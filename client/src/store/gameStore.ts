import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  GameState, GameConfig, PlayerAction, PlayerState,
} from '@jones/shared'
import {
  createGame, startGame, assignGoals, performAction, endTurn,
  HOBBY_DEFINITIONS, EVENT_DEFINITIONS,
  getJobById, resolveEventChoice, applyEventResolution, applyStatEffects,
  autoResolveAIEvents, chooseAIAction, HOBBY_XP_THRESHOLDS, HOBBY_LEVEL_ORDER,
} from '@jones/shared'
import type { HobbyLevel } from '@jones/shared'
import { getTranslations } from '../i18n'
import { translateActionResult } from '../i18n/actionResult'
import { useLanguageStore } from './languageStore'

function t() {
  return getTranslations(useLanguageStore.getState().language)
}

export interface AIRecapAction {
  playerId: string
  playerName: string
  color: string
  week: number
  actionType: string
  description: string
  locationId?: string
}

export interface AIRecap {
  week: number
  actions: AIRecapAction[]
}

interface GameStore {
  gameState: GameState | null
  localPlayerId: string
  humanPlayerIds: string[]
  isAIThinking: boolean
  showJobPicker: boolean
  jobPickerLocationId: string | null
  showMealPicker: boolean
  mealPickerLocationId: string | null
  statusMessage: string | null
  aiTurnRecap: AIRecap | null
  closeAIRecap: () => void
  lastNewsWeek: number | null
  setLastNewsWeek: (week: number) => void
  quitGame: () => void

  initGame: (config: GameConfig, playerNames: string[]) => void
  confirmGoals: (playerId: string, goalIds: string[]) => void
  startPlaying: () => void

  doAction: (action: PlayerAction) => void
  applyForJob: (jobId: string) => void
  openJobPicker: (locationId: string) => void
  closeJobPicker: () => void
  practiceHobby: (hobbyId: string, locationId?: string) => void
  openMealPicker: (locationId: string) => void
  closeMealPicker: () => void
  buyMeal: (dishId: string) => void
  endMyTurn: () => void
  resolveEvent: (eventId: string, choiceId: string) => void

  runAITurn: () => void
  clearMessage: () => void
}

