// Authoritative realtime server for online (human-vs-human) games.
//
// The server owns every room's GameState and is the single source of truth: the
// shared game engine (the exact same code the client runs for single-player)
// applies each intent here, then the resulting state is broadcast to everyone in
// the room. Clients never compute shared state in online mode — they send
// intents and render the snapshots they receive.

import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import type { Socket } from 'socket.io'
import {
  createGame, assignGoals, startGame, performAction, endTurn,
  resolveEventChoice, applyEventResolution, autoResolveAIEvents,
  EVENT_DEFINITIONS, DEFAULT_CONFIG,
} from '@jones/shared'
import type { GameState, GameConfig, PlayerAction } from '@jones/shared'

const PORT = Number(process.env.PORT) || 3001
// Comma-separated list of allowed web origins; '*' allows any (handy locally).
const ORIGINS = (process.env.CLIENT_ORIGIN || '*').split(',').map(s => s.trim())

interface Slot {
  playerId: string
  name: string
  socketId: string | null // null while disconnected
}

interface Room {
  code: string
  hostPlayerId: string
  config: GameConfig
  slots: Slot[]
  state: GameState | null // null until the host starts (then goal_selection)
}

const rooms = new Map<string, Room>()
// Reverse lookup so a disconnect/intent can find its room + identity in O(1).
const sockets = new Map<string, { code: string; playerId: string }>()

const MAX_PLAYERS = 4
const MIN_PLAYERS = 2

function makeCode(): string {
  // Unambiguous alphabet (no O/0/I/1) so codes are easy to read aloud / type.
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  do {
    code = Array.from({ length: 4 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join('')
  } while (rooms.has(code))
  return code
}

const app = express()
app.get('/', (_req, res) => res.send('Lífsbaráttan realtime server'))
app.get('/health', (_req, res) => res.json({ ok: true, rooms: rooms.size }))

const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: { origin: ORIGINS, methods: ['GET', 'POST'] },
})

// Roster sent to the waiting room (before the game has started).
function lobbyPayload(room: Room) {
  return {
    code: room.code,
    hostPlayerId: room.hostPlayerId,
    config: room.config,
    players: room.slots.map(s => ({
      playerId: s.playerId,
      name: s.name,
      connected: s.socketId !== null,
    })),
    canStart: room.slots.filter(s => s.socketId !== null).length >= MIN_PLAYERS,
  }
}

function broadcastLobby(room: Room) {
  io.to(room.code).emit('lobby', lobbyPayload(room))
}

function broadcastState(room: Room) {
  if (room.state) io.to(room.code).emit('state', room.state)
}

