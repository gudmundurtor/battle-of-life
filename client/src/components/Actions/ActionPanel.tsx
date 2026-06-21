import { BOARD_LOCATIONS, HOBBY_DEFINITIONS, getHousingLocationId, getVenueHobbyId, HOME_HOBBY_IDS } from '@jones/shared'
import type { GameState } from '@jones/shared'
import { useGameStore } from '../../store/gameStore'
import { useT } from '../../i18n'
import { ACTION_ICONS, ACTION_COLORS } from '../../utils/player'
import { Button } from '../UI/Button'

interface ActionPanelProps {
  gameState: GameState
  localPlayerId: string
  selectedLocationId: string | null
}

export function ActionPanel({ gameState, localPlayerId, selectedLocationId }: ActionPanelProps) {
  const { doAction, openJobPicker, openMealPicker, practiceHobby, endMyTurn } = useGameStore()
  const t = useT()
  const player = gameState.players[localPlayerId]
  const location = selectedLocationId ? BOARD_LOCATIONS.find(l => l.id === selectedLocationId) : null
  const currentPlayerId = gameState.playerOrder[gameState.currentPlayerIndex]
  const isMyTurn = currentPlayerId === localPlayerId

  if (!player) return null

  if (!isMyTurn) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-600">
        <span className="text-4xl opacity-40">⏳</span>
        <span className="text-sm">{t.game.waitingForTurn}</span>
      </div>
    )
  }

  const hobbyIdForLocation = selectedLocationId ? getVenueHobbyId(selectedLocationId) : undefined
  const isHome = !!location && location.id === getHousingLocationId(player.housingTier)
  // At home: keep up any owned hobby, plus start home-only hobbies (e.g. cooking).
  const homeHobbyIds = isHome
    ? Array.from(new Set([...player.hobbies.map(h => h.definitionId), ...HOME_HOBBY_IDS]))
    : []

  const actionLabel = (type: string): string => {
    const key = type as keyof typeof t.game
    return (t.game[key] as string | undefined) ?? type
  }

  return (
    <div className="flex flex-col gap-2 h-full overflow-y-auto">
      {/* Location header or guidance */}
      {location ? (
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-xl mb-1"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <span className="text-xl">{location.icon}</span>
          <span className="font-semibold text-slate-200 text-sm">{t.locations[location.id] ?? location.name}</span>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-6 gap-2 text-center">
          <span className="text-4xl">👆</span>
          <p className="text-slate-400 text-sm font-medium">Smelltu á stað á borðinu</p>
          <p className="text-slate-600 text-xs">til að sjá tiltækar aðgerðir</p>
        </div>
      )}

      {/* Location actions */}
      {location?.actions
        .filter(action => action.type !== 'rest' || location.id === getHousingLocationId(player.housingTier))
        .map(action => {
        const canAfford = !action.moneyCost || player.money >= action.moneyCost
        const hasTime = player.timeUnitsLeft >= action.timeCost
        const disabled = !canAfford || !hasTime

        if (action.type === 'apply_job') {
          return (
            <ActionButton
              key={action.type}
              type="apply_job"
              label={actionLabel('apply_job')}
              subtitle={`${action.timeCost} ${t.game.teUnit} · ${t.game.applyJobSubtitle}`}
              disabled={!hasTime}
              onClick={() => openJobPicker(location.id)}
            />
          )
        }

        if (action.type === 'buy_meal') {
          return (
            <ActionButton
              key={action.type}
              type="buy_meal"
              label={(t.game.buy_meal as string | undefined) ?? action.type}
              subtitle={`${action.timeCost} ${t.game.teUnit}`}
              disabled={!hasTime}
              warning={!hasTime ? t.game.noTime : undefined}
              onClick={() => openMealPicker(location.id)}
            />
          )
        }

        if (action.type === 'practice_hobby' && hobbyIdForLocation) {
          const hobbyDef = HOBBY_DEFINITIONS.find(h => h.id === hobbyIdForLocation)
          const existing = player.hobbies.find(h => h.definitionId === hobbyIdForLocation)
          const hobbyName = t.hobbies[hobbyIdForLocation]?.name ?? hobbyDef?.name ?? hobbyIdForLocation
          const verb = existing ? t.game.practiceVerb : t.game.startVerb
          return (
            <ActionButton
              key={action.type}
              type="practice_hobby"
              label={hobbyDef ? `${hobbyDef.icon} ${verb} ${hobbyName}` : actionLabel('practice_hobby')}
              subtitle={`${action.timeCost} ${t.game.teUnit} · ${t.game.hobbyXpSubtitle}`}
              disabled={!hasTime}
              onClick={() => practiceHobby(hobbyIdForLocation, location.id)}
            />
          )
        }

        const isWorkAction = action.type === 'work'
        const employedHere = isWorkAction
          ? !!(player.job?.definitionId && location.jobIds?.includes(player.job.definitionId))
          : true
        const workDisabled = isWorkAction && !employedHere
        const finalDisabled = disabled || workDisabled
        const workWarning = workDisabled ? t.game.notEmployedHere : undefined

        return (
          <ActionButton
            key={action.type}
            type={action.type}
            label={actionLabel(action.type)}
            subtitle={`${action.timeCost} ${t.game.teUnit}${action.moneyCost ? ` · ${action.moneyCost.toLocaleString()} kr` : ''}`}
            disabled={finalDisabled}
            warning={workWarning ?? (!canAfford ? t.game.noMoney : !hasTime ? t.game.noTime : undefined)}
            onClick={() => doAction({ type: action.type, locationId: location.id })}
          />
        )
      })}

      {/* Hobbies at home: keep up owned hobbies + start home-only hobbies */}
      {isHome && homeHobbyIds.length > 0 && (
        <div className="mt-1">
          <div className="text-xs text-slate-600 mb-1 px-1 uppercase tracking-wide">{t.game.hobbies}</div>
          {homeHobbyIds.map(hobbyId => {
            const def = HOBBY_DEFINITIONS.find(d => d.id === hobbyId)
            if (!def) return null
            const existing = player.hobbies.find(h => h.definitionId === hobbyId)
            const hobbyName = t.hobbies[hobbyId]?.name ?? def.name
            const verb = existing ? t.game.practiceVerb : t.game.startVerb
            const levelLabel = existing ? (t.hobbyLevels[existing.level] ?? existing.level) : t.game.hobbyXpSubtitle
            const hasTime = player.timeUnitsLeft >= 1
            return (
              <ActionButton
                key={hobbyId}
                type="practice_hobby"
                label={`${def.icon} ${verb} ${hobbyName}`}
                subtitle={existing ? `1 ${t.game.teUnit} · ${levelLabel} (${existing.xp} XP)` : `1 ${t.game.teUnit} · ${levelLabel}`}
                disabled={!hasTime}
                onClick={() => practiceHobby(hobbyId, location!.id)}
              />
            )
          })}
        </div>
      )}

      {/* End turn */}
      <div className="mt-auto pt-3 border-t border-slate-800">
        <Button variant="secondary" fullWidth onClick={endMyTurn}>
          {t.game.endTurn}
        </Button>
        <p className="text-center text-xs text-slate-600 mt-1.5">
          {t.game.teLeft(player.timeUnitsLeft)}
        </p>
      </div>
    </div>
  )
}

