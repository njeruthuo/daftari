import type { Entry, EntryForm, MemberStatus } from '@/types'

// A member's status in a session: their saved entry's sync state, a draft, or nothing yet.
export function memberStatus(entry: Entry | undefined, draft: EntryForm | undefined): MemberStatus {
  if (entry) return entry.sync
  if (draft) return 'draft'
  return 'none'
}