export const useGameStore = create<GameStore>()(persist((set, get) => ({
  gameState: null,
  localPlayerId: 'player_0',
  humanPlayerIds: ['player_0'],
  isAIThinking: false,
  showJobPicker: false,
  jobPickerLocationId: null,
  showMealPicker: false,
  mealPickerLocationId: null,
  statusMessage: null,
  aiTurnRecap: null,
  lastNewsWeek: null,

  closeAIRecap: () => set({ aiTurnRecap: null }),
  setLastNewsWeek: (week) => set({ lastNewsWeek: week }),

  // Hætta í leiknum og fara aftur á upphafsskjáinn (hreinsar vistaða stöðu).
  quitGame: () => set({
    gameState: null,
    localPlayerId: 'player_0',
    humanPlayerIds: ['player_0'],
    isAIThinking: false,
    showJobPicker: false,
    jobPickerLocationId: null,
    showMealPicker: false,
    mealPickerLocationId: null,
    statusMessage: null,
    aiTurnRecap: null,
    lastNewsWeek: null,
  }),

  initGame: (config, playerNames) => {
    const state = createGame(config, playerNames)
    const humanIds = playerNames.map((_, i) => `player_${i}`)
    set({ gameState: state, localPlayerId: 'player_0', humanPlayerIds: humanIds, lastNewsWeek: null })
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
      statusMessage: translateActionResult(result, t()),
    })
  },

  openJobPicker: (locationId) => set({ showJobPicker: true, jobPickerLocationId: locationId }),
  closeJobPicker: () => set({ showJobPicker: false, jobPickerLocationId: null }),

  openMealPicker: (locationId) => set({ showMealPicker: true, mealPickerLocationId: locationId }),
  closeMealPicker: () => set({ showMealPicker: false, mealPickerLocationId: null }),

  buyMeal: (dishId) => {
    const { gameState, localPlayerId, mealPickerLocationId } = get()
    if (!gameState || !mealPickerLocationId) return

    const { state: newState, result } = performAction(gameState, localPlayerId, {
      type: 'buy_meal',
      locationId: mealPickerLocationId,
      params: { dishId },
    })
    set({
      gameState: newState,
      showMealPicker: false,
      mealPickerLocationId: null,
      statusMessage: translateActionResult(result, t()),
    })
  },

  applyForJob: (jobId) => {
    const { gameState, localPlayerId, jobPickerLocationId } = get()
    if (!gameState) return

    const player = gameState.players[localPlayerId]
    const jobDef = getJobById(jobId)
    if (!player || !jobDef) return

    // Check requirements
    for (const [stat, min] of Object.entries(jobDef.requirements)) {
      const current = (player.stats as unknown as Record<string, number>)[stat] ?? 0
      if (current < (min as number)) {
        const title = t().jobs[jobId]?.title ?? jobDef.title
        set({ statusMessage: t().game.jobNoReqs(title) })
        return
      }
    }

    // Allar aðgerðir kosta 1 tímaeiningu.
    const TE_COST = 1
    if (player.timeUnitsLeft < TE_COST) {
      set({ statusMessage: t().game.noTime })
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
      // Move the player's avatar to the workplace where they applied.
      locationId: jobPickerLocationId ?? player.locationId,
      timeUnitsLeft: player.timeUnitsLeft - TE_COST,
      actionLog: [...player.actionLog, {
        week: gameState.week,
        actionType: 'apply_job',
        description: `Fékk starf sem ${jobDef.title}`,
        locationId: jobPickerLocationId ?? player.locationId,
      }],
    }

    const title = t().jobs[jobId]?.title ?? jobDef.title
    set({
      gameState: { ...gameState, players: { ...gameState.players, [localPlayerId]: updatedPlayer } },
      showJobPicker: false,
      statusMessage: t().game.jobHired(title),
    })
  },

  practiceHobby: (hobbyId, locationId) => {
    const { gameState, localPlayerId } = get()
    if (!gameState) return

    const player = gameState.players[localPlayerId]
    const hobbyDef = HOBBY_DEFINITIONS.find(h => h.id === hobbyId)
    if (!player || !hobbyDef) return

    // Allar aðgerðir kosta 1 tímaeiningu.
    const TE_COST = 1
    if (player.timeUnitsLeft < TE_COST) {
      set({ statusMessage: t().game.noTime })
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
      // Move the avatar to the tile where the hobby is practiced (when known).
      locationId: locationId ?? player.locationId,
      timeUnitsLeft: player.timeUnitsLeft - TE_COST,
      actionLog: [...player.actionLog, {
        week: gameState.week,
        actionType: 'practice_hobby',
        description: `Æfði ${hobbyDef.name} (+${newXP} XP)`,
        locationId: locationId ?? player.locationId,
      }],
    }

    const hobbyName = t().hobbies[hobbyId]?.name ?? hobbyDef.name
    set({
      gameState: { ...gameState, players: { ...gameState.players, [localPlayerId]: updatedPlayer } },
      statusMessage: t().game.hobbyXpMsg(hobbyDef.icon, hobbyName, newXP),
    })
  },

  endMyTurn: () => {
    const { gameState, localPlayerId, humanPlayerIds } = get()
    if (!gameState) return

    const newState = autoResolveAIEvents(endTurn(gameState, localPlayerId), EVENT_DEFINITIONS)
    const nextId = newState.playerOrder[newState.currentPlayerIndex]
    const nextIsHuman = humanPlayerIds.includes(nextId)

    set({
      gameState: newState,
      statusMessage: null,
      localPlayerId: nextIsHuman ? nextId : localPlayerId,
    })

    if (newState.phase === 'finished') return
    if (newState.pendingEvents.length > 0) return

    if (!nextIsHuman) {
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
      set({ statusMessage: result.messages[0] ?? t().actionMsg.error })
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

    // Record each player's action-log length at the start of the AI chain so we
    // can show the human a recap of everything the AI(s) did on their turn.
    const startState = get().gameState
    const baselines: Record<string, number> = {}
    if (startState) {
      for (const pid of startState.playerOrder) {
        baselines[pid] = startState.players[pid]?.actionLog.length ?? 0
      }
    }

    // Build a recap of what the AI players did since the chain started.
    const buildRecap = (state: GameState): AIRecap | null => {
      const actions: AIRecapAction[] = []
      for (const pid of state.playerOrder) {
        const p = state.players[pid]
        if (!p?.isAI) continue
        const base = baselines[pid] ?? 0
        for (const entry of p.actionLog.slice(base)) {
          actions.push({
            playerId: pid,
            playerName: p.name,
            color: p.color,
            week: entry.week,
            actionType: entry.actionType,
            description: entry.description,
            locationId: entry.locationId,
          })
        }
      }
      return actions.length > 0 ? { week: state.week, actions } : null
    }

    // Wrap up the current AI player's turn and chain to whoever is next.
    const finishTurn = (gameState: GameState, currentId: string) => {
      const newState = autoResolveAIEvents(endTurn(gameState, currentId), EVENT_DEFINITIONS)
      const nextId = newState.playerOrder[newState.currentPlayerIndex]
      const nextIsHuman = get().humanPlayerIds.includes(nextId)

      set({
        gameState: newState,
        isAIThinking: false,
        // Hand the local view to the next human (hot-seat); otherwise keep it.
        localPlayerId: nextIsHuman ? nextId : get().localPlayerId,
        // Show the recap once control returns to a human player.
        aiTurnRecap: nextIsHuman ? buildRecap(newState) : get().aiTurnRecap,
      })

      if (newState.phase === 'finished') return
      if (newState.pendingEvents.length > 0) return

      // If the next player is also an AI, keep the chain going.
      if (!nextIsHuman) {
        setTimeout(() => { set({ isAIThinking: true }); setTimeout(step, 400) }, 300)
      }
    }

    const step = () => {
      // Never let an unexpected error leave the AI stuck "thinking" forever.
      try {
        const { gameState } = get()
        if (!gameState || gameState.phase === 'finished') {
          set({ isAIThinking: false })
          return
        }

        const currentId = gameState.playerOrder[gameState.currentPlayerIndex]
        const player = gameState.players[currentId]
        if (!player?.isAI) { set({ isAIThinking: false }); return }

        if (player.timeUnitsLeft <= 0) { finishTurn(gameState, currentId); return }

        const action = chooseAIAction(gameState, currentId)
        if (!action) { finishTurn(gameState, currentId); return }

        const { state: newState } = performAction(gameState, currentId, action)

        // Safety guard: if the action was rejected and consumed no time, end the
        // turn instead of looping forever.
        const timeLeftAfter = newState.players[currentId]?.timeUnitsLeft ?? 0
        if (newState === gameState || timeLeftAfter >= player.timeUnitsLeft) {
          finishTurn(gameState, currentId)
          return
        }

        set({ gameState: newState })
        // The figure walks to the new tile (~0.55s CSS transition); then it
        // pauses ~0.5s standing on the spot before moving on, so Georg isn't
        // perpetually in motion.
        setTimeout(step, 1050)
      } catch (err) {
        console.error('[AI] turn aborted after error:', err)
        // Bail out of the AI turn cleanly so the game does not freeze.
        const { gameState } = get()
        if (gameState) {
          const currentId = gameState.playerOrder[gameState.currentPlayerIndex]
          finishTurn(gameState, currentId)
        } else {
          set({ isAIThinking: false })
        }
      }
    }

    setTimeout(step, 800)
  },

  clearMessage: () => set({ statusMessage: null }),
}), {
  name: 'jones-game',
  // Geyma aðeins eiginlega leikstöðu (ekki tímabundið UI-ástand eins og
  // valglugga eða "AI að hugsa"), svo F5/endurhleðsla haldi leiknum áfram.
  partialize: (state) => ({
    gameState: state.gameState,
    localPlayerId: state.localPlayerId,
    humanPlayerIds: state.humanPlayerIds,
    lastNewsWeek: state.lastNewsWeek,
  }),
  onRehydrateStorage: () => (state) => {
    // Ef endurhlaðið var á meðan röðin var hjá tölvuleikmanni, halda
    // AI-umferðinni áfram svo leikurinn frjósi ekki.
    if (!state?.gameState || state.gameState.phase !== 'playing') return
    const gs = state.gameState
    const currentId = gs.playerOrder[gs.currentPlayerIndex]
    const isHuman = state.humanPlayerIds.includes(currentId)
    if (!isHuman && gs.pendingEvents.length === 0) {
      setTimeout(() => useGameStore.getState().runAITurn(), 600)
    }
  },
}))
