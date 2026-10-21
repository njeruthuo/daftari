import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { seed } from '@/data/seed'
import { isActive } from '@/lib/members'
import type { RootState } from './store'
import type { Member } from '@/types'

// The group, its members and officials.
// Members are never deleted: revoking hides them from new sessions but keeps their history.
const dataSlice = createSlice({
  name: 'data',
  initialState: seed.data,
  reducers: {
    addMember(state, action: PayloadAction<Member>) {
      state.members.push(action.payload)
    },
    revokeMember(state, action: PayloadAction<{ id: string; reason: string }>) {
      const member = state.members.find((m) => m.id === action.payload.id)
      if (!member) return
      member.status = 'revoked'
      member.revokedAt = new Date().toISOString()
      member.revokedReason = action.payload.reason
    },
    reinstateMember(state, action: PayloadAction<string>) {
      const member = state.members.find((m) => m.id === action.payload)
      if (!member) return
      member.status = 'active'
      member.revokedAt = null
      member.revokedReason = ''
    },
  },
})

export const { addMember, revokeMember, reinstateMember } = dataSlice.actions

export const selectGroup = (state: RootState) => state.data.group
export const selectMembers = (state: RootState) => state.data.members
export const selectActiveCount = (state: RootState) => state.data.members.filter(isActive).length

export default dataSlice.reducer
