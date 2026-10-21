import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { seed } from '@/data/seed'
import type { RootState } from '@/app/store'
import type { Deduction, GumbatoSettings, LongTermSettings } from '@/types'

// New amounts and rates apply from now on; saved entries and issued loans keep theirs.
const settingsSlice = createSlice({
  name: 'settings',
  initialState: seed.settings,
  reducers: {
    saveDeduction(state, action: PayloadAction<Deduction>) {
      const i = state.deductions.findIndex((d) => d.id === action.payload.id)
      if (i === -1) state.deductions.push(action.payload)
      else state.deductions[i] = action.payload
    },
    setArchived(state, action: PayloadAction<{ id: string; archived: boolean }>) {
      const d = state.deductions.find((x) => x.id === action.payload.id)
      if (d) d.archived = action.payload.archived
    },
    saveLoanSettings(state, action: PayloadAction<{ gumbato: GumbatoSettings; longTerm: LongTermSettings; by: string }>) {
      state.gumbato = action.payload.gumbato
      state.longTerm = action.payload.longTerm
      state.updatedAt = new Date().toISOString()
      state.updatedBy = action.payload.by
    },
  },
})

export const { saveDeduction, setArchived, saveLoanSettings } = settingsSlice.actions

export const selectSettings = (state: RootState) => state.settings

export default settingsSlice.reducer
