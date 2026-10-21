export default function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = max ? Math.round((value / max) * 100) : 0
  return (
    <div className="h-1.5 rounded-full bg-line-soft" role="progressbar" aria-valuenow={value} aria-valuemax={max}>
      <div className="h-1.5 rounded-full bg-brand" style={{ width: `${pct}%` }} />
    </div>
  )
}
