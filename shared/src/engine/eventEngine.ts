import type { PlayerState } from '../types/player.js'
import type { GameState, ActionResult } from '../types/game.js'
import type { GameEventDefinition } from '../types/events.js'
import { getLuckModifier, applyStatEffects } from './statEngine.js'

export function checkEventTriggers(
  state: GameState,
  player: PlayerState,
  eventDefs: GameEventDefinition[],
): GameEventDefinition[] {
  const triggered: GameEventDefinition[] = []
  const triggeredIds = new Set(
    state.pendingEvents.map(e => e.definitionId),
  )

  for (const def of eventDefs) {
    if (triggeredIds.has(def.id)) continue
    if (isOnCooldown(player, def.id, def.cooldownWeeks, state.week)) continue
    if (def.isUniquePerGame && hasTriggeredBefore(player, def.id)) continue

    const probability = computeEventProbability(def, player)
    if (Math.random() < probability) {
      triggered.push(def)
    }
  }

  return triggered
}

function computeEventProbability(def: GameEventDefinition, player: PlayerState): number {
  const { trigger } = def
  let prob = trigger.probability

  // Athuga skilyrði
  if (trigger.conditions) {
    for (const cond of trigger.conditions) {
      const statValue = getStatValue(player, cond.stat)
      const met = evaluateCondition(statValue, cond.operator, cond.value)
      if (!met) return 0
    }
  }

  // Heppni breytir líkum
  if (trigger.luckModified) {
    prob *= getLuckModifier(player.hidden.luck)
  }

  return Math.min(1, Math.max(0, prob))
}

function getStatValue(player: PlayerState, stat: string): number {
  if (stat === 'stress') return player.hidden.stress
  if (stat === 'luck') return player.hidden.luck
  if (stat === 'money') return player.money
  return (player.stats as unknown as Record<string, number>)[stat] ?? 0
}

function evaluateCondition(value: number, op: string, threshold: number): boolean {
  switch (op) {
    case 'gt': return value > threshold
    case 'lt': return value < threshold
    case 'gte': return value >= threshold
    case 'lte': return value <= threshold
    default: return false
  }
}

function isOnCooldown(player: PlayerState, eventId: string, cooldownWeeks: number, currentWeek: number): boolean {
  const lastTriggered = player.eventCooldowns[eventId]
  if (lastTriggered === undefined) return false
  return currentWeek - lastTriggered < cooldownWeeks
}

function hasTriggeredBefore(player: PlayerState, eventId: string): boolean {
  return eventId in player.eventCooldowns
}

export function resolveEventChoice(
  player: PlayerState,
  def: GameEventDefinition,
  choiceId: string,
  _currentWeek: number,
): ActionResult {
  const choice = def.choices.find(c => c.id === choiceId)
  if (!choice) {
    return { success: false, effects: [], moneyDelta: 0, messages: ['Óþekkt val'] }
  }

  if (choice.moneyRequired && player.money < choice.moneyRequired) {
    return {
      success: false,
      effects: [],
      moneyDelta: 0,
      messages: ['Ekki nægir peningar'],
    }
  }

  if (choice.statRequirements) {
    for (const [stat, minValue] of Object.entries(choice.statRequirements)) {
      const current = (player.stats as unknown as Record<string, number>)[stat] ?? 0
      if (current < minValue) {
        return {
          success: false,
          effects: [],
          moneyDelta: 0,
          messages: [`Þarfnast hærra ${stat}`],
        }
      }
    }
  }

  const moneyDelta = choice.moneyEffect ?? 0
  return {
    success: true,
    effects: choice.effects,
    moneyDelta,
    messages: [`${def.title}: ${choice.label}`],
    triggeredEventId: choice.followUpEventId,
  }
}

export function applyEventResolution(
  player: PlayerState,
  result: ActionResult,
  eventId: string,
  currentWeek: number,
): PlayerState {
  const { stats, hidden, money } = applyStatEffects(player, result.effects)
  return {
    ...player,
    stats,
    hidden,
    money: Math.max(0, money + result.moneyDelta),
    eventCooldowns: {
      ...player.eventCooldowns,
      [eventId]: currentWeek,
    },
  }
}
