import type { GameState } from '@jones/shared'
import { computeScore, GOAL_DEFINITIONS, getJobById } from '@jones/shared'
import { getPlayerAvatar } from '../../utils/player'
import { useEscapeKey } from '../../utils/useEscapeKey'
import { useT } from '../../i18n'

interface StandingsDialogProps {
  gameState: GameState
  localPlayerId: string
  onClose: () => void
}

export function StandingsDialog({ gameState, localPlayerId, onClose }: StandingsDialogProps) {
  const t = useT()
  useEscapeKey(onClose)

  // Raða leikmönnum eftir stigum (flest efst) svo sjáist hver er að vinna.
  const ranked = gameState.playerOrder
    .map(id => gameState.players[id])
    .filter((p): p is NonNullable<typeof p> => !!p)
    .map(p => ({ player: p, score: computeScore(p, GOAL_DEFINITIONS) }))
    .sort((a, b) => b.score - a.score || b.player.money - a.player.money)

  const topScore = ranked[0]?.score ?? 0

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[55] p-4" onClick={onClose}>
      <div
        className="w-full max-w-6xl max-h-[90vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden animate-slide"
        style={{ background: '#0E1629', border: '1px solid rgba(255,255,255,0.1)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-slate-800 shrink-0">
          <span className="font-bold text-slate-100 text-xl">🏆 {t.standings.title}</span>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 text-2xl leading-none cursor-pointer">×</button>
        </div>

        {/* Columns: one per player, side by side */}
        <div className="flex gap-4 p-6 overflow-auto flex-1">
          {ranked.map(({ player, score }, idx) => {
            const isLeader = idx === 0 && score === topScore && ranked.length > 1
            const isLocal = player.id === localPlayerId
            const job = player.job ? getJobById(player.job.definitionId) : null
            const stats = player.stats
            return (
              <div
                key={player.id}
                className="shrink-0 rounded-xl border p-4 flex flex-col gap-3"
                style={{
                  minWidth: 240,
                  flex: '1 1 0',
                  borderColor: isLeader ? '#FBBF24' : `${player.color}50`,
                  background: isLeader ? 'rgba(251,191,36,0.08)' : `${player.color}10`,
                  boxShadow: isLeader ? '0 0 16px rgba(251,191,36,0.25)' : undefined,
                }}
              >
                {/* Rank + avatar + name */}
                <div className="flex items-center gap-2.5">
                  <span className="text-sm font-bold text-slate-500 w-5">{idx + 1}.</span>
                  <span className="text-3xl">{getPlayerAvatar(player.id)}</span>
                  <div className="min-w-0">
                    <div className="font-bold text-base truncate" style={{ color: player.color }}>
                      {player.name}{isLocal ? ` (${t.standings.you})` : ''}
                    </div>
                    <div className="text-xs text-slate-500">
                      {player.isAI ? 'AI' : ''}{isLeader ? ` 👑 ${t.standings.leader}` : ''}
                    </div>
                  </div>
                </div>

                {/* Score — the headline number */}
                <div
                  className="rounded-lg px-3 py-3 text-center"
                  style={{ background: 'rgba(255,255,255,0.04)' }}
                >
                  <div className="text-4xl font-black" style={{ color: isLeader ? '#FBBF24' : '#E2E8F0' }}>
                    {score}
                  </div>
                  <div className="text-xs uppercase tracking-wide text-slate-500 mt-0.5">{t.standings.points}</div>
                </div>

                {/* Key facts */}
                <div className="space-y-1.5 text-sm">
                  <Row label="🎯" value={`${player.completedGoalIds.length}/${player.goalIds.length}`} />
                  <Row label="💰" value={`${player.money.toLocaleString()} kr`} />
                  <Row label="❤️" value={String(stats.wellbeing)} />
                  <Row label="😰" value={String(player.hidden.stress)} />
                  <Row label="🎓" value={String(stats.knowledge)} />
                  <Row label="💼" value={job ? (t.jobs[job.id]?.title ?? job.title) : '—'} />
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-sm font-semibold bg-slate-700 hover:bg-slate-600 text-slate-100 transition-colors cursor-pointer"
          >
            {t.standings.close}
          </button>
        </div>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="shrink-0">{label}</span>
      <span className="text-slate-300 font-mono truncate text-right">{value}</span>
    </div>
  )
}
