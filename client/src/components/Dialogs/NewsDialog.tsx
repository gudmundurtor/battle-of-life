import { useState } from 'react'
import { useT } from '../../i18n'
import { useEscapeKey } from '../../utils/useEscapeKey'

// Pick `n` distinct random items (Fisher–Yates)
function pickRandom<T>(arr: T[], n: number): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a.slice(0, n)
}

interface NewsDialogProps {
  week: number
  year: number
  onClose: () => void
}

export function NewsDialog({ week, year, onClose }: NewsDialogProps) {
  const t = useT()
  useEscapeKey(onClose)
  // Stable random selection for the lifetime of this overlay (re-mounted each week via key)
  const [headlines] = useState(() => pickRandom(t.news.headlines, 3))

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-[55] p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl shadow-2xl animate-slide overflow-hidden"
        style={{ background: '#F5F1E6', border: '1px solid #C9BFA6' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Masthead */}
        <div className="px-6 pt-5 pb-3 text-center border-b-2 border-double" style={{ borderColor: '#2A2A2A' }}>
          <div
            className="font-black tracking-tight"
            style={{ color: '#1A1A1A', fontFamily: 'Georgia, "Times New Roman", serif', fontSize: '1.9rem', lineHeight: 1.1 }}
          >
            📰 {t.news.title}
          </div>
          <div className="text-xs mt-1 uppercase tracking-widest" style={{ color: '#6B5E45' }}>
            {t.news.edition(week, year)}
          </div>
        </div>

        {/* Headlines */}
        <div className="px-6 py-4 space-y-3">
          {headlines.map((line, i) => (
            <div key={i} className={i > 0 ? 'pt-3 border-t' : ''} style={i > 0 ? { borderColor: '#D8CFB8' } : undefined}>
              <div
                className="font-bold leading-snug"
                style={{ color: '#1A1A1A', fontFamily: 'Georgia, "Times New Roman", serif', fontSize: i === 0 ? '1.15rem' : '1rem' }}
              >
                {line}
              </div>
            </div>
          ))}
        </div>

        {/* Close */}
        <div className="px-6 pb-5 pt-1">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-lg font-semibold text-sm text-white cursor-pointer transition-all hover:scale-[1.01]"
            style={{ background: '#2A2A2A' }}
          >
            {t.news.close}
          </button>
        </div>
      </div>
    </div>
  )
}
