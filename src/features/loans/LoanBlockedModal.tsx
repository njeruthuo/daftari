import { Button, Modal, ModalIcon } from '@/components/ui'
import { daysBetween, shortDate, todayISO } from '@/lib/dates'
import type { ActiveLoan } from '@/lib/loans'
import { fmt, kes } from '@/lib/money'
import type { Member } from '@/types'

interface LoanBlockedModalProps {
  member: Member
  loan: ActiveLoan
  onRepay: () => void
  onClose: () => void
}

// A second loan of the same type is blocked while one is active.
export default function LoanBlockedModal({ member, loan, onRepay, onClose }: LoanBlockedModalProps) {
  const name = loan.type === 'gumbato' ? 'Gumbato' : 'long-term loan'
  const late = daysBetween(loan.deadline, todayISO())
  return (
    <Modal
      title={`Can't issue a new ${name}`}
      subtitle={`${member.name} (${member.id}) still has an active ${name}. Only one is allowed at a time.`}
      icon={<ModalIcon name="blocked" tone="bad" />}
      onClose={onClose}
      width="sm:max-w-[560px]"
      footer={
        <>
          <Button onClick={onClose}>Close</Button>
          <Button variant="primary" onClick={onRepay}>
            Repay {kes(loan.balance)} instead
          </Button>
        </>
      }
    >
      <div className={`overflow-hidden rounded-xl border-2 ${loan.overdue ? 'border-bad-line' : 'border-line'}`}>
        <div className={`flex items-center justify-between px-3.5 py-2.5 ${loan.overdue ? 'bg-bad-soft text-bad' : 'bg-subtle text-ink-2'}`}>
          <span className="text-sm font-bold">{loan.overdue ? `OVERDUE${late > 0 ? ` · ${late} days` : ''}` : 'ACTIVE'}</span>
          <span className="text-[13px] font-semibold">Deadline {shortDate(loan.deadline)}</span>
        </div>
        <div className="grid grid-cols-3">
          <div className="border-r border-canvas px-3.5 py-3">
            <div className="text-xs font-bold text-ink-2">ISSUED</div>
            <div className="mt-0.5 text-base font-bold">{fmt(loan.principal)}</div>
            <div className="text-xs text-ink-2">
              {shortDate(loan.issuedOn)} · debt {fmt(loan.total)}
            </div>
          </div>
          <div className="border-r border-canvas px-3.5 py-3">
            <div className="text-xs font-bold text-ink-2">REPAYMENTS</div>
            <div className={`mt-0.5 text-base font-bold ${loan.overdue ? 'text-bad' : ''}`}>
              {loan.count} of {loan.months} used
            </div>
            <div className="text-xs text-ink-2">Paid {fmt(loan.paid)}</div>
          </div>
          <div className="px-3.5 py-3">
            <div className="text-xs font-bold text-ink-2">STILL OWED</div>
            <div className="mt-0.5 text-xl font-bold text-bad">{kes(loan.balance)}</div>
            <div className="text-xs text-ink-2">
              {fmt(loan.total)} − {fmt(loan.paid)}
            </div>
          </div>
        </div>
      </div>
      <p className="mt-3 text-[13px] text-ink-2">Clearing the balance today makes them eligible again from the next entry.</p>
    </Modal>
  )
}
