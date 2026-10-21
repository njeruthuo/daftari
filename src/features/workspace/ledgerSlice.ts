import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { seed } from '@/data/seed'
import type { RootState } from '@/app/store'
import type { Entry, LoanTerms } from '@/types'

export type NewEntry = Omit<Entry, 'id'>

function pad(n: number): string {
  return String(n).padStart(4, '0')
}

// Every money movement: member entries, adjustments and loans.
// Entries are append-only; corrections are new adjustment entries.
const ledgerSlice = createSlice({
  name: 'ledger',
  initialState: seed.ledger,
  reducers: {
    // Save a member entry, plus the loan it issues, if any.
    saveEntry(state, action: PayloadAction<{ entry: NewEntry; loan: LoanTerms | null }>) {
      const { entry, loan } = action.payload
      const id = `E-${pad(state.nextEntry++)}`
      let loanId: string | null = null
      if (loan) {
        loanId = `L-${pad(state.nextLoan++)}`
        state.loans.push({ ...loan, id: loanId, memberId: entry.memberId, entryId: id })
      }
      state.entries.push({ ...entry, id, loanId })
    },
    // A correction: a new entry linked to the one it corrects. The original never changes.
    postAdjustment(state, action: PayloadAction<NewEntry>) {
      state.entries.push({ ...action.payload, id: `ADJ-${pad(state.nextAdjustment++)}` })
    },
    toggleFlag(state, action: PayloadAction<string>) {
      const entry = state.entries.find((e) => e.id === action.payload)
      if (entry) entry.flagged = !entry.flagged
    },
    // Stand-in for the server upload until a backend exists.
    markAllSynced(state) {
      for (const e of state.entries) if (e.sync === 'pending') e.sync = 'synced'
    },
    retrySync(state, action: PayloadAction<string | undefined>) {
      for (const e of state.entries) {
        if (e.sync === 'failed' && (!action.payload || e.id === action.payload)) e.sync = 'pending'
      }
    },
  },
})

export const { saveEntry, postAdjustment, toggleFlag, markAllSynced, retrySync } = ledgerSlice.actions

export const selectEntries = (state: RootState) => state.ledger.entries
export const selectLoans = (state: RootState) => state.ledger.loans

export default ledgerSlice.reducer
