export interface SegmentedOption<T extends string> {
  value: T
  label: string
  count?: number
}

interface SegmentedProps<T extends string> {
  options: SegmentedOption<T>[]
  value: T
  onChange: (value: T) => void
}

// Segmented filter control.
export default function Segmented<T extends string>({ options, value, onChange }: SegmentedProps<T>) {
  return (
    <div className="grid gap-1 rounded-xl bg-canvas p-1" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}>
      {options.map((o) => {
        const on = o.value === value
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(o.value)}
            className={`flex h-11 flex-col items-center justify-center rounded-[9px] text-[13px] font-semibold leading-tight ${
              on ? 'bg-white text-ink shadow-[0_1px_3px_rgba(14,23,38,.18)]' : 'text-ink-2'
            }`}
          >
            <span>{o.label}</span>
            {o.count !== undefined && <span className="text-xs font-bold">{o.count}</span>}
          </button>
        )
      })}
    </div>
  )
}
