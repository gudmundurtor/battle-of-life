import type { PlayerState } from '../types/player.js'
import type { GoalDefinition, GoalCondition } from '../types/goals.js'
import type { JobDefinition } from '../types/job.js'
import { HOBBY_LEVEL_ORDER } from '../types/hobby.js'

export function checkGoalCondition(
  player: PlayerState,
  condition: GoalCondition,
  jobDef?: JobDefinition | null,
): boolean {
  switch (condition.type) {
    case 'stat_min':
      return player.stats[condition.stat] >= condition.value

    case 'stat_min_multiple':
      return condition.conditions.every(c => player.stats[c.stat] >= c.value)

    case 'money_min':
      return player.money >= condition.value

    case 'hobby_level':
      return player.hobbies.some(
        h => HOBBY_LEVEL_ORDER.indexOf(h.level) >= HOBBY_LEVEL_ORDER.indexOf(condition.level),
      )

    case 'job_tier':
      return jobDef != null && jobDef.tier >= condition.tier

    case 'network_size':
      return player.stats.network >= condition.size

    case 'stress_max':
      return player.hidden.stress <= condition.value

    case 'combined':
      return condition.conditions.every(c => checkGoalCondition(player, c, jobDef))

    case 'group_level':
      return false // Checked externally with group data

    default:
      return false
  }
}

export function checkGoals(
  player: PlayerState,
  goalDefs: GoalDefinition[],
  jobDef?: JobDefinition | null,
): string[] {
  const newlyCompleted: string[] = []
  for (const goalId of player.goalIds) {
    if (player.completedGoalIds.includes(goalId)) continue
    const def = goalDefs.find(g => g.id === goalId)
    if (!def) continue
    if (checkGoalCondition(player, def.condition, jobDef)) {
      newlyCompleted.push(goalId)
    }
  }
  return newlyCompleted
}

export function computeScore(player: PlayerState, goalDefs: GoalDefinition[]): number {
  return player.completedGoalIds.reduce((sum, goalId) => {
    const def = goalDefs.find(g => g.id === goalId)
    return sum + (def?.points ?? 0)
  }, 0)
}
