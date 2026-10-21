import { useAppSelector } from '@/app/hooks'
import Icon from '@/components/ui/Icon'

// "Online · All synced" / "Offline · 5 on device" pill.
export default function SyncPill({ dark = false }: { dark?: boolean }) {
  const online = useAppSelector((state) => state.sync.online)
  const entries = useAppSelector((state) => state.ledger.entries)
  const waiting = entries.filter((e) => e.sync === 'pending').length
  const failed = entries.filter((e) => e.sync === 'failed').length

  let label = 'Online · All synced'
  let look = dark ? 'bg-[#163a26] text-[#86e5ab]' : 'bg-ok-soft text-ok'
  if (!online) {
    label = `Offline · ${waiting} on device${failed ? ` · ${failed} failed` : ''}`
    look = dark ? 'bg-[#3d2a06] text-[#ffc670]' : 'bg-warn-soft text-warn'
  } else if (failed) {
    label = `${failed} failed to sync`
    look = dark ? 'bg-[#3d1410] text-[#ff9c92]' : 'bg-bad-soft text-bad'
  } else if (waiting) {
    label = `Syncing ${waiting}…`
  }
  return (
    <span className={`flex h-10 items-center gap-2 whitespace-nowrap rounded-full px-3.5 text-sm font-semibold ${look}`}>
      <Icon name={online ? 'wifi' : 'wifiOff'} size={18} />
      {label}
    </span>
  )
}
