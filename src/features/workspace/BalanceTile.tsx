import { Badge, type Tone } from '@/components/ui'

interface BalanceTileProps {
  label: string
  before?: string
  after: string
  meta: string
  metaTone?: Tone
  badge?: { text: string; tone: Tone }
  muted?: boolean
}

// Balance before → after this entry, for savings and each loan.
export default function BalanceTile({ label, before, after, meta, metaTone = 'neutral', badge, muted }: BalanceTileProps) {
  const metaColor = { ok: 'text-ok', warn: 'text-warn', bad: 'text-bad', brand: 'text-brand', neutral: 'text-muted' }[metaTone]
  const border = badge?.tone === 'bad' ? 'border-bad-line bg-bad-tint' : 'border-line-soft bg-subtle'
  return (
    <div className={`min-w-0 rounded-[10px] border px-3 py-2 ${border}`}>
      <div className="flex h-5 items-center justify-between gap-1.5">
        <span className="truncate text-xs font-bold uppercase tracking-wider text-ink-2">{label}</span>
        {badge && <Badge tone={badge.tone}>{badge.text}</Badge>}
      </div>
      <div className="mt-0.5 flex items-baseline gap-1.5 whitespace-nowrap">
        {before !== undefined && (
          <>
            <span className="text-sm text-muted">{before}</span>
            <span className="text-sm text-muted">→</span>
          </>
        )}
        <span className={`truncate text-xl font-bold ${muted ? 'text-muted' : 'text-ink'}`}>{after}</span>
      </div>
      <div className={`truncate text-xs font-semibold ${metaColor}`}>{meta}</div>
    </div>
  )
}
