import { Card, Icon } from '@/components/ui'
import type { EntryMath } from '@/lib/entry'
import { fmt } from '@/lib/money'

interface EntryFooterProps {
  math: EntryMath
  error: string | null
  note: string
  onNote: (note: string) => void
  nextLabel: string
  onSave: () => void
}

// Balance check and the primary Save & Next action.
export default function EntryFooter({ math, error, note, onNote, nextLabel, onSave }: EntryFooterProps) {
  const over = math.unallocated < 0
  const under = math.unallocated > 0
  const blocked = math.cash === 0 || over || !!error

  let title = `Balanced · Unallocated KES 0`
  let look = 'border-line bg-white'
  let titleColor = 'text-ok'
  if (math.cash === 0) {
    title = 'Type the cash received'
    titleColor = 'text-ink-2'
  } else if (error) {
    title = error
    look = 'border-bad-line bg-bad-tint'
    titleColor = 'text-bad'
  } else if (over) {
    title = `Over-allocated by KES ${fmt(-math.unallocated)}`
    look = 'border-bad-line bg-bad-tint'
    titleColor = 'text-bad'
  } else if (under) {
    title = `KES ${fmt(math.unallocated)} unallocated`
    look = 'border-warn-line bg-warn-tint'
    titleColor = 'text-warn'
  }

  const eq = `${fmt(math.cash)} cash − ${fmt(math.deductionTotal)} deductions${math.fees ? ` − ${fmt(math.fees)} fees` : ''} − ${fmt(math.allocated)} allocated = ${fmt(math.unallocated)}`

  return (
    <Card className={`sticky bottom-0 flex flex-wrap items-center gap-3 py-2.5 pl-4 pr-2.5 md:min-h-[76px] md:flex-nowrap ${look}`}>
      <Icon name={blocked || under ? 'warn' : 'check'} size={28} className={titleColor} />
      <div className="min-w-0 flex-1">
        <div className={`text-[17px] font-bold ${titleColor}`}>{title}</div>
        <div className="truncate text-[13px] text-ink-2">{eq}</div>
      </div>
      <label className="hidden md:block">
        <span className="sr-only">Note</span>
        <input
          value={note}
          onChange={(e) => onNote(e.target.value)}
          placeholder="Add note (optional)"
          className="h-12 w-[180px] rounded-[10px] border border-line-strong bg-white px-3 text-sm focus:border-brand focus:outline-none"
        />
      </label>
      <button
        type="button"
        disabled={blocked}
        onClick={onSave}
        className={`flex h-14 w-full items-center justify-between gap-3 rounded-xl pl-[18px] pr-4 text-left text-white disabled:cursor-not-allowed disabled:bg-line-strong md:w-auto md:min-w-[250px] ${
          under ? 'bg-[#b86e00] hover:bg-warn' : 'bg-brand hover:bg-brand-dark'
        }`}
      >
        <span className="flex flex-col leading-tight">
          <span className="text-[17px] font-bold">{under ? `Put KES ${fmt(math.unallocated)} in savings & Save` : 'Save & Next'}</span>
          <span className="text-xs text-[#e3e8ff]">{nextLabel}</span>
        </span>
        <Icon name="next" size={22} strokeWidth={2.4} />
      </button>
    </Card>
  )
}
