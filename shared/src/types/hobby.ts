import type { StatEffect, PlayerStats } from './stats.js'

export type HobbyLevel = 'beginner' | 'skilled' | 'talented' | 'professional'

export const HOBBY_LEVEL_ORDER: HobbyLevel[] = ['beginner', 'skilled', 'talented', 'professional']
export const HOBBY_XP_THRESHOLDS: Record<HobbyLevel, number> = {
  beginner: 0,
  skilled: 100,
  talented: 300,
  professional: 700,
}

export interface HobbyOpportunity {
  id: string
  name: string
  description: string
  requiredLevel: HobbyLevel
  baseProbability: number
  luckModified: boolean
  effects: StatEffect[]
  moneyGain?: number
  isGroupOpportunity: boolean
  cooldownWeeks: number
}

export interface HobbyDefinition {
  id: string
  name: string
  icon: string
  description: string
  timeCostPerWeek: number
  wellbeingBonusPerWeek: number
  xpPerSession: number
  relatedStats: (keyof PlayerStats)[]
  opportunities: HobbyOpportunity[]
  groupActivityType?: string
}

export interface PlayerHobby {
  definitionId: string
  level: HobbyLevel
  xp: number
  active: boolean
  opportunitiesTriggered: string[]
}

export interface Talent {
  hobbyId: string
  xpMultiplier: number
}
