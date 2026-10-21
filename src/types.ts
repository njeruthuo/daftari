// Domain types shared across the app. The future database schema should start from these.

export type Attendance = 'present' | 'late' | 'absent'
export type SyncStatus = 'synced' | 'pending' | 'failed'
// What a member row shows in a session: an entry's sync status, a draft, or nothing yet.
export type MemberStatus = SyncStatus | 'draft' | 'none'
export type LoanType = 'gumbato' | 'longterm'

export interface Group {
  name: string
  meets: string
  location: string
}

export interface Member {
  id: string
  name: string
  since: string
  openingSavings: number
  phone?: string
  // Missing on older saved data, which means active.
  status?: 'active' | 'revoked'
  revokedAt?: string | null
  revokedReason?: string
}

export interface Official {
  memberId: string
  role: string
  pin: string
}

export interface Deduction {
  id: string
  name: string
  note: string
  amount: number
  appliesTo: 'everyone' | 'optin'
  autoOn: Attendance | null
  active: boolean
  archived: boolean
}

export interface GumbatoSettings {
  chargePct: number
  months: number
  formFee: number
}

export interface LongTermSettings {
  interestPct: number
  feePer10k: number
  months: number
}

// Calculated terms for a loan that is about to be issued.
export interface LoanTerms {
  type: LoanType
  principal: number
  charge: number
  total: number
  formFee: number
  months: number
  installment: number
  issuedOn: string
  deadline: string
  formRef?: string
}

export interface Loan extends LoanTerms {
  id: string
  memberId: string
  entryId?: string
  // Repaid before Daftari, migrated from the paper register.
  opening?: { paid: number; count: number }
}

export interface EntryDeduction {
  id: string
  name: string
  amount: number
}

export interface Entry {
  id: string
  kind: 'entry' | 'adjustment'
  sessionId: string
  memberId: string
  at: string
  by: string
  cash: number
  deductions: EntryDeduction[]
  fees: number
  savings: number
  repayST: number
  repayLT: number
  stLoanId: string | null
  ltLoanId: string | null
  // Principal paid out of the box for a loan issued in this entry.
  loanOut: number
  loanId: string | null
  note: string
  sync: SyncStatus
  linkedTo: string | null
  reason: string
  flagged: boolean
}

export interface Session {
  id: string
  name: string
  date: string
  startedAt: string
  leadId: string
  attendance: Record<string, Attendance>
  status: 'open' | 'closed'
  counted: number | null
  varianceReason: string
  closedAt: string | null
  closedBy: string | null
}

// The member entry being typed in the workspace. Amounts are keypad text.
export interface EntryForm {
  cash: string
  deductionIds: string[]
  // null = AUTO (remainder goes to savings)
  savings: string | null
  repayST: string
  repayLT: string
  note: string
  newLoan: LoanTerms | null
}
