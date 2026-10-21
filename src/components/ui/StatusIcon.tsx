import type { MemberStatus } from '@/types'

// Sync status shown beside each member and entry.
export const SYNC_STATUS: Record<MemberStatus, { label: string; tone: string; sub: string }> = {
  synced: { label: 'Synced', tone: 'text-ok', sub: 'text-ink-2' },
  pending: { label: 'Saved on device', tone: 'text-warn', sub: 'text-warn' },
  draft: { label: 'Draft · not saved', tone: 'text-warn', sub: 'text-warn' },
  failed: { label: 'Sync failed · tap to retry', tone: 'text-bad', sub: 'text-bad' },
  none: { label: 'Not yet processed', tone: 'text-muted', sub: 'text-muted' },
}

export default function StatusIcon({ status, size = 20 }: { status: MemberStatus; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" aria-hidden="true" className="shrink-0">
      {status === 'synced' && (
        <>
          <circle cx="10" cy="10" r="9" fill="#0F7A3E" />
          <path d="M6 10.2l2.6 2.6L14 7.4" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </>
      )}
      {status === 'pending' && (
        <>
          <circle cx="10" cy="10" r="8.5" fill="#FFF1D6" stroke="#C27803" strokeWidth="2" />
          <path d="M10 14V7M7 9.6l3-3 3 3" fill="none" stroke="#9A5B00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </>
      )}
      {status === 'draft' && (
        <>
          <circle cx="10" cy="10" r="8.5" fill="none" stroke="#C27803" strokeWidth="2" strokeDasharray="3 2.4" />
          <path d="M6.8 13.2l.6-2.4 4.4-4.4 1.8 1.8-4.4 4.4z" fill="#9A5B00" />
        </>
      )}
      {status === 'failed' && (
        <>
          <circle cx="10" cy="10" r="9" fill="#B42318" />
          <path d="M10 5.5v5.5" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
          <circle cx="10" cy="14.2" r="1.3" fill="#fff" />
        </>
      )}
      {status === 'none' && <circle cx="10" cy="10" r="8" fill="none" stroke="#8A93A3" strokeWidth="2" />}
    </svg>
  )
}
