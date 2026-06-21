import { EVENT_DEFINITIONS } from '@jones/shared'
import type { GameState } from '@jones/shared'
import { useGameStore } from '../../store/gameStore'
import { useT } from '../../i18n'
import { useListNav } from '../../utils/useListNav'

interface EventDialogProps {
  gameState: GameState
  localPlayerId: string
}

export function EventDialog({ gameState, localPlayerId }: EventDialogProps) {
  const { resolveEvent } = useGameStore()
  const t = useT()
  const listRef = useListNav<HTMLDivElement>()

  const pending = gameState.pendingEvents.find(e => e.targetPlayerId === localPlayerId)
  if (!pending) return null

  const eventDef = EVENT_DEFINITIONS.find(e => e.id === pending.definitionId)
  if (!eventDef) return null

  const player = gameState.players[localPlayerId]
  const et = t.events[eventDef.id]

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-600 rounded-2xl max-w-md w-full p-6 animate-slide shadow-2xl">
        {/* Header */}
        <div className="text-center mb-5">
          <div className="text-5xl mb-3">{eventDef.icon}</div>
          <h2 className="text-xl font-bold text-slate-100">{et?.title ?? eventDef.title}</h2>
          <p className="text-slate-400 text-sm mt-2 leading-relaxed">{et?.description ?? eventDef.description}</p>
        </div>

        {/* Choices */}
        <div ref={listRef} className="space-y-3">
          {eventDef.choices.map(choice => {
            const canAfford = !choice.moneyRequired || player.money >= choice.moneyRequired
            const meetsStats = !choice.statRequirements || Object.entries(choice.statRequirements).every(
              ([stat, min]) => (player.stats as unknown as Record<string, number>)[stat] >= (min as number),
            )
            const available = canAfford && meetsStats
            const ct = et?.choices[choice.id]

            return (
              <button
                key={choice.id}
                onClick={() => available && resolveEvent(eventDef.id, choice.id)}
                disabled={!available}
                className={`
                  w-full text-left p-4 rounded-xl border transition-all duration-150
                  focus:outline-none focus:ring-2 focus:ring-blue-400
                  ${available
                    ? 'border-slate-600 hover:border-blue-500 hover:bg-slate-800 cursor-pointer'
                    : 'border-slate-800 opacity-50 cursor-not-allowed'}
                `}
              >
                <div className="font-medium text-slate-200">{ct?.label ?? choice.label}</div>
                <div className="text-sm text-slate-400 mt-0.5">{ct?.description ?? choice.description}</div>

                {/* Effects preview */}
                <div className="flex flex-wrap gap-2 mt-2">
                  {choice.effects.map((e, i) => (
                    <span
                      key={i}
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        e.value > 0 ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'
                      }`}
                    >
                      {t.stats[e.stat as keyof typeof t.stats] ?? e.stat} {e.value > 0 ? '+' : ''}{e.value}
                    </span>
                  ))}
                  {(choice.moneyEffect ?? 0) !== 0 && (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      (choice.moneyEffect ?? 0) > 0 ? 'bg-yellow-900/50 text-yellow-300' : 'bg-red-900/50 text-red-300'
                    }`}>
                      💰 {(choice.moneyEffect ?? 0) > 0 ? '+' : ''}{(choice.moneyEffect ?? 0).toLocaleString()} kr
                    </span>
                  )}
                </div>

                {choice.moneyRequired && !canAfford && (
                  <div className="text-xs text-red-400 mt-1">
                    {t.eventDialog.requires} {choice.moneyRequired.toLocaleString()} kr
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
