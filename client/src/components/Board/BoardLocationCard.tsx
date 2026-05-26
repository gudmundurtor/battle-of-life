import type { BoardLocation, PlayerState } from '@jones/shared'
import type { LocationType } from '@jones/shared'

const TYPE_COLORS: Record<LocationType, { border: string; bg: string; text: string }> = {
  employment:  { border: '#7C3AED', bg: 'rgba(124,58,237,0.1)',  text: '#A78BFA' },
  workplace:   { border: '#2563EB', bg: 'rgba(37,99,235,0.1)',   text: '#60A5FA' },
  education:   { border: '#D97706', bg: 'rgba(217,119,6,0.1)',   text: '#FBBF24' },
  housing:     { border: '#059669', bg: 'rgba(5,150,105,0.1)',   text: '#34D399' },
  shop:        { border: '#EA580C', bg: 'rgba(234,88,12,0.1)',   text: '#FB923C' },
  social:      { border: '#DB2777', bg: 'rgba(219,39,119,0.1)',  text: '#F472B6' },
  gym:         { border: '#DC2626', bg: 'rgba(220,38,38,0.1)',   text: '#F87171' },
  park:        { border: '#16A34A', bg: 'rgba(22,163,74,0.1)',   text: '#4ADE80' },
  event_square:{ border: '#6B7280', bg: 'rgba(107,114,128,0.1)', text: '#9CA3AF' },
}

interface BoardLocationCardProps {
  location: BoardLocation
  players: PlayerState[]
  isSelected: boolean
  isCurrentLocation: boolean
  onClick: () => void
}

export function BoardLocationCard({
  location, players, isSelected, isCurrentLocation, onClick,
}: BoardLocationCardProps) {
  const colors = TYPE_COLORS[location.type]

  return (
    <button
      onClick={onClick}
      className="relative w-full h-full rounded-lg border transition-all duration-200 cursor-pointer text-left overflow-hidden"
      style={{
        borderColor: isSelected ? '#60A5FA' : colors.border,
        background: isSelected ? 'rgba(96,165,250,0.15)' : colors.bg,
        boxShadow: isCurrentLocation ? `0 0 12px ${colors.border}88` : undefined,
      }}
    >
      {/* Icon + name */}
      <div className="flex flex-col items-center justify-center h-full p-1 gap-0.5">
        <span className="text-lg leading-none">{location.icon}</span>
        <span
          className="text-center leading-tight font-medium"
          style={{ color: colors.text, fontSize: '0.6rem' }}
        >
          {location.name}
        </span>
      </div>

      {/* Player tokens */}
      {players.length > 0 && (
        <div className="absolute bottom-0.5 left-0 right-0 flex justify-center gap-0.5">
          {players.slice(0, 4).map(p => (
            <div
              key={p.id}
              className="w-2.5 h-2.5 rounded-full border border-slate-900 animate-glow"
              style={{ background: p.color, color: p.color }}
              title={p.name}
            />
          ))}
        </div>
      )}

      {/* Current player ring */}
      {isCurrentLocation && (
        <div
          className="absolute inset-0 rounded-lg border-2 pointer-events-none"
          style={{ borderColor: '#60A5FA' }}
        />
      )}
    </button>
  )
}
