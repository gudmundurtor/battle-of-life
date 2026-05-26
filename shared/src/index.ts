// Types
export type { StatKey, HiddenStatKey, AnyStatKey, PlayerStats, PlayerHiddenStats, StatEffect } from './types/stats.js'
export type { PlayerState, ActiveEducation, ActionLogEntry } from './types/player.js'
export type { JobDefinition, JobSector, ActiveJob } from './types/job.js'
export type { HobbyDefinition, PlayerHobby, HobbyOpportunity, Talent, HobbyLevel } from './types/hobby.js'
export type { GroupActivity, GroupActivityDefinition, GroupActivityType, GroupDecision } from './types/group.js'
export type { GameEventDefinition, EventChoice, EventTrigger, ActiveEvent } from './types/events.js'
export type { GoalDefinition, GoalCondition } from './types/goals.js'
export type { BoardLocation, LocationType, ActionType, LocationAction } from './types/board.js'
export type { GameState, GameConfig, GamePhase, GameLength, AIDifficulty, PlayerAction, ActionResult, GameLogEntry } from './types/game.js'

// Constants
export { STAT_LABELS, STAT_ICONS, DEFAULT_STATS, DEFAULT_HIDDEN, clampStat } from './types/stats.js'
export { HOBBY_LEVEL_ORDER, HOBBY_XP_THRESHOLDS } from './types/hobby.js'
export { GAME_LENGTH_YEARS, DEFAULT_CONFIG } from './types/game.js'

// Data
export { JOB_DEFINITIONS, getJobById, getJobsByTier } from './data/jobs.js'
export { HOBBY_DEFINITIONS, getHobbyById } from './data/hobbies.js'
export { EVENT_DEFINITIONS, getEventById } from './data/events.js'
export { GOAL_DEFINITIONS, getGoalById } from './data/goals.js'
export { BOARD_LOCATIONS, getLocationById, STARTING_LOCATION_ID } from './data/board.js'

// Engine
export { createGame, assignGoals, startGame, performAction, endTurn } from './engine/gameEngine.js'
export { applyStatEffects, applyWeeklyDecay, computeWealthLevel, getLuckModifier, getStressCategory } from './engine/statEngine.js'
export { checkEventTriggers, resolveEventChoice, applyEventResolution } from './engine/eventEngine.js'
export { checkGoals, checkGoalCondition, computeScore } from './engine/goalEngine.js'
export { chooseAIAction } from './engine/aiEngine.js'
