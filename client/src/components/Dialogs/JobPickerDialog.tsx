import { JOB_DEFINITIONS, BOARD_LOCATIONS } from '@jones/shared'
import type { GameState } from '@jones/shared'
import { useGameStore } from '../../store/gameStore'
import { Button } from '../UI/Button'

interface JobPickerDialogProps {
  gameState: GameState
  localPlayerId: string
  locationId: string
}

export function JobPickerDialog({ gameState, localPlayerId, locationId }: JobPickerDialogProps) {
  const { applyForJob, closeJobPicker } = useGameStore()
  const player = gameState.players[localPlayerId]
  const location = BOARD_LOCATIONS.find(l => l.id === locationId)

  // Which jobs are available at this location?
  const availableJobIds = location?.jobIds ?? JOB_DEFINITIONS.map(j => j.id)
  const jobs = JOB_DEFINITIONS.filter(j => availableJobIds.includes(j.id))

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-600 rounded-2xl max-w-lg w-full p-6 max-h-[80vh] flex flex-col animate-slide">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-100">Laus störf</h2>
            {location && <p className="text-sm text-slate-500">{location.icon} {location.name}</p>}
          </div>
          <button onClick={closeJobPicker} className="text-slate-500 hover:text-slate-300 text-xl cursor-pointer">×</button>
        </div>

        <div className="overflow-y-auto space-y-2 flex-1">
          {jobs.map(job => {
            const meetsReqs = Object.entries(job.requirements).every(
              ([stat, min]) => (player.stats as unknown as Record<string, number>)[stat] >= (min as number),
            )
            const isCurrent = player.job?.definitionId === job.id

            return (
              <button
                key={job.id}
                onClick={() => meetsReqs && !isCurrent && applyForJob(job.id)}
                disabled={!meetsReqs || isCurrent}
                className={`
                  w-full text-left p-3 rounded-xl border transition-all duration-150
                  ${isCurrent
                    ? 'border-blue-600 bg-blue-900/20 cursor-default'
                    : meetsReqs
                    ? 'border-slate-600 hover:border-blue-500 hover:bg-slate-800 cursor-pointer'
                    : 'border-slate-800 opacity-40 cursor-not-allowed'}
                `}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{job.icon}</span>
                    <div>
                      <div className="font-medium text-slate-200 text-sm">{job.title}</div>
                      <div className="text-xs text-slate-500">{job.description}</div>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <div className="text-sm font-mono text-yellow-400">
                      {job.weeklySalary.toLocaleString()} kr/v
                    </div>
                    <div className="text-xs text-slate-500">Stig {job.tier}</div>
                  </div>
                </div>

                {/* Requirements */}
                {Object.keys(job.requirements).length > 0 && (
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {Object.entries(job.requirements).map(([stat, min]) => {
                      const current = (player.stats as unknown as Record<string, number>)[stat] ?? 0
                      const ok = current >= (min as number)
                      return (
                        <span
                          key={stat}
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            ok ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'
                          }`}
                        >
                          {stat} {min}+
                        </span>
                      )
                    })}
                  </div>
                )}

                {isCurrent && (
                  <div className="text-xs text-blue-400 mt-1">✓ Núverandi starf</div>
                )}
              </button>
            )
          })}
        </div>

        <div className="pt-3 border-t border-slate-800 mt-3">
          <Button variant="ghost" fullWidth onClick={closeJobPicker}>
            Hætta við
          </Button>
        </div>
      </div>
    </div>
  )
}
