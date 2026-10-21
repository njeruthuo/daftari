import type { Attendance } from '@/types'

export const NEXT_ATTENDANCE: Record<Attendance, Attendance> = { present: 'late', late: 'absent', absent: 'present' }

export const ATTENDANCE_LOOK: Record<Attendance, { tag: string; tone: 'ok' | 'warn' | 'neutral'; row: string }> = {
  present: { tag: 'IN', tone: 'ok', row: 'border-line bg-white' },
  late: { tag: 'LATE', tone: 'warn', row: 'border-warn-line bg-warn-soft' },
  absent: { tag: 'ABSENT', tone: 'neutral', row: 'border-line-strong bg-line-soft text-ink-2' },
}
