import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

interface SyncState {
  online: boolean
  lastSyncedAt: string | null
}

const initialState: SyncState = { online: navigator.onLine, lastSyncedAt: null }

const syncSlice = createSlice({
  name: 'sync',
  initialState,
  reducers: {
    setOnline(state, action: PayloadAction<boolean>) {
      state.online = action.payload
    },
    syncedAt(state, action: PayloadAction<string>) {
      state.lastSyncedAt = action.payload
    },
  },
})

export const { setOnline, syncedAt } = syncSlice.actions
export default syncSlice.reducer
