import type { PlayerState } from './player.js'
import type { GroupActivity } from './group.js'
import type { ActiveEvent } from './events.js'
import type { ActionType } from './board.js'
import type { StatEffect } from './stats.js'

export type GamePhase =
  | 'lobby'
  | 'goal_selection'
  | 'playing'
  | 'event_resolution'
  | 'finished'

export type GameLength = 'short' | 'medium' | 'long'
export const GAME_LENGTH_YEARS: Record<GameLength, number> = {
  short: 5,
  medium: 10,
  long: 20,
}

export type AIDifficulty = 'easy' | 'medium' | 'hard'

export interface GameConfig {
  maxPlayers: number
  gameLength: GameLength
  aiDifficulty: AIDifficulty
  goalCount: number
  startingMoney: number
  startingAge: number
  enableGroupActivities: boolean
}

export const DEFAULT_CONFIG: GameConfig = {
  maxPlayers: 4,
  gameLength: 'medium',
  aiDifficulty: 'medium',
  goalCount: 3,
  startingMoney: 5000,
  startingAge: 22,
  enableGroupActivities: true,
}

export interface PlayerAction {
  type: ActionType
  locationId: string
  params?: Record<string, unknown>
}

export interface ActionResult {
  success: boolean
  effects: StatEffect[]
  moneyDelta: number
  messages: string[]
  triggeredEventId?: string
}

export interface GameLogEntry {
  week: number
  year: number
  playerId: string
  message: string
  isEvent: boolean
}

export interface GameState {
  id: string
  config: GameConfig
  phase: GamePhase
  players: Record<string, PlayerState>
  playerOrder: string[]
  currentPlayerIndex: number
  week: number
  year: number
  groups: Record<string, GroupActivity>
  pendingEvents: ActiveEvent[]
  log: GameLogEntry[]
  winnerId: string | null
  startedAt: number
}
