import { BOARD_LOCATIONS, HOBBY_DEFINITIONS } from '@jones/shared'
import type { GameState } from '@jones/shared'
import { useGameStore } from '../../store/gameStore'
import { Button } from '../UI/Button'

interface ActionPanelProps {
  gameState: GameState
  localPlayerId: string
  selectedLocationId: string | null
}

export function ActionPanel({ gameState, localPlayerId, selectedLocationId }: ActionPanelProps) {
  const { doAction, openJobPicker, practiceHobby, endMyTurn } = useGameStore()
  const player = gameState.players[localPlayerId]
  const location = selectedLocationId ? BOARD_LOCATIONS.find(l => l.id === selectedLocationId) : null
  const currentPlayerId = gameState.playerOrder[gameState.currentPlayerIndex]
  const isMyTurn = currentPlayerId === localPlayerId

  if (!player) return null

  if (!isMyTurn) {
    return (
      <div className="flex items-center justify-center h-full text-slate-600 text-sm">
        Bíður eftir röð þinni…
      </div>
    )
  }

  // Hobby options at this location
  const locationHobbyIds: Record<string, string> = {
    music_studio: 'music',
    art_studio: 'art',
    library: 'writing',
    gym: 'fitness',
    park: 'fitness',
    online_courses: 'programming',
  }
  const hobbyIdForLocation = selectedLocationId ? locationHobbyIds[selectedLocationId] : undefined

  return (
    <div className="flex flex-col gap-2 h-full overflow-y-auto">
      {location && (
        <div className="text-xs text-slate-500 px-1 flex items-center gap-1 mb-1">
          <span>{location.icon}</span>
          <span className="font-medium text-slate-300">{location.name}</span>
        </div>
      )}

      {/* Standard location actions */}
      {location?.actions.map(action => {
        const canAfford = !action.moneyCost || player.money >= action.moneyCost
        const hasTime = player.timeUnitsLeft >= action.timeCost
        const disabled = !canAfford || !hasTime

        // Job actions open picker instead
        if (action.type === 'apply_job') {
          return (
            <ActionButton
              key={action.type}
              label={action.label}
              subtitle={`${action.timeCost} TE · Opnar starfslista`}
              disabled={!hasTime}
              onClick={() => openJobPicker(location.id)}
            />
          )
        }

        // Hobby actions handled specially
        if (action.type === 'practice_hobby' && hobbyIdForLocation) {
          const hobbyDef = HOBBY_DEFINITIONS.find(h => h.id === hobbyIdForLocation)
          const existing = player.hobbies.find(h => h.definitionId === hobbyIdForLocation)
          return (
            <ActionButton
              key={action.type}
              label={hobbyDef ? `${hobbyDef.icon} ${existing ? 'Æfa' : 'Byrja'} ${hobbyDef.name}` : action.label}
              subtitle={`${action.timeCost} TE · +wellbeing, +XP`}
              disabled={!hasTime}
              onClick={() => practiceHobby(hobbyIdForLocation)}
            />
          )
        }

        return (
          <ActionButton
            key={action.type}
            label={action.label}
            subtitle={`${action.timeCost} TE${action.moneyCost ? ` · ${action.moneyCost.toLocaleString()} kr` : ''}`}
            disabled={disabled}
            warning={!canAfford ? 'Ekki nægir peningar' : undefined}
            onClick={() =>
              doAction({ type: action.type, locationId: location.id })
            }
          />
        )
      })}

      {/* Practice existing hobbies anywhere */}
      {!hobbyIdForLocation && player.hobbies.length > 0 && (
        <div className="mt-1">
          <div className="text-xs text-slate-600 mb-1 px-1">Hobbyar</div>
          {player.hobbies.map(h => {
            const def = HOBBY_DEFINITIONS.find(d => d.id === h.definitionId)
            if (!def) return null
            const hasTime = player.timeUnitsLeft >= def.timeCostPerWeek
            return (
              <ActionButton
                key={h.definitionId}
                label={`${def.icon} Æfa ${def.name}`}
                subtitle={`${def.timeCostPerWeek} TE · ${h.level} (${h.xp} XP)`}
                disabled={!hasTime}
                onClick={() => practiceHobby(h.definitionId)}
              />
            )
          })}
        </div>
      )}

      {/* End turn */}
      <div className="mt-auto pt-2 border-t border-slate-800">
        <Button
          variant="secondary"
          fullWidth
          onClick={endMyTurn}
        >
          Ljúka viku ↵
        </Button>
        <p className="text-center text-xs text-slate-600 mt-1">
          {player.timeUnitsLeft} TE eftir
        </p>
      </div>
    </div>
  )
}

interface ActionButtonProps {
  label: string
  subtitle?: string
  disabled?: boolean
  warning?: string
  onClick: () => void
}

function ActionButton({ label, subtitle, disabled, warning, onClick }: ActionButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        w-full text-left px-3 py-2 rounded-lg border transition-all duration-150
        ${disabled
          ? 'border-slate-800 bg-transparent text-slate-600 cursor-not-allowed'
          : 'border-slate-700 bg-slate-800/50 hover:bg-slate-700/60 hover:border-slate-500 text-slate-200 cursor-pointer'}
      `}
    >
      <div className="text-sm font-medium">{label}</div>
      {subtitle && !warning && (
        <div className="text-xs text-slate-500 mt-0.5">{subtitle}</div>
      )}
      {warning && (
        <div className="text-xs text-red-400 mt-0.5">{warning}</div>
      )}
    </button>
  )
}
