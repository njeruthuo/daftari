import type { ReactNode } from 'react'
import Icon, { type IconName } from './Icon'

const TONES = {
  ok: 'border-[#9ed3b2] bg-ok-soft text-ok',
  warn: 'border-warn-line bg-warn-tint text-warn',
  bad: 'border-bad-line bg-bad-soft text-bad',
  info: 'border-[#b9c6ff] bg-brand-tint text-brand-dark',
}
const ICONS: Record<keyof typeof TONES, IconName> = { ok: 'check', warn: 'warn', bad: 'warn', info: 'lock' }

// Inline message strip with an optional action on the right.
interface BannerProps {
  tone?: keyof typeof TONES
  title?: ReactNode
  action?: ReactNode
  className?: string
  children?: ReactNode
}

export default function Banner({ tone = 'info', title, children, action, className = '' }: BannerProps) {
  return (
    <div className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${TONES[tone]} ${className}`}>
      <Icon name={ICONS[tone]} size={22} />
      <div className="min-w-0 flex-1 text-sm text-ink">
        {title && <div className="font-bold">{title}</div>}
        {children}
      </div>
      {action}
    </div>
  )
}
