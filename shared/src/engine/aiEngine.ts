import type { GameState, PlayerAction, AIDifficulty } from '../types/game.js'
import type { PlayerState } from '../types/player.js'
import type { GoalDefinition } from '../types/goals.js'
import { GOAL_DEFINITIONS } from '../data/goals.js'
import { BOARD_LOCATIONS } from '../data/board.js'
import { getMenuItemsByLocation } from '../data/menus.js'
import { getJobById, JOB_DEFINITIONS } from '../data/jobs.js'
import type { BoardLocation } from '../types/board.js'
import { getWeeklyRent, getUpgradeTargetTier, getHousingLocationId } from '../data/housing.js'
import type { MenuItem } from '../types/menu.js'
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

  // Erfiðleikastig bætir "villu" við val.
  // Athygli: besta skor getur verið neikvætt (t.d. "rest" með litla streitu og
  // neikvæða slembitölu). Þá víkkar margföldun bilið rangt og getur skilið
  // listann eftir tóman. Reiknum þröskuld út frá fjarlægð frá besta skori í staðinn.
  const noiseFactor = difficulty === 'easy' ? 0.5 : difficulty === 'medium' ? 0.2 : 0.05
  const best = scored[0].score
  const worst = scored[scored.length - 1].score
  const threshold = best - Math.abs(best - worst) * noiseFactor
  const topActions = scored.filter(a => a.score >= threshold)
  const pool = topActions.length > 0 ? topActions : [scored[0]]

  return pool[Math.floor(Math.random() * pool.length)].action
}

function generatePossibleActions(player: PlayerState, _state: GameState): PlayerAction[] {
  const actions: PlayerAction[] = []

  // Keep at least one week's rent in reserve so the AI doesn't bankrupt itself.
  const rentBuffer = getWeeklyRent(player.housingTier)

  // Skoða aðgerðir á ÖLLUM reitum svo Georg geti ferðast á viðkomandi stað.
  // Avatarinn hreyfist þegar performAction setur locationId = action.locationId.
  for (const location of BOARD_LOCATIONS) {
    for (const locAction of location.actions) {
      if (player.timeUnitsLeft < locAction.timeCost) continue
      if (locAction.moneyCost && player.money < locAction.moneyCost) continue

      // 'work' skilar engu nema AI sé ráðið í starf á þessum vinnustað.
      if (locAction.type === 'work') {
        if (!player.job || !location.jobIds?.includes(player.job.definitionId)) continue
      }

      // Aðeins er hægt að hvíla sig heima — þ.e. í íbúðinni sem leikmaður leigir.
      if (locAction.type === 'rest' && location.id !== getHousingLocationId(player.housingTier)) continue

      // Don't spend down past the rent reserve on optional paid actions.
      if (locAction.moneyCost && player.money - locAction.moneyCost < rentBuffer) continue

      // Upgrading housing raises future rent — only do it if the AI can still
      // cover the new (higher) rent afterwards.
      if (locAction.type === 'upgrade_housing') {
        const targetTier = getUpgradeTargetTier(location.id)
        const newRent = targetTier ? getWeeklyRent(targetTier) : rentBuffer
        if (player.money - (locAction.moneyCost ?? 0) < newRent) continue
      }

      // Máltíðir hafa breytilegt verð per rétt — sleppa ef AI hefur ekki efni á
      // neinum rétti, annars velja rétt sem það hefur efni á.
      let params = buildActionParams(player, locAction.type)
      if (locAction.type === 'buy_meal') {
        const dish = pickAffordableDish(player, location.id)
        if (!dish) continue
        params = { dishId: dish.id }
      }

      // Sækja um starf: velja besta starf sem AI uppfyllir kröfur fyrir á þessum
      // vinnustað og er betra en núverandi starf. Annars sleppa (ekki sækja út í loftið).
      if (locAction.type === 'apply_job') {
        const job = pickJobForLocation(player, location)
        if (!job) continue
        params = { jobId: job }
      }

      actions.push({
        type: locAction.type,
        locationId: location.id,
        params,
      })
    }
  }

  return actions
}

function pickJobForLocation(player: PlayerState, location: BoardLocation): string | undefined {
  if (!location.jobIds || location.jobIds.length === 0) return undefined

  const currentTier = player.job ? (getJobById(player.job.definitionId)?.tier ?? 0) : 0

  const qualifying = location.jobIds
    .map(id => JOB_DEFINITIONS.find(j => j.id === id))
    .filter((j): j is NonNullable<typeof j> => !!j)
    .filter(j => j.tier > currentTier)
    .filter(j => Object.entries(j.requirements).every(([stat, min]) => {
      const current = (player.stats as unknown as Record<string, number>)[stat] ?? 0
      return current >= (min as number)
    }))

  if (qualifying.length === 0) return undefined
  // Velja best launaða starfið sem AI á kost á (mest framför).
  return qualifying.reduce((best, j) => (j.weeklySalary > best.weeklySalary ? j : best), qualifying[0]).id
}

function pickAffordableDish(player: PlayerState, locationId: string): MenuItem | undefined {
  // Keep one week's rent in reserve when buying meals too.
  const rentBuffer = getWeeklyRent(player.housingTier)
  const affordable = getMenuItemsByLocation(locationId).filter(d => player.money - d.price >= rentBuffer)
  if (affordable.length === 0) return undefined
  // Velja dýrasta réttinn sem AI hefur efni á (mest áhrif).
  return affordable.reduce((best, d) => (d.price > best.price ? d : best), affordable[0])
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

    case 'buy_meal':
      // Borða þegar líðan er lág eða streita há, en ekki ef peningar eru af skornum skammti.
      if (player.money > 2000) {
        score += player.stats.wellbeing < 40 ? 8 : 2
        score += urgency.stress > 50 ? 4 : 0
      }
      break

    default:
      score += 1
  }

  // Georg er svolítið random til að vera skemmtilegt
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
