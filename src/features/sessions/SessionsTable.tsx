import { selectActiveCount } from '@/app/dataSlice'
import { useAppSelector } from '@/app/hooks'
import { Button, Card, CardHeader, Icon, StatusIcon } from '@/components/ui'
import { formatDate } from '@/lib/dates'
import { fmt, kes } from '@/lib/money'
import { sessionTotals } from '@/lib/session'
import type { Session } from '@/types'

const COLS = 'grid grid-cols-[2.2fr_1.1fr_1fr_1.3fr_1.2fr_1.1fr_140px] gap-3 px-5'

export function varianceLabel(variance: number): { text: string; className: string } {
  if (variance === 0) return { text: 'KES 0', className: 'text-ok' }
  if (variance > 0) return { text: `+ KES ${fmt(variance)} over`, className: 'text-warn' }
  return { text: `− KES ${fmt(-variance)} short`, className: 'text-bad' }
}

// Closed sessions, newest first. Each opens read-only.
export default function SessionsTable({ sessions, limit }: { sessions: Session[]; limit?: number }) {
  const entries = useAppSelector((state) => state.ledger.entries)
  const loans = useAppSelector((state) => state.ledger.loans)
  const memberCount = useAppSelector(selectActiveCount)
  const closed = sessions
    .filter((s) => s.status === 'closed')
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, limit)

  return (
    <Card className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <CardHeader title="Past sessions" className="border-b border-line-soft px-5 py-3.5">
        <span className="text-[13px] text-ink-2">Closed sessions open read-only</span>
      </CardHeader>
      {closed.length === 0 ? (
        <p className="px-5 py-10 text-center text-[15px] text-ink-2">No closed sessions yet. Start this month's meeting to record the first one.</p>
      ) : (
        <div className="overflow-x-auto">
          <div className="min-w-[860px]">
            <div className={`${COLS} bg-subtle py-2.5 text-xs font-bold uppercase tracking-wider text-muted`}>
              <span>Session</span>
              <span>Date</span>
              <span>Processed</span>
              <span className="text-right">Collected</span>
              <span className="text-right">Cash variance</span>
              <span>Sync</span>
              <span />
            </div>
            {closed.map((s) => {
              const own = entries.filter((e) => e.sessionId === s.id)
              const totals = sessionTotals(own, loans)
              const variance = varianceLabel((s.counted ?? totals.expected) - totals.expected)
              const processed = new Set(own.filter((e) => e.kind === 'entry').map((e) => e.memberId)).size
              const unsynced = own.some((e) => e.sync !== 'synced')
              return (
                <div key={s.id} className={`${COLS} min-h-[60px] items-center border-t border-canvas text-[15px]`}>
                  <span className="font-semibold">{s.name}</span>
                  <span className="text-ink-2">{formatDate(s.date)}</span>
                  <span className="text-ink-2">
                    {processed} of {memberCount}
                  </span>
                  <span className="text-right font-semibold">{kes(totals.cash)}</span>
                  <span className={`text-right font-semibold ${variance.className}`}>{variance.text}</span>
                  <span className={`flex items-center gap-1.5 text-sm font-semibold ${unsynced ? 'text-warn' : 'text-ok'}`}>
                    <StatusIcon status={unsynced ? 'pending' : 'synced'} size={18} />
                    {unsynced ? 'On device' : 'Synced'}
                  </span>
                  <Button to={`/sessions/${s.id}/summary`}>
                    <Icon name="lock" size={16} strokeWidth={2} />
                    View
                  </Button>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </Card>
  )
}
