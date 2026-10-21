export function initials(name: string): string {
  const parts = name.split(' ')
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase()
}

const SIZES = { sm: 'h-11 w-11 text-base', lg: 'h-[72px] w-[72px] text-[26px]' }

interface AvatarProps {
  name: string
  size?: keyof typeof SIZES
  selected?: boolean
}

export default function Avatar({ name, size = 'sm', selected = false }: AvatarProps) {
  const ring = selected ? 'ring-4 ring-brand/30' : ''
  return (
    <span className={`flex shrink-0 items-center justify-center rounded-full bg-brand-soft font-bold text-brand-dark ${SIZES[size]} ${ring}`}>
      {initials(name)}
    </span>
  )
}
