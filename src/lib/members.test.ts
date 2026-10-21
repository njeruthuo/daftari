import { describe, expect, it } from 'vitest'
import { seed } from '@/data/seed'
import { isActive, nextMemberId, revokeBlockers } from './members'

const { members, officials } = seed.data
const { loans } = seed.ledger
const byId = (id: string) => members.find((m) => m.id === id)!

describe('members', () => {
  it('numbers new members after the highest id', () => {
    expect(nextMemberId(members)).toBe('M033')
    expect(nextMemberId([])).toBe('M001')
  })

  it('treats older saved members without a status as active', () => {
    expect(isActive({ id: 'M099', name: 'Old Data', since: '2020-01-01', openingSavings: 0 })).toBe(true)
    expect(isActive({ ...byId('M003'), status: 'revoked' })).toBe(false)
  })

  it('allows revoking a member with no role and no open loans', () => {
    expect(revokeBlockers(byId('M003'), officials, loans, [])).toEqual([])
  })

  it('blocks revoking officials and members who still owe on a loan', () => {
    expect(revokeBlockers(byId('M001'), officials, loans, [])[0]).toContain('Chairlady')
    expect(revokeBlockers(byId('M016'), officials, loans, [])[0]).toContain('Gumbato')
  })
})
