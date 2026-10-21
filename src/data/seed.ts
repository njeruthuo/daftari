import type { Deduction, Group, GumbatoSettings, Loan, LongTermSettings, Member, Official, Session, EntryForm, Entry } from '@/types'

// Demo data for the Umoja Women Group, used until the real database exists.
const NAMES = [
  'Wanjiru Kamau', 'Achieng Otieno', 'Mary Wambui', 'Grace Njeri Mwangi', 'Faith Chebet', 'Esther Nyambura',
  'Lucy Atieno', 'Joyce Mutheu', 'Beatrice Wairimu', 'Mercy Kerubo', 'Agnes Wangari', 'Rose Akinyi',
  'Jane Muthoni', 'Catherine Njoki', 'Peris Wanjiku', 'Hellen Moraa', 'Ann Wangui', 'Susan Kemunto',
  'Margaret Waithera', 'Purity Jepkosgei', 'Teresia Wangeci', 'Eunice Nduta', 'Dorcas Nafula', 'Lilian Kawira',
  'Judith Auma', 'Naomi Wacera', 'Gladys Mumbi', 'Ruth Nekesa', 'Phyllis Gathoni', 'Josephine Mwende',
  'Elizabeth Wanja', 'Monica Karimi',
]

export function memberId(n: number): string {
  return 'M' + String(n).padStart(3, '0')
}

const members: Member[] = NAMES.map((name, i) => ({
  id: memberId(i + 1),
  name,
  since: `${2019 + (i % 5)}-0${1 + (i % 9)}-01`,
  openingSavings: 20000 + ((i * 3700) % 30000),
  status: 'active',
}))

const deductions: Deduction[] = [
  { id: 'd-insurance', name: 'Cash insurance', note: 'Covers cash-in-transit loss', amount: 50, appliesTo: 'everyone', autoOn: null, active: true, archived: false },
  { id: 'd-sitting', name: 'Sitting allowance', note: 'Paid to officials each meeting', amount: 100, appliesTo: 'everyone', autoOn: null, active: true, archived: false },
  { id: 'd-late', name: 'Lateness penalty', note: 'Auto-on when marked Late', amount: 100, appliesTo: 'optin', autoOn: 'late', active: true, archived: false },
  { id: 'd-absent', name: 'Absence penalty', note: 'Auto-on when marked Absent', amount: 200, appliesTo: 'optin', autoOn: 'absent', active: true, archived: false },
  { id: 'd-welfare', name: 'Welfare (bereavement)', note: 'Switched on when a member is bereaved', amount: 300, appliesTo: 'optin', autoOn: null, active: false, archived: false },
]

// Loans migrated from the paper register; `opening` holds what was already repaid.
const loans: Loan[] = [
  { id: 'L-0001', memberId: 'M004', type: 'gumbato', principal: 5000, charge: 500, total: 5500, formFee: 20, months: 3, installment: 1834, issuedOn: '2026-08-18', deadline: '2026-11-18', opening: { paid: 1500, count: 1 } },
  { id: 'L-0002', memberId: 'M016', type: 'gumbato', principal: 6000, charge: 600, total: 6600, formFee: 20, months: 3, installment: 2200, issuedOn: '2026-06-16', deadline: '2026-09-16', opening: { paid: 5000, count: 2 } },
  { id: 'L-0003', memberId: 'M002', type: 'longterm', principal: 100000, charge: 14000, total: 114000, formFee: 1000, months: 12, installment: 9500, issuedOn: '2026-01-20', deadline: '2027-01-20', opening: { paid: 76000, count: 8 } },
]

export interface DataState {
  group: Group
  members: Member[]
  officials: Official[]
}

export interface SettingsState {
  deductions: Deduction[]
  gumbato: GumbatoSettings
  longTerm: LongTermSettings
  updatedAt: string | null
  updatedBy: string | null
}

export interface SessionsState {
  list: Session[]
  // Unsaved entries: drafts[sessionId][memberId]
  drafts: Record<string, Record<string, EntryForm>>
}

export interface LedgerState {
  entries: Entry[]
  loans: Loan[]
  nextEntry: number
  nextAdjustment: number
  nextLoan: number
}

export interface PersistedState {
  data: DataState
  settings: SettingsState
  sessions: SessionsState
  ledger: LedgerState
}

export const seed: PersistedState = {
  data: {
    group: { name: 'Umoja Women Group', meets: 'Meets 3rd Tuesday', location: 'Kiambu Road, Nairobi' },
    members,
    // Demo PINs: Wanjiru 1234, Achieng 2468
    officials: [
      { memberId: 'M001', role: 'Chairlady', pin: '1234' },
      { memberId: 'M002', role: 'Treasurer', pin: '2468' },
    ],
  },
  settings: {
    deductions,
    gumbato: { chargePct: 10, months: 3, formFee: 20 },
    longTerm: { interestPct: 14, feePer10k: 100, months: 12 },
    updatedAt: null,
    updatedBy: null,
  },
  sessions: { list: [], drafts: {} },
  ledger: { entries: [], loans, nextEntry: 1, nextAdjustment: 1, nextLoan: 4 },
}
