import type { ReactNode } from 'react'
import Button from '@/components/ui/Button'
import Icon from '@/components/ui/Icon'

interface TopBarProps {
  backTo?: string
  title: ReactNode
  subtitle?: ReactNode
  children?: ReactNode
}

// Dark header for task screens (session setup, workspace, close, ledger).
export default function TopBar({ backTo, title, subtitle, children }: TopBarProps) {
  return (
    <header className="flex min-h-16 shrink-0 flex-wrap items-center gap-4 bg-navy px-4 py-2 text-white md:px-5">
      {backTo && (
        <Button to={backTo} variant="dark" size="icon" aria-label="Back">
          <Icon name="back" size={22} strokeWidth={2.4} />
        </Button>
      )}
      <div className="flex min-w-0 flex-col leading-tight">
        <span className="truncate text-base font-bold md:text-lg">{title}</span>
        {subtitle && <span className="truncate text-xs text-navy-text">{subtitle}</span>}
      </div>
      <div className="flex-1" />
      {children}
    </header>
  )
}

// Full-height column for task screens.
export function TaskScreen({ children }: { children: ReactNode }) {
  return <div className="flex min-h-full flex-col">{children}</div>
}
