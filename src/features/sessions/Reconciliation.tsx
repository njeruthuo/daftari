import { useState } from 'react'
import { Navigate, useParams } from 'react-router'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import TopBar, { TaskScreen } from '@/components/layout/TopBar'
import { Badge, Button, Card, Field, MathRows, Segmented, SectionLabel, StatTile, TextArea } from '@/components/ui'
import { selectCurrentOfficial } from '@/features/auth/authSlice'
import { postAdjustment, toggleFlag } from '@/features/workspace/ledgerSlice'
import { adjustAmount, reverseEntry, type AdjustTarget } from '@/lib/adjustment'
import { memberSavings } from '@/lib/balances'
import { formatTime } from '@/lib/dates'
import { fmt, kes, signed, toNumber } from '@/lib/money'
import type { Entry } from '@/types'
import { useSessionData } from './useSessionData'

type Mode = 'adjust' | 'reverse' | 'flag'

const COLS = 'grid grid-cols-[90px_minmax(160px,2fr)_60px_repeat(4,minmax(70px,1fr))_120px] gap-3 px-4'

// Entries are never edited or deleted: corrections are new, linked entries.
export default function Reconciliation() {
  const { sessionId = '' } = useParams()
  const dispatch = useAppDispatch()
  const official = useAppSelector(selectCurrentOfficial)
  const members = useAppSelector((state) => state.data.members)
  const allEntries = useAppSelector((state) => state.ledger.entries)
  const { session, entries, totals, variance } = useSessionData(sessionId)

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [mode, setMode] = useState<Mode>('adjust')
  const [target, setTarget] = useState<AdjustTarget>('savings')
  const [sign, setSign] = useState<1 | -1>(-1)
  const [amount, setAmount] = useState('')
  const [reason, setReason] = useState('')

  if (!session) return <Navigate to="/" replace />

  const nameOf = (id: string) => members.find((m) => m.id === id)?.name ?? id
  const selected = entries.find((e) => e.id === selectedId)
  const flagged = entries.filter((e) => e.flagged).length

  function pick(entry: Entry) {
    setSelectedId(entry.id)
    setMode('adjust')
    setTarget('savings')
    setAmount('')
    setReason('')
  }

  function correction(entry: Entry) {
    return mode === 'reverse' ? reverseEntry(entry) : adjustAmount(entry, target, sign * toNumber(amount))
  }

  function post(entry: Entry) {
    if (mode === 'flag') {
      dispatch(toggleFlag(entry.id))
      return
    }
    dispatch(
      postAdjustment({
        ...correction(entry),
        kind: 'adjustment',
        sessionId,
        memberId: entry.memberId,
        at: new Date().toISOString(),
        by: official?.name ?? '',
        loanOut: 0,
        loanId: null,
        note: '',
        sync: 'pending',
        linkedTo: entry.id,
        reason: reason.trim(),
        flagged: false,
      }),
    )
    setSelectedId(null)
  }

  return (
    <TaskScreen>
      <TopBar backTo={`/sessions/${sessionId}/${session.status === 'closed' ? 'summary' : 'end'}`} title={`Reconciliation · ${session.name}`} subtitle="Entries are never edited or deleted — corrections are new, linked entries" />

      <div className="flex flex-1 flex-col gap-4 p-4 lg:px-6 lg:py-5">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatTile label="Expected cash" value={kes(totals.expected)} />
          <StatTile label="Counted" value={session.counted == null ? '—' : kes(session.counted)} />
          <StatTile label="Variance" value={variance == null ? '—' : signed(variance)} tone={variance ? 'bad' : 'ok'} sub={variance == null ? 'Not counted yet' : variance < 0 ? 'Short' : variance > 0 ? 'Over' : 'Balanced'} />
          <StatTile label="Entries" value={String(entries.length)} sub={`${flagged} flagged`} tone={flagged ? 'warn' : 'neutral'} />
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-4 xl:flex-row">
          <Card className="min-w-0 flex-1 overflow-x-auto">
            <div className="min-w-[820px]">
              <div className={`${COLS} bg-subtle py-2.5 text-xs font-bold uppercase tracking-wider text-muted`}>
                <span>Entry</span>
                <span>Member</span>
                <span>Time</span>
                <span className="text-right">Cash</span>
                <span className="text-right">Savings</span>
                <span className="text-right">Repaid</span>
                <span className="text-right">Ded + fees</span>
                <span>Status</span>
              </div>
              {entries.length === 0 && <p className="p-8 text-center text-sm text-ink-2">No entries in this session yet.</p>}
              {entries.map((e) => {
                const isSel = e.id === selectedId
                const adj = e.kind === 'adjustment'
                return (
                  <button
                    key={e.id}
                    type="button"
                    disabled={adj}
                    onClick={() => pick(e)}
                    className={`${COLS} min-h-14 w-full items-center border-t border-canvas text-left text-[15px] ${
                      isSel ? 'bg-brand-soft shadow-[inset_4px_0_0_#1f3fd1]' : e.flagged ? 'bg-warn-tint shadow-[inset_4px_0_0_#e0a33a]' : adj ? 'bg-subtle' : 'bg-white hover:bg-subtle'
                    }`}
                  >
                    <span className={`text-sm font-semibold ${adj ? 'text-warn' : 'text-ink-2'}`}>{e.id}</span>
                    <span className="min-w-0">
                      <span className="block truncate font-semibold">{nameOf(e.memberId)}</span>
                      <span className="block truncate text-xs text-ink-2">{adj ? `Corrects ${e.linkedTo} · ${e.reason}` : e.note}</span>
                    </span>
                    <span className="text-sm text-ink-2">{formatTime(e.at)}</span>
                    <span className="text-right font-semibold">{fmt(e.cash)}</span>
                    <span className="text-right">{fmt(e.savings)}</span>
                    <span className="text-right">{e.repayST + e.repayLT ? fmt(e.repayST + e.repayLT) : '—'}</span>
                    <span className="text-right">{fmt(e.deductions.reduce((s, d) => s + d.amount, 0) + e.fees)}</span>
                    <span>
                      {e.flagged ? <Badge tone="warn">Flagged</Badge> : adj ? <Badge tone="warn">Adjustment</Badge> : <Badge tone={e.sync === 'synced' ? 'ok' : 'warn'}>{e.sync === 'synced' ? 'Synced' : 'On device'}</Badge>}
                    </span>
                  </button>
                )
              })}
            </div>
          </Card>

          <Card as="aside" className="flex flex-col gap-4 p-5 xl:w-[400px] xl:shrink-0">
            {!selected ? (
              <p className="text-[15px] text-ink-2">Select an entry to adjust, reverse or flag it.</p>
            ) : (
              <CorrectionForm
                entry={selected}
                memberName={nameOf(selected.memberId)}
                savingsNow={memberSavings(members.find((m) => m.id === selected.memberId)!, allEntries)}
                cashNow={totals.cash}
                expectedNow={totals.expected}
                counted={session.counted}
                mode={mode}
                setMode={setMode}
                target={target}
                setTarget={setTarget}
                sign={sign}
                setSign={setSign}
                amount={amount}
                setAmount={setAmount}
                reason={reason}
                setReason={setReason}
                change={mode === 'flag' ? null : correction(selected)}
                onCancel={() => setSelectedId(null)}
                onPost={() => post(selected)}
              />
            )}
          </Card>
        </div>
      </div>
    </TaskScreen>
  )
}

