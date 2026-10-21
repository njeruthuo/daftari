import { createSlice } from '@reduxjs/toolkit'
import { seed } from '@/data/seed'
import type { RootState } from '@/app/store'

// Every money movement: member entries, adjustments and loans.
const ledgerSlice = createSlice({
  name: 'ledger',
  initialState: seed.ledger,
  reducers: {},
})

export const selectEntries = (state: RootState) => state.ledger.entries
export const selectLoans = (state: RootState) => state.ledger.loans

export default ledgerSlice.reducer
