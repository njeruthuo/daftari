import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { Banner, Button, Icon } from '@/components/ui'
import { count } from '@/lib/money'
import { retrySync } from './ledgerSlice'

// Shown in the workspace while offline or when uploads failed.
export default function OfflineBanner() {
  const dispatch = useAppDispatch()
  const online = useAppSelector((state) => state.sync.online)
  const entries = useAppSelector((state) => state.ledger.entries)
  const waiting = entries.filter((e) => e.sync === 'pending').length
  const failed = entries.filter((e) => e.sync === 'failed').length
  if (online && !failed) return null

  const retry = failed ? (
    <Button variant="secondary" onClick={() => dispatch(retrySync())}>
      <Icon name="retry" size={18} />
      Retry all now
    </Button>
  ) : undefined

  return (
    <Banner tone={online ? 'bad' : 'warn'} title={online ? `${count(failed, 'entry', 'entries')} failed to upload` : 'No internet — keep going.'} action={retry}>
      Every Save is stored on this tablet first. {count(waiting, 'entry', 'entries')} will upload automatically when the connection returns.
    </Banner>
  )
}
