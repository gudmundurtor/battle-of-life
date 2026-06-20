import { useState, useRef, useLayoutEffect } from 'react'
import { BOARD_LOCATIONS } from '@jones/shared'
import type { GameState } from '@jones/shared'
import { BoardLocationCard } from './BoardLocationCard'
import { ActionPopup } from './ActionPopup'
import { BoardCharacter, lastActionVisual } from './BoardCharacter'

// Regular 5-column × 4-row grid. Each tile is a wide (landscape) rectangle
// centered inside its grass cell, leaving a margin of grass on every side.
const BLDG_W = 12
const BLDG_H = 9
// Tile aspect ratio (width : height) — wider than tall.
const TILE_AR_W = 96
const TILE_AR_H = 60

// Column-left positions (%): grid hugs the left edge, leaving the extra space on the
// right for the sea/beach. Tiles keep a grass margin to the roads between them.
const COL_L = [0.5, 17.5, 34.5, 51.5, 68.5]
// Row-top positions (%) — tile sits with grass margin above/below within each row band
const ROW_T = [6, 28, 50, 72]

// Top-left corner of each tile, by location id
const POS: Record<string, { l: number; t: number }> = {
  // Row 1 — education & civic
  online_courses:    { l: COL_L[0], t: ROW_T[0] },
  library:           { l: COL_L[1], t: ROW_T[0] },
  university:        { l: COL_L[2], t: ROW_T[0] },
  school:            { l: COL_L[3], t: ROW_T[0] },
  hospital:          { l: COL_L[4], t: ROW_T[0] },

  // Row 2 — workplaces & employment
  apartment_budget:  { l: COL_L[0], t: ROW_T[1] },
  employment_office: { l: COL_L[1], t: ROW_T[1] },
  tech_company:      { l: COL_L[2], t: ROW_T[1] },
  office_building:   { l: COL_L[3], t: ROW_T[1] },
  gym:               { l: COL_L[4], t: ROW_T[1] },

  // Row 3 — recreation & creative
  apartment_mid:     { l: COL_L[0], t: ROW_T[2] },
  retail_store:      { l: COL_L[1], t: ROW_T[2] },
  park:              { l: COL_L[2], t: ROW_T[2] },
  art_studio:        { l: COL_L[3], t: ROW_T[2] },
  music_studio:      { l: COL_L[4], t: ROW_T[2] },

  // Row 4 — shops & social
  apartment_luxury:  { l: COL_L[0], t: ROW_T[3] },
  market:            { l: COL_L[1], t: ROW_T[3] },
  clothing_store:    { l: COL_L[2], t: ROW_T[3] },
  social_club:       { l: COL_L[3], t: ROW_T[3] },
}

// Vertical streets sit centered in the gap between adjacent tiles.
// e.g. col 0 right edge = 0.5+12 = 12.5; col 1 left = 17.5 → gap center 15
const VERTICAL_STREETS_X = [15, 32, 49, 66]
const ROAD_PX = 44

// Tree positions on grass — placed to avoid roads, buildings, and sea/beach.
const TREES: Array<{ x: number; y: number; size: number }> = [
  // Top strip — above row 0 (lots of clear grass here)
  { x: 3,   y: 1.5, size: 20 },
  { x: 10,  y: 0.8, size: 20 },
  { x: 17,  y: 1.5, size: 23 },
  { x: 24,  y: 0.8, size: 20 },
  { x: 31,  y: 1.5, size: 23 },
  { x: 38,  y: 0.8, size: 20 },
  { x: 45,  y: 1.5, size: 20 },
  { x: 52,  y: 0.8, size: 23 },
  { x: 59,  y: 1.5, size: 23 },
  { x: 66,  y: 0.8, size: 20 },
  { x: 73,  y: 1.5, size: 20 },
  // Bottom grass strip — between row 3 tiles and the beach (stays above the coastline)
  { x: 8,   y: 83,  size: 20 },
  { x: 24,  y: 84,  size: 23 },
  { x: 40,  y: 83,  size: 20 },
  { x: 56,  y: 84,  size: 23 },
  { x: 68,  y: 82,  size: 20 },
  // Empty cell at (col 4, row 3) — a grove, well inland of the right beach
  { x: 77,  y: 74,  size: 23 },
  { x: 83,  y: 73,  size: 32 },
  { x: 79,  y: 80,  size: 25 },
  { x: 85,  y: 78,  size: 23 },
  { x: 76,  y: 81,  size: 20 },
]

