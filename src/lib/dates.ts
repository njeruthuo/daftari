export function todayISO(): string {
  return toISODate(new Date())
}

export function toISODate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function parse(iso: string): Date {
  return new Date(`${iso.slice(0, 10)}T00:00:00`)
}

// "2026-10-20" -> "Tue 20 Oct 2026"
export function formatDate(iso: string | null): string {
  if (!iso) return ''
  return parse(iso).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
}

// "2026-10-20" -> "20 Oct 2026"
export function shortDate(iso: string | null): string {
  if (!iso) return ''
  return parse(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

// ISO timestamp -> "14:26"
export function formatTime(iso: string | null): string {
  if (!iso) return ''
  return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

// "2026-10-20" -> "October 2026"
export function monthName(iso: string): string {
  return parse(iso).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
}

export function addMonths(iso: string, months: number): string {
  const date = parse(iso)
  date.setMonth(date.getMonth() + months)
  return toISODate(date)
}

export function daysBetween(fromISO: string, toISO: string): number {
  return Math.round((parse(toISO).getTime() - parse(fromISO).getTime()) / 86400000)
}