interface CorrectionFormProps {
  entry: Entry
  memberName: string
  savingsNow: number
  cashNow: number
  expectedNow: number
  counted: number | null
  mode: Mode
  setMode: (m: Mode) => void
  target: AdjustTarget
  setTarget: (t: AdjustTarget) => void
  sign: 1 | -1
  setSign: (s: 1 | -1) => void
  amount: string
  setAmount: (a: string) => void
  reason: string
  setReason: (r: string) => void
  change: ReturnType<typeof reverseEntry> | null
  onCancel: () => void
  onPost: () => void
}

function CorrectionForm(p: CorrectionFormProps) {
  const { entry, change } = p
  const targets: { value: AdjustTarget; label: string; ok: boolean }[] = [
    { value: 'savings', label: 'Savings', ok: true },
    { value: 'repayST', label: 'Gumbato repayment', ok: !!entry.stLoanId },
    { value: 'repayLT', label: 'Long-term repayment', ok: !!entry.ltLoanId },
    { value: 'deduction', label: 'A deduction', ok: true },
  ]
  const reverseBlocked = p.mode === 'reverse' && !!entry.loanId
  const amountMissing = p.mode === 'adjust' && toNumber(p.amount) === 0
  const canPost = p.mode === 'flag' || (p.reason.trim() !== '' && !amountMissing && !reverseBlocked)
  const cashAfter = p.cashNow + (change?.cash ?? 0)
  const expectedAfter = p.expectedNow + (change?.cash ?? 0)

  return (
    <>
      <div>
        <h2 className="text-lg font-bold">Correct entry {entry.id}</h2>
        <p className="text-[13px] text-ink-2">
          {p.memberName} · {entry.memberId} · saved {formatTime(entry.at)} by {entry.by}
        </p>
      </div>
      <Segmented
        value={p.mode}
        onChange={p.setMode}
        options={[
          { value: 'adjust', label: 'Adjust amount' },
          { value: 'reverse', label: 'Reverse entry' },
          { value: 'flag', label: entry.flagged ? 'Unflag' : 'Flag only' },
        ]}
      />
      <p className="text-[13px] text-ink-2">
        Original: cash {fmt(entry.cash)} · deductions {fmt(entry.deductions.reduce((s, d) => s + d.amount, 0) + entry.fees)} · savings {fmt(entry.savings)}
      </p>

      {p.mode === 'adjust' && (
        <>
          <div className="flex flex-col gap-1.5">
            <SectionLabel>Adjust</SectionLabel>
            <div className="flex flex-wrap gap-2">
              {targets.map((t) => (
                <Button key={t.value} disabled={!t.ok} variant={p.target === t.value ? 'primary' : 'secondary'} onClick={() => p.setTarget(t.value)}>
                  {t.label}
                </Button>
              ))}
            </div>
          </div>
          <div className="flex items-end gap-2">
            <Button size="icon" variant="secondary" aria-label="Switch sign" onClick={() => p.setSign(p.sign === 1 ? -1 : 1)} className="!h-[52px] text-xl">
              {p.sign === 1 ? '+' : '−'}
            </Button>
            <Field className="flex-1" label="Amount" prefix="KES" inputMode="numeric" value={p.amount} onChange={(e) => p.setAmount(e.target.value.replace(/\D/g, ''))} />
          </div>
        </>
      )}
      {reverseBlocked && <p className="text-sm font-semibold text-bad">This entry issued a loan, so it can't be reversed. Adjust the amounts instead.</p>}

      {change && (
        <div className="rounded-[10px] border border-line-soft bg-subtle px-3.5 py-1">
          <SectionLabel className="block pt-2 !text-xs">Effect preview</SectionLabel>
          <MathRows
            rows={[
              ...(change.savings ? [{ label: `${p.memberName.split(' ')[0]}'s savings`, value: `${fmt(p.savingsNow)} → ${fmt(p.savingsNow + change.savings)}` }] : []),
              { label: 'Session cash received', value: `${fmt(p.cashNow)} → ${fmt(cashAfter)}` },
              { label: 'Expected cash', value: `${fmt(p.expectedNow)} → ${fmt(expectedAfter)}` },
              ...(p.counted == null ? [] : [{ label: 'Variance', value: `${signed(p.counted - p.expectedNow)} → ${signed(p.counted - expectedAfter)}` }]),
            ]}
          />
        </div>
      )}

      {p.mode !== 'flag' && <TextArea label="Reason *" value={p.reason} onChange={(e) => p.setReason(e.target.value)} />}
      {p.mode !== 'flag' && <p className="text-xs text-ink-2">Posts as a new adjustment entry linked to {entry.id}. The original entry stays in the ledger unchanged.</p>}

      <div className="flex justify-end gap-3">
        <Button onClick={p.onCancel}>Cancel</Button>
        <Button variant="primary" disabled={!canPost} onClick={p.onPost}>
          {p.mode === 'flag' ? (entry.flagged ? 'Remove flag' : 'Flag for review') : p.mode === 'reverse' ? 'Post reversal' : `Post adjustment ${signed(p.sign * toNumber(p.amount))}`}
        </Button>
      </div>
    </>
  )
}