// Palm trees line the grass just inland of the right-wing beach.
const PALM_TREES: Array<{ x: number; y: number; size: number }> = [
  { x: 84, y: 9,  size: 26 },
  { x: 86, y: 19, size: 28 },
  { x: 85, y: 29, size: 26 },
  { x: 86, y: 39, size: 28 },
  { x: 84, y: 49, size: 26 },
  { x: 86, y: 59, size: 28 },
  { x: 85, y: 68, size: 26 },
]

function PalmTree({ size = 24 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size * 1.3}
      viewBox="0 0 24 32"
      style={{
        display: 'block',
        filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.45))',
      }}
    >
      {/* Shadow */}
      <ellipse cx="11" cy="30" rx="7" ry="1.5" fill="rgba(0,0,0,0.35)" />
      {/* Curved trunk */}
      <path d="M10 29 Q 8 18 11 9.5" stroke="#A16207" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <path d="M10 29 Q 8 18 11 9.5" stroke="#854D0E" strokeWidth="0.9" fill="none" strokeLinecap="round" opacity="0.5" />
      {/* Coconuts at the crown */}
      <circle cx="10.5" cy="9.5" r="1.3" fill="#7C2D12" />
      <circle cx="12.3" cy="10" r="1.1" fill="#7C2D12" />
      {/* Fronds radiating from the crown */}
      <g fill="none" strokeLinecap="round">
        <path d="M11 9 Q 2 6 0 10"   stroke="#16A34A" strokeWidth="2.2" />
        <path d="M11 9 Q 3 2 2 1"    stroke="#15803D" strokeWidth="2.2" />
        <path d="M11 9 Q 11 1 12 0.5" stroke="#22C55E" strokeWidth="2.2" />
        <path d="M11 9 Q 19 2 20 1"  stroke="#15803D" strokeWidth="2.2" />
        <path d="M11 9 Q 21 6 23 10" stroke="#16A34A" strokeWidth="2.2" />
      </g>
      {/* Highlight */}
      <circle cx="11" cy="8.5" r="1.1" fill="#86EFAC" opacity="0.6" />
    </svg>
  )
}

function Tree({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size * 1.1}
      viewBox="0 0 24 26"
      style={{
        display: 'block',
        filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.45))',
      }}
    >
      {/* Shadow */}
      <ellipse cx="12" cy="24" rx="7" ry="1.5" fill="rgba(0,0,0,0.35)" />
      {/* Trunk */}
      <rect x="10.5" y="17" width="3" height="6" fill="#7C2D12" rx="0.5" />
      {/* Foliage layers — darker behind, lighter on top */}
      <circle cx="6"  cy="14" r="5"   fill="#14532D" />
      <circle cx="18" cy="14" r="5"   fill="#166534" />
      <circle cx="12" cy="11" r="6.5" fill="#15803D" />
      <circle cx="12" cy="8"  r="4.5" fill="#22C55E" />
      {/* Highlight */}
      <circle cx="10" cy="7"  r="1.5" fill="#86EFAC" opacity="0.6" />
    </svg>
  )
}

// Horizontal avenue Y positions depend on actual tile height (which depends on
// the board container's aspect ratio). They're computed at runtime in the component.

interface BoardProps {
  gameState: GameState
  localPlayerId: string
  selectedLocationId: string | null
  onSelectLocation: (id: string) => void
}

interface PopupData {
  locationId: string
  l: number
  t: number
}

