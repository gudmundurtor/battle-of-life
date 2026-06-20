import { BOARD_LOCATIONS, HOBBY_DEFINITIONS, getHousingLocationId } from '@jones/shared'
import type { GameState } from '@jones/shared'
import { useGameStore } from '../../store/gameStore'
import { useT } from '../../i18n'
import { ACTION_ICONS, ACTION_COLORS } from '../../utils/player'
import { useEscapeKey } from '../../utils/useEscapeKey'

interface ActionPopupProps {
  locationId: string
  gameState: GameState
  localPlayerId: string
  anchorPct: { l: number; t: number; w: number; h: number }
  onClose: () => void
}

const HOBBY_FOR_LOC: Record<string, string> = {
  music_studio: 'music',
  art_studio: 'art',
  library: 'writing',
  gym: 'fitness',
  park: 'fitness',
  online_courses: 'programming',
}

export function ActionPopup({ locationId, gameState, localPlayerId, anchorPct, onClose }: ActionPopupProps) {
  const { doAction, openJobPicker, openMealPicker, practiceHobby, endMyTurn } = useGameStore()
  const t = useT()
  useEscapeKey(onClose)

  const player = gameState.players[localPlayerId]
  const location = BOARD_LOCATIONS.find(l => l.id === locationId)
  const currentPlayerId = gameState.playerOrder[gameState.currentPlayerIndex]
  const isMyTurn = currentPlayerId === localPlayerId

  if (!player || !location) return null

  const hobbyIdForLocation = HOBBY_FOR_LOC[locationId]
  const locName = t.locations[locationId] ?? location.name

  // Determine popup position: open right unless near right edge, flip up near bottom
  const openLeft = anchorPct.l > 68
  const openUp = anchorPct.t > 55
  const popupStyle: React.CSSProperties = {
    position: 'absolute',
    zIndex: 60,
    width: 200,
    ...(openLeft
      ? { right: `${100 - anchorPct.l}%` }
      : { left: `${anchorPct.l + anchorPct.w + 0.5}%` }),
    ...(openUp
      ? { bottom: `${100 - anchorPct.t - anchorPct.h}%` }
      : { top: `${anchorPct.t}%` }),
  }

  return (
    <div
      style={{ ...popupStyle, background: 'rgba(15,22,41,0.98)', backdropFilter: 'blur(12px)' }}
      onClick={e => e.stopPropagation()}
      className="rounded-xl border border-slate-700 shadow-2xl overflow-hidden"
    >
      {/* Header */}
      <div className="px-3 py-2 flex items-center justify-between border-b border-slate-800">
        <span className="text-xs font-semibold text-slate-200">{location.icon} {locName}</span>
        <button onClick={onClose} className="text-slate-500 hover:text-slate-300 text-base leading-none cursor-pointer">×</button>
      </div>

      {!isMyTurn ? (
        <div className="px-3 py-4 text-center text-xs text-slate-600">{t.game.waitingForTurn}</div>
      ) : (
        <div className="p-2 space-y-1.5 max-h-72 overflow-y-auto">
          {location.actions
            .filter(action => action.type !== 'rest' || location.id === getHousingLocationId(player.housingTier))
            .map(action => {
            const canAfford = !action.moneyCost || player.money >= action.moneyCost
            const hasTime = player.timeUnitsLeft >= action.timeCost
            const isWork = action.type === 'work'
            const employedHere = isWork
              ? !!(player.job?.definitionId && location.jobIds?.includes(player.job.definitionId))
              : true
            const disabled = !canAfford || !hasTime || (isWork && !employedHere)
            const warning = (isWork && !employedHere) ? t.game.notEmployedHere
              : !canAfford ? t.game.noMoney
              : !hasTime ? t.game.noTime
              : undefined

            if (action.type === 'apply_job') {
              return (
                <PopupAction
                  key={action.type}
                  type="apply_job"
                  label={t.game.apply_job}
                  cost={`${action.timeCost} ${t.game.teUnit}`}
                  disabled={!hasTime}
                  warning={!hasTime ? t.game.noTime : undefined}
                  onClick={() => { openJobPicker(location.id); onClose() }}
                />
              )
            }

            if (action.type === 'buy_meal') {
              return (
                <PopupAction
                  key={action.type}
                  type="buy_meal"
                  label={(t.game.buy_meal as string | undefined) ?? action.label}
                  cost={`${action.timeCost} ${t.game.teUnit}`}
                  disabled={!hasTime}
                  warning={!hasTime ? t.game.noTime : undefined}
                  onClick={() => { openMealPicker(location.id); onClose() }}
                />
              )
            }

            if (action.type === 'practice_hobby' && hobbyIdForLocation) {
              const def = HOBBY_DEFINITIONS.find(h => h.id === hobbyIdForLocation)
              const existing = player.hobbies.find(h => h.definitionId === hobbyIdForLocation)
              const verb = existing ? t.game.practiceVerb : t.game.startVerb
              const name = t.hobbies[hobbyIdForLocation]?.name ?? def?.name ?? hobbyIdForLocation
              return (
                <PopupAction
                  key={action.type}
                  type="practice_hobby"
                  label={`${def?.icon ?? '⭐'} ${verb} ${name}`}
                  cost={`${action.timeCost} ${t.game.teUnit}`}
                  disabled={!hasTime}
                  warning={!hasTime ? t.game.noTime : undefined}
                  onClick={() => { practiceHobby(hobbyIdForLocation, location.id); onClose() }}
                />
              )
            }

            return (
              <PopupAction
                key={action.type}
                type={action.type}
                label={(t.game[action.type as keyof typeof t.game] as string | undefined) ?? action.type}
                cost={`${action.timeCost} ${t.game.teUnit}${action.moneyCost ? ` · ${action.moneyCost.toLocaleString()} kr` : ''}`}
                disabled={disabled}
                warning={warning}
                onClick={() => { doAction({ type: action.type, locationId: location.id }); onClose() }}
              />
            )
          })}

          <div className="pt-1 border-t border-slate-800">
            <button
              onClick={() => { endMyTurn(); onClose() }}
              className="w-full text-xs text-slate-500 hover:text-slate-300 py-1.5 text-center transition-colors cursor-pointer rounded"
            >
              {t.game.endTurn}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function PopupAction({ type, label, cost, disabled, warning, onClick }: {
  type: string; label: string; cost: string
  disabled?: boolean; warning?: string; onClick: () => void
}) {
  const color = ACTION_COLORS[type] ?? '#64748B'
  const icon = ACTION_ICONS[type] ?? '▶'
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full text-left rounded-lg border transition-all duration-100 overflow-hidden"
      style={{
        borderColor: disabled ? '#1E293B' : `${color}50`,
        background: disabled ? 'rgba(15,23,42,0.2)' : `${color}15`,
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      <div className="flex items-center gap-2 px-2.5 py-2">
        <div className="w-0.5 self-stretch rounded-full shrink-0" style={{ background: disabled ? '#334155' : color }} />
        <span className="text-sm shrink-0">{icon}</span>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold truncate" style={{ color: disabled ? '#475569' : '#E2E8F0' }}>{label}</div>
          {warning
            ? <div className="text-xs text-red-400">{warning}</div>
            : <div className="text-xs text-slate-600">{cost}</div>
          }
        </div>
      </div>
    </button>
  )
}
