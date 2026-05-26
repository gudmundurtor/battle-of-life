import type { PlayerStats, PlayerHiddenStats, StatEffect, AnyStatKey } from '../types/stats.js'
import type { PlayerState } from '../types/player.js'
import type { JobDefinition } from '../types/job.js'
import type { HobbyDefinition } from '../types/hobby.js'
import { clampStat } from '../types/stats.js'

export function applyStatEffects(
  player: PlayerState,
  effects: StatEffect[],
): { stats: PlayerStats; hidden: PlayerHiddenStats; money: number } {
  const stats = { ...player.stats }
  const hidden = { ...player.hidden }
  let money = player.money

  for (const effect of effects) {
    const key = effect.stat as AnyStatKey
    if (key === 'money') {
      money = Math.max(0, money + effect.value)
    } else if (key === 'stress' || key === 'luck') {
      hidden[key] = clampStat(
        effect.isMultiplier ? hidden[key] * effect.value : hidden[key] + effect.value,
      )
    } else if (key in stats) {
      const statKey = key as keyof PlayerStats
      stats[statKey] = clampStat(
        effect.isMultiplier ? stats[statKey] * effect.value : stats[statKey] + effect.value,
      )
    }
  }

  return { stats, hidden, money }
}

export function applyWeeklyDecay(player: PlayerState): PlayerState {
  const { stats, hidden } = player
  const decayEffects: StatEffect[] = []

  if (stats.knowledge > 10) decayEffects.push({ stat: 'knowledge', value: -0.5 })
  if (stats.network > 5) decayEffects.push({ stat: 'network', value: -0.3 })
  if (hidden.stress > 60) decayEffects.push({ stat: 'wellbeing', value: -2 })
  else if (hidden.stress > 30) decayEffects.push({ stat: 'wellbeing', value: -1 })

  decayEffects.push({ stat: 'stress', value: -1 })
  decayEffects.push({ stat: 'luck', value: (Math.random() - 0.5) * 4 })

  const targetWealth = computeWealthLevel(player.money)
  if (Math.abs(stats.wealth - targetWealth) > 2) {
    decayEffects.push({ stat: 'wealth', value: targetWealth > stats.wealth ? 1 : -1 })
  }

  const result = applyStatEffects(player, decayEffects)
  return { ...player, stats: result.stats, hidden: result.hidden, money: result.money }
}

export function applyJobWeeklyEffects(player: PlayerState, jobDef: JobDefinition): PlayerState {
  const effects: StatEffect[] = [
    ...jobDef.weeklyEffects,
    { stat: 'stress', value: jobDef.stressGainPerWeek },
    { stat: 'money', value: jobDef.weeklySalary },
  ]
  const result = applyStatEffects(player, effects)
  return {
    ...player,
    stats: result.stats,
    hidden: result.hidden,
    money: result.money,
    job: {
      ...player.job!,
      weeksWorked: player.job!.weeksWorked + 1,
      promotionProgress:
        player.job!.promotionProgress +
        (jobDef.weeklyEffects.find(e => e.stat === 'career')?.value ?? 0),
    },
  }
}

export function applyHobbyWeeklyEffects(player: PlayerState, hobbyDefs: HobbyDefinition[]): PlayerState {
  let updated = { ...player }
  for (const playerHobby of player.hobbies) {
    if (!playerHobby.active) continue
    const def = hobbyDefs.find(h => h.id === playerHobby.definitionId)
    if (!def) continue
    const result = applyStatEffects(updated, [{ stat: 'wellbeing', value: def.wellbeingBonusPerWeek }])
    updated = { ...updated, stats: result.stats, hidden: result.hidden, money: result.money }
  }
  return updated
}

export function computeWealthLevel(money: number): number {
  if (money <= 0) return 0
  if (money < 1000) return 5
  if (money < 5000) return 15
  if (money < 10000) return 25
  if (money < 25000) return 35
  if (money < 50000) return 50
  if (money < 100000) return 65
  if (money < 250000) return 80
  if (money < 500000) return 90
  return 100
}

export function getLuckModifier(luck: number): number {
  return 0.5 + luck / 100
}

export function getStressCategory(stress: number): 'low' | 'medium' | 'high' | 'critical' {
  if (stress <= 30) return 'low'
  if (stress <= 60) return 'medium'
  if (stress <= 80) return 'high'
  return 'critical'
}
