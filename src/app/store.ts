import { configureStore } from '@reduxjs/toolkit'
import auth from '@/features/auth/authSlice'
import data from './dataSlice'
import ledger from '@/features/workspace/ledgerSlice'
import sessions from '@/features/sessions/sessionsSlice'
import settings from '@/features/settings/settingsSlice'
import sync from '@/features/workspace/syncSlice'
import { loadState, saveState } from './storage'

export const store = configureStore({
  reducer: { auth, data, ledger, sessions, settings, sync },
  preloadedState: loadState(),
})

store.subscribe(() => saveState(store.getState()))

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
