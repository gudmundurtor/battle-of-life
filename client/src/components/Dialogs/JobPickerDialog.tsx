import { JOB_DEFINITIONS, BOARD_LOCATIONS } from '@jones/shared'
import type { GameState, BoardLocation } from '@jones/shared'
import { useGameStore } from '../../store/gameStore'
import { useT } from '../../i18n'
import { useEscapeKey } from '../../utils/useEscapeKey'
import { useListNav } from '../../utils/useListNav'
import { Button } from '../UI/Button'

interface JobPickerDialogProps {
  gameState: GameState
  localPlayerId: string
  locationId: string
}

export function JobPickerDialog({ gameState, localPlayerId, locationId }: JobPickerDialogProps) {
  const { applyForJob, closeJobPicker } = useGameStore()
  const t = useT()
  useEscapeKey(closeJobPicker)
  const listRef = useListNav<HTMLDivElement>()
  const player = gameState.players[localPlayerId]
  const location = BOARD_LOCATIONS.find(l => l.id === locationId)

  // Map every job to the workplace where it can actually be performed, so the
  // player knows where to go to work after being hired (esp. at the job center).
  const workplaceByJob = new Map<string, BoardLocation>()
  for (const loc of BOARD_LOCATIONS) {
    for (const jid of loc.jobIds ?? []) {
      if (!workplaceByJob.has(jid)) workplaceByJob.set(jid, loc)
    }
  }

  // At a specific workplace show its own jobs; at the job center list every job
  // that actually has a workplace to go to (skip unreachable/orphan jobs).
  const availableJobIds = location?.jobIds ?? [...workplaceByJob.keys()]
  const jobs = JOB_DEFINITIONS.filter(j => availableJobIds.includes(j.id))

  // Only show the workplace hint when this dialog isn't already tied to one
  // specific workplace (i.e. when applying from the employment office).
  const showWorkplace = !location?.jobIds

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-600 rounded-2xl max-w-lg w-full p-6 max-h-[80vh] flex flex-col animate-slide">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-100">{t.jobPicker.title}</h2>
            {location && (
              <p className="text-sm text-slate-500">
                {location.icon} {t.locations[location.id] ?? location.name}
              </p>
            )}
          </div>
          <button onClick={closeJobPicker} className="text-slate-500 hover:text-slate-300 text-xl cursor-pointer">×</button>
        </div>

        <div ref={listRef} className="overflow-y-auto space-y-2 flex-1">
          {jobs.map(job => {
            const meetsReqs = Object.entries(job.requirements).every(
              ([stat, min]) => (player.stats as unknown as Record<string, number>)[stat] >= (min as number),
            )
            const isCurrent = player.job?.definitionId === job.id
            const jt = t.jobs[job.id]
            const workplace = workplaceByJob.get(job.id)

            return (
              <button
                key={job.id}
                onClick={() => meetsReqs && !isCurrent && applyForJob(job.id)}
                disabled={!meetsReqs || isCurrent}
                className={`
                  w-full text-left p-3 rounded-xl border transition-all duration-150
                  focus:outline-none focus:ring-2 focus:ring-blue-400
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
                      <div className="font-medium text-slate-200 text-sm">{jt?.title ?? job.title}</div>
                      <div className="text-xs text-slate-500">{jt?.description ?? job.description}</div>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <div className="text-sm font-mono text-yellow-400">
                      {job.weeklySalary.toLocaleString()} {t.jobPicker.perWeek}
                    </div>
                    <div className="text-xs text-slate-500">{t.jobPicker.tier} {job.tier}</div>
                  </div>
                </div>

                {showWorkplace && workplace && (
                  <div className="text-xs text-slate-400 mt-1">
                    📍 {t.jobPicker.workplace}: {workplace.icon} {t.locations[workplace.id] ?? workplace.name}
                  </div>
                )}

                {Object.keys(job.requirements).length > 0 && (
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {Object.entries(job.requirements).map(([stat, min]) => {
                      const current = (player.stats as unknown as Record<string, number>)[stat] ?? 0
                      const ok = current >= (min as number)
                      const statLabel = t.stats[stat as keyof typeof t.stats] ?? stat
                      return (
                        <span
                          key={stat}
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            ok ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'
                          }`}
                        >
                          {statLabel} {min}+
                        </span>
                      )
                    })}
                  </div>
                )}

                {isCurrent && (
                  <div className="text-xs text-blue-400 mt-1">{t.jobPicker.currentJob}</div>
                )}
              </button>
            )
          })}
        </div>

        <div className="pt-3 border-t border-slate-800 mt-3">
          <Button variant="ghost" fullWidth onClick={closeJobPicker}>
            {t.jobPicker.cancel}
          </Button>
        </div>
      </div>
    </div>
  )
}
