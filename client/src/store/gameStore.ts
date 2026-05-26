import { create } from 'zustand'
import type {
  GameState, GameConfig, PlayerAction, PlayerState,
} from '@jones/shared'
import {
  createGame, startGame, assignGoals, performAction, endTurn,
  HOBBY_DEFINITIONS, EVENT_DEFINITIONS,
  getJobById, resolveEventChoice, applyEventResolution, applyStatEffects,
  chooseAIAction, HOBBY_XP_THRESHOLDS, HOBBY_LEVEL_ORDER,
} from '@jones/shared'
import type { HobbyLevel } from '@jones/shared'

interface GameStore {
  gameState: GameState | null
  localPlayerId: string
  isAIThinking: boolean
  showJobPicker: boolean
  jobPickerLocationId: string | null
  statusMessage: string | null

  initGame: (config: GameConfig, playerNames: string[]) => void
  confirmGoals: (playerId: string, goalIds: string[]) => void
  startPlaying: () => void

  doAction: (action: PlayerAction) => void
  applyForJob: (jobId: string) => void
  openJobPicker: (locationId: string) => void
  closeJobPicker: () => void
  practiceHobby: (hobbyId: string) => void
  endMyTurn: () => void
  resolveEvent: (eventId: string, choiceId: string) => void

  runAITurn: () => void
  clearMessage: () => void
}