io.on('connection', (socket: Socket) => {
  // ---- Create a room -------------------------------------------------------
  socket.on('create', (
    { name, config }: { name?: string; config?: Partial<GameConfig> },
    ack?: (res: { ok: boolean; code?: string; playerId?: string; error?: string }) => void,
  ) => {
    const code = makeCode()
    const playerId = 'player_0'
    const room: Room = {
      code,
      hostPlayerId: playerId,
      config: { ...DEFAULT_CONFIG, ...config },
      slots: [{ playerId, name: (name || 'Player 1').slice(0, 20), socketId: socket.id }],
      state: null,
    }
    rooms.set(code, room)
    sockets.set(socket.id, { code, playerId })
    socket.join(code)
    ack?.({ ok: true, code, playerId })
    broadcastLobby(room)
  })

  // ---- Join an existing room ----------------------------------------------
  socket.on('join', (
    { code, name }: { code: string; name?: string },
    ack?: (res: { ok: boolean; playerId?: string; error?: string }) => void,
  ) => {
    const room = rooms.get((code || '').toUpperCase())
    if (!room) { ack?.({ ok: false, error: 'not_found' }); return }

    const trimmed = (name || '').slice(0, 20)

    // Reclaim a disconnected slot with the same name (reconnect / rejoin).
    const reclaim = room.slots.find(s => s.socketId === null && s.name === trimmed)
    if (reclaim) {
      reclaim.socketId = socket.id
      sockets.set(socket.id, { code: room.code, playerId: reclaim.playerId })
      socket.join(room.code)
      ack?.({ ok: true, playerId: reclaim.playerId })
      broadcastLobby(room)
      broadcastState(room)
      return
    }

    if (room.state) { ack?.({ ok: false, error: 'already_started' }); return }
    if (room.slots.length >= MAX_PLAYERS) { ack?.({ ok: false, error: 'full' }); return }

    const playerId = `player_${room.slots.length}`
    room.slots.push({ playerId, name: trimmed || `Player ${room.slots.length + 1}`, socketId: socket.id })
    sockets.set(socket.id, { code: room.code, playerId })
    socket.join(room.code)
    ack?.({ ok: true, playerId })
    broadcastLobby(room)
  })

  // ---- Host starts the game (lobby -> goal selection) ----------------------
  socket.on('start', (_payload: unknown, ack?: (res: { ok: boolean; error?: string }) => void) => {
    const ident = sockets.get(socket.id)
    const room = ident && rooms.get(ident.code)
    if (!room) { ack?.({ ok: false, error: 'not_found' }); return }
    if (ident!.playerId !== room.hostPlayerId) { ack?.({ ok: false, error: 'not_host' }); return }
    if (room.state) { ack?.({ ok: false, error: 'already_started' }); return }

    const active = room.slots.filter(s => s.socketId !== null)
    if (active.length < MIN_PLAYERS) { ack?.({ ok: false, error: 'need_more_players' }); return }

    // Freeze the roster to the connected players, in slot order.
    room.slots = active
    const names = room.slots.map(s => s.name)
    room.state = createGame(room.config, names)
    ack?.({ ok: true })
    broadcastState(room)
  })

  // ---- Goal selection ------------------------------------------------------
  socket.on('assignGoals', ({ goalIds }: { goalIds: string[] }) => {
    const ident = sockets.get(socket.id)
    const room = ident && rooms.get(ident.code)
    if (!room || !room.state || room.state.phase !== 'goal_selection') return

    room.state = assignGoals(room.state, ident!.playerId, goalIds)

    // Start once every human player has picked their goals.
    const everyoneReady = room.slots.every(s => {
      const p = room.state!.players[s.playerId]
      return p && p.goalIds.length > 0
    })
    if (everyoneReady) room.state = startGame(room.state)
    broadcastState(room)
  })

  // ---- A turn action -------------------------------------------------------
  socket.on('action', ({ action }: { action: PlayerAction }) => {
    const ident = sockets.get(socket.id)
    const room = ident && rooms.get(ident.code)
    if (!room || !room.state) return

    const { state, result } = performAction(room.state, ident!.playerId, action)
    room.state = state
    socket.emit('result', result)
    broadcastState(room)
  })

  // ---- End the current player's turn ---------------------------------------
  socket.on('endTurn', () => {
    const ident = sockets.get(socket.id)
    const room = ident && rooms.get(ident.code)
    if (!room || !room.state) return
    if (room.state.playerOrder[room.state.currentPlayerIndex] !== ident!.playerId) return

    room.state = autoResolveAIEvents(endTurn(room.state, ident!.playerId), EVENT_DEFINITIONS)
    broadcastState(room)
  })

  // ---- Resolve one of a player's pending events ----------------------------
  socket.on('resolveEvent', ({ eventId, choiceId }: { eventId: string; choiceId: string }) => {
    const ident = sockets.get(socket.id)
    const room = ident && rooms.get(ident.code)
    if (!room || !room.state) return

    const playerId = ident!.playerId
    const eventDef = EVENT_DEFINITIONS.find(e => e.id === eventId)
    const player = room.state.players[playerId]
    if (!eventDef || !player) return

    const result = resolveEventChoice(player, eventDef, choiceId, room.state.week)
    if (!result.success) return

    const updatedPlayer = applyEventResolution(player, result, eventId, room.state.week)
    const remaining = room.state.pendingEvents.filter(
      e => !(e.definitionId === eventId && e.targetPlayerId === playerId),
    )
    room.state = {
      ...room.state,
      players: { ...room.state.players, [playerId]: updatedPlayer },
      pendingEvents: remaining,
      phase: remaining.length > 0 ? 'event_resolution' : 'playing',
    }
    broadcastState(room)
  })

  // ---- Disconnect ----------------------------------------------------------
  socket.on('disconnect', () => {
    const ident = sockets.get(socket.id)
    if (!ident) return
    sockets.delete(socket.id)
    const room = rooms.get(ident.code)
    if (!room) return

    const slot = room.slots.find(s => s.playerId === ident.playerId)
    if (slot) slot.socketId = null

    // Drop the room entirely once everyone has left.
    if (room.slots.every(s => s.socketId === null)) {
      rooms.delete(room.code)
      return
    }

    // Before the game starts, a leaver frees their slot.
    if (!room.state) {
      room.slots = room.slots.filter(s => s.socketId !== null)
      if (slot && slot.playerId === room.hostPlayerId) {
        room.hostPlayerId = room.slots[0]?.playerId ?? room.hostPlayerId
      }
    }
    broadcastLobby(room)
  })
})

httpServer.listen(PORT, () => {
  console.log(`Lífsbaráttan realtime server listening on :${PORT}`)
})
