import type { GameState, GameConfig, PlayerAction, ActionResult, GameLogEntry } from '../types/game.js'
import type { PlayerState } from '../types/player.js'
import { DEFAULT_STATS, DEFAULT_HIDDEN } from '../types/stats.js'
import { GAME_LENGTH_YEARS } from '../types/game.js'
import { JOB_DEFINITIONS, getJobById } from '../data/jobs.js'
import { HOBBY_DEFINITIONS } from '../data/hobbies.js'
import { EVENT_DEFINITIONS } from '../data/events.js'
import { GOAL_DEFINITIONS } from '../data/goals.js'
import { BOARD_LOCATIONS, STARTING_LOCATION_ID, getLocationById } from '../data/board.js'
import {
  applyStatEffects,
  applyWeeklyDecay,
  applyJobWeeklyEffects,
  applyHobbyWeeklyEffects,
} from './statEngine.js'
import { checkEventTriggers } from './eventEngine.js'
import { checkGoals, computeScore } from './goalEngine.js'

const TIME_UNITS_PER_WEEK = 10

export function createGame(config: GameConfig, playerNames: string[]): GameState {
  const playerOrder = playerNames.map((_, i) => `player_${i}`)
  const players: Record<string, PlayerState> = {}

  playerNames.forEach((name, i) => {
    const id = `player_${i}`
    players[id] = createPlayer(id, name, i === playerNames.length - 1 && i > 0)
  })

  // Alltaf a.m.k. Jones sem AI keppinautur ef bara 1 mannlegur leikmaður
  if (playerNames.length === 1) {
    players['jones'] = createPlayer('jones', 'Jones', true)
    playerOrder.push('jones')
  }

  return {
    id: `game_${Date.now()}`,
    config,
    phase: 'goal_selection',
    players,
    playerOrder,
    currentPlayerIndex: 0,
    week: 1,
    year: 1,
    groups: {},
    pendingEvents: [],
    log: [],
    winnerId: null,
    startedAt: Date.now(),
  }
}

function createPlayer(id: string, name: string, isAI: boolean): PlayerState {
  const colors = ['#4F9EF0', '#E05F5F', '#5DBF7A', '#F0AC4F']
  const colorIndex = parseInt(id.replace(/\D/g, '')) || 0

  return {
    id,
    name,
    isAI,
    color: id === 'jones' ? '#FF6B35' : colors[colorIndex % colors.length],
    avatarIndex: colorIndex,
    stats: { ...DEFAULT_STATS },
    hidden: { ...DEFAULT_HIDDEN },
    money: 5000,
    age: 22,
    locationId: STARTING_LOCATION_ID,
    job: null,
    education: null,
    hobbies: [],
    talent: null,
    goalIds: [],
    completedGoalIds: [],
    groupIds: [],
    timeUnitsLeft: TIME_UNITS_PER_WEEK,
    actionLog: [],
    eventCooldowns: {},
  }
}

export function assignGoals(state: GameState, playerId: string, goalIds: string[]): GameState {
  const player = state.players[playerId]
  if (!player) return state

  const updated = { ...player, goalIds }
  return { ...state, players: { ...state.players, [playerId]: updated } }
}

export function startGame(state: GameState): GameState {
  return {
    ...state,
    phase: 'playing',
    log: [
      {
        week: 1,
        year: 1,
        playerId: 'system',
        message: 'Leikurinn hefst!',
        isEvent: false,
      },
    ],
  }
}

