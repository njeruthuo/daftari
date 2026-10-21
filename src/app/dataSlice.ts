import { createSlice } from '@reduxjs/toolkit'
import { seed } from '@/data/seed'
import type { RootState } from './store'

// The group, its members and officials. Read-only until member management exists.
const dataSlice = createSlice({
  name: 'data',
  initialState: seed.data,
  reducers: {},
})

export const selectGroup = (state: RootState) => state.data.group
export const selectMembers = (state: RootState) => state.data.members

export default dataSlice.reducer
