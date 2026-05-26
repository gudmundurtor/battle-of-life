import type { GameState, PlayerAction, AIDifficulty } from '../types/game.js'
import type { PlayerState } from '../types/player.js'
import type { GoalDefinition } from '../types/goals.js'
import { GOAL_DEFINITIONS } from '../data/goals.js'
import { getLocationById } from '../data/board.js'
import type { ActionType } from '../types/board.js'

export function chooseAIAction(state: GameState, aiPlayerId: string): PlayerAction | null {
  const player = state.players[aiPlayerId]
  if (!player || player.timeUnitsLeft <= 0) return null

  const difficulty = state.config.aiDifficulty
  const actions = generatePossibleActions(player, state)

  if (actions.length === 0) return null

  const scored = actions.map(action => ({
    action,
    score: scoreAction(player, action, state, difficulty),
  }))

  scored.sort((a, b) => b.score - a.score)

  // Erfiðleikastig bætir "villu" við val
  const noiseFactor = difficulty === 'easy' ? 0.5 : difficulty === 'medium' ? 0.2 : 0.05
  const topActions = scored.filter(a => a.score >= scored[0].score * (1 - noiseFactor))

  return topActions[Math.floor(Math.random() * topActions.length)].action
}

function generatePossibleActions(player: PlayerState, _state: GameState): PlayerAction[] {
  const actions: PlayerAction[] = []
  const location = getLocationById(player.locationId)
  if (!location) return actions

  for (const locAction of location.actions) {
    if (player.timeUnitsLeft < locAction.timeCost) continue
    if (locAction.moneyCost && player.money < locAction.moneyCost) continue

    actions.push({
      type: locAction.type,
      locationId: player.locationId,
      params: buildActionParams(player, locAction.type),
    })
  }

  return actions
}

function buildActionParams(player: PlayerState, actionType: ActionType, _state?: GameState): Record<string, unknown> {
  if (actionType === 'practice_hobby' && player.hobbies.length > 0) {
    const activeHobby = player.hobbies.find(h => h.active) ?? player.hobbies[0]
    return { hobbyId: activeHobby.definitionId }
  }
  if (actionType === 'apply_job') {
    // AI velur starf sem það uppfyllir kröfur
    return {}
  }
  return {}
}

function scoreAction(
  player: PlayerState,
  action: PlayerAction,
  _state: GameState,
  difficulty: AIDifficulty,
): number {
  let score = 0

  const urgency = computeUrgency(player)
  const goalPriorities = computeGoalPriorities(player, GOAL_DEFINITIONS)

  switch (action.type) {
    case 'work':
      score += goalPriorities.wealth * 3
      score += goalPriorities.career * 2
      if (player.money < 2000) score += 20
      break

    case 'study':
      score += goalPriorities.knowledge * 4
      score += goalPriorities.career * 1.5
      break

    case 'socialize':
      score += goalPriorities.network * 4
      score += urgency.stress > 60 ? 8 : 2
      break

    case 'rest':
      score += urgency.stress * 0.3
      if (urgency.stress > 70) score += 15
      break

    case 'exercise':
      score += goalPriorities.wellbeing * 3
      score += urgency.stress > 50 ? 5 : 0
      break

    case 'practice_hobby':
      score += goalPriorities.reputation * 2
      score += urgency.stress > 40 ? 6 : 3
      break

    case 'apply_job':
      if (!player.job) score += 25
      else if (player.stats.career > 40) score += 5
      break

    default:
      score += 1
  }

  // Jones er svolítið random til að vera skemmtilegt
  const randomNoise = difficulty === 'easy' ? (Math.random() - 0.5) * 15
    : difficulty === 'medium' ? (Math.random() - 0.5) * 8
    : (Math.random() - 0.5) * 3

  return score + randomNoise
}

function computeUrgency(player: PlayerState): { stress: number; lowMoney: number; lowWellbeing: number } {
  return {
    stress: player.hidden.stress,
    lowMoney: player.money < 3000 ? 100 - (player.money / 3000) * 100 : 0,
    lowWellbeing: player.stats.wellbeing < 30 ? 30 - player.stats.wellbeing : 0,
  }
}

function computeGoalPriorities(
  player: PlayerState,
  goalDefs: GoalDefinition[],
): Record<string, number> {
  const priorities: Record<string, number> = {
    wealth: 0,
    knowledge: 0,
    career: 0,
    wellbeing: 0,
    network: 0,
    reputation: 0,
  }

  for (const goalId of player.goalIds) {
    const def = goalDefs.find(g => g.id === goalId)
    if (!def || player.completedGoalIds.includes(goalId)) continue

    const isClose = isGoalNear(player, def)
    const weight = isClose ? 3 : 1

    switch (def.id) {
      case 'millionaire': priorities.wealth += 3 * weight; break
      case 'expert': priorities.knowledge += 2 * weight; priorities.career += 2 * weight; break
      case 'wellbeing': priorities.wellbeing += 3 * weight; break
      case 'celebrity': priorities.reputation += 3 * weight; break
      case 'connector': priorities.network += 3 * weight; break
      case 'artist': priorities.reputation += 2 * weight; break
      case 'executive': priorities.career += 3 * weight; priorities.knowledge += 2 * weight; break
      case 'balanced':
        Object.keys(priorities).forEach(k => { priorities[k] += 1 * weight })
        break
      default:
        priorities.career += 1 * weight
    }
  }

  return priorities
}

function isGoalNear(player: PlayerState, def: GoalDefinition): boolean {
  if (def.condition.type === 'stat_min') {
    const current = player.stats[def.condition.stat]
    return current >= def.condition.value * 0.8
  }
  return false
}
