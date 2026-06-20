import type { PlayerState } from '@jones/shared'
import { getPlayerAvatar, ACTION_ICONS, ACTION_COLORS } from '../../utils/player'

interface BoardCharacterProps {
  player: PlayerState
  /** Horizontal center of the figure, in board % */
  leftPct: number
  /** Vertical position of the figure's feet, in board % */
  topPct: number
  /** Icon for what the player is currently doing (last logged action), if any */
  actionIcon: string | null
  /** Color for the action bubble border */
  actionColor: string | null
  /** Whether this is the local (human) player whose figure follows clicks */
  isLocal: boolean
  zIndex: number
}

export function BoardCharacter({
  player, leftPct, topPct, actionIcon, actionColor, isLocal, zIndex,
}: BoardCharacterProps) {
  const avatar = getPlayerAvatar(player.id)

  return (
    <div
      className="absolute pointer-events-none flex flex-col items-center"
      style={{
        left: `${leftPct}%`,
        top: `${topPct}%`,
        transform: 'translate(-50%, -100%)',
        // Smooth "walk" between tiles
        transition: 'left 0.55s cubic-bezier(0.45,0,0.25,1), top 0.55s cubic-bezier(0.45,0,0.25,1)',
        zIndex,
      }}
    >
      {/* Action bubble — what the player is doing */}
      {actionIcon && (
        <div
          key={actionIcon}
          className="animate-bubble-pop flex items-center justify-center rounded-full shadow-lg mb-0.5"
          style={{
            width: 22,
            height: 22,
            fontSize: 13,
            lineHeight: 1,
            background: 'rgba(8,13,26,0.92)',
            border: `1.5px solid ${actionColor ?? player.color}`,
            boxShadow: `0 0 8px ${actionColor ?? player.color}80`,
          }}
        >
          {actionIcon}
        </div>
      )}

      {/* Avatar token (bobbing) */}
      <div className="animate-char-bob flex flex-col items-center">
        <div
          className="flex items-center justify-center rounded-full"
          style={{
            width: 30,
            height: 30,
            fontSize: 18,
            lineHeight: 1,
            background: `${player.color}`,
            border: '2px solid rgba(255,255,255,0.9)',
            boxShadow: isLocal
              ? `0 2px 6px rgba(0,0,0,0.5), 0 0 12px ${player.color}`
              : '0 2px 6px rgba(0,0,0,0.5)',
          }}
        >
          {avatar}
        </div>

        {/* Name tag */}
        <div
          className="mt-0.5 px-1.5 rounded-full font-bold whitespace-nowrap"
          style={{
            fontSize: 9,
            lineHeight: '13px',
            color: '#fff',
            background: `${player.color}E0`,
            border: '1px solid rgba(255,255,255,0.35)',
            textShadow: '0 1px 1px rgba(0,0,0,0.6)',
          }}
        >
          {player.name}
        </div>
      </div>

      {/* Ground shadow */}
      <div
        style={{
          width: 22,
          height: 5,
          marginTop: 1,
          borderRadius: '50%',
          background: 'rgba(0,0,0,0.35)',
          filter: 'blur(1px)',
        }}
      />
    </div>
  )
}

/** Resolve the icon + color for a player's most recent action this game. */
export function lastActionVisual(player: PlayerState): { icon: string | null; color: string | null } {
  const last = player.actionLog[player.actionLog.length - 1]
  if (!last) return { icon: null, color: null }
  return {
    icon: ACTION_ICONS[last.actionType] ?? null,
    color: ACTION_COLORS[last.actionType] ?? null,
  }
}
