import { useState } from 'react'
import { Link } from 'react-router'
import { useAppSelector } from '@/app/hooks'
import AppShell, { PageTitle } from '@/components/layout/AppShell'
import { Avatar, Badge, Card, Field } from '@/components/ui'
import { memberSavings } from '@/lib/balances'
import { activeLoan } from '@/lib/loans'
import { fmt } from '@/lib/money'

const COLS = 'grid grid-cols-[minmax(200px,2fr)_repeat(3,minmax(110px,1fr))] gap-3 px-5'

export default function MembersPage() {
  const members = useAppSelector((state) => state.data.members)
  const { entries, loans } = useAppSelector((state) => state.ledger)
  const [query, setQuery] = useState('')
  const q = query.trim().toLowerCase()
  const visible = members.filter((m) => !q || m.name.toLowerCase().includes(q) || m.id.toLowerCase().includes(q))

  return (
    <AppShell>
      <PageTitle title="Members">
        <Field aria-label="Search members" placeholder="Search name or member no." value={query} onChange={(e) => setQuery(e.target.value)} className="w-full sm:w-80" />
      </PageTitle>
      <Card className="overflow-x-auto">
        <div className="min-w-[640px]">
          <div className={`${COLS} bg-subtle py-2.5 text-xs font-bold uppercase tracking-wider text-muted`}>
            <span>Member</span>
            <span className="text-right">Savings</span>
            <span className="text-right">Gumbato</span>
            <span className="text-right">Long-term</span>
          </div>
          {visible.map((m) => {
            const st = activeLoan(loans, entries, m.id, 'gumbato')
            const lt = activeLoan(loans, entries, m.id, 'longterm')
            return (
              <Link key={m.id} to={`/members/${m.id}`} className={`${COLS} min-h-[60px] items-center border-t border-canvas text-[15px] hover:bg-subtle`}>
                <span className="flex min-w-0 items-center gap-3">
                  <Avatar name={m.name} />
                  <span className="min-w-0">
                    <span className="block truncate font-semibold">{m.name}</span>
                    <span className="text-xs text-ink-2">{m.id}</span>
                  </span>
                </span>
                <span className="text-right font-semibold">{fmt(memberSavings(m, entries))}</span>
                <span className="flex items-center justify-end gap-2">
                  {st?.overdue && <Badge tone="bad">OVERDUE</Badge>}
                  {st ? fmt(st.balance) : <span className="text-muted">0</span>}
                </span>
                <span className="text-right">{lt ? fmt(lt.balance) : <span className="text-muted">0</span>}</span>
              </Link>
            )
          })}
        </div>
      </Card>
    </AppShell>
  )
}
