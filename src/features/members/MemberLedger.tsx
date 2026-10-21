import { useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router'
import { reinstateMember } from '@/app/dataSlice'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import TopBar, { TaskScreen } from '@/components/layout/TopBar'
import { Avatar, Badge, Banner, Button, Card, Segmented, StatTile } from '@/components/ui'
import { formatDate, shortDate } from '@/lib/dates'
import { memberLedger, type LedgerKind } from '@/lib/ledger'
import { activeLoan } from '@/lib/loans'
import { isActive } from '@/lib/members'
import { fmt } from '@/lib/money'
import RevokeMemberModal from './RevokeMemberModal'

type Filter = 'all' | LedgerKind

const COLS = 'grid grid-cols-[100px_90px_minmax(240px,3fr)_repeat(4,minmax(80px,1fr))] gap-3 px-5'

// Read-only history with balances recalculated after every row.
export default function MemberLedger() {
  const { memberId = '' } = useParams()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const member = useAppSelector((state) => state.data.members.find((m) => m.id === memberId))
  const { entries, loans } = useAppSelector((state) => state.ledger)
  const [filter, setFilter] = useState<Filter>('all')
  const [revoking, setRevoking] = useState(false)

  if (!member) return <Navigate to="/members" replace />

  const rows = memberLedger(member, entries, loans)
  const last = rows[rows.length - 1]
  const st = activeLoan(loans, entries, member.id, 'gumbato')
  const lt = activeLoan(loans, entries, member.id, 'longterm')
  const adjustments = rows.filter((r) => r.kinds.includes('adjustment')).length
  const visible = filter === 'all' ? rows : rows.filter((r) => r.kinds.includes(filter))
  const changed = (a: number, b: number | undefined) => (b === undefined || a !== b ? 'font-bold text-ink' : 'text-muted')

  return (
    <TaskScreen>
      <TopBar title="Member ledger" subtitle="Read-only · balances recalculated after every row">
        <Button variant="dark" onClick={() => navigate(-1)}>
          Back
        </Button>
      </TopBar>
      <div className="flex flex-1 flex-col gap-4 p-4 lg:px-6 lg:py-5">
        <Card className="flex flex-wrap items-center gap-4 p-5">
          <Avatar name={member.name} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2.5">
              <h1 className="text-[22px] font-bold">{member.name}</h1>
              {!isActive(member) && <Badge tone="bad">REVOKED</Badge>}
            </div>
            <p className="text-[13px] text-ink-2">
              {member.id}
              {member.phone ? ` · ${member.phone}` : ''} · Member since {shortDate(member.since)}
            </p>
          </div>
          {isActive(member) ? (
            <Button variant="secondary" onClick={() => setRevoking(true)}>
              Revoke member
            </Button>
          ) : (
            <Button variant="secondary" onClick={() => dispatch(reinstateMember(member.id))}>
              Reinstate
            </Button>
          )}
        </Card>
        {!isActive(member) && (
          <Banner tone="bad" title={`Revoked ${formatDate(member.revokedAt ?? null)}`}>
            {member.revokedReason} Not included in new sessions. History below is kept.
          </Banner>
        )}
        <div className="grid gap-4 sm:grid-cols-3">
          <StatTile label="Savings" value={`KES ${fmt(last.savings)}`} />
          <StatTile label="Gumbato" value={`KES ${fmt(st?.balance ?? 0)}`} sub={st ? `${st.count} of ${st.months} repaid${st.overdue ? ' · overdue' : ''}` : 'No active loan'} tone={st?.overdue ? 'bad' : 'neutral'} />
          <StatTile label="Long-term" value={`KES ${fmt(lt?.balance ?? 0)}`} sub={lt ? `${lt.count} of ${lt.months} repaid` : 'No active loan'} />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="w-full max-w-[560px]">
            <Segmented
              value={filter}
              onChange={setFilter}
              options={[
                { value: 'all', label: 'All' },
                { value: 'savings', label: 'Savings' },
                { value: 'loan', label: 'Loans' },
                { value: 'deduction', label: 'Deductions' },
                { value: 'adjustment', label: `Adjustments · ${adjustments}` },
              ]}
            />
          </div>
          <span className="text-[13px] text-ink-2">{rows.length} rows</span>
        </div>
        <Card className="overflow-x-auto">
          <div className="min-w-[900px]">
            <div className={`${COLS} bg-subtle py-2.5 text-xs font-bold uppercase tracking-wider text-muted`}>
              <span>Date</span>
              <span>Ref</span>
              <span>Transaction</span>
              <span className="text-right">Cash in</span>
              <span className="text-right">Savings</span>
              <span className="text-right">Gumbato</span>
              <span className="text-right">Long-term</span>
            </div>
            {visible.map((r) => {
              const prev = rows[rows.indexOf(r) - 1]
              const adj = r.kinds.includes('adjustment')
              return (
                <div key={r.id} className={`${COLS} min-h-14 items-center border-t border-canvas py-2 text-[15px] ${adj ? 'bg-warn-tint' : ''}`}>
                  <span className="text-sm text-ink-2">{r.date ? shortDate(r.date) : '—'}</span>
                  <span className={`text-sm font-semibold ${adj ? 'text-warn' : 'text-ink-2'}`}>{r.ref}</span>
                  <span className="min-w-0">
                    <span className="block font-semibold">
                      {r.description} {adj && <Badge tone="warn">Adjustment</Badge>}
                    </span>
                    <span className="block truncate text-xs text-ink-2">{r.detail}</span>
                  </span>
                  <span className="text-right">{r.cash === null ? '—' : fmt(r.cash)}</span>
                  <span className={`text-right ${changed(r.savings, prev?.savings)}`}>{fmt(r.savings)}</span>
                  <span className={`text-right ${changed(r.gumbato, prev?.gumbato)}`}>{fmt(r.gumbato)}</span>
                  <span className={`text-right ${changed(r.longTerm, prev?.longTerm)}`}>{fmt(r.longTerm)}</span>
                </div>
              )
            })}
          </div>
        </Card>
      </div>
      {revoking && <RevokeMemberModal member={member} onClose={() => setRevoking(false)} />}
    </TaskScreen>
  )
}
