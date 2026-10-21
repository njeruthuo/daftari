import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { markAllSynced } from './ledgerSlice'
import { setOnline, syncedAt } from './syncSlice'

const UPLOAD_DELAY_MS = 2000

// Tracks the connection and "uploads" entries saved on the device.
// There is no server yet, so uploading just marks pending entries as synced.
export default function SyncEngine() {
  const dispatch = useAppDispatch()
  const online = useAppSelector((state) => state.sync.online)
  const pending = useAppSelector((state) => state.ledger.entries.some((e) => e.sync === 'pending'))

  useEffect(() => {
    const goOnline = () => dispatch(setOnline(true))
    const goOffline = () => dispatch(setOnline(false))
    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)
    return () => {
      window.removeEventListener('online', goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [dispatch])

  useEffect(() => {
    if (!online || !pending) return
    const timer = setTimeout(() => {
      dispatch(markAllSynced())
      dispatch(syncedAt(new Date().toISOString()))
    }, UPLOAD_DELAY_MS)
    return () => clearTimeout(timer)
  }, [dispatch, online, pending])

  return null
}
