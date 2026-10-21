import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import TopBar, { TaskScreen } from '@/components/layout/TopBar'
import { Badge, Button, Card, CardHeader, Field, Icon, SectionLabel } from '@/components/ui'
import { monthName, todayISO } from '@/lib/dates'
import type { Attendance } from '@/types'
import { ATTENDANCE_LOOK, NEXT_ATTENDANCE } from './attendance'
import { selectOpenSession, startSession } from './sessionsSlice'

export default function StartSession() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { group, members } = useAppSelector((state) => state.data)
  const deductions = useAppSelector((state) => state.settings.deductions)
  const leadId = useAppSelector((state) => state.auth.memberId)
  const open = useAppSelector(selectOpenSession)

  const [date, setDate] = useState(todayISO())
  const [name, setName] = useState(`${monthName(todayISO())} Monthly Meeting`)
  const [attendance, setAttendance] = useState<Record<string, Attendance>>(() =>
    Object.fromEntries(members.map((m) => [m.id, 'present' as Attendance])),
  )

  if (open) return <Navigate to={`/sessions/${open.id}`} replace />

  const count = (value: Attendance) => Object.values(attendance).filter((a) => a === value).length
  const attending = count('present') + count('late')
  const live = deductions.filter((d) => d.active && !d.archived)
  const preApplied = [
    ...live.filter((d) => d.appliesTo === 'everyone').map((d) => ({ d, who: `${attending} attending` })),
    ...live.filter((d) => d.autoOn === 'late').map((d) => ({ d, who: `${count('late')} late` })),
    ...live.filter((d) => d.autoOn === 'absent').map((d) => ({ d, who: `${count('absent')} absent` })),
  ]

  function cycle(memberId: string) {
    setAttendance({ ...attendance, [memberId]: NEXT_ATTENDANCE[attendance[memberId]] })
  }

  function start() {
    const id = `S-${Date.now()}`
    dispatch(
      startSession({
        id,
        name: name.trim() || `${monthName(date)} Monthly Meeting`,
        date,
        startedAt: new Date().toISOString(),
        leadId: leadId ?? '',
        attendance,
        status: 'open',
        counted: null,
        varianceReason: '',
        closedAt: null,
        closedBy: null,
      }),
    )
    navigate(`/sessions/${id}`)
  }

  return (
    <TaskScreen>
      <TopBar backTo="/" title="Start a new session">
        <span className="hidden text-sm text-navy-text sm:inline">
          {group.name} · {members.length} members
        </span>
      </TopBar>

      <div className="flex flex-1 flex-col gap-5 p-4 lg:flex-row lg:px-6 lg:py-5">
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <Card className="grid gap-4 px-5 py-[18px] sm:grid-cols-2">
            <Field label="Meeting date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            <Field label="Meeting name" value={name} onChange={(e) => setName(e.target.value)} />
          </Card>

          <Card className="flex flex-col gap-3 px-5 py-[18px]">
            <div className="flex flex-wrap items-center gap-3">
              <div className="min-w-60 flex-1">
                <h2 className="text-lg font-bold">Attendance quick-mark</h2>
                <p className="mt-0.5 text-sm text-ink-2">Everyone starts Present. Tap to cycle Present → Late → Absent.</p>
              </div>
              <Button onClick={() => setAttendance(Object.fromEntries(members.map((m) => [m.id, 'present' as Attendance])))}>
                Mark all present
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-4">
              {members.map((m) => {
                const look = ATTENDANCE_LOOK[attendance[m.id]]
                return (
                  <button
                    key={m.id}
                    type="button"
                    aria-label={`${m.name}, ${attendance[m.id]}`}
                    onClick={() => cycle(m.id)}
                    className={`flex h-12 min-w-0 items-center gap-2 rounded-[10px] border px-2.5 text-left ${look.row}`}
                  >
                    <span className="w-8 shrink-0 text-[11px] font-bold text-muted">{m.id}</span>
                    <span className="min-w-0 flex-1 truncate text-sm font-semibold">{m.name}</span>
                    <Badge tone={look.tone} className="!text-[11px]">
                      {look.tag}
                    </Badge>
                  </button>
                )
              })}
            </div>
          </Card>
        </div>

        <Card as="aside" className="flex flex-col gap-4 p-5 lg:w-[340px] lg:shrink-0">
          <CardHeader title="Session summary" />
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-[10px] bg-ok-soft p-3 text-ok">
              <div className="text-[26px] font-bold">{count('present')}</div>
              <div className="text-xs font-semibold">Present</div>
            </div>
            <div className="rounded-[10px] bg-warn-soft p-3 text-warn">
              <div className="text-[26px] font-bold">{count('late')}</div>
              <div className="text-xs font-semibold">Late</div>
            </div>
            <div className="rounded-[10px] bg-line-soft p-3 text-ink-2">
              <div className="text-[26px] font-bold">{count('absent')}</div>
              <div className="text-xs font-semibold">Absent</div>
            </div>
          </div>
          <div className="flex flex-col gap-2.5">
            <SectionLabel>Pre-applied in entries</SectionLabel>
            {preApplied.map(({ d, who }) => (
              <div key={d.id} className="flex justify-between text-[15px]">
                <span>
                  {d.name} · {who}
                </span>
                <span className="font-semibold">{d.amount} each</span>
              </div>
            ))}
          </div>
          <p className="text-[13px] leading-normal text-ink-2">
            You can still change any chip inside a member's entry. Attendance can be edited during the session.
          </p>
          <div className="flex-1" />
          <div className="flex items-center gap-2 text-[13px] text-ink-2">
            <Icon name="check" size={18} className="text-ok" />
            Starts offline — no connection needed
          </div>
          <Button variant="primary" size="lg" onClick={start}>
            Start session
            <Icon name="next" size={22} strokeWidth={2.4} />
          </Button>
        </Card>
      </div>
    </TaskScreen>
  )
}
