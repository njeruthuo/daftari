export interface MathRow {
  label: string
  value: string
  total?: boolean
  className?: string
}

// Label / value rows for live calculations and summaries.
export default function MathRows({ rows }: { rows: MathRow[] }) {
  return (
    <dl className="flex flex-col">
      {rows.map((row) => (
        <div
          key={row.label}
          className={`flex items-baseline justify-between gap-4 py-2 text-[15px] ${row.total ? 'border-t border-line-soft font-bold' : ''}`}
        >
          <dt className={row.total ? '' : 'text-ink-2'}>{row.label}</dt>
          <dd className={`font-semibold ${row.className ?? ''}`}>{row.value}</dd>
        </div>
      ))}
    </dl>
  )
}
