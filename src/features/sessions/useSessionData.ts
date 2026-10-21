import { useAppSelector } from '@/app/hooks'
import { isActive } from '@/lib/members'
import { sessionTotals } from '@/lib/session'

// A session with its entries and totals, shared by the close, summary and reconciliation screens.
export function useSessionData(sessionId: string) {
  const session = useAppSelector((state) => state.sessions.list.find((s) => s.id === sessionId))
  const drafts = useAppSelector((state) => state.sessions.drafts[sessionId] ?? {})
  const { entries: allEntries, loans } = useAppSelector((state) => state.ledger)
  const members = useAppSelector((state) => state.data.members)

  const entries = allEntries.filter((e) => e.sessionId === sessionId)
  const totals = sessionTotals(entries, loans)
  const processed = new Set(entries.filter((e) => e.kind === 'entry').map((e) => e.memberId)).size
  const unsynced = entries.filter((e) => e.sync !== 'synced').length
  const variance = session?.counted == null ? null : session.counted - totals.expected

  return { session, entries, totals, processed, unsynced, variance, memberCount: members.filter(isActive).length, draftCount: Object.keys(drafts).length }
}