interface ActionButtonProps {
  type: string
  label: string
  subtitle?: string
  disabled?: boolean
  warning?: string
  onClick: () => void
}

function ActionButton({ type, label, subtitle, disabled, warning, onClick }: ActionButtonProps) {
  const color = ACTION_COLORS[type] ?? '#64748B'
  const icon = ACTION_ICONS[type] ?? '▶'

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full text-left rounded-xl border transition-all duration-150 overflow-hidden"
      style={{
        borderColor: disabled ? '#1E293B' : `${color}50`,
        background: disabled ? 'rgba(15,23,42,0.3)' : `${color}12`,
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      <div className="flex items-center gap-2.5 px-3 py-2.5">
        {/* Color accent strip */}
        <div
          className="w-1 self-stretch rounded-full shrink-0"
          style={{ background: disabled ? '#334155' : color }}
        />
        {/* Icon */}
        <span className="text-lg shrink-0">{icon}</span>
        {/* Text */}
        <div className="flex-1 min-w-0">
          <div
            className="text-sm font-semibold truncate"
            style={{ color: disabled ? '#475569' : '#E2E8F0' }}
          >
            {label}
          </div>
          {warning ? (
            <div className="text-xs text-red-400 mt-0.5">{warning}</div>
          ) : subtitle ? (
            <div className="text-xs text-slate-500 mt-0.5">{subtitle}</div>
          ) : null}
        </div>
      </div>
    </button>
  )
}
