import type { BoardLocation } from '@jones/shared'
import { useT } from '../../i18n'
import { BuildingArt } from './BuildingArt'

// Uniform frame color for every tile
const FRAME = { border: '#475569', glow: '#64748B' }

interface BoardLocationCardProps {
  location: BoardLocation
  isSelected: boolean
  isCurrentLocation: boolean
  onClick: () => void
  onActionClick: (e: React.MouseEvent) => void
}

export function BoardLocationCard({
  location, isSelected, isCurrentLocation, onClick, onActionClick,
}: BoardLocationCardProps) {
  const t = useT()
  const colors = FRAME
  const name = t.locations[location.id] ?? location.name

  const borderColor = isSelected ? '#60A5FA' : isCurrentLocation ? colors.glow : colors.border
  const glowShadow = isCurrentLocation
    ? `0 0 18px ${colors.glow}80, 0 0 5px ${colors.glow}40`
    : isSelected
    ? '0 0 12px rgba(96,165,250,0.6)'
    : '0 2px 6px rgba(0,0,0,0.5)'

  return (
    <div
      className="relative rounded-lg border-2 overflow-visible cursor-pointer transition-all duration-200 select-none"
      style={{
        width: '100%',
        aspectRatio: '96 / 60',
        borderColor,
        boxShadow: glowShadow,
        background: 'rgba(8,13,26,0.6)',
        transform: isSelected ? 'scale(1.08)' : isCurrentLocation ? 'scale(1.04)' : 'scale(1)',
        zIndex: isSelected || isCurrentLocation ? 10 : 1,
      }}
      onClick={onClick}
    >
      {/* Building illustration — 80% top-left of tile */}
      <div
        className="absolute overflow-hidden rounded-tl-md pointer-events-none"
        style={{ top: 0, left: 0, width: '80%', height: '80%' }}
      >
        <BuildingArt locationId={location.id} />
      </div>

      {/* Type icon badge — overlaid on the bottom-left corner of the frame (~30% larger than action icon) */}
      <div
        className="absolute rounded flex items-center justify-center"
        style={{
          bottom: -7, left: -11,
          width: 34, height: 34,
          background: 'rgba(8,13,26,0.85)',
          border: `1px solid ${colors.border}90`,
          fontSize: 21,
          lineHeight: 1,
          boxShadow: '0 1px 2px rgba(0,0,0,0.5)',
          zIndex: 5,
        }}
      >
        {location.icon}
      </div>

      {/* Action button ⚡ — overlaid on the top-right corner of the frame */}
      <button
        onClick={onActionClick}
        className="absolute rounded flex items-center justify-center transition-all duration-150 cursor-pointer hover:scale-110"
        style={{
          top: -7, right: -7,
          width: 26, height: 26,
          zIndex: 5,
          background: `${colors.glow}E6`,
          border: `1px solid ${colors.glow}`,
          fontSize: 16,
          color: 'white',
          fontWeight: 'bold',
          boxShadow: `0 0 6px ${colors.glow}90`,
        }}
        title={name}
      >
        ⚡
      </button>

      {/* Name strip — bottom of card */}
      <div
        className="absolute left-0 right-0 bottom-0 px-0.5 text-center font-semibold leading-tight rounded-b-md"
        style={{
          fontSize: '0.85rem',
          padding: '3px 3px',
          color: isSelected ? '#60A5FA' : isCurrentLocation ? colors.glow : '#CBD5E1',
          background: 'rgba(8,13,26,0.94)',
          borderTop: `1px solid ${colors.border}60`,
          textShadow: '0 1px 2px rgba(0,0,0,0.7)',
        }}
      >
        {name}
      </div>

      {/* Current location pulse ring */}
      {isCurrentLocation && (
        <div
          className="absolute inset-0 rounded-md pointer-events-none animate-loc-pulse"
          style={{ border: `2px solid ${colors.glow}`, opacity: 0.5 }}
        />
      )}
    </div>
  )
}
