import { useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { Badge, Button, Card, CardHeader, Field, Icon, SectionLabel } from '@/components/ui'
import { toNumber } from '@/lib/money'
import type { Attendance, Deduction } from '@/types'
import SettingsLayout from './SettingsLayout'
import { saveDeduction, setArchived } from './settingsSlice'

const COLS = 'grid grid-cols-[minmax(180px,2fr)_90px_minmax(150px,1.2fr)_100px] gap-3 px-5'

const BLANK: Deduction = { id: '', name: '', note: '', amount: 0, appliesTo: 'optin', autoOn: null, active: true, archived: false }

function OptionButton({ on, onClick, children }: { on: boolean; onClick: () => void; children: string }) {
  return (
    <Button variant={on ? 'primary' : 'secondary'} onClick={onClick} aria-pressed={on} className="flex-1">
      {children}
    </Button>
  )
}

export default function DeductionsSettings() {
  const dispatch = useAppDispatch()
  const deductions = useAppSelector((state) => state.settings.deductions)
  const [editing, setEditing] = useState<Deduction | null>(null)
  const [amount, setAmount] = useState('')
  const [showArchived, setShowArchived] = useState(false)

  const current = deductions.filter((d) => !d.archived)
  const archived = deductions.filter((d) => d.archived)

  function edit(d: Deduction) {
    setEditing(d)
    setAmount(String(d.amount || ''))
  }

  function save() {
    if (!editing) return
    dispatch(saveDeduction({ ...editing, id: editing.id || `d-${Date.now()}`, name: editing.name.trim(), amount: toNumber(amount) }))
    setEditing(null)
  }

  return (
    <SettingsLayout title="Deductions">
      <div className="flex flex-col gap-4 xl:flex-row">
        <Card className="min-w-0 flex-1 overflow-x-auto">
          <CardHeader title="These appear as chips in every member entry" className="px-5 py-3.5">
            <Button variant="primary" onClick={() => edit(BLANK)}>
              <Icon name="plus" size={18} />
              Add deduction
            </Button>
          </CardHeader>
          <div className="min-w-[600px]">
            <div className={`${COLS} bg-subtle py-2.5 text-xs font-bold uppercase tracking-wider text-muted`}>
              <span>Name</span>
              <span className="text-right">Amount</span>
              <span>Applies</span>
              <span>Status</span>
            </div>
            {current.map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => edit(d)}
                className={`${COLS} min-h-[60px] w-full items-center border-t border-canvas text-left text-[15px] ${
                  editing?.id === d.id ? 'bg-brand-tint shadow-[inset_4px_0_0_#1f3fd1]' : 'hover:bg-subtle'
                }`}
              >
                <span className="min-w-0">
                  <span className={`block font-semibold ${d.active ? '' : 'text-muted'}`}>{d.name}</span>
                  <span className="block truncate text-xs text-ink-2">{d.note}</span>
                </span>
                <span className="text-right font-semibold">{d.amount}</span>
                <span className="text-sm text-ink-2">{d.appliesTo === 'everyone' ? 'Everyone by default' : 'Opt-in per entry'}</span>
                <span>
                  <Badge tone={d.active ? 'ok' : 'neutral'}>{d.active ? 'Active' : 'Inactive'}</Badge>
                </span>
              </button>
            ))}
            {archived.length > 0 && (
              <div className="flex items-center justify-between border-t border-canvas px-5 py-3 text-sm text-ink-2">
                <span>Archived ({archived.length}) · kept in past entries</span>
                <Button variant="link" onClick={() => setShowArchived(!showArchived)}>
                  {showArchived ? 'Hide' : 'Show'}
                </Button>
              </div>
            )}
            {showArchived &&
              archived.map((d) => (
                <div key={d.id} className={`${COLS} min-h-14 items-center border-t border-canvas text-[15px] text-muted`}>
                  <span>{d.name}</span>
                  <span className="text-right">{d.amount}</span>
                  <span />
                  <Button variant="link" onClick={() => dispatch(setArchived({ id: d.id, archived: false }))}>
                    Restore
                  </Button>
                </div>
              ))}
          </div>
        </Card>

        {editing && (
          <Card as="aside" className="flex flex-col gap-4 p-5 xl:w-[400px] xl:shrink-0">
            <h2 className="text-lg font-bold">{editing.id ? `Edit · ${editing.name}` : 'New deduction'}</h2>
            <Field label="Name" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
            <Field label="Note" value={editing.note} onChange={(e) => setEditing({ ...editing, note: e.target.value })} />
            <Field label="Default amount" prefix="KES" inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value.replace(/\D/g, ''))} />
            <div className="flex flex-col gap-1.5">
              <SectionLabel>Applies to</SectionLabel>
              <div className="flex gap-2">
                <OptionButton on={editing.appliesTo === 'everyone'} onClick={() => setEditing({ ...editing, appliesTo: 'everyone', autoOn: null })}>
                  Everyone by default
                </OptionButton>
                <OptionButton on={editing.appliesTo === 'optin'} onClick={() => setEditing({ ...editing, appliesTo: 'optin' })}>
                  Opt-in per entry
                </OptionButton>
              </div>
              <span className="text-[13px] text-ink-2">
                {editing.appliesTo === 'everyone' ? 'Chip starts ON for everyone attending.' : 'Chip starts OFF unless switched on by attendance.'}
              </span>
            </div>
            {editing.appliesTo === 'optin' && (
              <div className="flex flex-col gap-1.5">
                <SectionLabel>Turn on automatically when marked</SectionLabel>
                <div className="flex gap-2">
                  {([null, 'late', 'absent'] as (Attendance | null)[]).map((a) => (
                    <OptionButton key={a ?? 'never'} on={editing.autoOn === a} onClick={() => setEditing({ ...editing, autoOn: a })}>
                      {a === null ? 'Never' : a === 'late' ? 'Late' : 'Absent'}
                    </OptionButton>
                  ))}
                </div>
              </div>
            )}
            <label className="flex min-h-12 items-center gap-3 text-[15px]">
              <input type="checkbox" className="h-5 w-5 accent-brand" checked={editing.active} onChange={(e) => setEditing({ ...editing, active: e.target.checked })} />
              <span>
                <b>Active</b> <span className="text-ink-2">· inactive deductions are hidden from entries</span>
              </span>
            </label>
            <p className="text-[13px] text-ink-2">A new amount applies to entries from now on. Past entries keep the amount they were recorded with.</p>
            <div className="flex flex-wrap justify-end gap-3">
              {editing.id && (
                <Button
                  variant="ghost"
                  className="mr-auto"
                  onClick={() => {
                    dispatch(setArchived({ id: editing.id, archived: true }))
                    setEditing(null)
                  }}
                >
                  <Icon name="archive" size={18} />
                  Archive
                </Button>
              )}
              <Button onClick={() => setEditing(null)}>Cancel</Button>
              <Button variant="primary" disabled={!editing.name.trim() || toNumber(amount) === 0} onClick={save}>
                Save changes
              </Button>
            </div>
          </Card>
        )}
      </div>
    </SettingsLayout>
  )
}
