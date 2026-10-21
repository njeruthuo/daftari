import type { Entry } from '@/types'

export type AdjustTarget = 'savings' | 'repayST' | 'repayLT' | 'deduction'

type Correction = Pick<Entry, 'cash' | 'savings' | 'repayST' | 'repayLT' | 'fees' | 'deductions' | 'stLoanId' | 'ltLoanId'>

const ZERO: Correction = { cash: 0, savings: 0, repayST: 0, repayLT: 0, fees: 0, deductions: [], stLoanId: null, ltLoanId: null }

// Money fields of an adjustment that moves `amount` (signed) on one part of an entry.
// Cash received moves by the same amount, so the entry still balances.
export function adjustAmount(original: Entry, target: AdjustTarget, amount: number): Correction {
  const out: Correction = { ...ZERO, cash: amount }
  if (target === 'savings') out.savings = amount
  if (target === 'repayST') {
    out.repayST = amount
    out.stLoanId = original.stLoanId
  }
  if (target === 'repayLT') {
    out.repayLT = amount
    out.ltLoanId = original.ltLoanId
  }
  if (target === 'deduction') out.deductions = [{ id: 'adjustment', name: 'Deduction adjustment', amount }]
  return out
}

// Money fields of an adjustment that cancels an entry completely.
export function reverseEntry(original: Entry): Correction {
  return {
    cash: -original.cash,
    savings: -original.savings,
    repayST: -original.repayST,
    repayLT: -original.repayLT,
    fees: -original.fees,
    deductions: original.deductions.map((d) => ({ ...d, amount: -d.amount })),
    stLoanId: original.stLoanId,
    ltLoanId: original.ltLoanId,
  }
}
