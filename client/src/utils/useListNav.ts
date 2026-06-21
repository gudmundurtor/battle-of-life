import { useEffect, useRef } from 'react'
import { playNav, playWoof } from './sound'

/**
 * Roving-focus keyboard navigation for a vertical list of <button> items.
 * Attach the returned ref to the container holding the buttons. On mount the
 * first enabled button is focused; ArrowUp/ArrowDown cycle focus between enabled
 * buttons. Enter activates the focused button natively (it is a real <button>).
 */
export function useListNav<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null)
  useEffect(() => {
    const container = ref.current
    if (!container) return
    const enabled = () =>
      Array.from(container.querySelectorAll<HTMLButtonElement>('button:not([disabled])'))
    enabled()[0]?.focus()

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return
      e.preventDefault()
      const items = enabled()
      if (!items.length) return
      const idx = items.indexOf(document.activeElement as HTMLButtonElement)
      const next = e.key === 'ArrowDown'
        ? (idx + 1) % items.length
        : (idx - 1 + items.length) % items.length
      items[next].focus()
      playNav()
    }

    // A native <button> fires a click event when activated via Enter, Space or
    // the mouse, so this single handler covers all "select" cases.
    const onClick = (e: MouseEvent) => {
      const btn = (e.target as HTMLElement | null)?.closest('button')
      if (btn && !btn.disabled && container.contains(btn)) playWoof()
    }

    container.addEventListener('keydown', onKey)
    container.addEventListener('click', onClick)
    return () => {
      container.removeEventListener('keydown', onKey)
      container.removeEventListener('click', onClick)
    }
  }, [])
  return ref
}
