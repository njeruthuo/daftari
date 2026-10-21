import { seed, type PersistedState } from '@/data/seed'

const KEY = 'daftari:v1'

export function loadState(): PersistedState {
  try {
    const saved = localStorage.getItem(KEY)
    if (saved) return JSON.parse(saved) as PersistedState
  } catch {
    // Corrupt or blocked storage: fall back to the seed.
  }
  return seed
}

// Only these slices are saved on the device. auth and sync are per visit.
export function saveState({ data, settings, sessions, ledger }: PersistedState): void {
  try {
    localStorage.setItem(KEY, JSON.stringify({ data, settings, sessions, ledger }))
  } catch {
    // Storage full or blocked: keep running in memory.
  }
}

export function clearState(): void {
  localStorage.removeItem(KEY)
}
