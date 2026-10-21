import Icon from './Icon'

// Short confirmation at the bottom of the screen.
export default function Toast({ message, tone = 'ok' }: { message: string | null; tone?: 'ok' | 'warn' }) {
  if (!message) return null
  return (
    <div role="status" className="fixed bottom-24 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2.5 rounded-xl bg-navy px-4 py-3 text-sm font-semibold text-white shadow-lg md:bottom-6">
      <Icon name={tone === 'ok' ? 'check' : 'edit'} size={18} className={tone === 'ok' ? 'text-[#7ee2a4]' : 'text-[#ffc670]'} />
      {message}
    </div>
  )
}
