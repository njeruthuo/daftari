import { createSlice } from '@reduxjs/toolkit'
import { seed } from '@/data/seed'
import type { RootState } from '@/app/store'

const sessionsSlice = createSlice({
  name: 'sessions',
  initialState: seed.sessions,
  reducers: {},
})

export const selectSessions = (state: RootState) => state.sessions.list
export const selectOpenSession = (state: RootState) => state.sessions.list.find((s) => s.status === 'open')

export default sessionsSlice.reducer
