import { useEffect } from 'react'

/**
 * Kallar `handler` þegar ýtt er á Esc. Notað til að loka gluggum/aðgerðum.
 * `enabled` má nota til að slökkva á hlustun (sjálfgefið true).
 */
export function useEscapeKey(handler: () => void, enabled = true): void {
  useEffect(() => {
    if (!enabled) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        handler()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [handler, enabled])
}
