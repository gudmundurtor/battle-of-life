import { BOARD_LOCATIONS, getMenuItemsByLocation } from '@jones/shared'
import type { GameState } from '@jones/shared'
import { useGameStore } from '../../store/gameStore'
import { useT } from '../../i18n'
import { useEscapeKey } from '../../utils/useEscapeKey'
import { Button } from '../UI/Button'

interface MealPickerDialogProps {
  gameState: GameState
  localPlayerId: string
  locationId: string
}

const STAT_META: Record<string, { icon: string; positiveGood: boolean }> = {
  wellbeing: { icon: '❤️', positiveGood: true },
  reputation: { icon: '⭐', positiveGood: true },
  stress: { icon: '😰', positiveGood: false },
}

export function MealPickerDialog({ gameState, localPlayerId, locationId }: MealPickerDialogProps) {
  const { buyMeal, closeMealPicker } = useGameStore()
  const t = useT()
  useEscapeKey(closeMealPicker)
  const player = gameState.players[localPlayerId]
  const location = BOARD_LOCATIONS.find(l => l.id === locationId)
  const dishes = getMenuItemsByLocation(locationId)

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-600 rounded-2xl max-w-lg w-full p-6 max-h-[80vh] flex flex-col animate-slide">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-100">{t.mealPicker.title}</h2>
            {location && (
              <p className="text-sm text-slate-500">
                {location.icon} {t.locations[location.id] ?? location.name}
              </p>
            )}
          </div>
          <button onClick={closeMealPicker} className="text-slate-500 hover:text-slate-300 text-xl cursor-pointer">×</button>
        </div>

        <div className="overflow-y-auto space-y-2 flex-1">
          {dishes.map(dish => {
            const canAfford = player.money >= dish.price
            const dt = t.dishes[dish.id]

            return (
              <button
                key={dish.id}
                onClick={() => canAfford && buyMeal(dish.id)}
                disabled={!canAfford}
                className={`
                  w-full text-left p-3 rounded-xl border transition-all duration-150
                  ${canAfford
                    ? 'border-slate-600 hover:border-amber-500 hover:bg-slate-800 cursor-pointer'
                    : 'border-slate-800 opacity-40 cursor-not-allowed'}
                `}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{dish.icon}</span>
                    <div>
                      <div className="font-medium text-slate-200 text-sm">{dt?.name ?? dish.name}</div>
                      <div className="text-xs text-slate-500">{dt?.description ?? dish.description}</div>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <div className={`text-sm font-mono ${canAfford ? 'text-yellow-400' : 'text-red-400'}`}>
                      {dish.price.toLocaleString()} kr
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mt-2 flex-wrap">
                  {dish.effects.map(eff => {
                    const meta = STAT_META[eff.stat] ?? { icon: '•', positiveGood: true }
                    const good = meta.positiveGood ? eff.value > 0 : eff.value < 0
                    return (
                      <span
                        key={eff.stat}
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          good ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'
                        }`}
                      >
                        {meta.icon} {eff.value > 0 ? '+' : ''}{eff.value}
                      </span>
                    )
                  })}
                </div>
              </button>
            )
          })}
        </div>

        <div className="pt-3 border-t border-slate-800 mt-3">
          <Button variant="ghost" fullWidth onClick={closeMealPicker}>
            {t.mealPicker.cancel}
          </Button>
        </div>
      </div>
    </div>
  )
}
