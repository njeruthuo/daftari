// Stroke icons used across the app. Add new ones here so every screen draws them the same way.
const PATHS = {
  home: 'M3 11l9-8 9 8M5 10v10h14V10',
  sessions: 'M4 5h16M4 12h16M4 19h10',
  members: 'M16 20v-2a4 4 0 0 0-8 0v2M12 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6M20 20v-2a3 3 0 0 0-2-2.8M4 20v-2a3 3 0 0 1 2-2.8',
  settings: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1',
  back: 'M19 12H5M11 6l-6 6 6 6',
  next: 'M5 12h14M13 6l6 6-6 6',
  check: 'M20 6L9 17l-5-5',
  plus: 'M12 5v14M5 12h14',
  close: 'M6 6l12 12M18 6L6 18',
  search: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14M20 20l-3.5-3.5',
  lock: 'M5 10h14v10H5zM8 10V7a4 4 0 0 1 8 0v3',
  calendar: 'M3 5h18v16H3zM3 10h18M8 3v4M16 3v4',
  wifi: 'M2 8.5a15 15 0 0 1 20 0M5.5 12.2a10 10 0 0 1 13 0M9 15.8a5 5 0 0 1 6 0M12 19.5h.01',
  wifiOff: 'M2 2l20 20M8.5 16.4a5 5 0 0 1 7 0M5 12.6a10 10 0 0 1 5.2-2.6M14 10.1a10 10 0 0 1 5 2.5M2 8.8a15 15 0 0 1 4.3-2.8M10.7 5a15 15 0 0 1 11.3 3.8M12 20h.01',
  save: 'M12 3v12M7 10l5 5 5-5M4 20h16',
  repay: 'M4 12a8 8 0 1 0 2.4-5.7M4 4v4.5h4.5',
  ledger: 'M4 5h16M4 12h16M4 19h10',
  blocked: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18M5.7 5.7l12.6 12.6',
  warn: 'M12 3L2 20h20zM12 10v4M12 17h.01',
  retry: 'M4 12a8 8 0 1 0 2.4-5.7M4 4v4.5h4.5',
  backspace: 'M21 5H9l-6 7 6 7h12a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1zM17 9l-5 6M12 9l5 6',
  undo: 'M9 14L4 9l5-5M4 9h11a5 5 0 0 1 0 10h-3',
  flag: 'M5 21V4M5 4h11l-2 4 2 4H5',
  edit: 'M4 20h4L19 9l-4-4L4 16zM13 7l4 4',
  archive: 'M3 4h18v4H3zM5 8v12h14V8M10 12h4',
}

export type IconName = keyof typeof PATHS

interface IconProps {
  name: IconName
  size?: number
  strokeWidth?: number
  className?: string
}

export default function Icon({ name, size = 20, strokeWidth = 2.2, className = '' }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`shrink-0 ${className}`}
    >
      <path d={PATHS[name]} />
    </svg>
  )
}
