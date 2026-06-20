import { useState, useEffect } from 'react'
import { GOAL_DEFINITIONS } from '@jones/shared'
import { useGameStore } from '../store/gameStore'
import { useT } from '../i18n'
import { Button } from '../components/UI/Button'

const DIFFICULTY_COLORS = {
  easy:   'text-green-400 border-green-700',
  medium: 'text-yellow-400 border-yellow-700',
  hard:   'text-red-400 border-red-700',
}

// Pick `count` distinct random goal ids (Fisher–Yates shuffle)
function pickRandomGoals(count: number): string[] {
  const ids = GOAL_DEFINITIONS.map(g => g.id)
  for (let i = ids.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[ids[i], ids[j]] = [ids[j], ids[i]]
  }
  return ids.slice(0, count)
}

export function GoalSelectionView() {
  const { gameState, humanPlayerIds, confirmGoals, startPlaying } = useGameStore()
  const t = useT()
  const [selectionIndex, setSelectionIndex] = useState(0)
  const [selected, setSelected] = useState<string[]>([])

  // Pre-fill each player's selection with random goals so the user can start
  // the game immediately (they can still change the picks before confirming).
  useEffect(() => {
    if (gameState && selected.length === 0) {
      setSelected(pickRandomGoals(gameState.config.goalCount))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectionIndex, gameState])

  if (!gameState) return null

  const goalCount = gameState.config.goalCount
  const currentPlayerId = humanPlayerIds[selectionIndex]
  const currentPlayer = gameState.players[currentPlayerId]

  const toggle = (id: string) => {
    setSelected(prev =>
      prev.includes(id)
        ? prev.filter(g => g !== id)
        : prev.length < goalCount
        ? [...prev, id]
        : prev,
    )
  }

  const handleConfirm = () => {
    confirmGoals(currentPlayerId, selected)
    const nextIndex = selectionIndex + 1
    if (nextIndex >= humanPlayerIds.length) {
      startPlaying()
    } else {
      setSelectionIndex(nextIndex)
      setSelected([])
    }
  }

  const isLast = selectionIndex >= humanPlayerIds.length - 1

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: '#080D1A' }}>
      <div className="max-w-5xl w-full space-y-5">
        {/* Header */}
        <div className="text-center">
          {humanPlayerIds.length > 1 && (
            <div className="text-sm text-slate-500 mb-2">
              {t.goalSelection.playerOf(selectionIndex + 1, humanPlayerIds.length)}
            </div>
          )}
          <div className="flex items-center justify-center gap-2 mb-1">
            {currentPlayer && (
              <div className="w-3 h-3 rounded-full" style={{ background: currentPlayer.color }} />
            )}
            <h1 className="text-2xl font-bold text-slate-100">{currentPlayer?.name ?? ''}</h1>
          </div>
          <p className="text-slate-500 text-sm mt-1">
            {t.goalSelection.selectGoalsDesc(goalCount)}
          </p>
        </div>

        {/* Player progress bar (multiplayer) */}
        {humanPlayerIds.length > 1 && (
          <div className="flex justify-center gap-1.5 flex-wrap">
            {humanPlayerIds.map((pid, i) => {
              const p = gameState.players[pid]
              return (
                <div
                  key={pid}
                  className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-all ${
                    i === selectionIndex
                      ? 'bg-blue-900/40 border border-blue-700 text-blue-300'
                      : i < selectionIndex
                      ? 'bg-green-900/30 border border-green-800 text-green-500'
                      : 'border border-slate-800 text-slate-600'
                  }`}
                >
                  <div className="w-2 h-2 rounded-full" style={{ background: p?.color ?? '#888' }} />
                  {p?.name ?? pid}
                  {i < selectionIndex && ' ✓'}
                </div>
              )
            })}
          </div>
        )}

        {/* Goal selection progress */}
        <div className="flex justify-center gap-2">
          {Array.from({ length: goalCount }).map((_, i) => (
            <div
              key={i}
              className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm transition-all ${
                i < selected.length
                  ? 'border-blue-500 bg-blue-500 text-white'
                  : 'border-slate-600 text-slate-600'
              }`}
            >
              {i < selected.length ? '✓' : i + 1}
            </div>
          ))}
        </div>

        {/* Goal grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[60vh] overflow-y-auto">
          {GOAL_DEFINITIONS.map(goal => {
            const isSelected = selected.includes(goal.id)
            const isDisabled = !isSelected && selected.length >= goalCount
            const gt = t.goals[goal.id]

            return (
              <button
                key={goal.id}
                onClick={() => !isDisabled && toggle(goal.id)}
                disabled={isDisabled}
                className={`
                  text-left p-4 rounded-xl border transition-all duration-150 cursor-pointer
                  ${isSelected
                    ? 'border-blue-500 bg-blue-900/25 shadow-lg shadow-blue-900/20'
                    : isDisabled
                    ? 'border-slate-800 opacity-40 cursor-not-allowed'
                    : 'border-slate-700 bg-slate-900/60 hover:border-slate-500 hover:bg-slate-800/40'}
                `}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="text-2xl">{goal.icon}</div>
                  <div className={`text-xs border rounded px-1.5 py-0.5 ${DIFFICULTY_COLORS[goal.difficulty]}`}>
                    {goal.points}p
                  </div>
                </div>
                <div className="font-semibold text-slate-200 text-sm mt-2">{gt?.name ?? goal.name}</div>
                <div className="text-xs text-slate-500 mt-1 leading-relaxed">{gt?.description ?? goal.description}</div>
                <div className="text-xs text-slate-600 mt-2 italic">{gt?.hint ?? goal.hint}</div>
              </button>
            )
          })}
        </div>

        <Button
          fullWidth
          size="lg"
          onClick={handleConfirm}
          disabled={selected.length < goalCount}
        >
          {selected.length < goalCount
            ? t.goalSelection.selectMore(goalCount - selected.length)
            : isLast
            ? t.goalSelection.startGame
            : t.goalSelection.confirmNext}
        </Button>
      </div>
    </div>
  )
}
