import { useState, useEffect } from 'react'
import { DEFAULT_CONFIG } from '@jones/shared'
import type { GameConfig } from '@jones/shared'
import { useGameStore } from '../store/gameStore'
import { useLanguageStore } from '../store/languageStore'
import { useT, getTranslations } from '../i18n'
import type { Language } from '../i18n'

const ALL_LANGS: Language[] = ['is', 'en', 'da']

// A name is "still a default" if it matches the auto-generated player name in any language.
function isDefaultName(name: string, index: number): boolean {
  return ALL_LANGS.some(l => getTranslations(l).lobby.playerName(index + 1) === name)
}
import { PLAYER_AVATARS } from '../utils/player'
import { Button } from '../components/UI/Button'

const PLAYER_COLORS = ['#3B82F6', '#EF4444', '#22C55E', '#F59E0B']

const LANG_FLAGS: Record<Language, string> = { is: '🇮🇸', en: '🇬🇧', da: '🇩🇰' }
const LANG_LABELS: Record<Language, string> = { is: 'Íslenska', en: 'English', da: 'Dansk' }

// Online play needs a reachable realtime server. In local dev it falls back to
// localhost:3001; in production it only shows up once VITE_SERVER_URL is set, so
// the live site never offers a button that can't connect.
const ONLINE_ENABLED = import.meta.env.DEV || !!import.meta.env.VITE_SERVER_URL

export function LobbyView() {
  const { online } = useGameStore()

  // Once we're in an online room (created or joined), the store flips `online`
  // and the waiting room takes over.
  if (online) return <WaitingRoom />
  return <LobbySetup />
}

