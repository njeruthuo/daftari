import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { seed } from '@/data/seed'
import type { RootState } from '@/app/store'
import type { Attendance, EntryForm, Session } from '@/types'

interface MemberRef {
  sessionId: string
  memberId: string
}

const sessionsSlice = createSlice({
  name: 'sessions',
  initialState: seed.sessions,
  reducers: {
    startSession(state, action: PayloadAction<Session>) {
      state.list.push(action.payload)
    },
    setAttendance(state, action: PayloadAction<MemberRef & { value: Attendance }>) {
      const session = state.list.find((s) => s.id === action.payload.sessionId)
      if (session) session.attendance[action.payload.memberId] = action.payload.value
    },
    saveDraft(state, action: PayloadAction<MemberRef & { form: EntryForm }>) {
      const { sessionId, memberId, form } = action.payload
      state.drafts[sessionId] = { ...state.drafts[sessionId], [memberId]: form }
    },
    clearDraft(state, action: PayloadAction<MemberRef>) {
      delete state.drafts[action.payload.sessionId]?.[action.payload.memberId]
    },
  },
})

export const { startSession, setAttendance, saveDraft, clearDraft } = sessionsSlice.actions

export const selectSessions = (state: RootState) => state.sessions.list
export const selectOpenSession = (state: RootState) => state.sessions.list.find((s) => s.status === 'open')

export default sessionsSlice.reducer
