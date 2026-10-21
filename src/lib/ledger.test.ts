import { describe, expect, it } from 'vitest'
import { seed } from '@/data/seed'
import type { Entry } from '@/types'
import { adjustAmount, reverseEntry } from './adjustment'
import { memberLedger } from './ledger'
import { sessionTotals } from './session'

function entry(patch: Partial<Entry>): Entry {
  return {
    id: 'E-0001', kind: 'entry', sessionId: 'S-1', memberId: 'M028', at: '2026-10-20T14:26:00Z', by: 'Wanjiru Kamau',
    cash: 3150, deductions: [{ id: 'd-insurance', name: 'Cash insurance', amount: 50 }, { id: 'd-sitting', name: 'Sitting allowance', amount: 100 }],
    fees: 0, savings: 3000, repayST: 0, repayLT: 0, stLoanId: null, ltLoanId: null, loanOut: 0, loanId: null,
    note: '', sync: 'synced', linkedTo: null, reason: '', flagged: false, ...patch,
  }
}

describe('adjustments (screen 14)', () => {
  it('moves cash and savings together so a −200 correction clears a −200 variance', () => {
    const original = entry({})
    const adj = { ...entry({ id: 'ADJ-0001', kind: 'adjustment', linkedTo: 'E-0001' }), ...adjustAmount(original, 'savings', -200) }
    const before = sessionTotals([original], [])
    const after = sessionTotals([original, adj], [])
    expect(after.cash).toBe(before.cash - 200)
    expect(after.savings).toBe(before.savings - 200)
    expect(after.adjustments).toBe(1)
  })

  it('reverses every amount of an entry', () => {
    const original = entry({})
    const totals = sessionTotals([original, { ...original, id: 'ADJ-0002', kind: 'adjustment', ...reverseEntry(original) }], [])
    expect(totals.cash).toBe(0)
    expect(totals.savings).toBe(0)
    expect(totals.deductionTotal).toBe(0)
  })
})

describe('member ledger', () => {
  it('starts from the migrated opening balance and runs balances per row', () => {
    const grace = seed.data.members.find((m) => m.id === 'M004')!
    const repay = entry({ memberId: 'M004', cash: 4150, savings: 2000, repayST: 2000, stLoanId: 'L-0001' })
    const rows = memberLedger(grace, [repay], seed.ledger.loans)
    expect(rows[0].gumbato).toBe(4000)
    expect(rows[1].gumbato).toBe(2000)
    expect(rows[1].savings).toBe(grace.openingSavings + 2000)
  })
})
