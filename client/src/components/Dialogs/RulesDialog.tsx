import { useT } from '../../i18n'
import { useEscapeKey } from '../../utils/useEscapeKey'

export function RulesDialog({ onClose }: { onClose: () => void }) {
  const t = useT()
  useEscapeKey(onClose)

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60] p-4"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-slate-600 rounded-2xl max-w-lg w-full shadow-2xl animate-slide flex flex-col"
        style={{ maxHeight: '85vh' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between shrink-0">
          <h2 className="text-xl font-bold text-slate-100">📖 {t.rules.title}</h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-300 text-2xl leading-none cursor-pointer"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4 overflow-y-auto space-y-5">
          <p className="text-slate-400 text-sm leading-relaxed">{t.rules.intro}</p>

          {t.rules.sections.map((section, i) => (
            <div key={i}>
              <h3 className="text-slate-200 font-semibold text-sm mb-1.5">{section.heading}</h3>
              <ul className="space-y-1">
                {section.body.map((line, j) => (
                  <li key={j} className="text-slate-400 text-sm leading-relaxed flex gap-2">
                    <span className="text-slate-600 shrink-0">•</span>
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 shrink-0">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl font-semibold text-sm text-white cursor-pointer transition-all hover:scale-[1.01]"
            style={{ background: 'linear-gradient(135deg, #3B82F6, #2563EB)' }}
          >
            {t.rules.close}
          </button>
        </div>
      </div>
    </div>
  )
}