export function Board({ gameState, localPlayerId, selectedLocationId, onSelectLocation }: BoardProps) {
  const localPlayer = gameState.players[localPlayerId]
  const [popup, setPopup] = useState<PopupData | null>(null)

  // Measure the board container so we can compute the actual rendered tile height,
  // which determines where horizontal roads must sit to be visually centered.
  const boardRef = useRef<HTMLDivElement>(null)
  const [tileHpct, setTileHpct] = useState(7) // fallback %

  useLayoutEffect(() => {
    const el = boardRef.current
    if (!el) return
    const update = () => {
      const w = el.clientWidth
      const h = el.clientHeight
      if (!w || !h) return
      // Tile CSS: width: BLDG_W%, aspect-ratio: TILE_AR_W/TILE_AR_H → tile_h_px = w * BLDG_W/100 * AR_H/AR_W
      const tileHpx = (w * BLDG_W / 100) * (TILE_AR_H / TILE_AR_W)
      setTileHpct((tileHpx / h) * 100)
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Each tile spans [ROW_T[i], ROW_T[i] + tileHpct] (includes building art + name strip).
  // The visible name strip is part of the row, so the road must sit at the midpoint
  // between the BOTTOM of one tile and the TOP of the next — equivalent to centering
  // between the two row-centers.
  const HORIZONTAL_AVENUES_Y = [0, 1, 2].map(
    i => (ROW_T[i] + ROW_T[i + 1]) / 2 + tileHpct / 2,
  )

  const handleActionClick = (e: React.MouseEvent, locationId: string) => {
    e.stopPropagation()
    if (popup?.locationId === locationId) {
      setPopup(null)
      return
    }
    const pos = POS[locationId]
    if (pos) setPopup({ locationId, l: pos.l, t: pos.t })
  }

  return (
    <div
      ref={boardRef}
      className="relative w-full h-full overflow-hidden"
      style={{
        background:
          'linear-gradient(135deg, #166534 0%, #15803D 40%, #16A34A 100%)',
      }}
      onClick={() => setPopup(null)}
    >
      {/* Subtle grass texture */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px), radial-gradient(circle, rgba(0,0,0,0.08) 1px, transparent 1px)',
          backgroundSize: '14px 14px, 22px 22px',
          backgroundPosition: '0 0, 7px 11px',
        }}
      />

      {/* Sea + sand beach — covers below the town and to the right with a curved coastline */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="seaGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%"   stopColor="#38BDF8" />
            <stop offset="60%"  stopColor="#0EA5E9" />
            <stop offset="100%" stopColor="#1D4ED8" />
          </linearGradient>
          <linearGradient id="sandGrad" x1="0" y1="0" x2="0.4" y2="1">
            <stop offset="0%" stopColor="#FDE68A" />
            <stop offset="100%" stopColor="#FCD34D" />
          </linearGradient>
        </defs>
        {/* Sand/beach belt — solid yellow strip inland of the coastline */}
        <path
          d="
            M 100 0
            L 100 100
            L 0 100
            L 0 88
            C 14 86, 28 90, 44 89
            C 58 88, 72 92, 86 87
            C 90 80, 89 45, 88 0
            Z
          "
          fill="url(#sandGrad)"
          fillOpacity="0.95"
        />
        {/* Sea — overlays the outer portion of the sand, leaving a visible beach band */}
        <path
          d="
            M 100 0
            L 100 100
            L 0 100
            L 0 94
            C 14 92, 28 96, 44 95
            C 58 94, 72 97, 88 93
            C 93 86, 94 48, 93 0
            Z
          "
          fill="url(#seaGrad)"
        />
        {/* White wave lines along the coast */}
        <path
          d="
            M 0 95.5
            C 14 93.5, 28 97.5, 44 96.5
            C 58 95.5, 72 98.5, 88 94
            C 93 88, 94 49, 93 0
          "
          stroke="white"
          strokeWidth="0.3"
          strokeOpacity="0.6"
          fill="none"
        />
        <path
          d="
            M 0 97
            C 14 95, 28 99, 44 98
            C 58 97, 72 99.5, 88 95.5
            C 92 90, 93 49, 92 0
          "
          stroke="white"
          strokeWidth="0.2"
          strokeOpacity="0.4"
          fill="none"
        />
      </svg>

      {/* Trees scattered around the village on grass */}
      {TREES.map((tree, i) => (
        <div
          key={`tree-${i}`}
          className="absolute pointer-events-none"
          style={{
            left: `${tree.x}%`,
            top: `${tree.y}%`,
            transform: 'translate(-50%, -50%)',
            zIndex: 0,
          }}
        >
          <Tree size={tree.size} />
        </div>
      ))}

      {/* Palm trees along the right-wing beach (on the grass, inland of the coast) */}
      {PALM_TREES.map((palm, i) => (
        <div
          key={`palm-${i}`}
          className="absolute pointer-events-none"
          style={{
            left: `${palm.x}%`,
            top: `${palm.y}%`,
            transform: 'translate(-50%, -50%)',
            zIndex: 0,
          }}
        >
          <PalmTree size={palm.size} />
        </div>
      ))}

      {/* Horizontal avenues — end at the last vertical street (no right-arm overhang) */}
      {HORIZONTAL_AVENUES_Y.map(y => (
        <HorizontalRoad
          key={`h-${y}`}
          y={y}
          thickness={ROAD_PX}
          endX={VERTICAL_STREETS_X[VERTICAL_STREETS_X.length - 1]}
        />
      ))}

      {/* Vertical streets — end at the last horizontal avenue (no bottom-arm overhang) */}
      {VERTICAL_STREETS_X.map(x => (
        <VerticalRoad
          key={`v-${x}`}
          x={x}
          thickness={ROAD_PX}
          endY={HORIZONTAL_AVENUES_Y[HORIZONTAL_AVENUES_Y.length - 1]}
        />
      ))}

      {/* Intersection patches — clean asphalt squares masking edge stripes & dashes at crossings */}
      {VERTICAL_STREETS_X.flatMap(x =>
        HORIZONTAL_AVENUES_Y.map(y => (
          <div
            key={`isect-${x}-${y}`}
            className="absolute pointer-events-none"
            style={{
              left: `${x}%`,
              top: `${y}%`,
              width: ROAD_PX,
              height: ROAD_PX,
              marginLeft: -ROAD_PX / 2,
              marginTop: -ROAD_PX / 2,
              background: '#1F2937',
              boxShadow: 'inset 0 0 8px rgba(0,0,0,0.3)',
              zIndex: 2,
            }}
          />
        ))
      )}

      {/* End caps — white closing lines at the truncated road ends, above intersection patches.
          Vertical roads end at last horizontal road → cap on the FAR (bottom) edge of that road.
          Horizontal roads end at last vertical road → cap on the FAR (right) edge of that road. */}
      {VERTICAL_STREETS_X.map(x => (
        <div
          key={`vcap-${x}`}
          className="absolute pointer-events-none"
          style={{
            left: `${x}%`,
            top: `${HORIZONTAL_AVENUES_Y[HORIZONTAL_AVENUES_Y.length - 1]}%`,
            width: ROAD_PX - 6,
            height: 1,
            marginLeft: -(ROAD_PX - 6) / 2,
            marginTop: ROAD_PX / 2 - 3,
            background: '#E5E7EB',
            opacity: 0.45,
            zIndex: 3,
          }}
        />
      ))}
      {HORIZONTAL_AVENUES_Y.map(y => (
        <div
          key={`hcap-${y}`}
          className="absolute pointer-events-none"
          style={{
            left: `${VERTICAL_STREETS_X[VERTICAL_STREETS_X.length - 1]}%`,
            top: `${y}%`,
            width: 1,
            height: ROAD_PX - 6,
            marginLeft: ROAD_PX / 2 - 3,
            marginTop: -(ROAD_PX - 6) / 2,
            background: '#E5E7EB',
            opacity: 0.45,
            zIndex: 3,
          }}
        />
      ))}

      {/* Buildings */}
      {BOARD_LOCATIONS.map(loc => {
        const pos = POS[loc.id]
        if (!pos) return null

        return (
          <div
            key={loc.id}
            style={{
              position: 'absolute',
              left: `${pos.l}%`,
              top: `${pos.t}%`,
              width: `${BLDG_W}%`,
              zIndex: selectedLocationId === loc.id || localPlayer?.locationId === loc.id ? 10 : 2,
            }}
          >
            <BoardLocationCard
              location={loc}
              isSelected={selectedLocationId === loc.id}
              isCurrentLocation={localPlayer?.locationId === loc.id}
              onClick={() => { onSelectLocation(loc.id); setPopup(null) }}
              onActionClick={e => handleActionClick(e, loc.id)}
            />
          </div>
        )
      })}

      {/* Player characters — animated figures standing in front of their tile.
          Every figure (local included) stands on the player's actual location, so
          the avatar walks to a tile only when an action is actually performed there. */}
      {(() => {
        const targets = Object.values(gameState.players).map(p => ({
          player: p,
          targetId: p.locationId,
        }))

        // Group co-located figures so they can be spread out side by side.
        const byTile: Record<string, string[]> = {}
        targets.forEach(({ player, targetId }) => {
          if (!targetId || !POS[targetId]) return
          ;(byTile[targetId] ??= []).push(player.id)
        })

        return targets.map(({ player, targetId }) => {
          if (!targetId) return null
          const pos = POS[targetId]
          if (!pos) return null

          const group = byTile[targetId] ?? [player.id]
          const idx = group.indexOf(player.id)
          const spread = 3.4 // % between co-located figures
          const offsetX = (idx - (group.length - 1) / 2) * spread

          const centerL = pos.l + BLDG_W / 2 + offsetX
          // Feet sit just below the building art, over the name strip area.
          const feetT = pos.t + tileHpct * 0.92
          const isLocal = player.id === localPlayerId
          const { icon, color } = lastActionVisual(player)

          return (
            <BoardCharacter
              key={player.id}
              player={player}
              leftPct={centerL}
              topPct={feetT}
              actionIcon={icon}
              actionColor={color}
              isLocal={isLocal}
              zIndex={isLocal ? 16 : 15}
            />
          )
        })
      })()}

      {/* Action popup */}
      {popup && (
        <ActionPopup
          locationId={popup.locationId}
          gameState={gameState}
          localPlayerId={localPlayerId}
          anchorPct={{ l: popup.l, t: popup.t, w: BLDG_W, h: BLDG_H }}
          onClose={() => setPopup(null)}
        />
      )}
    </div>
  )
}

function HorizontalRoad({ y, thickness, endX }: { y: number; thickness: number; endX?: number }) {
  return (
    <div
      className="absolute pointer-events-none"
      style={{
        top: `${y}%`,
        left: 0,
        right: endX != null ? `${100 - endX}%` : 0,
        height: thickness,
        marginTop: -thickness / 2,
        background: 'linear-gradient(to bottom, #2B3548 0%, #1F2937 20%, #1F2937 80%, #2B3548 100%)',
        boxShadow: '0 0 10px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)',
        zIndex: 1,
      }}
    >
      {/* White edge lines */}
      <div className="absolute left-0 right-0" style={{ top: 3, height: 1, background: '#E5E7EB', opacity: 0.45 }} />
      <div className="absolute left-0 right-0" style={{ bottom: 3, height: 1, background: '#E5E7EB', opacity: 0.45 }} />
      {/* End cap — vertical white line at the truncated right end */}
      {endX != null && (
        <div className="absolute" style={{ right: 3, top: 3, bottom: 3, width: 1, background: '#E5E7EB', opacity: 0.45 }} />
      )}
      {/* Dashed yellow center line */}
      <div
        className="absolute"
        style={{
          top: '50%',
          left: 6,
          right: 6,
          height: 3,
          marginTop: -1.5,
          backgroundImage: 'repeating-linear-gradient(to right, #FBBF24 0 14px, transparent 14px 24px)',
          opacity: 0.85,
        }}
      />
    </div>
  )
}

function VerticalRoad({ x, thickness, endY }: { x: number; thickness: number; endY?: number }) {
  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: `${x}%`,
        top: 0,
        bottom: endY != null ? `${100 - endY}%` : 0,
        width: thickness,
        marginLeft: -thickness / 2,
        background: 'linear-gradient(to right, #2B3548 0%, #1F2937 20%, #1F2937 80%, #2B3548 100%)',
        boxShadow: '0 0 10px rgba(0,0,0,0.5), inset 1px 0 0 rgba(255,255,255,0.04)',
        zIndex: 1,
      }}
    >
      {/* White edge lines */}
      <div className="absolute top-0 bottom-0" style={{ left: 3, width: 1, background: '#E5E7EB', opacity: 0.45 }} />
      <div className="absolute top-0 bottom-0" style={{ right: 3, width: 1, background: '#E5E7EB', opacity: 0.45 }} />
      {/* End cap — horizontal white line at the truncated bottom end */}
      {endY != null && (
        <div className="absolute" style={{ bottom: 3, left: 3, right: 3, height: 1, background: '#E5E7EB', opacity: 0.45 }} />
      )}
      {/* Dashed yellow center line */}
      <div
        className="absolute"
        style={{
          left: '50%',
          top: 6,
          bottom: 6,
          width: 3,
          marginLeft: -1.5,
          backgroundImage: 'repeating-linear-gradient(to bottom, #FBBF24 0 14px, transparent 14px 24px)',
          opacity: 0.85,
        }}
      />
    </div>
  )
}
