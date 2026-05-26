import type { StatEffect } from './stats.js'

export type GroupActivityType =
  | 'band'
  | 'sports_team'
  | 'card_game'
  | 'startup'
  | 'art_group'
  | 'running_club'
  | 'book_club'

export type GroupDecisionType = 'direction' | 'leader' | 'opportunity'

export interface GroupDecision {
  id: string
  type: GroupDecisionType
  description: string
  options: GroupDecisionOption[]
  weekDeadline: number
  votes: Record<string, string>
}

export interface GroupDecisionOption {
  id: string
  label: string
  effects: StatEffect[]
}

export interface GroupOpportunity {
  id: string
  name: string
  description: string
  requiredLevel: number
  effects: StatEffect[]
  moneyGain?: number
  requiresDecision: boolean
}

export interface GroupActivity {
  id: string
  type: GroupActivityType
  name: string
  founderPlayerId: string
  memberIds: string[]
  level: number
  xp: number
  xpPerWeek: number
  commitment: Record<string, number>
  foundedWeek: number
  weeklyTimeCost: number
  weeklyEffects: StatEffect[]
  pendingDecision: GroupDecision | null
  opportunities: GroupOpportunity[]
  disbanded: boolean
}

export interface GroupActivityDefinition {
  type: GroupActivityType
  name: string
  icon: string
  description: string
  minMembers: number
  maxMembers: number
  weeklyTimeCost: number
  requiredHobbyId?: string
  weeklyEffects: StatEffect[]
  levelOpportunities: GroupOpportunity[]
}
