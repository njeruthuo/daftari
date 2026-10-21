import { useState } from 'react'
import { Navigate, useParams } from 'react-router'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import SyncPill from '@/components/layout/SyncPill'
import TopBar from '@/components/layout/TopBar'
import { applyKey, Button, Icon, Modal, Toast, type KeypadKey } from '@/components/ui'
import { selectCurrentOfficial } from '@/features/auth/authSlice'
import { NEXT_ATTENDANCE } from '@/features/sessions/attendance'
import { clearDraft, saveDraft, setAttendance } from '@/features/sessions/sessionsSlice'
import NewLoanActions from '@/features/loans/NewLoanActions'
import { useToast } from '@/hooks/useToast'
import { memberSavings } from '@/lib/balances'
import { isActive } from '@/lib/members'
import { formatDate } from '@/lib/dates'
import { calcEntry, newEntryForm } from '@/lib/entry'
import { activeLoan, GUMBATO, LONG_TERM } from '@/lib/loans'
import { fmt } from '@/lib/money'
import type { EntryForm } from '@/types'
import EntryFooter from './EntryFooter'
import EntryPanel, { type KeypadTarget } from './EntryPanel'
import { retrySync, saveEntry } from './ledgerSlice'
import MemberHeader from './MemberHeader'
import MemberList, { type MemberRow } from './MemberList'
import { memberStatus } from './memberStatus'
import OfflineBanner from './OfflineBanner'
import SavedEntry from './SavedEntry'

