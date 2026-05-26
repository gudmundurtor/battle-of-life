import { useState, useEffect } from 'react'
import { useGameStore } from '../store/gameStore'
import { Board } from '../components/Board/Board'
import { PlayerHUD } from '../components/HUD/PlayerHUD'
import { ActionPanel } from '../components/Actions/ActionPanel'
import { EventDialog } from '../components/Dialogs/EventDialog'
import { JobPickerDialog } from '../components/Dialogs/JobPickerDialog'

export function GameView() {
  const {
    gameState, localPlayerId, isAIThinking,
    showJobPicker, jobPickerLocationId,
    statusMessage, clearMessage,
  } = useGameStore()

  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null)

  useEffect(() => {
    if (statusMessage) {
      const t = setTimeout(clearMessage, 3000)
      return () => clearTimeout(t)
    }
  }, [statusMessage, clearMessage])

  if (!gameState) return null

  const currentPlayerId = gameState.playerOrder[gameState.currentPlayerIndex]
  const currentPlayer = gameState.players[currentPlayerId]
  const localPlayer = gameState.players[localPlayerId]
  const isMyTurn = currentPlayerId === localPlayerId

  return (
    <div className="flex flex-col h-screen" style={{ background: '#080D1A' }}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-3">
          <span className="font-bold text-orange-400">Jones</span>
          <span className="text-xs text-slate-600">·</span>
          <span className="text-sm text-slate-400">
            📅 Vika {gameState.week}, Ár {gameState.year}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {isAIThinking && (
            <div className="flex items-center gap-2 text-orange-400 animate-think text-sm">
              <span>🤖</span>
              <span>Jones er að hugsa…</span>
            </div>
          )}
          {!isAIThinking && (
            <div className={`text-sm font-medium ${isMyTurn ? 'text-blue-300' : 'text-slate-500'}`}>
              {isMyTurn ? '⚡ Röð þín' : `⏳ Röð: ${currentPlayer?.name ?? '?'}`}
            </div>
          )}
        </div>

        <div className="text-xs text-slate-600">
          {Object.values(gameState.players).filter(p => !p.isAI).map(p => (
            <span key={p.id}>
              🎯 {p.completedGoalIds.length}/{p.goalIds.length}
            </span>
          ))}
        </div>
      </div>

      {/* Main area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Board */}
        <div className="flex-1 overflow-hidden">
          <Board
            gameState={gameState}
            localPlayerId={localPlayerId}
            selectedLocationId={selectedLocationId ?? localPlayer?.locationId ?? null}
            onSelectLocation={setSelectedLocationId}
          />
        </div>

        {/* Right panel */}
        <div className="w-72 shrink-0 flex flex-col border-l border-slate-800 overflow-hidden">
          {/* Local player HUD */}
          {localPlayer && (
            <div className="p-3 border-b border-slate-800 overflow-y-auto" style={{ maxHeight: '65%' }}>
              <PlayerHUD
                player={localPlayer}
                isCurrentPlayer={isMyTurn}
                isLocal={true}
              />
            </div>
          )}

          {/* Action panel */}
          <div className="flex-1 p-3 overflow-y-auto">
            <ActionPanel
              gameState={gameState}
              localPlayerId={localPlayerId}
              selectedLocationId={selectedLocationId ?? localPlayer?.locationId ?? null}
            />
          </div>
        </div>
      </div>

      {/* Bottom: other players */}
      <div className="flex gap-2 px-3 py-2 border-t border-slate-800 shrink-0 overflow-x-auto">
        {gameState.playerOrder
          .filter(id => id !== localPlayerId)
          .map(id => {
            const p = gameState.players[id]
            if (!p) return null
            return (
              <div key={id} className="shrink-0 w-52">
                <PlayerHUD
                  player={p}
                  isCurrentPlayer={currentPlayerId === id}
                  isLocal={false}
                />
              </div>
            )
          })}
      </div>

      {/* Status toast */}
      {statusMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-slate-800 border border-slate-600 rounded-full px-4 py-2 text-sm text-slate-200 shadow-xl animate-slide">
          {statusMessage}
        </div>
      )}

      {/* Event dialog */}
      {gameState.phase === 'event_resolution' && (
        <EventDialog gameState={gameState} localPlayerId={localPlayerId} />
      )}

      {/* Job picker */}
      {showJobPicker && jobPickerLocationId && (
        <JobPickerDialog
          gameState={gameState}
          localPlayerId={localPlayerId}
          locationId={jobPickerLocationId}
        />
      )}
    </div>
  )
}
