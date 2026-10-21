import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import PinUnlock from '@/features/auth/PinUnlock'
import RequireAuth from '@/features/auth/RequireAuth'
import Home from '@/features/home/Home'
import MemberLedger from '@/features/members/MemberLedger'
import MembersPage from '@/features/members/MembersPage'
import EndSession from '@/features/sessions/EndSession'
import Reconciliation from '@/features/sessions/Reconciliation'
import SessionsPage from '@/features/sessions/SessionsPage'
import StartSession from '@/features/sessions/StartSession'
import SyncEngine from '@/features/workspace/SyncEngine'
import Workspace from '@/features/workspace/Workspace'

export default function App() {
  return (
    <BrowserRouter>
      <SyncEngine />
      <Routes>
        <Route path="/unlock" element={<PinUnlock />} />
        <Route element={<RequireAuth />}>
          <Route path="/" element={<Home />} />
          <Route path="/sessions" element={<SessionsPage />} />
          <Route path="/sessions/new" element={<StartSession />} />
          <Route path="/sessions/:sessionId" element={<Workspace />} />
          <Route path="/sessions/:sessionId/end" element={<EndSession />} />
          <Route path="/sessions/:sessionId/summary" element={<EndSession />} />
          <Route path="/sessions/:sessionId/reconcile" element={<Reconciliation />} />
          <Route path="/members" element={<MembersPage />} />
          <Route path="/members/:memberId" element={<MemberLedger />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
