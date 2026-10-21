import type { Entry, Loan, Member } from '@/types'
import { loanStatus } from './loans'

export function memberSavings(member: Member, entries: Entry[]): number {
  return entries.filter((e) => e.memberId === member.id).reduce((sum, e) => sum + e.savings, member.openingSavings)
}

interface LoanBook {
  amount: number
  active: number
  overdue: number
}

// Group-wide totals for the Home stat tiles.
export function groupTotals(members: Member[], entries: Entry[], loans: Loan[]) {
  const savings = members.reduce((sum, m) => sum + memberSavings(m, entries), 0)
  const gumbato: LoanBook = { amount: 0, active: 0, overdue: 0 }
  const longTerm: LoanBook = { amount: 0, active: 0, overdue: 0 }
  for (const loan of loans) {
    const status = loanStatus(loan, entries)
    if (!status.active) continue
    const book = loan.type === 'gumbato' ? gumbato : longTerm
    book.amount += status.balance
    book.active += 1
    if (status.overdue) book.overdue += 1
  }
  return { savings, gumbato, longTerm }
}
