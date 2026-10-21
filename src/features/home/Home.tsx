import { useAppSelector } from '@/app/hooks'
import AppShell, { PageTitle } from '@/components/layout/AppShell'
import SyncPill from '@/components/layout/SyncPill'
import { Button, Icon, StatTile } from '@/components/ui'
import { selectCurrentOfficial } from '@/features/auth/authSlice'
import SessionsTable, { varianceLabel } from '@/features/sessions/SessionsTable'
import { groupTotals } from '@/lib/balances'
import { formatDate, monthName, todayISO } from '@/lib/dates'
import { kes } from '@/lib/money'
import { sessionTotals } from '@/lib/session'

function greeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

export default function Home() {
  const official = useAppSelector(selectCurrentOfficial)
  const { group, members } = useAppSelector((state) => state.data)
  const { entries, loans } = useAppSelector((state) => state.ledger)
  const sessions = useAppSelector((state) => state.sessions.list)
  const deductions = useAppSelector((state) => state.settings.deductions)

  const totals = groupTotals(members, entries, loans)
  const open = sessions.find((s) => s.status === 'open')
  const last = sessions.filter((s) => s.status === 'closed').sort((a, b) => b.date.localeCompare(a.date))[0]
  const lastEntries = last ? entries.filter((e) => e.sessionId === last.id) : []
  const lastTotals = sessionTotals(lastEntries, loans)
  const lastProcessed = new Set(lastEntries.filter((e) => e.kind === 'entry').map((e) => e.memberId)).size
  const defaults = deductions
    .filter((d) => d.active && !d.archived && d.appliesTo === 'everyone')
    .map((d) => `${d.name} ${d.amount}`)
    .join(', ')

  return (
    <AppShell>
      <PageTitle eyebrow={`${group.name} · ${formatDate(todayISO())}`} title={`${greeting()}, ${official?.name.split(' ')[0]}`}>
        <SyncPill />
      </PageTitle>

      <section className="flex flex-col gap-5 rounded-2xl bg-brand px-7 py-6 text-white sm:flex-row sm:items-center">
        <div className="flex-1">
          <div className="text-sm font-semibold uppercase tracking-wider text-[#c9d3ff]">{open ? 'Meeting in progress' : "Today's meeting"}</div>
          <div className="mt-1 text-[26px] font-bold">{open ? open.name : `${monthName(todayISO())} Monthly Meeting`}</div>
          <div className="mt-1 text-[15px] text-[#dce3ff]">
            {members.length} members · Defaults on: {defaults || 'none'}
          </div>
        </div>
        <Button to={open ? `/sessions/${open.id}` : '/sessions/new'} variant="inverse" size="lg">
          {open ? 'Continue session' : 'Start session'}
          <Icon name="next" size={22} strokeWidth={2.4} />
        </Button>
      </section>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile label="Total savings" value={kes(totals.savings)} sub={`${members.length} members`} />
        <StatTile
          label="Gumbato out"
          value={kes(totals.gumbato.amount)}
          sub={`${totals.gumbato.active} active${totals.gumbato.overdue ? ` · ${totals.gumbato.overdue} overdue` : ''}`}
          tone={totals.gumbato.overdue ? 'bad' : 'neutral'}
        />
        <StatTile label="Long-term out" value={kes(totals.longTerm.amount)} sub={`${totals.longTerm.active} active loans`} />
        {last ? (
          <StatTile
            label="Last session"
            value={`${lastProcessed} of ${members.length}`}
            sub={`Variance ${varianceLabel((last.counted ?? lastTotals.expected) - lastTotals.expected).text}`}
            tone={last.counted === lastTotals.expected ? 'ok' : 'warn'}
          />
        ) : (
          <StatTile label="Last session" value="—" sub="No sessions yet" />
        )}
      </div>

      <SessionsTable sessions={sessions} limit={5} />
    </AppShell>
  )
}
