import { useState } from 'react'
import { GOAL_DEFINITIONS } from '@jones/shared'
import { useGameStore } from '../store/gameStore'
import { Button } from '../components/UI/Button'

const DIFFICULTY_COLORS = {
  easy:   'text-green-400 border-green-700',
  medium: 'text-yellow-400 border-yellow-700',
  hard:   'text-red-400 border-red-700',
}

export function GoalSelectionView() {
  const { gameState, localPlayerId, confirmGoals, startPlaying } = useGameStore()
  const [selected, setSelected] = useState<string[]>([])

  if (!gameState) return null

  const goalCount = gameState.config.goalCount

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
    confirmGoals(localPlayerId, selected)
    startPlaying()
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: '#080D1A' }}>
      <div className="max-w-2xl w-full space-y-5">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-100">Veldu markmið þín</h1>
          <p className="text-slate-500 text-sm mt-1">
            Veldu {goalCount} markmið — þú þarft að ná þeim öllum til að vinna
          </p>
        </div>

        {/* Progress indicator */}
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
        <div className="grid grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto">
          {GOAL_DEFINITIONS.map(goal => {
            const isSelected = selected.includes(goal.id)
            const isDisabled = !isSelected && selected.length >= goalCount

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
                <div className="font-semibold text-slate-200 text-sm mt-2">{goal.name}</div>
                <div className="text-xs text-slate-500 mt-1 leading-relaxed">{goal.description}</div>
                <div className="text-xs text-slate-600 mt-2 italic">{goal.hint}</div>
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
            ? `Veldu enn ${goalCount - selected.length} markmið`
            : 'Hefja leik! →'}
        </Button>
      </div>
    </div>
  )
}
