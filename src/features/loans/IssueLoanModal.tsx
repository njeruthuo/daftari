import { useState } from 'react'
import { useAppSelector } from '@/app/hooks'
import { AmountField, Button, Field, Keypad, MathRows, Modal, ModalIcon, SectionLabel, applyKey, type KeypadKey } from '@/components/ui'
import { shortDate } from '@/lib/dates'
import { gumbatoTerms, longTermTerms } from '@/lib/loans'
import { fmt, kes, toNumber } from '@/lib/money'
import type { LoanTerms, LoanType, Member } from '@/types'

interface IssueLoanModalProps {
  type: LoanType
  member: Member
  onIssue: (terms: LoanTerms) => void
  onClose: () => void
}

// Issue a Gumbato or long-term loan. Charge, total, deadline and form fee update live.
export default function IssueLoanModal({ type, member, onIssue, onClose }: IssueLoanModalProps) {
  const settings = useAppSelector((state) => state.settings)
  const isST = type === 'gumbato'
  const [amount, setAmount] = useState('')
  const [months, setMonths] = useState(String(settings.longTerm.months))
  const [formRef, setFormRef] = useState('')

  const principal = toNumber(amount)
  const period = Math.max(1, toNumber(months))
  const terms = isST ? gumbatoTerms(principal, settings.gumbato) : longTermTerms(principal, settings.longTerm, period)
  const rate = isST ? settings.gumbato.chargePct : settings.longTerm.interestPct
  const canIssue = principal > 0 && (isST || formRef.trim() !== '')

  const rows = [
    { label: 'Principal', value: kes(principal) },
    { label: `${isST ? 'Charge' : 'Interest'} ${rate}%`, value: `+ ${fmt(terms.charge)}` },
    { label: isST ? 'Total debt' : 'Total repayable', value: kes(terms.total), total: true },
    { label: isST ? `Suggested installment · ${terms.months} repayments` : `Monthly · ${terms.months} months`, value: fmt(terms.installment) },
    { label: 'Deadline', value: shortDate(terms.deadline) },
    { label: 'Form fee · from this entry', value: fmt(terms.formFee) },
  ]

  return (
    <Modal
      title={isST ? 'Issue Gumbato' : 'Issue long-term loan'}
      subtitle={`${member.name} (${member.id}) · paid out in cash from the box`}
      icon={<ModalIcon name="plus" tone="brand" />}
      onClose={onClose}
      width="sm:max-w-[860px]"
      footer={
        <>
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="primary" disabled={!canIssue} onClick={() => onIssue({ ...terms, formRef: formRef.trim() || undefined })}>
            Issue {kes(principal)}
          </Button>
        </>
      }
    >
      <div className="grid gap-5 pb-2 md:grid-cols-[300px_1fr]">
        <div className="flex flex-col gap-2.5">
          <SectionLabel>Amount</SectionLabel>
          <AmountField label="Loan amount" value={amount} size="lg" active />
          <Keypad onKey={(key: KeypadKey) => setAmount(applyKey(amount, key))} />
        </div>
        <div className="flex flex-col gap-3">
          <SectionLabel>Live calculation</SectionLabel>
          <MathRows rows={rows} />
          {!isST && (
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Period" suffix="months" inputMode="numeric" value={months} onChange={(e) => setMonths(e.target.value.replace(/\D/g, ''))} />
              <Field label="Paper form reference *" placeholder="e.g. LT-2026-031" value={formRef} onChange={(e) => setFormRef(e.target.value)} />
            </div>
          )}
          <p className="text-[13px] text-ink-2">
            {isST
              ? 'One Gumbato at a time. Repay within the deadline; no further charge is added.'
              : 'Issue stays disabled until the paper form reference is entered.'}
          </p>
        </div>
      </div>
    </Modal>
  )
}
