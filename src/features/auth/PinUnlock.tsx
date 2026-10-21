import { useState } from 'react'
import { Navigate, useLocation } from 'react-router'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { Avatar, Button, Icon, Keypad, StatusIcon, applyKey, type KeypadKey } from '@/components/ui'
import { Logo } from '@/components/layout/SideNav'
import { formatDate, formatTime } from '@/lib/dates'
import { count } from '@/lib/money'
import { unlock } from './authSlice'

const PIN_LENGTH = 4

export default function PinUnlock() {
  const dispatch = useAppDispatch()
  const location = useLocation()
  const { group, members, officials } = useAppSelector((state) => state.data)
  const { memberId, lastMemberId } = useAppSelector((state) => state.auth)
  const { lastSyncedAt } = useAppSelector((state) => state.sync)
  const waiting = useAppSelector((state) => state.ledger.entries.filter((e) => e.sync !== 'synced').length)
  const [selectedId, setSelectedId] = useState(lastMemberId)
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')

  const from = (location.state as { from?: string } | null)?.from ?? '/'
  if (memberId) return <Navigate to={from} replace />

  const nameOf = (id: string) => members.find((m) => m.id === id)?.name ?? ''
  const official = officials.find((o) => o.memberId === selectedId) ?? officials[0]
  const treasurer = officials.find((o) => o.role === 'Treasurer') ?? officials[0]

  function onKey(key: KeypadKey) {
    const next = applyKey(pin, key, PIN_LENGTH)
    setError('')
    setPin(next)
    if (next.length < PIN_LENGTH) return
    if (next === official.pin) {
      dispatch(unlock(official.memberId))
    } else {
      setError('Wrong PIN. Try again.')
      setPin('')
    }
  }

  return (
    <div className="flex min-h-full flex-col bg-white md:flex-row">
      <section className="flex flex-col justify-between gap-8 bg-navy p-8 text-white md:w-[520px] md:shrink-0 md:p-12">
        <div className="flex items-center gap-3">
          <Logo />
          <div className="flex flex-col">
            <span className="text-[22px] font-bold">Daftari</span>
            <span className="text-sm text-navy-text">Paperless chama meetings</span>
          </div>
        </div>
        <div className="flex flex-col gap-5">
          <div className="text-sm font-semibold uppercase tracking-widest text-navy-text">This tablet</div>
          <div className="flex flex-col gap-1">
            <span className="text-[34px] font-bold leading-tight">{group.name}</span>
            <span className="text-base text-navy-text">
              {members.length} members · {group.meets} · {group.location}
            </span>
          </div>
          <div className="flex flex-col gap-3 rounded-[14px] border border-navy-line bg-navy-2 p-5">
            <div className="flex items-center gap-2.5 text-[15px] font-semibold text-[#7ee2a4]">
              <StatusIcon status={waiting ? 'pending' : 'synced'} />
              {waiting ? `${count(waiting, 'entry', 'entries')} waiting to sync` : 'All entries synced'}
            </div>
            <div className="text-sm leading-normal text-[#d3dae5]">
              {lastSyncedAt ? `Last synced ${formatDate(lastSyncedAt)}, ${formatTime(lastSyncedAt)}.` : 'Not synced yet on this tablet.'} {count(waiting, 'entry', 'entries')} waiting on this tablet.
            </div>
            <div className="h-px bg-navy-line" />
            <div className="flex items-start gap-2.5 text-sm leading-normal text-[#d3dae5]">
              <Icon name="lock" className="mt-0.5 text-navy-text" />
              <span>Unlock and record entries without internet. Everything saves to this tablet first and syncs when a connection returns.</span>
            </div>
          </div>
        </div>
        <div className="text-[13px] text-[#8d99ab]">v0.1 · Treasurer: {nameOf(treasurer.memberId)}</div>
      </section>

      <section className="flex flex-1 flex-col items-center justify-center gap-7 p-10">
        <div className="flex gap-3" role="group" aria-label="Who is unlocking">
          {officials.map((o) => (
            <button
              key={o.memberId}
              type="button"
              aria-pressed={o.memberId === selectedId}
              onClick={() => {
                setSelectedId(o.memberId)
                setPin('')
                setError('')
              }}
              className="rounded-full"
              aria-label={`${nameOf(o.memberId)}, ${o.role}`}
            >
              <Avatar name={nameOf(o.memberId)} size="lg" selected={o.memberId === selectedId} />
            </button>
          ))}
        </div>
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-[28px] font-bold">Welcome back, {nameOf(selectedId).split(' ')[0]}</h1>
          <p className="text-base text-ink-2">{official.role} · Enter your 4-digit PIN</p>
        </div>
        <div aria-label={`${pin.length} of 4 digits entered`} className="flex h-6 items-center gap-5">
          {Array.from({ length: PIN_LENGTH }, (_, i) => (
            <span key={i} className={`h-5 w-5 rounded-full ${i < pin.length ? 'bg-ink' : 'border-2 border-faint'}`} />
          ))}
        </div>
        <p role="alert" className="h-5 text-sm font-semibold text-bad">
          {error}
        </p>
        <div className="w-[340px] max-w-full">
          <Keypad onKey={onKey} withDoubleZero={false} size="lg" />
        </div>
        <Button variant="link">Forgot PIN? The treasurer can reset it</Button>
      </section>
    </div>
  )
}
