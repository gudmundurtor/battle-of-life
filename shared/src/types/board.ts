export type LocationType =
  | 'employment'
  | 'workplace'
  | 'education'
  | 'housing'
  | 'shop'
  | 'social'
  | 'gym'
  | 'park'
  | 'event_square'

export type ActionType =
  | 'apply_job'
  | 'work'
  | 'quit_job'
  | 'study'
  | 'practice_hobby'
  | 'socialize'
  | 'rest'
  | 'exercise'
  | 'shop_clothes'
  | 'shop_food'
  | 'upgrade_housing'
  | 'form_group'
  | 'join_group'
  | 'group_session'

export interface LocationAction {
  type: ActionType
  label: string
  timeCost: number
  moneyCost?: number
  description: string
}

export interface BoardLocation {
  id: string
  name: string
  type: LocationType
  icon: string
  description: string
  actions: LocationAction[]
  position: { x: number; y: number }
  linkedLocationIds: string[]
  jobIds?: string[]
  educationIds?: string[]
}
