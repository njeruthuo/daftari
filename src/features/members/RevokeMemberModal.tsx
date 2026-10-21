import { useState } from 'react'
import { revokeMember } from '@/app/dataSlice'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { Banner, Button, Modal, ModalIcon, TextArea } from '@/components/ui'
import { memberSavings } from '@/lib/balances'
import { revokeBlockers } from '@/lib/members'
import { kes } from '@/lib/money'
import type { Member } from '@/types'

// Revoking hides a member from new sessions. Their ledger and past entries stay.
export default function RevokeMemberModal({ member, onClose }: { member: Member; onClose: () => void }) {
  const dispatch = useAppDispatch()
  const officials = useAppSelector((state) => state.data.officials)
  const { entries, loans } = useAppSelector((state) => state.ledger)
  const [reason, setReason] = useState('')

  const blockers = revokeBlockers(member, officials, loans, entries)
  const savings = memberSavings(member, entries)

  function revoke() {
    dispatch(revokeMember({ id: member.id, reason: reason.trim() }))
    onClose()
  }

  return (
    <Modal
      title={`Revoke ${member.name}`}
      subtitle={`${member.id} will no longer appear in new sessions. Their ledger and past entries are kept.`}
      icon={<ModalIcon name="blocked" tone="bad" />}
      onClose={onClose}
      width="sm:max-w-[560px]"
      footer={
        <>
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="danger" disabled={blockers.length > 0 || !reason.trim()} onClick={revoke}>
            Revoke member
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4 pb-2">
        {blockers.length > 0 ? (
          <Banner tone="bad" title="Can't revoke yet">
            <ul className="mt-1 list-disc pl-5">
              {blockers.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          </Banner>
        ) : (
          savings > 0 && (
            <Banner tone="warn" title={`${kes(savings)} in savings`}>
              Pay out or settle the savings outside Daftari. The balance stays on their ledger.
            </Banner>
          )
        )}
        <TextArea label="Reason *" placeholder="e.g. Left the group, moved away" value={reason} onChange={(e) => setReason(e.target.value)} />
      </div>
    </Modal>
  )
}
