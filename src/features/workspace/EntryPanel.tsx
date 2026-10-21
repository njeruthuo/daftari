import type { ReactNode } from 'react'
import { AmountField, Card, Chip, Keypad, SectionLabel, type KeypadKey } from '@/components/ui'
import type { EntryMath } from '@/lib/entry'
import type { ActiveLoan } from '@/lib/loans'
import { fmt } from '@/lib/money'
import { shortDate } from '@/lib/dates'
import type { Deduction, EntryForm } from '@/types'
import AllocationRow from './AllocationRow'

export type KeypadTarget = 'cash' | 'savings' | 'repayST' | 'repayLT'

const TARGET_LABEL: Record<KeypadTarget, string> = {
  cash: 'Cash received',
  savings: 'Add to savings',
  repayST: 'Repay Gumbato',
  repayLT: 'Repay long-term loan',
}

interface EntryPanelProps {
  form: EntryForm
  math: EntryMath
  deductions: Deduction[]
  target: KeypadTarget
  setTarget: (target: KeypadTarget) => void
  onKey: (key: KeypadKey) => void
  onToggleDeduction: (id: string) => void
  onFill: (field: 'repayST' | 'repayLT', amount: number) => void
  onAutoSavings: () => void
  st: ActiveLoan | null
  lt: ActiveLoan | null
  // New-loan buttons, rendered under the allocation rows.
  loanActions?: ReactNode
}

function suggested(loan: ActiveLoan): number {
  return Math.min(loan.installment, loan.balance)
}

function loanSub(loan: ActiveLoan | null, kind: string): string {
  if (!loan) return `No active ${kind} loan`
  const next = loan.count + 1
  return `${fmt(loan.balance)} owed · installment ${next} of ${loan.months} · due ${shortDate(loan.deadline)}`
}

export default function EntryPanel(props: EntryPanelProps) {
  const { form, math, deductions, target, setTarget, onKey, onToggleDeduction, onFill, onAutoSavings, st, lt, loanActions } = props
  return (
    <div className="flex flex-1 flex-col gap-3 lg:flex-row">
      <Card className="flex flex-col gap-2.5 p-3 lg:w-[300px] lg:shrink-0">
        <div className="flex items-center justify-between">
          <SectionLabel>Cash received</SectionLabel>
          <span className="text-xs text-ink-2">Treasurer's count</span>
        </div>
        <AmountField label="Cash received" value={form.cash} size="lg" active={target === 'cash'} onSelect={() => setTarget('cash')} />
        <Keypad onKey={onKey} />
        <div className="flex items-center gap-1.5 text-[13px] text-ink-2">
          <span className="h-2 w-2 rounded-full bg-brand" />
          Keypad is typing into: <b className="text-brand-dark">{TARGET_LABEL[target]}</b>
        </div>
      </Card>

      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <Card className="flex flex-col gap-2 px-3.5 py-3">
          <div className="flex items-center justify-between">
            <SectionLabel>Deductions</SectionLabel>
            <span className="text-base font-bold">− KES {fmt(math.deductionTotal + math.fees)}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {deductions.map((d) => (
              <Chip key={d.id} on={form.deductionIds.includes(d.id)} onClick={() => onToggleDeduction(d.id)}>
                <span>{d.name}</span>
                <span className="font-bold">{d.amount}</span>
              </Chip>
            ))}
            {form.newLoan && (
              <Chip on disabled>
                <span>{form.newLoan.type === 'gumbato' ? 'Gumbato form fee' : 'Long-term form fee'}</span>
                <span className="font-bold">{fmt(form.newLoan.formFee)}</span>
              </Chip>
            )}
          </div>
        </Card>

        <Card className="flex flex-1 flex-col px-3.5 py-3">
          <div className="flex items-center justify-between pb-1.5">
            <SectionLabel>Allocation</SectionLabel>
            <span className="text-[13px] font-semibold text-ink-2">
              KES {fmt(math.allocated)} of {fmt(Math.max(0, math.cash - math.deductionTotal - math.fees))} allocated
            </span>
          </div>
          <AllocationRow
            icon="save"
            label="Add to savings"
            sub={math.auto ? 'Remainder after deductions and repayments' : 'Typed by hand'}
            value={math.auto ? String(math.savings) : form.savings}
            auto={math.auto}
            active={target === 'savings'}
            onSelect={() => setTarget('savings')}
            action={math.auto ? undefined : { label: 'Auto', onClick: onAutoSavings }}
          />
          <AllocationRow
            icon="repay"
            label="Repay Gumbato"
            sub={loanSub(st, 'short-term')}
            value={form.repayST}
            disabled={!st}
            active={target === 'repayST'}
            onSelect={() => setTarget('repayST')}
            action={st ? { label: `Fill ${fmt(suggested(st))}`, onClick: () => onFill('repayST', suggested(st)) } : undefined}
          />
          <AllocationRow
            icon="repay"
            label="Repay long-term loan"
            sub={loanSub(lt, 'long-term')}
            value={form.repayLT}
            disabled={!lt}
            active={target === 'repayLT'}
            onSelect={() => setTarget('repayLT')}
            action={lt ? { label: `Fill ${fmt(suggested(lt))}`, onClick: () => onFill('repayLT', suggested(lt)) } : undefined}
          />
          {loanActions}
        </Card>
      </div>
    </div>
  )
}
