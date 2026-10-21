import { useState } from 'react'
import { ProgressBar, Segmented, StatusIcon, SYNC_STATUS, Icon } from '@/components/ui'
import { fmt } from '@/lib/money'
import type { Entry, Member, MemberStatus } from '@/types'

type Filter = 'all' | 'pending' | 'done' | 'failed'

export interface MemberRow {
  member: Member
  status: MemberStatus
  entry?: Entry
}

interface MemberListProps {
  rows: MemberRow[]
  selectedId: string
  onSelect: (memberId: string) => void
  onRetry: (entryId: string) => void
}

function matches(filter: Filter, status: MemberStatus): boolean {
  if (filter === 'pending') return status === 'none' || status === 'draft'
  if (filter === 'done') return status === 'synced' || status === 'pending'
  if (filter === 'failed') return status === 'failed'
  return true
}

export default function MemberList({ rows, selectedId, onSelect, onRetry }: MemberListProps) {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const done = rows.filter((r) => r.entry).length
  const count = (f: Filter) => rows.filter((r) => matches(f, r.status)).length
  const q = query.trim().toLowerCase()
  const visible = rows.filter(
    (r) => matches(filter, r.status) && (!q || r.member.name.toLowerCase().includes(q) || r.member.id.toLowerCase().includes(q)),
  )

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex flex-col gap-3 border-b border-line-soft px-4 pb-3 pt-4">
        <label className="relative block">
          <span className="sr-only">Search members</span>
          <Icon name="search" size={18} className="absolute left-3.5 top-[15px] text-muted" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name or member no."
            className="h-12 w-full rounded-[10px] border border-line-strong bg-subtle pl-[42px] pr-3.5 text-[15px] focus:border-brand focus:outline-none"
          />
        </label>
        <Segmented
          value={filter}
          onChange={setFilter}
          options={[
            { value: 'all', label: 'All', count: rows.length },
            { value: 'pending', label: 'Pending', count: count('pending') },
            { value: 'done', label: 'Done', count: count('done') },
            { value: 'failed', label: 'Failed', count: count('failed') },
          ]}
        />
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-sm">
            <span>
              <b>
                {done} of {rows.length}
              </b>{' '}
              processed
            </span>
            <span className="text-ink-2">{rows.length - done} left</span>
          </div>
          <ProgressBar value={done} max={rows.length} />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {visible.map(({ member, status, entry }) => {
          const current = member.id === selectedId
          const look = SYNC_STATUS[status]
          const tag = current ? 'Editing' : status === 'failed' ? 'Retry' : entry ? fmt(entry.cash) : ''
          return (
            <button
              key={member.id}
              type="button"
              aria-label={`${member.name}, ${member.id}, ${look.label}`}
              aria-current={current}
              onClick={() => (status === 'failed' && entry ? onRetry(entry.id) : onSelect(member.id))}
              className={`flex h-[60px] w-full items-center gap-3 border-b border-canvas px-4 text-left ${
                current ? 'bg-brand-soft shadow-[inset_4px_0_0_#1f3fd1]' : status === 'failed' ? 'bg-bad-tint' : 'bg-white hover:bg-subtle'
              }`}
            >
              <StatusIcon status={status} />
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-[15px] font-semibold">{member.name}</span>
                <span className={`truncate text-xs ${look.sub}`}>
                  {member.id} · {look.label}
                </span>
              </span>
              <span className={`whitespace-nowrap text-[13px] font-bold ${current ? 'text-brand' : look.tone}`}>{tag}</span>
            </button>
          )
        })}
        {visible.length === 0 && <p className="p-6 text-center text-sm text-ink-2">No members match.</p>}
      </div>
    </div>
  )
}
