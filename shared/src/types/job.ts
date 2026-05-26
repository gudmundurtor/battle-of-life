import type { StatEffect, PlayerStats } from './stats.js'

export type JobSector = 'tech' | 'healthcare' | 'arts' | 'business' | 'education' | 'trades' | 'retail' | 'service'

export interface JobDefinition {
  id: string
  title: string
  sector: JobSector
  tier: 1 | 2 | 3 | 4 | 5
  weeklySalary: number
  timeCostPerWeek: number
  stressGainPerWeek: number
  requirements: Partial<PlayerStats>
  weeklyEffects: StatEffect[]
  description: string
  icon: string
}

export interface ActiveJob {
  definitionId: string
  weeksWorked: number
  promotionProgress: number
}
