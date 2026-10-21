import type { Tone } from './Badge'

const SUB_TONES: Record<Tone, string> = { ok: 'text-ok', warn: 'text-warn', bad: 'text-bad', brand: 'text-brand', neutral: 'text-ink-2' }

interface StatTileProps {
  label: string
  value: string
  sub?: string
  tone?: Tone
}

export default function StatTile({ label, value, sub, tone = 'neutral' }: StatTileProps) {
  return (
    <div className="min-w-0 rounded-xl border border-line bg-white px-[18px] py-4">
      <div className="text-[13px] font-semibold text-ink-2">{label}</div>
      <div className="mt-1.5 truncate text-2xl font-bold">{value}</div>
      {sub && <div className={`mt-0.5 text-[13px] font-medium ${SUB_TONES[tone]}`}>{sub}</div>}
    </div>
  )
}
