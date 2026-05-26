import { useGameStore } from './store/gameStore'
import { LobbyView } from './views/LobbyView'
import { GoalSelectionView } from './views/GoalSelectionView'
import { GameView } from './views/GameView'
import { GameOverView } from './views/GameOverView'

export default function App() {
  const { gameState } = useGameStore()

  if (!gameState) return <LobbyView />

  switch (gameState.phase) {
    case 'lobby':
    case 'goal_selection':
      return <GoalSelectionView />
    case 'playing':
    case 'event_resolution':
      return <GameView />
    case 'finished':
      return <GameOverView gameState={gameState} />
    default:
      return <LobbyView />
  }
}
