import type { Entry, Loan, Member } from '@/types'
import { fmt } from './money'

export type LedgerKind = 'opening' | 'savings' | 'loan' | 'deduction' | 'adjustment'

export interface LedgerRow {
  id: string
  date: string
  ref: string
  description: string
  detail: string
  cash: number | null
  savings: number
  gumbato: number
  longTerm: number
  kinds: LedgerKind[]
}

function describe(e: Entry, issued: Loan | undefined): { description: string; detail: string; kinds: LedgerKind[] } {
  if (e.kind === 'adjustment') {
    return { description: `Adjustment · cash ${e.cash < 0 ? '−' : '+'} ${fmt(Math.abs(e.cash))}`, detail: `Corrects ${e.linkedTo} · ${e.reason} · ${e.by}`, kinds: ['adjustment'] }
  }
  const parts: string[] = []
  const kinds: LedgerKind[] = []
  if (e.savings) {
    parts.push(`Savings + ${fmt(e.savings)}`)
    kinds.push('savings')
  }
  if (issued) {
    parts.push(`${issued.type === 'gumbato' ? 'Gumbato' : 'Long-term'} issued ${fmt(issued.principal)}`)
    kinds.push('loan')
  }
  if (e.repayST) {
    parts.push(`Gumbato repaid ${fmt(e.repayST)}`)
    kinds.push('loan')
  }
  if (e.repayLT) {
    parts.push(`Long-term repaid ${fmt(e.repayLT)}`)
    kinds.push('loan')
  }
  const ded = e.deductions.reduce((s, d) => s + d.amount, 0)
  if (ded) kinds.push('deduction')
  const detail = [ded ? `Deductions ${fmt(ded)}` : '', e.fees ? `form fee ${fmt(e.fees)}` : '', e.note].filter(Boolean).join(' · ')
  return { description: parts.join(' · ') || 'No savings this month', detail, kinds }
}

// A member's full history, oldest first, with balances recalculated after every row.
export function memberLedger(member: Member, entries: Entry[], loans: Loan[]): LedgerRow[] {
  const own = loans.filter((l) => l.memberId === member.id)
  const migrated = own.filter((l) => !l.entryId)
  const openingOwed = (type: Loan['type']) =>
    migrated.filter((l) => l.type === type).reduce((s, l) => s + l.total - (l.opening?.paid ?? 0), 0)

  let savings = member.openingSavings
  let gumbato = openingOwed('gumbato')
  let longTerm = openingOwed('longterm')
  const rows: LedgerRow[] = [
    { id: 'opening', date: '', ref: `OB-${member.id.slice(1)}`, description: 'Opening balance', detail: member.openingSavings || migrated.length ? 'Migrated from paper passbook' : 'Joined with no opening balance', cash: null, savings, gumbato, longTerm, kinds: ['opening'] },
  ]

  const mine = entries.filter((e) => e.memberId === member.id).sort((a, b) => a.at.localeCompare(b.at))
  for (const e of mine) {
    const issued = own.find((l) => l.entryId === e.id)
    savings += e.savings
    gumbato += (issued?.type === 'gumbato' ? issued.total : 0) - e.repayST
    longTerm += (issued?.type === 'longterm' ? issued.total : 0) - e.repayLT
    rows.push({ id: e.id, date: e.at, ref: e.id, ...describe(e, issued), cash: e.cash, savings, gumbato, longTerm })
  }
  return rows
}
