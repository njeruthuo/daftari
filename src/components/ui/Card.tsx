import type { HTMLAttributes, ReactNode } from 'react'

interface CardProps extends HTMLAttributes<HTMLElement> {
  as?: 'section' | 'div' | 'aside'
}

export default function Card({ as: Tag = 'section', className = '', children, ...props }: CardProps) {
  return (
    <Tag className={`rounded-xl border border-line bg-white ${className}`} {...props}>
      {children}
    </Tag>
  )
}

// Small uppercase heading used at the top of cards.
export function SectionLabel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <span className={`text-[13px] font-bold uppercase tracking-wider text-ink-2 ${className}`}>{children}</span>
}

// Card title row: heading on the left, optional content on the right.
export function CardHeader({ title, children, className = '' }: { title: ReactNode; children?: ReactNode; className?: string }) {
  return (
    <div className={`flex items-center justify-between gap-3 ${className}`}>
      <h2 className="text-lg font-bold">{title}</h2>
      {children}
    </div>
  )
}
