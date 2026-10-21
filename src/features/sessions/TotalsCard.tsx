import { Card, CardHeader, SectionLabel } from '@/components/ui'
import { fmt } from '@/lib/money'
import type { SessionTotals } from '@/lib/session'

interface Group {
  title: string
  rows: { label: string; calc: string; amount: string }[]
  totalLabel: string
  total: string
  out?: boolean
}

function groups(t: SessionTotals): Group[] {
  return [
    {
      title: 'Money in · members',
      rows: [
        { label: 'Savings added', calc: '', amount: fmt(t.savings) },
        { label: 'Gumbato repaid', calc: `${t.repaymentsST} repayments`, amount: fmt(t.repayST) },
        { label: 'Long-term repaid', calc: `${t.repaymentsLT} repayments`, amount: fmt(t.repayLT) },
      ],
      totalLabel: 'Savings + repayments',
      total: fmt(t.savings + t.repayST + t.repayLT),
    },
    {
      title: 'Deductions',
      rows: Object.entries(t.deductions).map(([name, d]) => ({ label: name, calc: `${d.count} entries`, amount: fmt(d.amount) })),
      totalLabel: 'Deductions',
      total: fmt(t.deductionTotal),
    },
    {
      title: 'Form fees',
      rows: [
        { label: 'Gumbato form fee', calc: `${t.countST} loans`, amount: fmt(t.feesST) },
        { label: 'Long-term form fee', calc: `${t.countLT} loans`, amount: fmt(t.feesLT) },
      ],
      totalLabel: 'Fees',
      total: fmt(t.fees),
    },
    {
      title: 'Loans paid out · cash out',
      rows: [
        { label: `Gumbato · ${t.countST} loans`, calc: `debt created ${fmt(t.debtST)}`, amount: fmt(t.loansOutST) },
        { label: `Long-term · ${t.countLT} loans`, calc: `repayable ${fmt(t.debtLT)}`, amount: fmt(t.loansOutLT) },
      ],
      totalLabel: `Total cash received ${fmt(t.cash)} · paid out`,
      total: `− ${fmt(t.loansOut)}`,
      out: true,
    },
  ]
}

// Totals by category for a session.
export default function TotalsCard({ totals, entryCount }: { totals: SessionTotals; entryCount: number }) {
  return (
    <Card className="flex flex-col gap-4 p-5">
      <CardHeader title="Totals by category">
        <span className="text-[13px] text-ink-2">
          From {entryCount} entries · {totals.adjustments} adjustments
        </span>
      </CardHeader>
      <div className="grid gap-4 xl:grid-cols-2">
        {groups(totals).map((g) => (
          <div key={g.title} className="flex flex-col overflow-hidden rounded-[10px] border border-line-soft">
            <SectionLabel className="px-3.5 pt-3">{g.title}</SectionLabel>
            <div className="flex flex-col px-3.5 py-1.5">
              {g.rows.length === 0 && <span className="py-1.5 text-sm text-muted">None</span>}
              {g.rows.map((r) => (
                <div key={r.label} className="flex items-baseline gap-2 py-1.5 text-[15px]">
                  <span className="flex-1">{r.label}</span>
                  <span className="text-xs text-muted">{r.calc}</span>
                  <span className="w-24 text-right font-semibold">{r.amount}</span>
                </div>
              ))}
            </div>
            <div className={`mt-auto flex justify-between px-3.5 py-2.5 text-sm font-bold ${g.out ? 'bg-warn-tint text-[#8a5200]' : 'bg-subtle'}`}>
              <span>{g.totalLabel}</span>
              <span>{g.total}</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
