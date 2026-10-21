import { fmt, signed } from '@/lib/money'

// Counted vs expected cash, coloured by short / over / balanced.
export default function VarianceBox({ counted, expected }: { counted: number; expected: number }) {
  const variance = counted - expected
  const look = variance === 0 ? 'border-[#9ed3b2] bg-ok-soft text-ok' : variance < 0 ? 'border-bad-line bg-bad-soft text-bad' : 'border-warn-line bg-warn-tint text-warn'
  const label = variance === 0 ? 'BALANCED' : variance < 0 ? 'SHORT' : 'OVER'
  return (
    <div className={`flex items-center justify-between rounded-[10px] border px-4 py-3 ${look}`}>
      <div>
        <div className="text-xs font-bold">VARIANCE · {label}</div>
        <div className="text-[13px] text-ink-2">
          {fmt(counted)} counted − {fmt(expected)} expected
        </div>
      </div>
      <span className="text-[28px] font-bold">{signed(variance)}</span>
    </div>
  )
}
