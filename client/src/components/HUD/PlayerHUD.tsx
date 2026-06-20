import type { PlayerState } from '@jones/shared'
import { HOBBY_DEFINITIONS, getJobById, getWeeklyRent } from '@jones/shared'
import { useT } from '../../i18n'
import { getPlayerAvatar } from '../../utils/player'
import { StatBar } from './StatBar'

interface PlayerHUDProps {
  player: PlayerState
  isCurrentPlayer: boolean
  isLocal: boolean
}

export function PlayerHUD({ player, isCurrentPlayer, isLocal }: PlayerHUDProps) {
  const t = useT()
  const job = player.job ? getJobById(player.job.definitionId) : null
  const stressColor = player.hidden.stress > 80 ? '#EF4444' : player.hidden.stress > 60 ? '#F59E0B' : '#10B981'
  const avatar = getPlayerAvatar(player.id)
  const rent = getWeeklyRent(player.housingTier)
  const housingIcon = player.housingTier === 'luxury' ? '🏰' : player.housingTier === 'mid' ? '🏡' : '🏠'
  // Warn when next week's rent isn't covered by current funds.
  const cannotAffordRent = player.money < rent

  const STATS: Array<import('@jones/shared').StatKey> = ['wealth', 'knowledge', 'career', 'wellbeing', 'network', 'reputation']

  return (
    <div
      className="rounded-xl border overflow-hidden transition-all duration-300"
      style={{
        borderColor: isCurrentPlayer ? player.color : '#334155',
        boxShadow: isCurrentPlayer ? `0 0 16px ${player.color}30` : undefined,
      }}
    >
      {/* Colored avatar header */}
      <div
        className="flex items-center gap-3 px-3 py-2.5"
        style={{ background: `linear-gradient(135deg, ${player.color}25, ${player.color}10)`, borderBottom: `1px solid ${player.color}30` }}
      >
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-2xl border-2 shrink-0"
          style={{ background: `${player.color}30`, borderColor: player.color }}
        >
          {avatar}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-100 truncate">{player.name}</span>
            {player.isAI && <span className="text-xs text-slate-500 shrink-0">AI</span>}
          </div>
          <div className="text-xs text-yellow-400 font-mono">{player.money.toLocaleString()} kr</div>
        </div>
        {isCurrentPlayer && isLocal && (
          <span className="text-xs font-semibold animate-pulse shrink-0" style={{ color: player.color }}>
            {t.hud.yourTurn}
          </span>
        )}
        {isCurrentPlayer && !isLocal && (
          <span className="text-xs font-semibold animate-pulse shrink-0" style={{ color: player.color }}>
            ⚡
          </span>
        )}
      </div>

      {/* Body */}
      <div className="px-3 py-2.5 space-y-2.5" style={{ background: 'rgba(10,16,30,0.8)' }}>
        {/* Stats */}
        <div className="space-y-1.5">
          {STATS.map(stat => (
            <StatBar key={stat} stat={stat} value={player.stats[stat]} />
          ))}
        </div>

        {/* Hidden stats row */}
        <div className="flex gap-4 text-xs pt-1 border-t border-slate-800">
          <div className="flex items-center gap-1">
            <span>😰</span>
            <span className="text-slate-400">{t.hud.stress}</span>
            <span className="font-mono font-bold" style={{ color: stressColor }}>{player.hidden.stress}</span>
          </div>
          <div className="flex items-center gap-1">
            <span>🍀</span>
            <span className="text-slate-400">{t.hud.luck}</span>
            <span className="font-mono text-emerald-400">{Math.round(player.hidden.luck)}</span>
          </div>
        </div>

        {/* Job */}
        <div className="text-xs border-t border-slate-800 pt-2">
          {job ? (
            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="text-base">{job.icon}</span>
              <span className="font-medium">{t.jobs[job.id]?.title ?? job.title}</span>
              <span className="text-slate-500 ml-auto font-mono">{job.weeklySalary.toLocaleString()} kr</span>
            </div>
          ) : (
            <span className="text-slate-600 italic">{t.hud.noJob}</span>
          )}
        </div>

        {/* Housing + weekly rent */}
        <div className="text-xs border-t border-slate-800 pt-2">
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="text-base">{housingIcon}</span>
            <span className="font-medium">{t.housing[player.housingTier] ?? player.housingTier}</span>
            <span
              className="ml-auto font-mono flex items-center gap-1"
              style={{ color: cannotAffordRent ? '#EF4444' : '#94A3B8' }}
              title={t.hud.rent}
            >
              {cannotAffordRent && <span>⚠️</span>}
              {t.hud.rent}: {rent.toLocaleString()} {t.hud.perWeek}
            </span>
          </div>
        </div>

        {/* Hobbies */}
        {player.hobbies.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1 border-t border-slate-800">
            {player.hobbies.map(h => {
              const def = HOBBY_DEFINITIONS.find(d => d.id === h.definitionId)
              if (!def) return null
              return (
                <span
                  key={h.definitionId}
                  className="bg-slate-800/70 border border-slate-700 px-1.5 py-0.5 rounded-md text-xs text-slate-300 flex items-center gap-0.5"
                  title={`${t.hobbyLevels[h.level] ?? h.level} — ${h.xp} XP`}
                >
                  {def.icon}
                  {h.level === 'professional' ? '⭐' : h.level === 'talented' ? '✨' : null}
                </span>
              )
            })}
          </div>
        )}

        {/* Time units — local player only */}
        {isLocal && isCurrentPlayer && (
          <div className="border-t border-slate-800 pt-2">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-slate-400">⏱ {t.hud.timeUnits}</span>
              <span className="text-xs font-mono font-bold text-blue-300">{player.timeUnitsLeft}/10</span>
            </div>
            <div className="flex gap-1">
              {Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  className="flex-1 h-2.5 rounded transition-all duration-300"
                  style={{
                    background: i < player.timeUnitsLeft
                      ? `linear-gradient(90deg, #3B82F6, #60A5FA)`
                      : '#1E293B',
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Goals */}
        {isLocal && (
          <div className="flex items-center gap-1.5 text-xs pt-1 border-t border-slate-800">
            <span>🎯</span>
            <span className="text-slate-400">{t.hud.goals(player.completedGoalIds.length, player.goalIds.length)}</span>
            <div className="ml-auto flex gap-1">
              {player.goalIds.map(gid => (
                <div
                  key={gid}
                  className={`w-2 h-2 rounded-full ${player.completedGoalIds.includes(gid) ? 'bg-green-400' : 'bg-slate-700'}`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
