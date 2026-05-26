import { useState } from 'react'
import { DEFAULT_CONFIG } from '@jones/shared'
import type { GameConfig } from '@jones/shared'
import { useGameStore } from '../store/gameStore'
import { Button } from '../components/UI/Button'

export function LobbyView() {
  const { initGame, startPlaying } = useGameStore()
  const [playerName, setPlayerName] = useState('Leikmaður 1')
  const [config, setConfig] = useState<GameConfig>({ ...DEFAULT_CONFIG })

  const handleStart = () => {
    initGame(config, [playerName])
    startPlaying()
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: '#080D1A' }}>
      <div className="max-w-md w-full space-y-6">
        {/* Title */}
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-1" style={{ color: '#FF6B35' }}>
            Jones
          </h1>
          <p className="text-slate-400 text-sm">Lífið í hraðakerfinu</p>
        </div>

        {/* Player setup */}
        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 space-y-4">
          <h2 className="text-slate-200 font-semibold">Leikmaður</h2>

          <div>
            <label className="text-xs text-slate-500 block mb-1">Nafn þitt</label>
            <input
              value={playerName}
              onChange={e => setPlayerName(e.target.value)}
              className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-slate-200 text-sm focus:outline-none focus:border-blue-500"
              placeholder="Nafn..."
              maxLength={20}
            />
          </div>
        </div>

        {/* Game config */}
        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 space-y-4">
          <h2 className="text-slate-200 font-semibold">Stillingar</h2>

          <div>
            <label className="text-xs text-slate-500 block mb-2">Lengd leiks</label>
            <div className="grid grid-cols-3 gap-2">
              {(['short', 'medium', 'long'] as const).map(len => (
                <button
                  key={len}
                  onClick={() => setConfig(c => ({ ...c, gameLength: len }))}
                  className={`py-2 rounded-lg text-sm border transition-all cursor-pointer ${
                    config.gameLength === len
                      ? 'border-blue-500 bg-blue-900/30 text-blue-300'
                      : 'border-slate-700 text-slate-400 hover:border-slate-500'
                  }`}
                >
                  {len === 'short' ? '5 ár' : len === 'medium' ? '10 ár' : '20 ár'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-500 block mb-2">Jones erfiðleikastig</label>
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
                  {diff === 'easy' ? 'Auðveld' : diff === 'medium' ? 'Meðal' : 'Erfið'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-500 block mb-2">Fjöldi markmiða</label>
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
                  {n} markmið
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Jones info */}
        <div className="bg-orange-950/30 border border-orange-800/40 rounded-xl p-3 flex gap-3 items-start">
          <span className="text-2xl">🤖</span>
          <div>
            <div className="text-sm font-medium text-orange-300">Jones keppist við þig</div>
            <div className="text-xs text-orange-700 mt-0.5">AI keppinautur sem þú þekkir úr upprunalega leiknum</div>
          </div>
        </div>

        <Button
          fullWidth
          size="lg"
          onClick={handleStart}
          disabled={!playerName.trim()}
        >
          Hefja leik →
        </Button>
      </div>
    </div>
  )
}
