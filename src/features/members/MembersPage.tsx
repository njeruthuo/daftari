import { useState } from 'react'
import { Link } from 'react-router'
import { useAppSelector } from '@/app/hooks'
import AppShell, { PageTitle } from '@/components/layout/AppShell'
import { Avatar, Badge, Button, Card, Field, Icon, Segmented } from '@/components/ui'
import { memberSavings } from '@/lib/balances'
import { activeLoan } from '@/lib/loans'
import { isActive } from '@/lib/members'
import { fmt } from '@/lib/money'
import AddMemberModal from './AddMemberModal'

const COLS = 'grid grid-cols-[minmax(200px,2fr)_repeat(3,minmax(110px,1fr))] gap-3 px-5'

export default function MembersPage() {
  const members = useAppSelector((state) => state.data.members)
  const { entries, loans } = useAppSelector((state) => state.ledger)
  const [query, setQuery] = useState('')
  const [show, setShow] = useState<'active' | 'revoked'>('active')
  const [adding, setAdding] = useState(false)
  const q = query.trim().toLowerCase()
  const revokedCount = members.filter((m) => !isActive(m)).length
  const visible = members
    .filter((m) => (show === 'active') === isActive(m))
    .filter((m) => !q || m.name.toLowerCase().includes(q) || m.id.toLowerCase().includes(q))

  return (
    <AppShell>
      <PageTitle title="Members">
        <Button variant="primary" onClick={() => setAdding(true)}>
          <Icon name="plus" size={18} />
          Add member
        </Button>
      </PageTitle>
      <div className="flex flex-wrap items-center gap-3">
        <div className="w-full sm:w-72">
          <Segmented
            value={show}
            onChange={setShow}
            options={[
              { value: 'active', label: 'Active', count: members.length - revokedCount },
              { value: 'revoked', label: 'Revoked', count: revokedCount },
            ]}
          />
        </div>
        <Field aria-label="Search members" placeholder="Search name or member no." value={query} onChange={(e) => setQuery(e.target.value)} className="w-full sm:w-80" />
      </div>
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
                    <span className="text-xs text-ink-2">
                      {m.id}
                      {m.phone ? ` · ${m.phone}` : ''}
                    </span>
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
          {visible.length === 0 && <p className="p-8 text-center text-sm text-ink-2">{show === 'revoked' ? 'No revoked members.' : 'No members match.'}</p>}
        </div>
      </Card>
      {adding && <AddMemberModal onClose={() => setAdding(false)} />}
    </AppShell>
  )
}
