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
    // Treasurer's physical count of the cash box, and why it differs from expected.
    setCount(state, action: PayloadAction<{ sessionId: string; counted: number | null; reason: string }>) {
      const session = state.list.find((s) => s.id === action.payload.sessionId)
      if (!session) return
      session.counted = action.payload.counted
      session.varianceReason = action.payload.reason
    },
    // Locks the session. Later fixes are adjustment entries.
    closeSession(state, action: PayloadAction<{ sessionId: string; by: string }>) {
      const session = state.list.find((s) => s.id === action.payload.sessionId)
      if (!session) return
      session.status = 'closed'
      session.closedAt = new Date().toISOString()
      session.closedBy = action.payload.by
      delete state.drafts[session.id]
    },
  },
})

export const { startSession, setAttendance, saveDraft, clearDraft, setCount, closeSession } = sessionsSlice.actions

export const selectSessions = (state: RootState) => state.sessions.list
export const selectOpenSession = (state: RootState) => state.sessions.list.find((s) => s.status === 'open')

export default sessionsSlice.reducer
