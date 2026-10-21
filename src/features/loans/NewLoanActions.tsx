import { useState } from 'react'
import { Button, Icon, SectionLabel } from '@/components/ui'
import type { ActiveLoan } from '@/lib/loans'
import { fmt, kes } from '@/lib/money'
import type { LoanTerms, LoanType, Member } from '@/types'
import IssueLoanModal from './IssueLoanModal'
import LoanBlockedModal from './LoanBlockedModal'

interface NewLoanActionsProps {
  member: Member
  newLoan: LoanTerms | null
  st: ActiveLoan | null
  lt: ActiveLoan | null
  rates: { gumbatoPct: number; gumbatoFee: number; longTermPct: number; feePer10k: number }
  onIssue: (terms: LoanTerms | null) => void
  onRepayInstead: (type: LoanType, amount: number) => void
}

// "Take Gumbato" / "Take long-term loan" under the allocation rows.
export default function NewLoanActions({ member, newLoan, st, lt, rates, onIssue, onRepayInstead }: NewLoanActionsProps) {
  const [open, setOpen] = useState<LoanType | null>(null)
  const blocking = open === 'gumbato' ? st : open === 'longterm' ? lt : null

  const options = [
    { type: 'gumbato' as const, label: 'Take Gumbato', sub: `+${rates.gumbatoPct}% charge · KES ${rates.gumbatoFee} form fee` },
    { type: 'longterm' as const, label: 'Take long-term loan', sub: `${rates.longTermPct}% interest · KES ${rates.feePer10k} per 10,000 form` },
  ]

  return (
    <div className="mt-auto flex flex-col gap-1.5 border-t border-canvas pt-2">
      <SectionLabel className="!text-xs">New loans · cash out of the box</SectionLabel>
      {newLoan ? (
        <div className="flex items-center gap-3 rounded-[10px] border-2 border-brand bg-brand-tint px-3 py-2">
          <Icon name="check" className="text-brand" />
          <div className="min-w-0 flex-1">
            <div className="text-sm font-bold">
              {newLoan.type === 'gumbato' ? 'Gumbato' : 'Long-term loan'} {kes(newLoan.principal)} issued in this entry
            </div>
            <div className="truncate text-xs text-ink-2">
              Repay {fmt(newLoan.total)} · form fee {fmt(newLoan.formFee)} taken from this entry's cash
            </div>
          </div>
          <Button variant="link" onClick={() => onIssue(null)}>
            Remove
          </Button>
        </div>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2">
          {options.map((o) => (
            <button
              key={o.type}
              type="button"
              onClick={() => setOpen(o.type)}
              className="flex min-h-[52px] items-center gap-2.5 rounded-[10px] border border-line-strong bg-white px-3 py-1.5 text-left hover:bg-subtle"
            >
              <Icon name="plus" className="text-brand" strokeWidth={2.4} />
              <span className="flex min-w-0 flex-col leading-tight">
                <span className="text-sm font-bold">{o.label}</span>
                <span className="truncate text-xs text-ink-2">{o.sub}</span>
              </span>
            </button>
          ))}
        </div>
      )}

      {open && blocking && (
        <LoanBlockedModal
          member={member}
          loan={blocking}
          onClose={() => setOpen(null)}
          onRepay={() => {
            onRepayInstead(blocking.type, blocking.balance)
            setOpen(null)
          }}
        />
      )}
      {open && !blocking && (
        <IssueLoanModal
          type={open}
          member={member}
          onClose={() => setOpen(null)}
          onIssue={(terms) => {
            onIssue(terms)
            setOpen(null)
          }}
        />
      )}
    </div>
  )
}
