import type { Entry, GumbatoSettings, Loan, LoanTerms, LoanType, LongTermSettings } from '@/types'
import { addMonths, todayISO } from './dates'
import { fmt } from './money'

export const GUMBATO: LoanType = 'gumbato'
export const LONG_TERM: LoanType = 'longterm'

export interface LoanStatus {
  paid: number
  count: number
  balance: number
  overdue: boolean
  active: boolean
}

export type ActiveLoan = Loan & LoanStatus

// Short-term loan: flat charge added once, cleared in `months` repayments.
export function gumbatoTerms(principal: number, settings: GumbatoSettings, issuedOn = todayISO()): LoanTerms {
  const charge = Math.round((principal * settings.chargePct) / 100)
  const total = principal + charge
  return {
    type: GUMBATO,
    principal,
    charge,
    total,
    formFee: settings.formFee,
    months: settings.months,
    installment: Math.ceil(total / settings.months),
    issuedOn,
    deadline: addMonths(issuedOn, settings.months),
  }
}

// Form fee per 10,000 of principal, rounded up to the nearest 10.
export function longTermFormFee(principal: number, feePer10k: number): number {
  return Math.ceil(((principal / 10000) * feePer10k) / 10) * 10
}

// Long-term loan: simple interest on the principal for the whole term.
export function longTermTerms(
  principal: number,
  settings: LongTermSettings,
  months = settings.months,
  issuedOn = todayISO(),
): LoanTerms {
  const charge = Math.round((principal * settings.interestPct) / 100)
  const total = principal + charge
  return {
    type: LONG_TERM,
    principal,
    charge,
    total,
    formFee: longTermFormFee(principal, settings.feePer10k),
    months,
    installment: Math.ceil(total / months),
    issuedOn,
    deadline: addMonths(issuedOn, months),
  }
}

// Smallest repayment allowed this month. Gumbato takes any amount;
// long-term needs at least the monthly installment, or the balance if that is less.
export function minimumRepayment(loan: ActiveLoan): number {
  return loan.type === GUMBATO ? 0 : Math.min(loan.installment, loan.balance)
}

// Why a repayment amount is not allowed, or null. Zero means "not repaying this month".
export function repaymentError(amount: number, loan: ActiveLoan | null): string | null {
  if (!loan || amount === 0) return null
  const name = loan.type === GUMBATO ? 'Gumbato' : 'Long-term'
  if (amount > loan.balance) return `${name} repayment is more than the ${fmt(loan.balance)} owed`
  const min = minimumRepayment(loan)
  if (amount < min) return `${name} repayment must be at least ${fmt(min)}`
  return null
}

// Balance and repayment count for one loan, from ledger entries.
export function loanStatus(loan: Loan, entries: Entry[], today = todayISO()): LoanStatus {
  const isST = loan.type === GUMBATO
  const repayments = entries.filter((e) => (isST ? e.stLoanId : e.ltLoanId) === loan.id)
  const amountOf = (e: Entry) => (isST ? e.repayST : e.repayLT)
  const paid = (loan.opening?.paid ?? 0) + repayments.reduce((sum, e) => sum + amountOf(e), 0)
  const count = (loan.opening?.count ?? 0) + repayments.filter((e) => e.kind === 'entry' && amountOf(e) > 0).length
  const balance = loan.total - paid
  const overdue = balance > 0 && (today > loan.deadline || (isST && count >= loan.months))
  return { paid, count, balance, overdue, active: balance > 0 }
}

// The member's open loan of a type, with its status, or null.
export function activeLoan(loans: Loan[], entries: Entry[], memberId: string, type: LoanType): ActiveLoan | null {
  for (const loan of loans) {
    if (loan.memberId !== memberId || loan.type !== type) continue
    const status = loanStatus(loan, entries)
    if (status.active) return { ...loan, ...status }
  }
  return null
}
