import type { Entry, Loan } from '@/types'
import { GUMBATO } from './loans'

export interface SessionTotals {
  cash: number
  savings: number
  repayST: number
  repayLT: number
  repaymentsST: number
  repaymentsLT: number
  deductions: Record<string, { count: number; amount: number }>
  deductionTotal: number
  feesST: number
  feesLT: number
  fees: number
  loansOutST: number
  loansOutLT: number
  loansOut: number
  debtST: number
  debtLT: number
  countST: number
  countLT: number
  adjustments: number
  expected: number
}

// Totals for one session's entries (README: Session close).
export function sessionTotals(entries: Entry[], loans: Loan[]): SessionTotals {
  const loanById = new Map(loans.map((l) => [l.id, l]))
  const t: SessionTotals = {
    cash: 0, savings: 0, repayST: 0, repayLT: 0, repaymentsST: 0, repaymentsLT: 0,
    deductions: {}, deductionTotal: 0, feesST: 0, feesLT: 0, fees: 0,
    loansOutST: 0, loansOutLT: 0, loansOut: 0, debtST: 0, debtLT: 0, countST: 0, countLT: 0,
    adjustments: 0, expected: 0,
  }
  for (const e of entries) {
    t.cash += e.cash
    t.savings += e.savings
    t.repayST += e.repayST
    t.repayLT += e.repayLT
    if (e.kind === 'adjustment') t.adjustments += 1
    if (e.kind === 'entry' && e.repayST > 0) t.repaymentsST += 1
    if (e.kind === 'entry' && e.repayLT > 0) t.repaymentsLT += 1
    for (const d of e.deductions) {
      const row = t.deductions[d.name] ?? { count: 0, amount: 0 }
      row.count += 1
      row.amount += d.amount
      t.deductions[d.name] = row
      t.deductionTotal += d.amount
    }
    const loan = e.loanId ? loanById.get(e.loanId) : undefined
    if (!loan) continue
    if (loan.type === GUMBATO) {
      t.feesST += e.fees
      t.loansOutST += e.loanOut
      t.debtST += loan.total
      t.countST += 1
    } else {
      t.feesLT += e.fees
      t.loansOutLT += e.loanOut
      t.debtLT += loan.total
      t.countLT += 1
    }
  }
  t.fees = t.feesST + t.feesLT
  t.loansOut = t.loansOutST + t.loansOutLT
  t.expected = t.cash - t.loansOut
  return t
}
