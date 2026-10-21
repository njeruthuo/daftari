import { Banner, Card, MathRows, SectionLabel } from '@/components/ui'
import { formatTime } from '@/lib/dates'
import { fmt, kes } from '@/lib/money'
import type { Entry } from '@/types'

// Read-only view of an entry already saved in this session.
export default function SavedEntry({ entry }: { entry: Entry }) {
  const rows = [
    { label: 'Cash received', value: kes(entry.cash) },
    ...entry.deductions.map((d) => ({ label: d.name, value: `− ${fmt(d.amount)}` })),
    ...(entry.fees ? [{ label: 'Form fee', value: `− ${fmt(entry.fees)}` }] : []),
    { label: 'Added to savings', value: fmt(entry.savings) },
    ...(entry.repayST ? [{ label: 'Gumbato repaid', value: fmt(entry.repayST) }] : []),
    ...(entry.repayLT ? [{ label: 'Long-term repaid', value: fmt(entry.repayLT) }] : []),
    ...(entry.loanOut ? [{ label: 'Loan paid out of the box', value: fmt(entry.loanOut) }] : []),
  ]
  return (
    <Card className="flex flex-col gap-3 p-4">
      <div className="flex items-center justify-between">
        <SectionLabel>Entry {entry.id}</SectionLabel>
        <span className="text-[13px] text-ink-2">
          Saved {formatTime(entry.at)} by {entry.by}
        </span>
      </div>
      <MathRows rows={rows} />
      {entry.note && <p className="text-sm text-ink-2">Note: {entry.note}</p>}
      <Banner tone="info">Saved entries are never edited. Corrections are made in reconciliation as new, linked entries.</Banner>
    </Card>
  )
}