export default function Workspace() {
  const { sessionId = '' } = useParams()
  const dispatch = useAppDispatch()
  const session = useAppSelector((state) => state.sessions.list.find((s) => s.id === sessionId))
  const drafts = useAppSelector((state) => state.sessions.drafts[sessionId] ?? {})
  const { members, group } = useAppSelector((state) => state.data)
  const { entries, loans } = useAppSelector((state) => state.ledger)
  const settings = useAppSelector((state) => state.settings)
  const allDeductions = settings.deductions
  const official = useAppSelector(selectCurrentOfficial)
  const leadName = useAppSelector((state) => state.data.members.find((m) => m.id === session?.leadId)?.name)

  const sessionEntries = entries.filter((e) => e.sessionId === sessionId && e.kind === 'entry')
  const rows: MemberRow[] = members
    .map((member) => {
      const entry = sessionEntries.find((e) => e.memberId === member.id)
      return { member, entry, status: memberStatus(entry, drafts[member.id]) }
    })
    .filter((r) => isActive(r.member) || r.entry)
  const firstOpen = rows.find((r) => !r.entry)?.member.id ?? rows[0]?.member.id ?? ''

  const [selectedId, setSelectedId] = useState(firstOpen)
  const [target, setTarget] = useState<KeypadTarget>('cash')
  const [listOpen, setListOpen] = useState(false)
  const { toast, show } = useToast()

  if (!session) return <Navigate to="/" replace />
  if (session.status === 'closed') return <Navigate to={`/sessions/${sessionId}/summary`} replace />

  const deductions = allDeductions.filter((d) => d.active && !d.archived)
  const row = rows.find((r) => r.member.id === selectedId) ?? rows[0]
  const member = row.member
  const attendance = session.attendance[member.id] ?? 'present'
  const fresh = newEntryForm(deductions, attendance)
  const form = drafts[member.id] ?? fresh
  const math = calcEntry(form, deductions)
  const st = activeLoan(loans, entries, member.id, GUMBATO)
  const lt = activeLoan(loans, entries, member.id, LONG_TERM)
  const next = rows.slice(rows.indexOf(row) + 1).concat(rows).find((r) => !r.entry && r.member.id !== member.id)

  let error: string | null = null
  if (st && math.repayST > st.balance) error = `Gumbato repayment is more than the ${fmt(st.balance)} owed`
  if (lt && math.repayLT > lt.balance) error = `Long-term repayment is more than the ${fmt(lt.balance)} owed`

  // The form lives in the session's drafts, so nothing is lost when switching members or closing the app.
  function setForm(next: EntryForm) {
    const ref = { sessionId, memberId: member.id }
    if (JSON.stringify(next) === JSON.stringify(fresh)) dispatch(clearDraft(ref))
    else dispatch(saveDraft({ ...ref, form: next }))
  }

  function goTo(memberId: string) {
    setSelectedId(memberId)
    setTarget('cash')
    setListOpen(false)
  }

  function select(memberId: string) {
    if (drafts[member.id] && memberId !== member.id) show(`Draft kept for ${member.name}`, 'warn')
    goTo(memberId)
  }

  function onKey(key: KeypadKey) {
    if (target === 'savings') {
      const current = form.savings ?? (math.savings ? String(math.savings) : '')
      setForm({ ...form, savings: applyKey(current, key) })
    } else {
      setForm({ ...form, [target]: applyKey(form[target], key) })
    }
  }

  function cycleAttendance() {
    const value = NEXT_ATTENDANCE[attendance]
    dispatch(setAttendance({ sessionId, memberId: member.id, value }))
    if (drafts[member.id]) setForm({ ...form, deductionIds: newEntryForm(deductions, value).deductionIds })
  }

  function save() {
    // Money left over goes to savings ("Put KES X in savings & Save").
    const savings = math.savings + Math.max(0, math.unallocated)
    dispatch(
      saveEntry({
        entry: {
          kind: 'entry',
          sessionId,
          memberId: member.id,
          at: new Date().toISOString(),
          by: official?.name ?? '',
          cash: math.cash,
          deductions: math.chosen.map((d) => ({ id: d.id, name: d.name, amount: d.amount })),
          fees: math.fees,
          savings,
          repayST: math.repayST,
          repayLT: math.repayLT,
          stLoanId: st && math.repayST ? st.id : null,
          ltLoanId: lt && math.repayLT ? lt.id : null,
          loanOut: form.newLoan?.principal ?? 0,
          loanId: null,
          note: form.note.trim(),
          sync: 'pending',
          linkedTo: null,
          reason: '',
          flagged: false,
        },
        loan: form.newLoan,
      }),
    )
    dispatch(clearDraft({ sessionId, memberId: member.id }))
    show(`Saved ${member.name} · KES ${fmt(math.cash)}`)
    if (next) goTo(next.member.id)
  }

  const list = (
    <MemberList rows={rows} selectedId={member.id} onSelect={select} onRetry={(id) => dispatch(retrySync(id))} />
  )

  return (
    <div className="flex min-h-full flex-col md:h-screen">
      <TopBar title={session.name} subtitle={`${group.name} · ${formatDate(session.date)} · Lead: ${leadName ?? ''}`}>
        <span className="hidden sm:block">
          <SyncPill dark />
        </span>
        <Button variant="dark" className="md:hidden" onClick={() => setListOpen(true)}>
          <Icon name="members" size={18} />
          Members
        </Button>
        <Button variant="dark" to={`/sessions/${sessionId}/end`}>
          End session
        </Button>
      </TopBar>

      <div className="flex min-h-0 flex-1">
        <aside className="hidden w-[340px] shrink-0 flex-col border-r border-line bg-white md:flex">{list}</aside>

        <main className="flex min-w-0 flex-1 flex-col gap-3 overflow-y-auto p-3 md:p-4">
          <OfflineBanner />
          <MemberHeader
            member={member}
            attendance={attendance}
            onCycleAttendance={row.entry ? undefined : cycleAttendance}
            status={row.status}
            savingsBefore={memberSavings(member, entries) - (row.entry?.savings ?? 0)}
            st={st}
            lt={lt}
            math={row.entry ? null : math}
            newLoan={row.entry ? null : form.newLoan}
          />
          {row.entry ? (
            <SavedEntry entry={row.entry} />
          ) : (
            <>
              <EntryPanel
                form={form}
                math={math}
                deductions={deductions}
                target={target}
                setTarget={setTarget}
                onKey={onKey}
                onToggleDeduction={(id) =>
                  setForm({
                    ...form,
                    deductionIds: form.deductionIds.includes(id) ? form.deductionIds.filter((x) => x !== id) : [...form.deductionIds, id],
                  })
                }
                onFill={(field, amount) => setForm({ ...form, [field]: String(amount) })}
                onAutoSavings={() => setForm({ ...form, savings: null })}
                st={st}
                lt={lt}
                loanActions={
                  <NewLoanActions
                    member={member}
                    newLoan={form.newLoan}
                    st={st}
                    lt={lt}
                    rates={{
                      gumbatoPct: settings.gumbato.chargePct,
                      gumbatoFee: settings.gumbato.formFee,
                      longTermPct: settings.longTerm.interestPct,
                      feePer10k: settings.longTerm.feePer10k,
                    }}
                    onIssue={(newLoan) => setForm({ ...form, newLoan })}
                    onRepayInstead={(type, amount) => {
                      setForm({ ...form, [type === GUMBATO ? 'repayST' : 'repayLT']: String(amount) })
                      setTarget(type === GUMBATO ? 'repayST' : 'repayLT')
                    }}
                  />
                }
              />
              <EntryFooter
                math={math}
                error={error}
                note={form.note}
                onNote={(note) => setForm({ ...form, note })}
                nextLabel={`Saves on this tablet · ${next ? `Next: ${next.member.id} ${next.member.name.split(' ')[0]}` : 'Last member'}`}
                onSave={save}
              />
            </>
          )}
        </main>
      </div>

      {listOpen && (
        <Modal title="Members" onClose={() => setListOpen(false)}>
          <div className="-mx-6 flex h-[70vh] flex-col">{list}</div>
        </Modal>
      )}
      <Toast message={toast?.message ?? null} tone={toast?.tone} />
    </div>
  )
}

