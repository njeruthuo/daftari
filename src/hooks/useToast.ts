import { useEffect, useState } from 'react'

export function useToast(ms = 2600) {
  const [toast, setToast] = useState<{ message: string; tone: 'ok' | 'warn' } | null>(null)
  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), ms)
    return () => clearTimeout(timer)
  }, [toast, ms])
  return { toast, show: (message: string, tone: 'ok' | 'warn' = 'ok') => setToast({ message, tone }) }
}
