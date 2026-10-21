import type { ReactNode } from 'react'
import SideNav from './SideNav'

// Screens with the main navigation: Home, Sessions, Members, Settings.
export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-full">
      <SideNav />
      <main className="flex min-w-0 flex-1 flex-col gap-5 px-4 pb-24 pt-6 md:px-8 md:py-7">{children}</main>
    </div>
  )
}

export function PageTitle({ eyebrow, title, children }: { eyebrow?: ReactNode; title: ReactNode; children?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        {eyebrow && <div className="text-sm text-ink-2">{eyebrow}</div>}
        <h1 className="mt-0.5 text-[28px] font-bold">{title}</h1>
      </div>
      {children}
    </div>
  )
}
