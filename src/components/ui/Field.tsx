import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react'

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: ReactNode
  hint?: ReactNode
  prefix?: string
  suffix?: string
}

const INPUT =
  'w-full rounded-[10px] border border-line-strong bg-white px-3.5 text-base font-semibold focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/15'

function Label({ label, hint, className = '', children }: { label?: ReactNode; hint?: ReactNode; className?: string; children: ReactNode }) {
  return (
    <label className={`flex flex-col gap-1.5 ${className}`}>
      {label && <span className="text-[13px] font-bold text-ink-2">{label}</span>}
      {children}
      {hint && <span className="text-[13px] text-ink-2">{hint}</span>}
    </label>
  )
}

// Labelled text input with optional prefix ("KES") or suffix ("%").
export default function Field({ label, hint, prefix, suffix, className = '', ...props }: FieldProps) {
  return (
    <Label label={label} hint={hint} className={className}>
      <span className="relative flex items-center">
        {prefix && <span className="absolute left-3.5 text-[13px] font-semibold text-muted">{prefix}</span>}
        <input className={`${INPUT} h-[52px] ${prefix ? 'pl-12' : ''} ${suffix ? 'pr-20' : ''}`} {...props} />
        {suffix && <span className="absolute right-3.5 text-sm font-semibold text-muted">{suffix}</span>}
      </span>
    </Label>
  )
}

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: ReactNode
  hint?: ReactNode
}

export function TextArea({ label, hint, className = '', ...props }: TextAreaProps) {
  return (
    <Label label={label} hint={hint} className={className}>
      <textarea className={`${INPUT} min-h-24 py-3 font-normal`} {...props} />
    </Label>
  )
}
