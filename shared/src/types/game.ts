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

export type GameLength = 'short' | 'long'
export const GAME_LENGTH_YEARS: Record<GameLength, number> = {
  short: 2,
  long: 5,
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
  gameLength: 'short',
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
  /**
   * Stable, language-agnostic outcome code. The client maps this to a localized
   * string. `messages` stays in Icelandic and is used only for internal logs.
   */
  code?: string
  /** Dynamic values referenced by the localized message for `code`. */
  codeParams?: Record<string, string | number>
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
