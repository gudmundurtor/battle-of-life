import { BOARD_LOCATIONS } from '@jones/shared'
import type { GameState } from '@jones/shared'
import { BoardLocationCard } from './BoardLocationCard'

const COLS = 7
const ROWS = 5

interface BoardProps {
  gameState: GameState
  localPlayerId: string
  selectedLocationId: string | null
  onSelectLocation: (id: string) => void
}

export function Board({ gameState, localPlayerId, selectedLocationId, onSelectLocation }: BoardProps) {
  const localPlayer = gameState.players[localPlayerId]

  // Build grid: locationId at each [col][row] or null
  const grid: (string | null)[][] = Array.from({ length: COLS }, () => Array(ROWS).fill(null))
  for (const loc of BOARD_LOCATIONS) {
    if (loc.position.x < COLS && loc.position.y < ROWS) {
      grid[loc.position.x][loc.position.y] = loc.id
    }
  }

  return (
    <div
      className="w-full h-full p-2"
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${COLS}, 1fr)`,
        gridTemplateRows: `repeat(${ROWS}, 1fr)`,
        gap: '6px',
      }}
    >
      {Array.from({ length: ROWS }).map((_, row) =>
        Array.from({ length: COLS }).map((_, col) => {
          const locationId = grid[col][row]

          if (!locationId) {
            return (
              <div
                key={`${col}-${row}`}
                className="rounded-lg"
                style={{ background: 'rgba(255,255,255,0.02)' }}
              />
            )
          }

          const location = BOARD_LOCATIONS.find(l => l.id === locationId)!
          const playersHere = Object.values(gameState.players).filter(
            p => p.locationId === locationId,
          )

          return (
            <BoardLocationCard
              key={locationId}
              location={location}
              players={playersHere}
              isSelected={selectedLocationId === locationId}
              isCurrentLocation={localPlayer?.locationId === locationId}
              onClick={() => onSelectLocation(locationId)}
            />
          )
        }),
      )}
    </div>
  )
}
