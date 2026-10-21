import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { loadUnlockedMemberId } from '@/app/storage'
import type { RootState } from '@/app/store'

interface AuthState {
  memberId: string | null
  lastMemberId: string
}

const unlocked = loadUnlockedMemberId()
const initialState: AuthState = { memberId: unlocked, lastMemberId: unlocked ?? 'M001' }

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    unlock(state, action: PayloadAction<string>) {
      state.memberId = action.payload
      state.lastMemberId = action.payload
    },
    lock(state) {
      state.memberId = null
    },
  },
})

export const { unlock, lock } = authSlice.actions

// The signed-in official, joined with their member name.
export const selectCurrentOfficial = (state: RootState) => {
  const official = state.data.officials.find((o) => o.memberId === state.auth.memberId)
  const member = state.data.members.find((m) => m.id === official?.memberId)
  return official && member ? { ...official, name: member.name } : null
}

export default authSlice.reducer
