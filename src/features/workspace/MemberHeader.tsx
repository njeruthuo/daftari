import { Avatar, Badge, Button, Card, Icon, SYNC_STATUS } from '@/components/ui'
import { ATTENDANCE_LOOK } from '@/features/sessions/attendance'
import { shortDate } from '@/lib/dates'
import type { EntryMath } from '@/lib/entry'
import type { ActiveLoan } from '@/lib/loans'
import { fmt, kes } from '@/lib/money'
import type { Attendance, LoanTerms, Member, MemberStatus } from '@/types'
import BalanceTile from './BalanceTile'

interface MemberHeaderProps {
  member: Member
  attendance: Attendance
  onCycleAttendance?: () => void
  status: MemberStatus
  savingsBefore: number
  st: ActiveLoan | null
  lt: ActiveLoan | null
  math: EntryMath | null
  newLoan: LoanTerms | null
}

const STATUS_TONE = { synced: 'ok', pending: 'warn', draft: 'warn', failed: 'bad', none: 'neutral' } as const

function loanTile(label: string, loan: ActiveLoan | null, repay: number, newLoan: LoanTerms | null) {
  if (newLoan) {
    return <BalanceTile label={label} after={kes(newLoan.total)} meta={`New · due ${shortDate(newLoan.deadline)}`} metaTone="brand" badge={{ text: 'NEW', tone: 'brand' }} />
  }
  if (!loan) return <BalanceTile label={label} after="KES 0" meta={`No active ${label.toLowerCase()} loan`} muted />
  const count = loan.count + (repay > 0 ? 1 : 0)
  return (
    <BalanceTile
      label={label}
      before={repay > 0 ? fmt(loan.balance) : undefined}
      after={kes(loan.balance - repay)}
      meta={loan.overdue ? `Overdue · was due ${shortDate(loan.deadline)}` : `Due ${shortDate(loan.deadline)} · ${fmt(loan.installment)} / month`}
      metaTone={loan.overdue ? 'bad' : 'neutral'}
      badge={{ text: loan.overdue ? 'OVERDUE' : `${count} of ${loan.months}`, tone: loan.overdue ? 'bad' : 'brand' }}
    />
  )
}

export default function MemberHeader({ member, attendance, onCycleAttendance, status, savingsBefore, st, lt, math, newLoan }: MemberHeaderProps) {
  const att = ATTENDANCE_LOOK[attendance]
  const added = math?.savings ?? 0
  return (
    <Card className="flex flex-col gap-2.5 px-4 py-3">
      <div className="flex flex-wrap items-center gap-3">
        <Avatar name={member.name} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2.5">
            <h1 className="truncate text-[22px] font-bold">{member.name}</h1>
            <button type="button" onClick={onCycleAttendance} disabled={!onCycleAttendance} aria-label={`Attendance ${attendance}, tap to change`}>
              <Badge tone={att.tone}>{attendance.toUpperCase()}</Badge>
            </button>
          </div>
          <div className="text-[13px] text-ink-2">
            {member.id} · Member since {shortDate(member.since)}
          </div>
        </div>
        <Badge pill tone={STATUS_TONE[status]}>
          {SYNC_STATUS[status].label}
        </Badge>
        <Button to={`/members/${member.id}`}>
          <Icon name="ledger" size={18} strokeWidth={2} />
          Ledger
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
        <BalanceTile
          label="Savings"
          before={added ? fmt(savingsBefore) : undefined}
          after={kes(savingsBefore + added)}
          meta={added ? `+ ${fmt(added)} this meeting` : 'No savings added yet'}
          metaTone={added ? 'ok' : 'neutral'}
        />
        {loanTile('Gumbato', st, math?.repayST ?? 0, newLoan?.type === 'gumbato' ? newLoan : null)}
        {loanTile('Long-term', lt, math?.repayLT ?? 0, newLoan?.type === 'longterm' ? newLoan : null)}
      </div>
    </Card>
  )
}