export const useGameStore = create<GameStore>((set, get) => ({
  gameState: null,
  localPlayerId: 'player_0',
  isAIThinking: false,
  showJobPicker: false,
  jobPickerLocationId: null,
  statusMessage: null,

  initGame: (config, playerNames) => {
    const state = createGame(config, playerNames)
    set({ gameState: state, localPlayerId: 'player_0' })
  },

  confirmGoals: (playerId, goalIds) => {
    const { gameState } = get()
    if (!gameState) return
    set({ gameState: assignGoals(gameState, playerId, goalIds) })
  },

  startPlaying: () => {
    const { gameState } = get()
    if (!gameState) return
    set({ gameState: startGame(gameState) })
  },

  doAction: (action) => {
    const { gameState, localPlayerId } = get()
    if (!gameState) return

    const { state: newState, result } = performAction(gameState, localPlayerId, action)
    set({
      gameState: newState,
      statusMessage: result.success ? (result.messages[0] ?? null) : (result.messages[0] ?? 'Villa'),
    })
  },

  openJobPicker: (locationId) => set({ showJobPicker: true, jobPickerLocationId: locationId }),
  closeJobPicker: () => set({ showJobPicker: false, jobPickerLocationId: null }),

  applyForJob: (jobId) => {
    const { gameState, localPlayerId } = get()
    if (!gameState) return

    const player = gameState.players[localPlayerId]
    const jobDef = getJobById(jobId)
    if (!player || !jobDef) return

    // Check requirements
    for (const [stat, min] of Object.entries(jobDef.requirements)) {
      const current = (player.stats as unknown as Record<string, number>)[stat] ?? 0
      if (current < (min as number)) {
        set({ statusMessage: `Uppfyllir ekki kröfur fyrir ${jobDef.title}` })
        return
      }
    }

    // Deduct 2 TE and assign job
    const TE_COST = 2
    if (player.timeUnitsLeft < TE_COST) {
      set({ statusMessage: 'Ekki nægur tími' })
      return
    }

    const { stats, hidden, money } = applyStatEffects(player, [
      { stat: 'career', value: 3 },
      { stat: 'reputation', value: 2 },
    ])

    const updatedPlayer: PlayerState = {
      ...player,
      stats,
      hidden,
      money,
      job: { definitionId: jobId, weeksWorked: 0, promotionProgress: 0 },
      timeUnitsLeft: player.timeUnitsLeft - TE_COST,
      actionLog: [...player.actionLog, {
        week: gameState.week,
        actionType: 'apply_job',
        description: `Fékk starf sem ${jobDef.title}`,
      }],
    }

    set({
      gameState: { ...gameState, players: { ...gameState.players, [localPlayerId]: updatedPlayer } },
      showJobPicker: false,
      statusMessage: `🎉 Fékk starf sem ${jobDef.title}!`,
    })
  },

  practiceHobby: (hobbyId) => {
    const { gameState, localPlayerId } = get()
    if (!gameState) return

    const player = gameState.players[localPlayerId]
    const hobbyDef = HOBBY_DEFINITIONS.find(h => h.id === hobbyId)
    if (!player || !hobbyDef) return

    const TE_COST = hobbyDef.timeCostPerWeek
    if (player.timeUnitsLeft < TE_COST) {
      set({ statusMessage: 'Ekki nægur tími' })
      return
    }

    // Find or create hobby
    let hobbies = [...player.hobbies]
    const existing = hobbies.find(h => h.definitionId === hobbyId)

    let newXP = hobbyDef.xpPerSession
    if (player.talent?.hobbyId === hobbyId) newXP = Math.round(newXP * player.talent.xpMultiplier)

    if (existing) {
      const totalXP = existing.xp + newXP
      let level: HobbyLevel = 'beginner'
      for (const lvl of [...HOBBY_LEVEL_ORDER].reverse()) {
        if (totalXP >= HOBBY_XP_THRESHOLDS[lvl]) { level = lvl; break }
      }
      hobbies = hobbies.map(h =>
        h.definitionId === hobbyId ? { ...h, xp: totalXP, level, active: true } : h,
      )
    } else {
      hobbies.push({ definitionId: hobbyId, level: 'beginner', xp: newXP, active: true, opportunitiesTriggered: [] })
    }

    const { stats, hidden, money } = applyStatEffects(player, [
      { stat: 'wellbeing', value: hobbyDef.wellbeingBonusPerWeek },
      { stat: 'stress', value: -5 },
    ])

    const updatedPlayer: PlayerState = {
      ...player,
      stats,
      hidden,
      money,
      hobbies,
      timeUnitsLeft: player.timeUnitsLeft - TE_COST,
      actionLog: [...player.actionLog, {
        week: gameState.week,
        actionType: 'practice_hobby',
        description: `Æfði ${hobbyDef.name} (+${newXP} XP)`,
      }],
    }

    set({
      gameState: { ...gameState, players: { ...gameState.players, [localPlayerId]: updatedPlayer } },
      statusMessage: `${hobbyDef.icon} ${hobbyDef.name} +${newXP} XP`,
    })
  },

  endMyTurn: () => {
    const { gameState, localPlayerId } = get()
    if (!gameState) return

    const newState = endTurn(gameState, localPlayerId)
    set({ gameState: newState, statusMessage: null })

    if (newState.phase === 'finished') return

    if (newState.pendingEvents.length > 0) return

    const nextId = newState.playerOrder[newState.currentPlayerIndex]
    if (newState.players[nextId]?.isAI) {
      setTimeout(() => get().runAITurn(), 600)
    }
  },

  resolveEvent: (eventId, choiceId) => {
    const { gameState, localPlayerId } = get()
    if (!gameState) return

    const eventDef = EVENT_DEFINITIONS.find(e => e.id === eventId)
    const player = gameState.players[localPlayerId]
    if (!eventDef || !player) return

    const result = resolveEventChoice(player, eventDef, choiceId, gameState.week)
    if (!result.success) {
      set({ statusMessage: result.messages[0] ?? 'Villa' })
      return
    }

    const updatedPlayer = applyEventResolution(player, result, eventId, gameState.week)
    const remaining = gameState.pendingEvents.filter(
      e => !(e.definitionId === eventId && e.targetPlayerId === localPlayerId),
    )

    const newState: GameState = {
      ...gameState,
      players: { ...gameState.players, [localPlayerId]: updatedPlayer },
      pendingEvents: remaining,
      phase: remaining.length > 0 ? 'event_resolution' : 'playing',
    }
    set({ gameState: newState, statusMessage: result.messages[0] ?? null })

    if (remaining.length === 0) {
      const nextId = newState.playerOrder[newState.currentPlayerIndex]
      if (newState.players[nextId]?.isAI) {
        setTimeout(() => get().runAITurn(), 600)
      }
    }
  },

  runAITurn: () => {
    set({ isAIThinking: true })

    const step = () => {
      const { gameState } = get()
      if (!gameState || gameState.phase === 'finished') {
        set({ isAIThinking: false })
        return
      }

      const currentId = gameState.playerOrder[gameState.currentPlayerIndex]
      const player = gameState.players[currentId]
      if (!player?.isAI) { set({ isAIThinking: false }); return }

      if (player.timeUnitsLeft <= 0) {
        const newState = endTurn(gameState, currentId)
        set({ gameState: newState, isAIThinking: false })

        if (newState.phase === 'finished') return
        if (newState.pendingEvents.length > 0) return

        const nextId = newState.playerOrder[newState.currentPlayerIndex]
        if (newState.players[nextId]?.isAI) {
          setTimeout(() => { set({ isAIThinking: true }); setTimeout(step, 400) }, 300)
        }
        return
      }

      const action = chooseAIAction(gameState, currentId)
      if (!action) {
        const newState = endTurn(gameState, currentId)
        set({ gameState: newState, isAIThinking: false })
        return
      }

      const { state: newState } = performAction(gameState, currentId, action)
      set({ gameState: newState })
      setTimeout(step, 550)
    }

    setTimeout(step, 800)
  },

  clearMessage: () => set({ statusMessage: null }),
}))
