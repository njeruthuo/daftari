import type { ReactNode } from 'react'
import { NavLink } from 'react-router'
import AppShell, { PageTitle } from '@/components/layout/AppShell'

const TABS = [
  { to: '/settings/deductions', label: 'Deductions' },
  { to: '/settings/loans', label: 'Loan settings' },
  { to: '/settings/tablet', label: 'This tablet' },
]

export default function SettingsLayout({ title, children }: { title: string; children: ReactNode }) {
  return (
    <AppShell>
      <PageTitle eyebrow="Settings" title={title} />
      <nav aria-label="Settings" className="flex gap-1 border-b border-line">
        {TABS.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            className={({ isActive }) =>
              `-mb-px flex h-12 items-center border-b-2 px-4 text-[15px] font-semibold ${isActive ? 'border-brand text-brand-dark' : 'border-transparent text-ink-2 hover:text-ink'}`
            }
          >
            {t.label}
          </NavLink>
        ))}
      </nav>
      {children}
    </AppShell>
  )
}
