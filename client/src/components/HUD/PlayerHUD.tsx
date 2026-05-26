import type { PlayerState } from '@jones/shared'
import { HOBBY_DEFINITIONS, getJobById } from '@jones/shared'
import { StatBar } from './StatBar'

interface PlayerHUDProps {
  player: PlayerState
  isCurrentPlayer: boolean
  isLocal: boolean
}

export function PlayerHUD({ player, isCurrentPlayer, isLocal }: PlayerHUDProps) {
  const job = player.job ? getJobById(player.job.definitionId) : null
  const stressColor = player.hidden.stress > 80 ? '#EF4444' : player.hidden.stress > 60 ? '#F59E0B' : '#10B981'

  const STATS: Array<import('@jones/shared').StatKey> = ['wealth', 'knowledge', 'career', 'wellbeing', 'network', 'reputation']

  return (
    <div
      className={`rounded-xl border p-3 transition-all duration-300 ${
        isCurrentPlayer
          ? 'border-blue-500 bg-slate-900 shadow-lg shadow-blue-900/30'
          : 'border-slate-700 bg-slate-900/60'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ background: player.color }}
          />
          <span className="font-semibold text-sm text-slate-200">
            {player.name}
            {player.isAI && <span className="ml-1 text-xs text-slate-500">(AI)</span>}
          </span>
        </div>
        {isCurrentPlayer && (
          <span className="text-xs text-blue-400 font-medium animate-pulse">Röð þín</span>
        )}
      </div>

      {/* Money */}
      <div className="flex justify-between items-center mb-2 px-1">
        <span className="text-xs text-slate-500">Peningar</span>
        <span className="text-sm font-mono text-yellow-400">
          {player.money.toLocaleString()} kr.
        </span>
      </div>

      {/* Stats */}
      <div className="space-y-1.5 mb-3">
        {STATS.map(stat => (
          <StatBar key={stat} stat={stat} value={player.stats[stat]} />
        ))}
      </div>

      {/* Hidden stats */}
      <div className="flex gap-3 mb-3 text-xs border-t border-slate-800 pt-2">
        <div className="flex items-center gap-1">
          <span>😰</span>
          <span className="text-slate-400">Streita</span>
          <span className="font-mono" style={{ color: stressColor }}>
            {player.hidden.stress}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span>🍀</span>
          <span className="text-slate-400">Heppni</span>
          <span className="font-mono text-emerald-400">{Math.round(player.hidden.luck)}</span>
        </div>
      </div>

      {/* Job */}
      <div className="text-xs border-t border-slate-800 pt-2 mb-2">
        {job ? (
          <div className="flex items-center gap-1 text-slate-300">
            <span>{job.icon}</span>
            <span>{job.title}</span>
            <span className="text-slate-500 ml-auto">{job.weeklySalary.toLocaleString()} kr/v</span>
          </div>
        ) : (
          <span className="text-slate-600 italic">Engin vinna</span>
        )}
      </div>

      {/* Hobbies */}
      {player.hobbies.length > 0 && (
        <div className="text-xs border-t border-slate-800 pt-2">
          <div className="flex flex-wrap gap-1">
            {player.hobbies.map(h => {
              const def = HOBBY_DEFINITIONS.find(d => d.id === h.definitionId)
              if (!def) return null
              return (
                <span
                  key={h.definitionId}
                  className="bg-slate-800 px-1.5 py-0.5 rounded text-slate-300"
                  title={`${h.level} — ${h.xp} XP`}
                >
                  {def.icon} {h.level === 'professional' ? '⭐' : h.level === 'talented' ? '✨' : ''}
                </span>
              )
            })}
          </div>
        </div>
      )}

      {/* Time units — only for local player when it's their turn */}
      {isLocal && isCurrentPlayer && (
        <div className="mt-3 border-t border-slate-800 pt-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-400">⏱ Tímaeiningar</span>
            <span className="text-xs font-mono text-blue-300">
              {player.timeUnitsLeft}/10
            </span>
          </div>
          <div className="flex gap-1">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className={`flex-1 h-2 rounded-sm transition-all duration-300 ${
                  i < player.timeUnitsLeft ? 'bg-blue-500' : 'bg-slate-800'
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Goals progress */}
      {isLocal && (
        <div className="mt-2 border-t border-slate-800 pt-2">
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <span>🎯</span>
            <span>{player.completedGoalIds.length}/{player.goalIds.length} markmið</span>
          </div>
        </div>
      )}
    </div>
  )
}
