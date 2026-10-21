import { useAppSelector } from '@/app/hooks'
import AppShell, { PageTitle } from '@/components/layout/AppShell'
import { Button, Icon } from '@/components/ui'
import SessionsTable from './SessionsTable'

export default function SessionsPage() {
  const sessions = useAppSelector((state) => state.sessions.list)
  const open = sessions.find((s) => s.status === 'open')
  return (
    <AppShell>
      <PageTitle title="Sessions">
        <Button to={open ? `/sessions/${open.id}` : '/sessions/new'} variant="primary">
          {open ? 'Continue open session' : 'Start session'}
          <Icon name="next" size={18} />
        </Button>
      </PageTitle>
      <SessionsTable sessions={sessions} />
    </AppShell>
  )
}
