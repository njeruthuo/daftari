import { useState } from 'react'
import { useNavigate } from 'react-router'
import { addMember } from '@/app/dataSlice'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { Button, Field, Modal, ModalIcon } from '@/components/ui'
import { todayISO } from '@/lib/dates'
import { nextMemberId } from '@/lib/members'
import { toNumber } from '@/lib/money'

// Register a new member. Opening savings is for balances migrated from a paper passbook.
export default function AddMemberModal({ onClose }: { onClose: () => void }) {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const members = useAppSelector((state) => state.data.members)
  const id = nextMemberId(members)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [since, setSince] = useState(todayISO())
  const [opening, setOpening] = useState('')

  const trimmed = name.trim().replace(/\s+/g, ' ')
  const duplicate = members.some((m) => m.name.toLowerCase() === trimmed.toLowerCase())

  function save() {
    dispatch(addMember({ id, name: trimmed, phone: phone.trim(), since, openingSavings: toNumber(opening), status: 'active' }))
    onClose()
    navigate(`/members/${id}`)
  }

  return (
    <Modal
      title="Add member"
      subtitle={`Will be registered as ${id} and included from the next session.`}
      icon={<ModalIcon name="plus" tone="brand" />}
      onClose={onClose}
      width="sm:max-w-[560px]"
      footer={
        <>
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="primary" disabled={!trimmed} onClick={save}>
            Add {id}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4 pb-2">
        <Field
          label="Full name *"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
          hint={duplicate ? 'A member with this name already exists. Check before adding.' : undefined}
        />
        <Field label="Phone" type="tel" placeholder="07XX XXX XXX" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Member since" type="date" value={since} onChange={(e) => setSince(e.target.value)} />
          <Field
            label="Opening savings"
            prefix="KES"
            inputMode="numeric"
            value={opening}
            onChange={(e) => setOpening(e.target.value.replace(/\D/g, ''))}
            hint="From the paper passbook, if any"
          />
        </div>
      </div>
    </Modal>
  )
}
