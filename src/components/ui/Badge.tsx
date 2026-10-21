import type { ReactNode } from 'react'

const TONES = {
  ok: 'bg-ok-soft text-ok',
  warn: 'bg-warn-soft text-warn',
  bad: 'bg-bad-soft text-bad',
  brand: 'bg-brand-soft text-brand-dark',
  neutral: 'bg-line-soft text-ink-2',
}

export type Tone = keyof typeof TONES

interface BadgeProps {
  tone?: Tone
  pill?: boolean
  className?: string
  children: ReactNode
}

export default function Badge({ tone = 'neutral', pill = false, className = '', children }: BadgeProps) {
  const shape = pill ? 'h-8 rounded-full px-3 text-[13px]' : 'rounded-md px-2 py-0.5 text-xs'
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap font-bold ${shape} ${TONES[tone]} ${className}`}>
      {children}
    </span>
  )
}
