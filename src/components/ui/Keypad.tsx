import Icon from './Icon'

export type KeypadKey = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '00' | 'back'

const DIGITS: KeypadKey[] = ['1', '2', '3', '4', '5', '6', '7', '8', '9']

interface KeypadProps {
  onKey: (key: KeypadKey) => void
  withDoubleZero?: boolean
  size?: 'md' | 'lg'
}

// Numeric keypad shared by PIN unlock, member entries and loan forms.
export default function Keypad({ onKey, withDoubleZero = true, size = 'md' }: KeypadProps) {
  const keys: (KeypadKey | null)[] = [...DIGITS, withDoubleZero ? '00' : null, '0', 'back']
  const height = size === 'lg' ? 'h-[72px] text-[28px] rounded-2xl' : 'h-14 text-2xl rounded-[10px]'
  return (
    <div className={`grid grid-cols-3 ${size === 'lg' ? 'gap-3.5' : 'gap-2'}`}>
      {keys.map((key, i) =>
        key === null ? (
          <span key={i} />
        ) : (
          <button
            key={key}
            type="button"
            aria-label={key === 'back' ? 'Delete' : key}
            onClick={() => onKey(key)}
            className={`flex items-center justify-center border border-line font-semibold text-ink active:bg-brand-soft ${height} ${
              key === 'back' || key === '00' ? 'bg-white' : 'bg-key'
            }`}
          >
            {key === 'back' ? <Icon name="backspace" size={26} strokeWidth={2} /> : key}
          </button>
        ),
      )}
    </div>
  )
}

// Apply a keypad key to a digit string, capped at `max` digits.
export function applyKey(value: string | null, key: KeypadKey, max = 7): string {
  const text = value ?? ''
  if (key === 'back') return text.slice(0, -1)
  return (text + key).replace(/^0+(?=\d)/, '').slice(0, max)
}
