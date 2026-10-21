const formatter = new Intl.NumberFormat('en-KE', { maximumFractionDigits: 0 })

// 3150 -> "3,150"
export function fmt(amount: number): string {
  return formatter.format(Math.round(amount || 0))
}

// 3150 -> "KES 3,150"
export function kes(amount: number): string {
  return `KES ${fmt(amount)}`
}

// -200 -> "− 200", 50 -> "+ 50"
export function signed(amount: number): string {
  if (amount > 0) return `+ ${fmt(amount)}`
  if (amount < 0) return `− ${fmt(-amount)}`
  return '0'
}

// 1 -> "1 entry", 3 -> "3 entries"
export function count(n: number, one: string, many: string): string {
  return `${n} ${n === 1 ? one : many}`
}

// Keypad text ("3150", "") -> number
export function toNumber(text: string | null | undefined): number {
  const n = parseInt(text ?? '', 10)
  return Number.isNaN(n) ? 0 : n
}
