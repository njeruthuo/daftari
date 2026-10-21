import { createSlice } from '@reduxjs/toolkit'
import { seed } from '@/data/seed'
import type { RootState } from '@/app/store'

const settingsSlice = createSlice({
  name: 'settings',
  initialState: seed.settings,
  reducers: {},
})

export const selectSettings = (state: RootState) => state.settings
export const selectDeductions = (state: RootState) => state.settings.deductions

export default settingsSlice.reducer
