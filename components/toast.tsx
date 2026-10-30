'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { CheckCircle2, XCircle } from 'lucide-react'

export interface ToastMsg {
  id: number
  text: string
  kind: 'info' | 'error'
}

interface UseToasts {
  toasts: ToastMsg[]
  push: (text: string, kind?: ToastMsg['kind']) => void
}

/** Minimal self-cleaning toast hook — no library, clear timings. */
export function useToasts(): UseToasts {
  const [toasts, setToasts] = useState<ToastMsg[]>([])
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])

  useEffect(() => {
    const list = timers.current
    return () => list.forEach(clearTimeout)
  }, [])

  const push = useCallback((text: string, kind: ToastMsg['kind'] = 'info') => {
    const id = Date.now() + Math.floor(Math.random() * 1000)
    setToasts((t) => [...t, { id, text, kind }])
    timers.current.push(
      setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3800)
    )
  }, [])

  return { toasts, push }
}

export function ToastViewport({ toasts }: { toasts: ToastMsg[] }) {
  if (toasts.length === 0) return null
  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-[60] flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-center gap-2 rounded-full px-4 py-2.5 text-sm shadow-lg ${
            t.kind === 'error' ? 'bg-red-600 text-white' : 'bg-neutral-900 text-white'
          }`}
        >
          {t.kind === 'error' ? (
            <XCircle size={15} className="shrink-0 opacity-90" />
          ) : (
            <CheckCircle2 size={15} className="shrink-0 opacity-90" />
          )}
          {t.text}
        </div>
      ))}
    </div>
  )
}
