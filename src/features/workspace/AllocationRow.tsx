import { AmountField, Badge, Button, Icon, type IconName } from '@/components/ui'

interface AllocationRowProps {
  icon: IconName
  label: string
  sub: string
  value: string | null
  active: boolean
  disabled?: boolean
  auto?: boolean
  onSelect: () => void
  // Optional quick action, e.g. "Fill 3,667" or "Auto".
  action?: { label: string; onClick: () => void }
}

export default function AllocationRow({ icon, label, sub, value, active, disabled, auto, onSelect, action }: AllocationRowProps) {
  return (
    <div className="flex min-h-14 flex-wrap items-center gap-2.5 border-t border-canvas py-1.5 sm:flex-nowrap">
      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${disabled ? 'bg-canvas text-faint' : 'bg-ok-soft text-ok'}`}>
        <Icon name={icon} size={18} />
      </span>
      <div className="min-w-0 flex-1">
        <div className={`text-[15px] font-semibold ${disabled ? 'text-muted' : ''}`}>{label}</div>
        <div className={`truncate text-xs font-medium ${disabled ? 'text-muted' : 'text-ink-2'}`}>{sub}</div>
      </div>
      {auto && <Badge tone="brand">AUTO</Badge>}
      {action && !disabled && (
        <Button variant="link" className="!h-11 !px-2 text-sm" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
      <div className="w-[156px] shrink-0">
        <AmountField label={label} value={value} active={active} disabled={disabled} onSelect={onSelect} />
      </div>
    </div>
  )
}
