import type { Entry, Loan, Member, Official } from '@/types'
import { loanStatus } from './loans'

export function isActive(member: Member): boolean {
  return member.status !== 'revoked'
}

// M032 -> M033
export function nextMemberId(members: Member[]): string {
  const highest = members.reduce((max, m) => Math.max(max, parseInt(m.id.slice(1), 10) || 0), 0)
  return 'M' + String(highest + 1).padStart(3, '0')
}

// Reasons a member can't be revoked yet. Empty means revoking is allowed.
export function revokeBlockers(member: Member, officials: Official[], loans: Loan[], entries: Entry[]): string[] {
  const reasons: string[] = []
  const official = officials.find((o) => o.memberId === member.id)
  if (official) reasons.push(`${member.name} is the ${official.role}. Hand the role to another member first.`)
  for (const loan of loans) {
    if (loan.memberId !== member.id) continue
    const status = loanStatus(loan, entries)
    if (status.active) {
      const name = loan.type === 'gumbato' ? 'Gumbato' : 'long-term loan'
      reasons.push(`An active ${name} still has KES ${status.balance.toLocaleString('en-KE')} owed.`)
    }
  }
  return reasons
}
