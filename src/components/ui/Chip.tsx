import type { ReactNode } from 'react'
import Icon from './Icon'

interface ChipProps {
  on: boolean
  onClick?: () => void
  disabled?: boolean
  children: ReactNode
}

// Toggle chip, used for deductions.
export default function Chip({ on, onClick, disabled, children }: ChipProps) {
  const look = on ? 'border-2 border-brand bg-brand-soft text-brand-dark' : 'border border-line-strong bg-white text-ink-2'
  return (
    <button
      type="button"
      aria-pressed={on}
      disabled={disabled}
      onClick={onClick}
      className={`flex h-12 items-center gap-2 rounded-full px-3.5 text-sm font-semibold disabled:opacity-60 ${look}`}
    >
      <Icon name={on ? 'check' : 'plus'} size={18} strokeWidth={2.6} />
      {children}
    </button>
  )
}
