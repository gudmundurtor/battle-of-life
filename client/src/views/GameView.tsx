import { useState, useEffect, useRef } from 'react'
import { StandingsDialog } from '../components/Dialogs/StandingsDialog'
import { useEscapeKey } from '../utils/useEscapeKey'
import { useGameStore } from '../store/gameStore'
import { useT } from '../i18n'
import { getPlayerAvatar } from '../utils/player'
import { Board } from '../components/Board/Board'
import { PlayerHUD } from '../components/HUD/PlayerHUD'
import { PlayerMiniCard } from '../components/HUD/PlayerMiniCard'
import { ActionPanel } from '../components/Actions/ActionPanel'
import { EventDialog } from '../components/Dialogs/EventDialog'
import { JobPickerDialog } from '../components/Dialogs/JobPickerDialog'
import { MealPickerDialog } from '../components/Dialogs/MealPickerDialog'
import { RulesDialog } from '../components/Dialogs/RulesDialog'
import { NewsDialog } from '../components/Dialogs/NewsDialog'
import { AITurnRecapDialog } from '../components/Dialogs/AITurnRecapDialog'

export function GameView() {
  const {
    gameState, localPlayerId, humanPlayerIds, isAIThinking,
    showJobPicker, jobPickerLocationId,
    showMealPicker, mealPickerLocationId,
    statusMessage, clearMessage,
    aiTurnRecap, closeAIRecap,
    lastNewsWeek, setLastNewsWeek, quitGame,
  } = useGameStore()

  const t = useT()
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null)
  const [showHandoff, setShowHandoff] = useState(false)
  const [showRules, setShowRules] = useState(false)
  const [showNews, setShowNews] = useState(false)
  const [showStandings, setShowStandings] = useState(false)
  const [showQuitConfirm, setShowQuitConfirm] = useState(false)
  const prevLocalId = useRef(localPlayerId)

  useEffect(() => {
    if (statusMessage) {
      const timer = setTimeout(clearMessage, 3000)
      return () => clearTimeout(timer)
    }
  }, [statusMessage, clearMessage])

  // Show the weekly news overlay once per new week. We track the last week we
  // showed it in persisted store state, so refreshing the page (F5) mid-week
  // does NOT pop the newspaper again.
  const week = gameState?.week
  const phase = gameState?.phase
  useEffect(() => {
    if (phase !== 'playing' || week == null) return
    if (lastNewsWeek !== week) {
      setLastNewsWeek(week)
      setShowNews(true)
    }
  }, [week, phase, lastNewsWeek, setLastNewsWeek])

  useEffect(() => {
    if (prevLocalId.current !== localPlayerId && humanPlayerIds.length > 1) {
      setShowHandoff(true)
      setSelectedLocationId(null)
    }
    prevLocalId.current = localPlayerId
  }, [localPlayerId, humanPlayerIds.length])

  // Esc lokar staðfestingarglugganum (hættir við að hætta).
  useEscapeKey(() => setShowQuitConfirm(false), showQuitConfirm)

  if (!gameState) return null

  const currentPlayerId = gameState.playerOrder[gameState.currentPlayerIndex]
  const currentPlayer = gameState.players[currentPlayerId]
  const localPlayer = gameState.players[localPlayerId]
  const isMyTurn = currentPlayerId === localPlayerId
  const otherPlayerIds = gameState.playerOrder.filter(id => id !== localPlayerId)

  // Þegar tölvuleikmaður (Georg) er á ferð sýnum við HANS upplýsingar hægra
  // megin (auður, þekking o.s.frv.) svo notandinn sjái hvað hann er með.
  const hudPlayer = (!isMyTurn && currentPlayer?.isAI) ? currentPlayer : localPlayer

  return (
    <div className="flex flex-col h-screen" style={{ background: '#080D1A' }}>

      {/* ── Top bar ── */}
      <div
        className="flex items-center gap-4 px-4 py-2 shrink-0 border-b border-slate-800"
        style={{ background: 'rgba(8,13,26,0.95)', backdropFilter: 'blur(8px)' }}
      >
        {/* Logo + date */}
        <div className="shrink-0 flex items-center gap-2">
          <span className="font-black text-orange-400 text-lg tracking-tight">{t.lobby.title}</span>
          <span
            className="text-xs px-2 py-0.5 rounded-full text-slate-400"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            {t.game.week} {gameState.week} · {t.game.year} {gameState.year}
          </span>
        </div>

        {/* Current player turn — CENTER, prominent */}
        <div className="flex-1 flex justify-center">
          {isAIThinking ? (
            <div
              className="flex items-center gap-2.5 px-4 py-1.5 rounded-full animate-think"
              style={{ background: 'rgba(251,146,60,0.12)', border: '1px solid rgba(251,146,60,0.3)' }}
            >
              <span className="text-xl">🤖</span>
              <span className="text-sm font-medium text-orange-300">{t.game.aiThinking}</span>
            </div>
          ) : (
            <div
              className="flex items-center gap-2.5 px-4 py-1.5 rounded-full"
              style={{
                background: `${currentPlayer?.color ?? '#3B82F6'}18`,
                border: `1px solid ${currentPlayer?.color ?? '#3B82F6'}50`,
                boxShadow: isMyTurn ? `0 0 12px ${currentPlayer?.color ?? '#3B82F6'}30` : undefined,
              }}
            >
              <span className="text-xl">{getPlayerAvatar(currentPlayerId)}</span>
              <div>
                <div
                  className="text-sm font-bold leading-tight"
                  style={{ color: currentPlayer?.color ?? '#E2E8F0' }}
                >
                  {isMyTurn ? t.game.myTurn : currentPlayer?.name ?? ''}
                </div>
                {isMyTurn && localPlayer && (
                  <div className="flex gap-0.5 mt-0.5">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <div
                        key={i}
                        className="w-1.5 h-1.5 rounded-full transition-all duration-300"
                        style={{
                          background: i < localPlayer.timeUnitsLeft
                            ? (localPlayer.color ?? '#3B82F6')
                            : '#1E293B',
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Goal progress for all players */}
        <div className="flex items-center gap-3 shrink-0">
          {gameState.playerOrder.map(id => {
            const p = gameState.players[id]
            if (!p) return null
            return (
              <div key={id} className="flex items-center gap-1 text-xs">
                <span className="text-base">{getPlayerAvatar(id)}</span>
                <span style={{ color: p.color }}>
                  🎯 {p.completedGoalIds.length}/{p.goalIds.length}
                </span>
              </div>
            )
          })}

          {/* Standings button */}
          <button
            onClick={() => setShowStandings(true)}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 border border-slate-700 hover:border-slate-500 rounded-full px-2.5 py-1 transition-all cursor-pointer"
            title={t.standings.title}
          >
            <span className="text-sm">🏆</span>
            <span>{t.standings.title}</span>
          </button>

          {/* Rules / help button */}
          <button
            onClick={() => setShowRules(true)}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 border border-slate-700 hover:border-slate-500 rounded-full px-2.5 py-1 transition-all cursor-pointer"
            title={t.rules.title}
          >
            <span className="text-sm">📖</span>
            <span>{t.rules.button}</span>
          </button>

          {/* Quit button */}
          <button
            onClick={() => setShowQuitConfirm(true)}
            className="flex items-center gap-1 text-xs text-red-400/80 hover:text-red-300 border border-red-900/60 hover:border-red-700 rounded-full px-2.5 py-1 transition-all cursor-pointer"
            title={t.game.quit}
          >
            <span className="text-sm">🚪</span>
            <span>{t.game.quit}</span>
          </button>
        </div>
      </div>

      {/* ── Main area ── */}
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
        <div
          className="w-72 shrink-0 flex flex-col overflow-hidden"
          style={{ borderLeft: '1px solid rgba(255,255,255,0.06)' }}
        >
          {/* Player HUD — shows the local player, or the acting AI during its turn */}
          {hudPlayer && (
            <div className="p-3 overflow-y-auto shrink-0" style={{ maxHeight: '58%' }}>
              <PlayerHUD
                player={hudPlayer}
                isCurrentPlayer={hudPlayer.id === currentPlayerId}
                isLocal={hudPlayer.id === localPlayerId}
              />
            </div>
          )}

          {/* Divider */}
          <div style={{ height: 1, background: 'rgba(255,255,255,0.05)' }} />

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

      {/* ── Bottom strip: other players ── */}
      {otherPlayerIds.length > 0 && (
        <div
          className="flex gap-2 px-3 py-2 shrink-0 overflow-x-auto"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(8,13,26,0.7)' }}
        >
          {otherPlayerIds.map(id => {
            const p = gameState.players[id]
            if (!p) return null
            return (
              <PlayerMiniCard
                key={id}
                player={p}
                isCurrentPlayer={currentPlayerId === id}
              />
            )
          })}
        </div>
      )}

      {/* ── Status toast ── */}
      {statusMessage && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 animate-bounce-in">
          <div
            className="px-5 py-2.5 rounded-full text-sm font-medium text-slate-100 shadow-2xl"
            style={{
              background: 'rgba(30,41,59,0.95)',
              border: '1px solid rgba(255,255,255,0.1)',
              backdropFilter: 'blur(12px)',
            }}
          >
            {statusMessage}
          </div>
        </div>
      )}

      {/* ── Dialogs ── */}
      {gameState.phase === 'event_resolution' && (
        <EventDialog gameState={gameState} localPlayerId={localPlayerId} />
      )}

      {showJobPicker && jobPickerLocationId && (
        <JobPickerDialog
          gameState={gameState}
          localPlayerId={localPlayerId}
          locationId={jobPickerLocationId}
        />
      )}

      {showMealPicker && mealPickerLocationId && (
        <MealPickerDialog
          gameState={gameState}
          localPlayerId={localPlayerId}
          locationId={mealPickerLocationId}
        />
      )}

      {/* ── Weekly news overlay ── */}
      {showNews && (
        <NewsDialog
          key={gameState.week}
          week={gameState.week}
          year={gameState.year}
          onClose={() => setShowNews(false)}
        />
      )}

      {/* ── AI turn recap overlay ── */}
      {aiTurnRecap && (
        <AITurnRecapDialog recap={aiTurnRecap} onClose={closeAIRecap} />
      )}

      {/* ── Standings overlay ── */}
      {showStandings && (
        <StandingsDialog
          gameState={gameState}
          localPlayerId={localPlayerId}
          onClose={() => setShowStandings(false)}
        />
      )}

      {/* ── Quit confirmation overlay ── */}
      {showQuitConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60] p-4" onClick={() => setShowQuitConfirm(false)}>
          <div
            className="w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-bounce-in"
            style={{ background: '#0E1629', border: '1px solid rgba(255,255,255,0.1)' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="p-5 text-center space-y-2">
              <div className="text-3xl">🚪</div>
              <div className="text-lg font-bold text-slate-100">{t.game.quitConfirmTitle}</div>
              <div className="text-sm text-slate-400">{t.game.quitConfirmBody}</div>
            </div>
            <div className="flex gap-2 p-4 pt-0">
              <button
                onClick={() => setShowQuitConfirm(false)}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold bg-slate-700 hover:bg-slate-600 text-slate-100 transition-colors cursor-pointer"
              >
                {t.game.quitCancel}
              </button>
              <button
                onClick={() => { setShowQuitConfirm(false); quitGame() }}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold bg-red-600 hover:bg-red-500 text-white transition-colors cursor-pointer"
              >
                {t.game.quitConfirm}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Rules / help overlay ── */}
      {showRules && <RulesDialog onClose={() => setShowRules(false)} />}

      {/* ── Hot-seat handoff overlay ── */}
      {showHandoff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(8,13,26,0.97)' }}>
          <div className="text-center space-y-6 animate-bounce-in">
            {/* Avatar */}
            <div
              className="w-28 h-28 rounded-full flex items-center justify-center text-6xl mx-auto border-4 shadow-2xl"
              style={{
                background: `${localPlayer?.color ?? '#3B82F6'}20`,
                borderColor: localPlayer?.color ?? '#3B82F6',
                boxShadow: `0 0 40px ${localPlayer?.color ?? '#3B82F6'}50`,
              }}
            >
              {getPlayerAvatar(localPlayerId)}
            </div>

            <div>
              <div className="text-slate-500 text-sm mb-1">{t.game.handoffTitle}</div>
              <div className="text-4xl font-black" style={{ color: localPlayer?.color ?? '#E2E8F0' }}>
                {localPlayer?.name ?? ''}
              </div>
            </div>

            <button
              onClick={() => setShowHandoff(false)}
              className="px-10 py-3 font-bold rounded-2xl text-lg transition-all cursor-pointer hover:scale-105"
              style={{
                background: `linear-gradient(135deg, ${localPlayer?.color ?? '#3B82F6'}, ${localPlayer?.color ?? '#3B82F6'}AA)`,
                color: '#fff',
                boxShadow: `0 4px 20px ${localPlayer?.color ?? '#3B82F6'}50`,
              }}
            >
              {t.game.handoffReady}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
