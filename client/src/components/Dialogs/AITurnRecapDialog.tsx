import { useT } from '../../i18n'
import { getPlayerAvatar, ACTION_ICONS } from '../../utils/player'
import { useEscapeKey } from '../../utils/useEscapeKey'
import type { AIRecap } from '../../store/gameStore'

interface AITurnRecapDialogProps {
  recap: AIRecap
  onClose: () => void
}

export function AITurnRecapDialog({ recap, onClose }: AITurnRecapDialogProps) {
  const t = useT()
  useEscapeKey(onClose)

  // Group the actions by AI player so each gets its own card.
  const byPlayer = new Map<string, AIRecap['actions']>()
  for (const a of recap.actions) {
    const list = byPlayer.get(a.playerId) ?? []
    list.push(a)
    byPlayer.set(a.playerId, list)
  }

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-[55] p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl shadow-2xl animate-slide overflow-hidden bg-slate-900 border border-slate-700"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-5 pt-4 pb-3 border-b border-slate-700">
          <div className="text-lg font-bold text-slate-100">
            🤖 {t.aiRecap.title([...byPlayer.values()][0]?.[0]?.playerName ?? '')}
          </div>
          <div className="text-xs text-slate-400 mt-0.5">{t.aiRecap.subtitle(recap.week)}</div>
        </div>

        <div className="px-5 py-4 space-y-4 max-h-[60vh] overflow-y-auto">
          {[...byPlayer.entries()].map(([pid, actions]) => {
            const head = actions[0]
            return (
              <div key={pid} className="space-y-2">
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-lg border-2 shrink-0"
                    style={{ background: `${head.color}30`, borderColor: head.color }}
                  >
                    {getPlayerAvatar(pid)}
                  </div>
                  <span className="font-semibold text-slate-100">{head.playerName}</span>
                </div>
                <ul className="space-y-1.5 pl-1">
                  {actions.map((a, i) => {
                    const rawLabel = (t.game as unknown as Record<string, unknown>)[a.actionType]
                    const actionLabel = typeof rawLabel === 'string' ? rawLabel : a.actionType
                    const locName = a.locationId ? t.locations[a.locationId] : undefined
                    return (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                        <span className="text-base leading-5 shrink-0">{ACTION_ICONS[a.actionType] ?? '•'}</span>
                        <span>{locName ? t.aiRecap.atLocation(actionLabel, locName) : actionLabel}</span>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )
          })}
          {recap.actions.length === 0 && (
            <div className="text-sm text-slate-400 italic">{t.aiRecap.nothing}</div>
          )}
        </div>

        <div className="px-5 pb-4 pt-1">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-lg font-semibold text-sm text-white cursor-pointer transition-all hover:scale-[1.01] bg-blue-600 hover:bg-blue-500"
          >
            {t.aiRecap.close}
          </button>
        </div>
      </div>
    </div>
  )
}
