import { describe, expect, it } from 'vitest'
import { seed } from '@/data/seed'
import type { EntryForm } from '@/types'
import { calcEntry, newEntryForm } from './entry'
import { activeLoan, gumbatoTerms, loanStatus, longTermFormFee, longTermTerms } from './loans'

const { deductions, gumbato, longTerm } = seed.settings
const { loans } = seed.ledger

function form(patch: Partial<EntryForm>): EntryForm {
  return { ...newEntryForm(deductions), ...patch }
}

// Examples come from the notes on the Daftari design canvas.
describe('entry allocation', () => {
  it('auto-fills savings with the remainder (screen 05)', () => {
    const math = calcEntry(form({ cash: '3150' }), deductions)
    expect(math.deductionTotal).toBe(150)
    expect(math.savings).toBe(3000)
    expect(math.unallocated).toBe(0)
  })

  it('leaves money unallocated when savings is typed (screen 06)', () => {
    const f = form({ cash: '2500', savings: '500', repayST: '1000', deductionIds: ['d-insurance', 'd-sitting', 'd-late'] })
    expect(calcEntry(f, deductions).unallocated).toBe(750)
  })

  it('goes negative when over-allocated', () => {
    expect(calcEntry(form({ cash: '1000', savings: '2000' }), deductions).unallocated).toBe(-1150)
  })

  it('pre-applies attendance penalties', () => {
    expect(newEntryForm(deductions, 'late').deductionIds).toEqual(['d-insurance', 'd-sitting', 'd-late'])
    expect(newEntryForm(deductions, 'absent').deductionIds).toEqual(['d-absent'])
  })
})

describe('loans', () => {
  it('calculates Gumbato terms (screen 08)', () => {
    const t = gumbatoTerms(10000, gumbato, '2026-10-20')
    expect(t.charge).toBe(1000)
    expect(t.total).toBe(11000)
    expect(t.installment).toBe(3667)
    expect(t.deadline).toBe('2027-01-20')
    expect(t.formFee).toBe(20)
  })

  it('calculates long-term terms (screen 09)', () => {
    const t = longTermTerms(50000, longTerm)
    expect(t.total).toBe(57000)
    expect(t.installment).toBe(4750)
    expect(t.formFee).toBe(500)
  })

  it('scales the long-term form fee', () => {
    expect(longTermFormFee(10000, 100)).toBe(100)
    expect(longTermFormFee(100000, 100)).toBe(1000)
    expect(longTermFormFee(15500, 100)).toBe(160)
  })
})

describe('loan status', () => {
  it('flags a Gumbato overdue after 3 repayments with debt left (screen 08b)', () => {
    const hellen = loans.find((l) => l.memberId === 'M016')!
    const status = loanStatus(hellen, [], '2026-10-20')
    expect(status.balance).toBe(1600)
    expect(status.overdue).toBe(true)
  })

  it('counts repayments recorded in entries (screen 10)', () => {
    const lt = loans.find((l) => l.memberId === 'M002')!
    const repayment = { kind: 'entry', ltLoanId: lt.id, repayLT: 9500, stLoanId: null, repayST: 0 }
    const status = loanStatus(lt, [repayment as never], '2026-10-20')
    expect(status.balance).toBe(28500)
    expect(status.count).toBe(9)
  })

  it('finds no active loan once it is cleared', () => {
    const grace = loans.find((l) => l.memberId === 'M004')!
    const cleared = { kind: 'entry', stLoanId: grace.id, repayST: 4000, ltLoanId: null, repayLT: 0 }
    expect(activeLoan(loans, [cleared as never], 'M004', 'gumbato')).toBeNull()
  })
})
