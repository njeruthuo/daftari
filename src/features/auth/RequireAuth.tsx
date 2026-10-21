import { Navigate, Outlet, useLocation } from 'react-router'
import { useAppSelector } from '@/app/hooks'

export default function RequireAuth() {
  const memberId = useAppSelector((state) => state.auth.memberId)
  const location = useLocation()
  if (!memberId) return <Navigate to="/unlock" replace state={{ from: location.pathname }} />
  return <Outlet />
}
