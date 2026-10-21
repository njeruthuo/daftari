import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import PinUnlock from '@/features/auth/PinUnlock'
import RequireAuth from '@/features/auth/RequireAuth'
import Home from '@/features/home/Home'
import SessionsPage from '@/features/sessions/SessionsPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/unlock" element={<PinUnlock />} />
        <Route element={<RequireAuth />}>
          <Route path="/" element={<Home />} />
          <Route path="/sessions" element={<SessionsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
