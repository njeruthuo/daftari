import type { Attendance, Deduction, EntryForm } from '@/types'
import { toNumber } from './money'

// A blank entry form. Deduction chips start ON when they apply to everyone
// attending, or when they auto-apply for the member's attendance.
export function newEntryForm(deductions: Deduction[], attendance: Attendance = 'present'): EntryForm {
  const attending = attendance !== 'absent'
  const deductionIds = deductions
    .filter((d) => d.active && !d.archived)
    .filter((d) => (d.appliesTo === 'everyone' && attending) || d.autoOn === attendance)
    .map((d) => d.id)
  return { cash: '', deductionIds, savings: null, repayST: '', repayLT: '', note: '', newLoan: null }
}

export interface EntryMath {
  cash: number
  chosen: Deduction[]
  deductionTotal: number
  fees: number
  repayST: number
  repayLT: number
  savings: number
  auto: boolean
  allocated: number
  unallocated: number
}

// Allocation math (README: Entry allocation). `savings: null` means AUTO.
export function calcEntry(form: EntryForm, deductions: Deduction[]): EntryMath {
  const cash = toNumber(form.cash)
  const chosen = deductions.filter((d) => form.deductionIds.includes(d.id))
  const deductionTotal = chosen.reduce((sum, d) => sum + d.amount, 0)
  const fees = form.newLoan ? form.newLoan.formFee : 0
  const repayST = toNumber(form.repayST)
  const repayLT = toNumber(form.repayLT)
  const auto = form.savings === null
  const savings = auto ? Math.max(0, cash - deductionTotal - fees - repayST - repayLT) : toNumber(form.savings)
  const allocated = savings + repayST + repayLT
  const unallocated = cash - deductionTotal - fees - allocated
  return { cash, chosen, deductionTotal, fees, repayST, repayLT, savings, auto, allocated, unallocated }
}
