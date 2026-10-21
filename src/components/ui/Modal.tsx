import { useEffect, type ReactNode } from 'react'
import Icon from './Icon'

interface ModalProps {
  title: string
  subtitle?: ReactNode
  icon?: ReactNode
  onClose: () => void
  footer?: ReactNode
  width?: string
  children: ReactNode
}

// Centered dialog on tablets, bottom sheet on phones.
export default function Modal({ title, subtitle, icon, onClose, footer, width = 'sm:max-w-[640px]', children }: ModalProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#0e1726]/60 sm:items-center sm:p-6" onClick={onClose}>
      <section
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className={`flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-[18px] bg-white shadow-[0_24px_64px_rgba(0,0,0,.35)] sm:rounded-[18px] ${width}`}
      >
        <header className="flex gap-3.5 px-6 pb-3.5 pt-5">
          {icon}
          <div className="min-w-0 flex-1">
            <h2 className="text-[21px] font-bold">{title}</h2>
            {subtitle && <p className="mt-1 text-[15px] leading-snug text-ink-2">{subtitle}</p>}
          </div>
          <button type="button" aria-label="Close" onClick={onClose} className="-mr-2 flex h-11 w-11 items-center justify-center rounded-[10px] text-ink-2 hover:bg-key">
            <Icon name="close" />
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-6">{children}</div>
        {footer && <footer className="flex flex-wrap justify-end gap-3 px-6 pb-5 pt-4">{footer}</footer>}
      </section>
    </div>
  )
}

// Round tinted icon shown at the top left of a modal.
export function ModalIcon({ name, tone }: { name: 'plus' | 'blocked' | 'repay' | 'warn'; tone: 'brand' | 'bad' }) {
  const look = tone === 'bad' ? 'bg-bad-soft text-bad' : 'bg-brand-soft text-brand'
  return (
    <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${look}`}>
      <Icon name={name} size={26} strokeWidth={2.4} />
    </span>
  )
}
