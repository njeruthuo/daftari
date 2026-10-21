import { useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import SyncPill from '@/components/layout/SyncPill'
import TopBar, { TaskScreen } from '@/components/layout/TopBar'
import { AmountField, Banner, Button, Card, CardHeader, Icon, Keypad, MathRows, SectionLabel, TextArea, applyKey } from '@/components/ui'
import { selectCurrentOfficial } from '@/features/auth/authSlice'
import { formatDate, formatTime } from '@/lib/dates'
import { count as plural, fmt, kes, toNumber } from '@/lib/money'
import { closeSession, setCount } from './sessionsSlice'
import TotalsCard from './TotalsCard'
import { useSessionData } from './useSessionData'
import VarianceBox from './VarianceBox'

// End-session summary while open; the same screen read-only once closed.
export default function EndSession() {
  const { sessionId = '' } = useParams()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const official = useAppSelector(selectCurrentOfficial)
  const { session, entries, totals, processed, unsynced, memberCount, draftCount } = useSessionData(sessionId)
  const [count, setCountText] = useState(session?.counted == null ? '' : String(session.counted))
  const [reason, setReason] = useState(session?.varianceReason ?? '')

  if (!session) return <Navigate to="/" replace />
  const locked = session.status === 'closed'
  const counted = count === '' ? null : toNumber(count)
  const variance = counted === null ? null : counted - totals.expected
  const canClose = counted !== null && (variance === 0 || reason.trim() !== '')

  function saveCount() {
    dispatch(setCount({ sessionId, counted, reason: reason.trim() }))
  }

  function close() {
    saveCount()
    dispatch(closeSession({ sessionId, by: official?.name ?? '' }))
    navigate(`/sessions/${sessionId}/summary`, { replace: true })
  }

  function review() {
    saveCount()
    navigate(`/sessions/${sessionId}/reconcile`)
  }

  return (
    <TaskScreen>
      <TopBar
        backTo={locked ? '/sessions' : `/sessions/${sessionId}`}
        title={`${locked ? 'Session summary' : 'End session'} · ${session.name}`}
        subtitle={`${formatDate(session.date)} · Started ${formatTime(session.startedAt)} · ${processed} of ${memberCount} processed`}
      >
        <SyncPill dark />
      </TopBar>

      <div className="flex flex-1 flex-col gap-4 p-4 lg:flex-row lg:px-6 lg:py-5">
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          {locked ? (
            <Banner tone="info" title="Closed and locked">
              Closed {formatDate(session.closedAt)} {formatTime(session.closedAt)} by {session.closedBy}. Later fixes are adjustment entries with a reason.
            </Banner>
          ) : (
            (processed < memberCount || draftCount > 0) && (
              <Banner tone="warn" title={`${plural(memberCount - processed, 'member', 'members')} not processed`}>
                {draftCount > 0 ? `${plural(draftCount, 'draft is', 'drafts are')} not saved and will be discarded on close. ` : ''}Go back to the workspace to finish them, or close anyway.
              </Banner>
            )
          )}
          {unsynced > 0 && <Banner tone="warn">{plural(unsynced, 'entry is', 'entries are')} saved on this tablet and still waiting to sync.</Banner>}
          <TotalsCard totals={totals} entryCount={entries.length} />
        </div>

        <Card as="aside" className="flex flex-col gap-4 p-5 lg:w-[380px] lg:shrink-0">
          <CardHeader title="Cash in the box" />
          <MathRows
            rows={[
              { label: 'Cash received', value: fmt(totals.cash) },
              { label: 'Loans paid out', value: `− ${fmt(totals.loansOut)}` },
              { label: 'Expected cash', value: kes(totals.expected), total: true },
            ]}
          />
          <SectionLabel>Treasurer's physical count</SectionLabel>
          {locked ? (
            <MathRows rows={[{ label: 'Counted', value: session.counted == null ? '—' : kes(session.counted) }]} />
          ) : (
            <>
              <AmountField label="Counted cash" value={count} size="lg" active />
              <Keypad onKey={(key) => setCountText(applyKey(count, key, 8))} />
              <span className="text-xs text-ink-2">Counted by {official?.name} ({official?.role})</span>
            </>
          )}
          {counted !== null && <VarianceBox counted={counted} expected={totals.expected} />}
          {locked
            ? session.varianceReason && <p className="text-sm text-ink-2">Reason: {session.varianceReason}</p>
            : variance !== null &&
              variance !== 0 && <TextArea label="Reason for variance *" value={reason} onChange={(e) => setReason(e.target.value)} />}

          <div className="flex-1" />
          <Button onClick={review}>Review entries in reconciliation</Button>
          {!locked && (
            <>
              <Button variant="primary" size="lg" disabled={!canClose} onClick={close}>
                <Icon name="lock" size={20} />
                Close &amp; lock session
              </Button>
              <p className="text-xs text-ink-2">Locking makes this session read-only. Later fixes are adjustment entries with a reason.</p>
            </>
          )}
        </Card>
      </div>
    </TaskScreen>
  )
}
