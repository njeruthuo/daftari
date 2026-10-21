import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import PinUnlock from '@/features/auth/PinUnlock'
import RequireAuth from '@/features/auth/RequireAuth'
import Home from '@/features/home/Home'
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
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
