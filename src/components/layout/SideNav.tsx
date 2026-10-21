import { NavLink } from 'react-router'
import { useAppDispatch } from '@/app/hooks'
import { lock } from '@/features/auth/authSlice'
import Icon, { type IconName } from '@/components/ui/Icon'

interface NavItemDef {
  to: string
  label: string
  icon: IconName
  end?: boolean
}

const ITEMS: NavItemDef[] = [
  { to: '/', label: 'Home', icon: 'home', end: true },
  { to: '/sessions', label: 'Sessions', icon: 'sessions' },
  { to: '/members', label: 'Members', icon: 'members' },
  { to: '/settings', label: 'Settings', icon: 'settings' },
]

const ITEM_CLASS = 'flex h-16 w-20 flex-col items-center justify-center gap-1 rounded-xl text-xs font-semibold'

export function Logo() {
  return <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-bright text-xl font-bold text-white">D</div>
}

// Left rail on tablets, bottom bar on phones.
export default function SideNav() {
  const dispatch = useAppDispatch()
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-40 flex justify-around bg-navy px-2 py-1 text-white md:sticky md:top-0 md:h-screen md:w-24 md:flex-col md:items-center md:justify-start md:gap-2 md:py-4"
    >
      <div className="mb-4 hidden md:block">
        <Logo />
      </div>
      {ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) => `${ITEM_CLASS} ${isActive ? 'bg-brand text-white' : 'text-navy-text hover:bg-navy-2'}`}
        >
          <Icon name={item.icon} size={22} strokeWidth={2} />
          {item.label}
        </NavLink>
      ))}
      <button type="button" onClick={() => dispatch(lock())} className={`${ITEM_CLASS} text-navy-text hover:bg-navy-2 md:mt-auto`}>
        <Icon name="lock" size={22} strokeWidth={2} />
        Lock
      </button>
    </nav>
  )
}
