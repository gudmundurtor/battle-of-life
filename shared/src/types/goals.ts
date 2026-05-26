import type { StatKey } from './stats.js'
import type { HobbyLevel } from './hobby.js'

export type GoalConditionType =
  | 'stat_min'
  | 'stat_min_multiple'
  | 'money_min'
  | 'hobby_level'
  | 'job_tier'
  | 'network_size'
  | 'group_level'
  | 'stress_max'

export type GoalCondition =
  | { type: 'stat_min'; stat: StatKey; value: number }
  | { type: 'stat_min_multiple'; conditions: Array<{ stat: StatKey; value: number }> }
  | { type: 'money_min'; value: number }
  | { type: 'hobby_level'; level: HobbyLevel }
  | { type: 'job_tier'; tier: number }
  | { type: 'network_size'; size: number }
  | { type: 'group_level'; level: number }
  | { type: 'stress_max'; value: number }
  | { type: 'combined'; conditions: GoalCondition[] }

export interface GoalDefinition {
  id: string
  name: string
  description: string
  icon: string
  difficulty: 'easy' | 'medium' | 'hard'
  condition: GoalCondition
  points: number
  hint: string
}