export function performAction(
  state: GameState,
  playerId: string,
  action: PlayerAction,
): { state: GameState; result: ActionResult } {
  const player = state.players[playerId]
  if (!player || state.playerOrder[state.currentPlayerIndex] !== playerId) {
    return {
      state,
      result: { success: false, effects: [], moneyDelta: 0, messages: ['Ekki röð þín'] },
    }
  }

  const location = getLocationById(action.locationId)
  if (!location) {
    return {
      state,
      result: { success: false, effects: [], moneyDelta: 0, messages: ['Staðurinn finnst ekki'] },
    }
  }

  const locationAction = location.actions.find(a => a.type === action.type)
  if (!locationAction) {
    return {
      state,
      result: { success: false, effects: [], moneyDelta: 0, messages: ['Aðgerð ekki í boði hér'] },
    }
  }

  if (player.timeUnitsLeft < locationAction.timeCost) {
    return {
      state,
      result: { success: false, effects: [], moneyDelta: 0, messages: ['Ekki nægur tími'] },
    }
  }

  const moneyCost = locationAction.moneyCost ?? 0
  if (player.money < moneyCost) {
    return {
      state,
      result: { success: false, effects: [], moneyDelta: 0, messages: ['Ekki nægir peningar'] },
    }
  }

  const result = resolveAction(player, action, state)
  const { stats, hidden, money } = applyStatEffects(player, result.effects)

  const updatedPlayer: PlayerState = {
    ...player,
    stats,
    hidden,
    money: Math.max(0, money + result.moneyDelta - moneyCost),
    locationId: action.locationId,
    timeUnitsLeft: player.timeUnitsLeft - locationAction.timeCost,
    actionLog: [
      ...player.actionLog,
      { week: state.week, actionType: action.type, description: result.messages[0] ?? '' },
    ],
  }

  const logEntry: GameLogEntry = {
    week: state.week,
    year: state.year,
    playerId,
    message: result.messages[0] ?? action.type,
    isEvent: false,
  }

  return {
    state: {
      ...state,
      players: { ...state.players, [playerId]: updatedPlayer },
      log: [...state.log, logEntry],
    },
    result,
  }
}

function resolveAction(player: PlayerState, action: PlayerAction, _state: GameState): ActionResult {
  switch (action.type) {
    case 'work':
      return resolveWork(player)

    case 'study':
      return resolveStudy(player)

    case 'practice_hobby':
      return resolvePracticeHobby(player, action.params)

    case 'socialize':
      return {
        success: true,
        effects: [
          { stat: 'network', value: 5 },
          { stat: 'wellbeing', value: 8 },
          { stat: 'stress', value: -8 },
        ],
        moneyDelta: 0,
        messages: ['Hittist við vini'],
      }

    case 'rest':
      return {
        success: true,
        effects: [
          { stat: 'wellbeing', value: 10 },
          { stat: 'stress', value: -12 },
        ],
        moneyDelta: 0,
        messages: ['Hvílaðist vel'],
      }

    case 'exercise':
      return {
        success: true,
        effects: [
          { stat: 'wellbeing', value: 12 },
          { stat: 'stress', value: -10 },
        ],
        moneyDelta: -200,
        messages: ['Fór í líkamsrækt'],
      }

    case 'shop_clothes':
      return {
        success: true,
        effects: [
          { stat: 'reputation', value: 3 },
          { stat: 'wellbeing', value: 5 },
        ],
        moneyDelta: -2000,
        messages: ['Keypti ný föt'],
      }

    case 'shop_food':
      return {
        success: true,
        effects: [
          { stat: 'wellbeing', value: 5 },
          { stat: 'stress', value: -3 },
        ],
        moneyDelta: -500,
        messages: ['Keypti mat'],
      }

    case 'apply_job':
      return resolveApplyJob(player, action.params)

    case 'upgrade_housing':
      return {
        success: true,
        effects: [
          { stat: 'wellbeing', value: 10 },
          { stat: 'reputation', value: 5 },
          { stat: 'stress', value: -5 },
        ],
        moneyDelta: -(action.params?.cost as number ?? 5000),
        messages: ['Flutti í betri íbúð'],
      }

    default:
      return { success: false, effects: [], moneyDelta: 0, messages: ['Óþekkt aðgerð'] }
  }
}

function resolveWork(player: PlayerState): ActionResult {    if (!player.job) {
    return { success: false, effects: [], moneyDelta: 0, messages: ['Þú ert ekki í vinnu'] }
  }
  const jobDef = getJobById(player.job.definitionId)
  if (!jobDef) {
    return { success: false, effects: [], moneyDelta: 0, messages: ['Vinnustaður finnst ekki'] }
  }
  return {
    success: true,
    effects: [
      ...jobDef.weeklyEffects,
      { stat: 'stress', value: jobDef.stressGainPerWeek * 0.5 },
    ],
    moneyDelta: jobDef.weeklySalary,
    messages: [`Vann sem ${jobDef.title}`],
  }
}

function resolveStudy(_player: PlayerState): ActionResult {
  const knowledgeGain = 8 + Math.floor(Math.random() * 5)
  return {
    success: true,
    effects: [
      { stat: 'knowledge', value: knowledgeGain },
      { stat: 'stress', value: 3 },
    ],
    moneyDelta: 0,
    messages: [`Lærði — þekking +${knowledgeGain}`],
  }
}

