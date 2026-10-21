import { fmt, toNumber } from '@/lib/money'

interface AmountFieldProps {
  label: string
  value: string | null
  active?: boolean
  disabled?: boolean
  onSelect?: () => void
  size?: 'md' | 'lg'
}

// A KES amount the keypad types into. Tap it to make it the keypad's target.
export default function AmountField({ label, value, active = false, disabled = false, onSelect, size = 'md' }: AmountFieldProps) {
  const big = size === 'lg'
  const state = disabled
    ? 'border border-dashed border-line bg-subtle'
    : active
      ? 'border-2 border-brand bg-brand-tint shadow-[0_0_0_4px_rgba(31,63,209,.15)]'
      : 'border border-line-strong bg-white'
  const text = disabled ? '—' : fmt(toNumber(value))
  return (
    <button
      type="button"
      aria-label={`${label}, KES ${text}`}
      aria-pressed={active}
      disabled={disabled}
      onClick={onSelect}
      className={`flex w-full items-center justify-end gap-2 rounded-[10px] px-4 ${big ? 'h-[72px]' : 'h-12'} ${state}`}
    >
      <span className={`font-semibold text-muted ${big ? 'text-base' : 'text-[13px]'}`}>KES</span>
      <span className={`font-bold ${big ? 'text-[40px] tracking-tight' : 'text-[19px]'} ${disabled ? 'text-faint' : 'text-ink'}`}>{text}</span>
    </button>
  )
}
