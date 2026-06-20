import type { PlayerStats, PlayerHiddenStats } from './stats.js'
import type { PlayerHobby, Talent } from './hobby.js'
import type { ActiveJob } from './job.js'
import type { HousingTier } from '../data/housing.js'

export interface ActiveEducation {
  institutionId: string
  programId: string
  weeksCompleted: number
  totalWeeks: number
  timeCostPerWeek: number
  moneyCostPerWeek: number
  knowledgeGainTotal: number
}

export interface ActionLogEntry {
  week: number
  actionType: string
  description: string
  locationId?: string
}

export interface PlayerState {
  id: string
  name: string
  isAI: boolean
  color: string
  avatarIndex: number

  stats: PlayerStats
  hidden: PlayerHiddenStats
  money: number

  age: number
  locationId: string
  housingTier: HousingTier
  job: ActiveJob | null
  education: ActiveEducation | null
  hobbies: PlayerHobby[]
  talent: Talent | null

  goalIds: string[]
  completedGoalIds: string[]
  groupIds: string[]

  timeUnitsLeft: number
  actionLog: ActionLogEntry[]
  eventCooldowns: Record<string, number>
}