function resolvePracticeHobby(_player: PlayerState, params?: Record<string, unknown>): ActionResult {
  const hobbyId = params?.hobbyId as string
  const hobbyDef = HOBBY_DEFINITIONS.find(h => h.id === hobbyId)
  if (!hobbyDef) {
    return { success: false, effects: [], moneyDelta: 0, messages: ['Hobby finnst ekki'] }
  }
  return {
    success: true,
    effects: [
      { stat: 'wellbeing', value: hobbyDef.wellbeingBonusPerWeek },
      { stat: 'stress', value: -5 },
    ],
    moneyDelta: 0,
    messages: [`Æfði ${hobbyDef.name}`],
    triggeredEventId: undefined,
  }
}

function resolveApplyJob(player: PlayerState, params?: Record<string, unknown>): ActionResult {
  const jobId = params?.jobId as string
  const jobDef = jobId ? getJobById(jobId) : null

  if (!jobDef) {
    return {
      success: true,
      effects: [{ stat: 'network', value: 1 }],
      moneyDelta: 0,
      messages: ['Leitaðist að vinnu'],
    }
  }

  // Athuga kröfur
  for (const [stat, minValue] of Object.entries(jobDef.requirements)) {
    const current = (player.stats as unknown as Record<string, number>)[stat] ?? 0
    if (current < (minValue as number)) {
      return {
        success: false,
        effects: [],
        moneyDelta: 0,
        messages: [`Uppfyllir ekki kröfur fyrir ${jobDef.title}`],
      }
    }
  }

  return {
    success: true,
    effects: [
      { stat: 'career', value: 2 },
      { stat: 'reputation', value: 1 },
    ],
    moneyDelta: 0,
    messages: [`Fékk starf sem ${jobDef.title}!`],
  }
}

export function endTurn(state: GameState, playerId: string): GameState {
  let player = state.players[playerId]
  if (!player) return state

  // Beita vikulegum áhrifum
  if (player.job) {
    const jobDef = getJobById(player.job.definitionId)
    if (jobDef) player = applyJobWeeklyEffects(player, jobDef)
  }

  player = applyHobbyWeeklyEffects(player, HOBBY_DEFINITIONS)
  player = applyWeeklyDecay(player)

  // Athuga markmið
  const jobDef = player.job ? getJobById(player.job.definitionId) : null
  const newlyCompleted = checkGoals(player, GOAL_DEFINITIONS, jobDef)
  if (newlyCompleted.length > 0) {
    player = {
      ...player,
      completedGoalIds: [...player.completedGoalIds, ...newlyCompleted],
    }
  }

  // Athuga events
  const triggeredEvents = checkEventTriggers(state, player, EVENT_DEFINITIONS)
  const newPendingEvents = triggeredEvents.map(def => ({
    definitionId: def.id,
    targetPlayerId: playerId,
    triggeredWeek: state.week,
  }))

  // Næsti leikmaður
  const nextIndex = (state.currentPlayerIndex + 1) % state.playerOrder.length
  const isNewWeek = nextIndex === 0

  let newWeek = state.week
  let newYear = state.year

  if (isNewWeek) {
    newWeek = state.week + 1
    if (newWeek > 52) {
      newWeek = 1
      newYear = state.year + 1
    }
  }

  // Endurnýja tímaeiningar
  player = { ...player, timeUnitsLeft: TIME_UNITS_PER_WEEK }

  const updatedPlayers = { ...state.players, [playerId]: player }

  // Athuga sigurinn
  const totalYears = GAME_LENGTH_YEARS[state.config.gameLength]
  const winnerId = newYear > totalYears ? determineWinner(updatedPlayers) : null

  return {
    ...state,
    players: updatedPlayers,
    currentPlayerIndex: nextIndex,
    week: newWeek,
    year: newYear,
    pendingEvents: [...state.pendingEvents, ...newPendingEvents],
    phase: winnerId ? 'finished' : newPendingEvents.length > 0 ? 'event_resolution' : 'playing',
    winnerId,
  }
}

function determineWinner(players: Record<string, PlayerState>): string {
  let bestScore = -1
  let winnerId = ''

  for (const [id, player] of Object.entries(players)) {
    const score = computeScore(player, GOAL_DEFINITIONS)
    if (score > bestScore) {
      bestScore = score
      winnerId = id
    }
  }

  return winnerId
}

export { BOARD_LOCATIONS, JOB_DEFINITIONS, HOBBY_DEFINITIONS, EVENT_DEFINITIONS, GOAL_DEFINITIONS }
