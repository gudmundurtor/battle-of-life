import { io } from 'socket.io-client'
import type { Socket } from 'socket.io-client'

// Where the realtime server lives. Set VITE_SERVER_URL at build time for
// production (the deployed Railway/Render URL); defaults to localhost for dev.
const URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001'

let socket: Socket | null = null

export function getSocket(): Socket {
  if (!socket) {
    socket = io(URL, { transports: ['websocket', 'polling'] })
  }
  return socket
}

export function disconnectSocket(): void {
  socket?.disconnect()
  socket = null
}