function LobbySetup() {
  const { initGame, createOnlineGame, joinOnlineGame, onlineError } = useGameStore()
  const { language, setLanguage } = useLanguageStore()
  const t = useT()

  const [mode, setMode] = useState<'local' | 'online'>('local')
  const [playerNames, setPlayerNames] = useState<string[]>(() => [getTranslations(language).lobby.playerName(1)])
  const [onlineName, setOnlineName] = useState<string>(() => getTranslations(language).lobby.playerName(1))
  const [roomCodeInput, setRoomCodeInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [config, setConfig] = useState<GameConfig>({ ...DEFAULT_CONFIG })

  // A ?room=CODE link drops the player straight into online join mode.
  useEffect(() => {
    if (!ONLINE_ENABLED) return
    const code = new URLSearchParams(window.location.search).get('room')
    if (code) {
      setMode('online')
      setRoomCodeInput(code.toUpperCase().slice(0, 4))
    }
  }, [])

  // When the language changes, re-translate any names the user hasn't customised.
  useEffect(() => {
    setPlayerNames(prev =>
      prev.map((name, i) => (isDefaultName(name, i) ? t.lobby.playerName(i + 1) : name)),
    )
    setOnlineName(prev => (isDefaultName(prev, 0) ? t.lobby.playerName(1) : prev))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language])

  const addPlayer = () => {
    if (playerNames.length < 4) {
      setPlayerNames(p => [...p, t.lobby.playerName(p.length + 1)])
    }
  }

  const removePlayer = (i: number) => {
    setPlayerNames(p => p.filter((_, idx) => idx !== i))
  }

  const updateName = (i: number, name: string) => {
    setPlayerNames(p => p.map((n, idx) => idx === i ? name : n))
  }

  const allNamed = playerNames.every(n => n.trim().length > 0)

  const handleCreate = async () => {
    setBusy(true)
    await createOnlineGame(onlineName.trim() || t.lobby.playerName(1), config)
    setBusy(false)
  }

  const handleJoin = async () => {
    setBusy(true)
    await joinOnlineGame(roomCodeInput.trim().toUpperCase(), onlineName.trim() || t.lobby.playerName(1))
    setBusy(false)
  }

  const errText =
    onlineError === 'not_found' ? t.online.errNotFound
    : onlineError === 'full' ? t.online.errFull
    : onlineError === 'already_started' ? t.online.errAlreadyStarted
    : onlineError ? t.online.errGeneric
    : null

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: '#080D1A' }}>
      <div className="max-w-md w-full space-y-6">
        {/* Title + language picker */}
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-1" style={{ color: '#FF6B35' }}>
            {t.lobby.title}
          </h1>
          <p className="text-slate-400 text-sm mb-4">{t.lobby.tagline}</p>

          {/* Language selector */}
          <div className="flex justify-center gap-2">
            {(['is', 'en', 'da'] as Language[]).map(lang => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border transition-all cursor-pointer ${
                  language === lang
                    ? 'border-blue-500 bg-blue-900/30 text-blue-300'
                    : 'border-slate-700 text-slate-500 hover:border-slate-500 hover:text-slate-300'
                }`}
              >
                <span>{LANG_FLAGS[lang]}</span>
                <span>{LANG_LABELS[lang]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Local / Online mode toggle */}
        {ONLINE_ENABLED && (
        <div className="grid grid-cols-2 gap-2">
          {(['local', 'online'] as const).map(m => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`py-2.5 rounded-xl text-sm font-medium border transition-all cursor-pointer ${
                mode === m
                  ? 'border-blue-500 bg-blue-900/30 text-blue-300'
                  : 'border-slate-700 text-slate-400 hover:border-slate-500'
              }`}
            >
              {m === 'local' ? t.online.modeLocal : t.online.modeOnline}
            </button>
          ))}
        </div>
        )}

        {mode === 'local' ? (
          <>
            {/* Players */}
            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-slate-200 font-semibold">{t.lobby.players}</h2>
                {playerNames.length < 4 && (
                  <button
                    onClick={addPlayer}
                    className="text-xs text-blue-400 hover:text-blue-300 border border-blue-800 hover:border-blue-600 px-2 py-1 rounded-lg transition-all cursor-pointer"
                  >
                    {t.lobby.addPlayer}
                  </button>
                )}
              </div>

              {playerNames.map((name, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-xl shrink-0 border-2"
                    style={{ background: `${PLAYER_COLORS[i]}25`, borderColor: PLAYER_COLORS[i] }}
                  >
                    {PLAYER_AVATARS[i % PLAYER_AVATARS.length]}
                  </div>
                  <input
                    value={name}
                    onChange={e => updateName(i, e.target.value)}
                    className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-slate-200 text-sm focus:outline-none focus:border-blue-500"
                    maxLength={20}
                  />
                  {playerNames.length > 1 && (
                    <button
                      onClick={() => removePlayer(i)}
                      className="text-slate-600 hover:text-red-400 w-8 h-8 flex items-center justify-center text-xl transition-colors cursor-pointer"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>

            <ConfigPanel config={config} setConfig={setConfig} showDifficulty={playerNames.length === 1} t={t} />

            {/* Rival AI info (single player only) */}
            {playerNames.length === 1 && (
              <div className="bg-orange-950/30 border border-orange-800/40 rounded-xl p-3 flex gap-3 items-start">
                <span className="text-2xl">🤖</span>
                <div>
                  <div className="text-sm font-medium text-orange-300">{t.lobby.rivalCompetes}</div>
                  <div className="text-xs text-orange-700 mt-0.5">{t.lobby.rivalCompetesDesc}</div>
                </div>
              </div>
            )}

            <Button
              fullWidth
              size="lg"
              onClick={() => initGame(config, playerNames)}
              disabled={!allNamed}
            >
              {t.lobby.startGame}
            </Button>
          </>
        ) : (
          <>
            {/* Your name */}
            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 space-y-2">
              <label className="text-xs text-slate-500 block">{t.online.yourName}</label>
              <input
                value={onlineName}
                onChange={e => setOnlineName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-slate-200 text-sm focus:outline-none focus:border-blue-500"
                maxLength={20}
              />
            </div>

            {errText && (
              <div className="text-center text-sm text-red-400 bg-red-950/30 border border-red-900/50 rounded-lg py-2">
                {errText}
              </div>
            )}

            {/* Create */}
            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 space-y-3">
              <div>
                <div className="text-slate-200 font-semibold">{t.online.createGame}</div>
                <div className="text-xs text-slate-500">{t.online.createDesc}</div>
              </div>
              <ConfigPanel config={config} setConfig={setConfig} showDifficulty={false} t={t} bare />
              <Button fullWidth onClick={handleCreate} disabled={busy || !onlineName.trim()}>
                {busy ? t.online.connecting : t.online.create}
              </Button>
            </div>

            <div className="flex items-center gap-3 text-slate-600 text-xs">
              <div className="h-px bg-slate-800 flex-1" />
              {t.online.or}
              <div className="h-px bg-slate-800 flex-1" />
            </div>

            {/* Join */}
            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 space-y-3">
              <div>
                <div className="text-slate-200 font-semibold">{t.online.joinGame}</div>
                <div className="text-xs text-slate-500">{t.online.joinDesc}</div>
              </div>
              <input
                value={roomCodeInput}
                onChange={e => setRoomCodeInput(e.target.value.toUpperCase().slice(0, 4))}
                placeholder={t.online.roomCodePlaceholder}
                className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-slate-200 text-center text-2xl tracking-[0.4em] font-mono focus:outline-none focus:border-blue-500"
                maxLength={4}
              />
              <Button
                fullWidth
                variant="secondary"
                onClick={handleJoin}
                disabled={busy || roomCodeInput.trim().length < 4 || !onlineName.trim()}
              >
                {busy ? t.online.connecting : t.online.join}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function ConfigPanel({
  config, setConfig, showDifficulty, t, bare,
}: {
  config: GameConfig
  setConfig: React.Dispatch<React.SetStateAction<GameConfig>>
  showDifficulty: boolean
  t: ReturnType<typeof useT>
  bare?: boolean
}) {
  const inner = (
    <>
      <div>
        <label className="text-xs text-slate-500 block mb-2">{t.lobby.gameLength}</label>
        <div className="grid grid-cols-2 gap-2">
          {(['short', 'long'] as const).map(len => (
            <button
              key={len}
              onClick={() => setConfig(c => ({ ...c, gameLength: len }))}
              className={`py-2 rounded-lg text-sm border transition-all cursor-pointer ${
                config.gameLength === len
                  ? 'border-blue-500 bg-blue-900/30 text-blue-300'
                  : 'border-slate-700 text-slate-400 hover:border-slate-500'
              }`}
            >
              {t.lobby[len]}
            </button>
          ))}
        </div>
      </div>

      {showDifficulty && (
        <div>
          <label className="text-xs text-slate-500 block mb-2">{t.lobby.rivalDifficulty}</label>
          <div className="grid grid-cols-3 gap-2">
            {(['easy', 'medium', 'hard'] as const).map(diff => (
              <button
                key={diff}
                onClick={() => setConfig(c => ({ ...c, aiDifficulty: diff }))}
                className={`py-2 rounded-lg text-sm border transition-all cursor-pointer ${
                  config.aiDifficulty === diff
                    ? 'border-orange-500 bg-orange-900/30 text-orange-300'
                    : 'border-slate-700 text-slate-400 hover:border-slate-500'
                }`}
              >
                {diff === 'easy' ? t.lobby.easy : diff === 'medium' ? t.lobby.mediumDiff : t.lobby.hard}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <label className="text-xs text-slate-500 block mb-2">{t.lobby.goalCountLabel}</label>
        <div className="grid grid-cols-3 gap-2">
          {[2, 3, 4].map(n => (
            <button
              key={n}
              onClick={() => setConfig(c => ({ ...c, goalCount: n }))}
              className={`py-2 rounded-lg text-sm border transition-all cursor-pointer ${
                config.goalCount === n
                  ? 'border-purple-500 bg-purple-900/30 text-purple-300'
                  : 'border-slate-700 text-slate-400 hover:border-slate-500'
              }`}
            >
              {t.lobby.goalsN(n)}
            </button>
          ))}
        </div>
      </div>
    </>
  )

  if (bare) return <div className="space-y-4">{inner}</div>
  return <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 space-y-4">{inner}</div>
}

function WaitingRoom() {
  const { roomCode, myPlayerId, hostPlayerId, roomPlayers, canStart, startOnlineGame, leaveOnline } = useGameStore()
  const t = useT()
  const [copied, setCopied] = useState(false)

  const isHost = myPlayerId !== null && myPlayerId === hostPlayerId
  const inviteLink = `${window.location.origin}${window.location.pathname}?room=${roomCode ?? ''}`

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard may be blocked; the link is still visible to copy manually.
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: '#080D1A' }}>
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-1" style={{ color: '#FF6B35' }}>
            {t.online.waitingRoomTitle}
          </h1>
        </div>

        {/* Room code */}
        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 text-center space-y-1">
          <div className="text-xs text-slate-500">{t.online.roomCodeLabel}</div>
          <div className="text-4xl font-mono font-bold tracking-[0.4em] text-slate-100 pl-[0.4em]">
            {roomCode}
          </div>
        </div>

        {/* Invite link */}
        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 space-y-2">
          <div className="text-xs text-slate-500">{t.online.inviteLink}</div>
          <div className="flex gap-2">
            <input
              readOnly
              value={inviteLink}
              onFocus={e => e.target.select()}
              className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-slate-300 text-xs focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={copyLink}
              className="px-3 py-2 rounded-lg text-sm border border-blue-700 text-blue-300 hover:border-blue-500 transition-all cursor-pointer whitespace-nowrap"
            >
              {copied ? t.online.copied : t.online.copy}
            </button>
          </div>
        </div>

        {/* Players */}
        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 space-y-3">
          <h2 className="text-slate-200 font-semibold">{t.lobby.players}</h2>
          {roomPlayers.map((p, i) => (
            <div key={p.playerId} className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-xl shrink-0 border-2"
                style={{ background: `${PLAYER_COLORS[i % PLAYER_COLORS.length]}25`, borderColor: PLAYER_COLORS[i % PLAYER_COLORS.length] }}
              >
                {PLAYER_AVATARS[i % PLAYER_AVATARS.length]}
              </div>
              <span className="text-slate-200 text-sm flex-1">
                {p.name}
                {p.playerId === myPlayerId && <span className="text-slate-500"> ({t.online.you})</span>}
              </span>
              {p.playerId === hostPlayerId && (
                <span className="text-xs text-orange-400 border border-orange-800 rounded px-1.5 py-0.5">
                  {t.online.host}
                </span>
              )}
              <span className={`w-2 h-2 rounded-full ${p.connected ? 'bg-green-500' : 'bg-slate-600'}`} />
            </div>
          ))}
        </div>

        {isHost ? (
          <Button fullWidth size="lg" onClick={startOnlineGame} disabled={!canStart}>
            {canStart ? t.online.start : t.online.needMorePlayers}
          </Button>
        ) : (
          <div className="text-center text-sm text-slate-400 py-2">{t.online.waitingForHost}</div>
        )}

        <button
          onClick={leaveOnline}
          className="w-full text-slate-500 hover:text-red-400 text-sm transition-colors cursor-pointer"
        >
          {t.online.leave}
        </button>
      </div>
    </div>
  )
}
