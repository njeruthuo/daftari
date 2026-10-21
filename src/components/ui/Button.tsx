import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link } from 'react-router'

const VARIANTS = {
  primary: 'bg-brand text-white hover:bg-brand-dark disabled:bg-line-strong',
  secondary: 'border border-line-strong bg-white text-ink hover:bg-subtle disabled:text-faint',
  ghost: 'bg-key text-ink-2 hover:bg-line-soft',
  link: 'bg-transparent text-brand hover:text-brand-dark',
  danger: 'bg-bad text-white hover:bg-[#8c1d13] disabled:bg-line-strong',
  warn: 'bg-[#b86e00] text-white hover:bg-warn',
  inverse: 'bg-white text-brand-dark hover:bg-brand-soft',
  dark: 'border border-[#475569] bg-transparent text-white hover:bg-navy-2',
}

const SIZES = {
  md: 'h-12 px-4 text-[15px] rounded-[10px]',
  lg: 'h-[60px] px-6 text-lg rounded-[14px]',
  icon: 'h-12 w-12 rounded-[10px]',
}

export type ButtonVariant = keyof typeof VARIANTS

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: keyof typeof SIZES
  // Renders a router link instead of a button.
  to?: string
  children: ReactNode
}

// One button for the whole app.
export default function Button({ variant = 'secondary', size = 'md', to, className = '', children, ...props }: ButtonProps) {
  const classes = `inline-flex items-center justify-center gap-2 font-semibold transition-colors disabled:cursor-not-allowed ${VARIANTS[variant]} ${SIZES[size]} ${className}`
  if (to) {
    return (
      <Link to={to} className={classes} aria-label={props['aria-label']}>
        {children}
      </Link>
    )
  }
  return (
    <button type="button" className={classes} {...props}>
      {children}
    </button>
  )
}
