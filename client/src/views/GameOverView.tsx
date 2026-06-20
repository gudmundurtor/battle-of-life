import { GOAL_DEFINITIONS } from '@jones/shared'
import type { GameState } from '@jones/shared'
import { computeScore } from '@jones/shared'
import { useGameStore } from '../store/gameStore'
import { useT } from '../i18n'
import { Button } from '../components/UI/Button'
import { StatBar } from '../components/HUD/StatBar'

interface GameOverViewProps {
  gameState: GameState
}

export function GameOverView({ gameState }: GameOverViewProps) {
  useGameStore()
  const t = useT()

  const players = gameState.playerOrder.map(id => ({
    player: gameState.players[id],
    score: computeScore(gameState.players[id], GOAL_DEFINITIONS),
  })).sort((a, b) => b.score - a.score)

  const winner = players[0]

  const STATS: Array<import('@jones/shared').StatKey> = ['wealth', 'knowledge', 'career', 'wellbeing', 'network', 'reputation']

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: '#080D1A' }}>
      <div className="max-w-2xl w-full space-y-6">
        {/* Winner */}
        <div className="text-center">
          <div className="text-6xl mb-3">🏆</div>
          <h1 className="text-3xl font-bold text-slate-100">
            {t.gameOver.wonTitle(winner.player.name)}
          </h1>
          <p className="text-slate-500 mt-1">
            {t.gameOver.scoreAndYear(winner.score, gameState.year)}
          </p>
        </div>

        {/* Player results */}
        <div className="space-y-3">
          {players.map(({ player, score }, rank) => (
            <div
              key={player.id}
              className={`rounded-xl border p-4 ${
                rank === 0
                  ? 'border-yellow-500 bg-yellow-900/10'
                  : 'border-slate-700 bg-slate-900/60'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{rank === 0 ? '🥇' : rank === 1 ? '🥈' : '🥉'}</span>
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ background: player.color }}
                  />
                  <span className="font-semibold text-slate-200">
                    {player.name}
                    {player.isAI && <span className="text-xs text-slate-500 ml-1">({t.gameOver.ai})</span>}
                  </span>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg" style={{ color: player.color }}>
                    {score}{t.gameOver.points}
                  </div>
                  <div className="text-xs text-slate-500">{player.money.toLocaleString()} {t.gameOver.money}</div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 mb-3">
                {STATS.map(stat => (
                  <StatBar key={stat} stat={stat} value={player.stats[stat]} compact />
                ))}
              </div>

              {/* Goals */}
              <div className="flex flex-wrap gap-1.5">
                {player.goalIds.map(goalId => {
                  const def = GOAL_DEFINITIONS.find(g => g.id === goalId)
                  const gt = t.goals[goalId]
                  const completed = player.completedGoalIds.includes(goalId)
                  if (!def) return null
                  return (
                    <span
                      key={goalId}
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        completed
                          ? 'bg-green-900/50 text-green-300'
                          : 'bg-slate-800 text-slate-500 line-through'
                      }`}
                    >
                      {def.icon} {gt?.name ?? def.name}
                    </span>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        <Button fullWidth size="lg" onClick={() => window.location.reload()}>
          {t.gameOver.playAgain}
        </Button>
      </div>
    </div>
  )
}
