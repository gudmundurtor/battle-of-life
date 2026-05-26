import type { StatEffect, StatKey } from './stats.js'

export type EventTriggerType =
  | 'random'
  | 'stat_threshold'
  | 'stat_low'
  | 'time_based'
  | 'job_related'
  | 'hobby_milestone'

export interface EventTrigger {
  type: EventTriggerType
  probability: number
  luckModified: boolean
  conditions?: EventCondition[]
}

export interface EventCondition {
  stat: StatKey | 'stress' | 'money'
  operator: 'gt' | 'lt' | 'gte' | 'lte'
  value: number
}

export interface EventChoice {
  id: string
  label: string
  description: string
  requirementDescription?: string
  statRequirements?: Partial<Record<StatKey, number>>
  moneyRequired?: number
  effects: StatEffect[]
  moneyEffect?: number
  followUpEventId?: string
}

export interface GameEventDefinition {
  id: string
  title: string
  description: string
  icon: string
  trigger: EventTrigger
  choices: EventChoice[]
  isUniquePerGame: boolean
  cooldownWeeks: number
}

export interface ActiveEvent {
  definitionId: string
  targetPlayerId: string
  triggeredWeek: number
}
