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

export function LobbyView() {
  const { initGame } = useGameStore()
  const { language, setLanguage } = useLanguageStore()
  const t = useT()
  const [playerNames, setPlayerNames] = useState<string[]>(() => [getTranslations(language).lobby.playerName(1)])
  const [config, setConfig] = useState<GameConfig>({ ...DEFAULT_CONFIG })

  // When the language changes, re-translate any names the user hasn't customised.
  useEffect(() => {
    setPlayerNames(prev =>
      prev.map((name, i) => (isDefaultName(name, i) ? t.lobby.playerName(i + 1) : name)),
    )
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

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: '#080D1A' }}>
      <div className="max-w-md w-full space-y-6">
        {/* Title + language picker */}
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-1" style={{ color: '#FF6B35' }}>
            Jones
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

        {/* Game config */}
        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 space-y-4">
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

          <div>
            <label className="text-xs text-slate-500 block mb-2">{t.lobby.jonesDifficulty}</label>
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
        </div>

        {/* Jones AI info (single player only) */}
        {playerNames.length === 1 && (
          <div className="bg-orange-950/30 border border-orange-800/40 rounded-xl p-3 flex gap-3 items-start">
            <span className="text-2xl">🤖</span>
            <div>
              <div className="text-sm font-medium text-orange-300">{t.lobby.jonesCompetes}</div>
              <div className="text-xs text-orange-700 mt-0.5">{t.lobby.jonesCompetesDesc}</div>
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
      </div>
    </div>
  )
}
