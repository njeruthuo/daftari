import { useAppSelector } from '@/app/hooks'
import { clearState } from '@/app/storage'
import { Banner, Button, Card, MathRows } from '@/components/ui'
import SettingsLayout from './SettingsLayout'

// Device info and a reset for the demo data stored in localStorage.
export default function TabletSettings() {
  const { group, members } = useAppSelector((state) => state.data)
  const { entries } = useAppSelector((state) => state.ledger)
  const sessions = useAppSelector((state) => state.sessions.list)

  function reset() {
    clearState()
    window.location.assign('/')
  }

  return (
    <SettingsLayout title="This tablet">
      <Card className="flex max-w-[640px] flex-col gap-4 p-5">
        <MathRows
          rows={[
            { label: 'Group', value: group.name },
            { label: 'Members', value: String(members.length) },
            { label: 'Sessions on this tablet', value: String(sessions.length) },
            { label: 'Entries on this tablet', value: String(entries.length) },
          ]}
        />
        <Banner tone="warn" title="Demo data">
          Data is stored in this browser until the database is ready. Resetting removes every session and entry and restores the demo group.
        </Banner>
        <div>
          <Button variant="danger" onClick={reset}>
            Reset demo data
          </Button>
        </div>
      </Card>
    </SettingsLayout>
  )
}
