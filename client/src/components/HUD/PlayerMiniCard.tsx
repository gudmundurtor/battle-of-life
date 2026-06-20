import type { PlayerState } from '@jones/shared'
import { getJobById } from '@jones/shared'
import { getPlayerAvatar, ACTION_ICONS } from '../../utils/player'
import { useT } from '../../i18n'

interface PlayerMiniCardProps {
  player: PlayerState
  isCurrentPlayer: boolean
}

export function PlayerMiniCard({ player, isCurrentPlayer }: PlayerMiniCardProps) {
  const t = useT()
  const job = player.job ? getJobById(player.job.definitionId) : null
  const stressColor = player.hidden.stress > 70 ? '#EF4444' : player.hidden.stress > 45 ? '#F59E0B' : '#10B981'
  const wellbeing = player.stats.wellbeing
  const wellbeingColor = wellbeing < 30 ? '#EF4444' : wellbeing < 55 ? '#F59E0B' : '#10B981'
  const avatar = getPlayerAvatar(player.id)

  // What is this player currently doing? (most recent logged action)
  const lastAction = player.actionLog[player.actionLog.length - 1]
  const actionLabelRaw = lastAction ? t.game[lastAction.actionType as keyof typeof t.game] : undefined
  const actionLabel = typeof actionLabelRaw === 'string' ? actionLabelRaw : null
  const actionIcon = lastAction ? ACTION_ICONS[lastAction.actionType] ?? '•' : null

  return (
    <div
      className="shrink-0 flex items-center gap-2.5 rounded-xl border px-3 py-2 transition-all duration-200"
      style={{
        borderColor: isCurrentPlayer ? player.color : '#334155',
        background: isCurrentPlayer ? `${player.color}15` : 'rgba(15,22,41,0.7)',
        boxShadow: isCurrentPlayer ? `0 0 12px ${player.color}40` : undefined,
        minWidth: 170,
      }}
    >
      {/* Avatar */}
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center text-2xl shrink-0 border-2"
        style={{ background: `${player.color}30`, borderColor: player.color }}
      >
        {avatar}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span
            className="font-bold text-sm truncate"
            style={{ color: isCurrentPlayer ? player.color : '#CBD5E1' }}
          >
            {player.name}
          </span>
          {player.isAI && <span className="text-xs text-slate-600">AI</span>}
          {isCurrentPlayer && (
            <span className="text-xs font-semibold animate-pulse ml-auto" style={{ color: player.color }}>
              ⚡
            </span>
          )}
        </div>

        <div className="text-xs text-yellow-400 font-mono mb-1">
          {player.money.toLocaleString()} kr
        </div>

        {/* Wellbeing + stress + goals row */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-0.5 text-xs" style={{ color: wellbeingColor }} title={t.stats.wellbeing}>
            <span>❤️</span>
            <span className="font-mono">{wellbeing}</span>
          </div>
          <div className="flex items-center gap-0.5 text-xs" style={{ color: stressColor }} title={t.stats.stress}>
            <span>😰</span>
            <span className="font-mono">{player.hidden.stress}</span>
          </div>
          <div className="flex items-center gap-0.5 text-xs text-slate-500">
            <span>🎯</span>
            <span>{player.completedGoalIds.length}/{player.goalIds.length}</span>
          </div>
          {job && (
            <div className="text-xs text-slate-500 ml-auto truncate flex items-center gap-0.5">
              <span>{job.icon}</span>
              <span className="hidden xl:inline">{t.jobs[job.id]?.title ?? job.title}</span>
            </div>
          )}
        </div>

        {/* Currently doing */}
        {actionLabel && (
          <div
            className="mt-1 flex items-center gap-1 text-xs rounded-md px-1.5 py-0.5 truncate"
            style={{ background: 'rgba(255,255,255,0.05)', color: '#94A3B8' }}
          >
            <span>{actionIcon}</span>
            <span className="truncate">{actionLabel}</span>
          </div>
        )}
      </div>
    </div>
  )
}
