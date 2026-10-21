import { seed, type PersistedState } from '@/data/seed'

const KEY = 'daftari:v1'
const SYNC_KEY = 'daftari:lastSyncedAt'
// Unlock lasts for this browser tab only, so a reload doesn't ask for the PIN again.
const AUTH_KEY = 'daftari:auth'

function read(storage: Storage, key: string): string | null {
  try {
    return storage.getItem(key)
  } catch {
    return null
  }
}

function write(storage: Storage, key: string, value: string | null): void {
  try {
    if (value === null) storage.removeItem(key)
    else storage.setItem(key, value)
  } catch {
    // Storage full or blocked: keep running in memory.
  }
}

export function loadState(): PersistedState {
  try {
    const saved = read(localStorage, KEY)
    if (saved) return JSON.parse(saved) as PersistedState
  } catch {
    // Corrupt data: fall back to the seed.
  }
  return seed
}

export const loadLastSyncedAt = () => read(localStorage, SYNC_KEY)
export const loadUnlockedMemberId = () => read(sessionStorage, AUTH_KEY)

interface SavedState extends PersistedState {
  auth: { memberId: string | null }
  sync: { lastSyncedAt: string | null }
}

export function saveState({ data, settings, sessions, ledger, auth, sync }: SavedState): void {
  write(localStorage, KEY, JSON.stringify({ data, settings, sessions, ledger }))
  write(localStorage, SYNC_KEY, sync.lastSyncedAt)
  write(sessionStorage, AUTH_KEY, auth.memberId)
}

export function clearState(): void {
  write(localStorage, KEY, null)
  write(localStorage, SYNC_KEY, null)
}
