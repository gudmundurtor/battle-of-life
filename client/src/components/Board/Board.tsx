import { useState, useRef, useLayoutEffect, useEffect } from 'react'
import { BOARD_LOCATIONS } from '@jones/shared'
import type { GameState } from '@jones/shared'
import { BoardLocationCard } from './BoardLocationCard'
import { ActionPopup } from './ActionPopup'
import { BoardCharacter, lastActionVisual } from './BoardCharacter'
import { playNav, playWoof } from '../../utils/sound'

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

// Big boulders scattered along the sandy beach (2 on the bottom strip, 3 on the right wing).
const ROCKS: Array<{ x: number; y: number; size: number }> = [
  { x: 26, y: 91, size: 40 },
  { x: 60, y: 92, size: 36 },
  { x: 90, y: 24, size: 34 },
  { x: 91.5, y: 45, size: 34 },
  { x: 91, y: 66, size: 38 },
]

// A large rock sitting out in the sea off the right wing.
const SEA_ROCK = { x: 96.5, y: 52, size: 64 }

// Goats grazing on the open grass around the town's outskirts — the southern
// meadow strip (kept above the beach) and the right-wing grove.
const GOATS: Array<{ x: number; y: number; size: number; flip?: boolean }> = [
  { x: 15, y: 85, size: 22, flip: true },
  { x: 32, y: 86, size: 22 },
  { x: 44, y: 85, size: 24 },
  { x: 60, y: 85, size: 22, flip: true },
  { x: 72, y: 80, size: 22 },
  { x: 83, y: 80, size: 21, flip: true },
  { x: 77, y: 67, size: 22 },
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

function Rock({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size * 0.75}
      viewBox="0 0 32 24"
      style={{
        display: 'block',
        filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.4))',
      }}
    >
      {/* Shadow on the sand */}
      <ellipse cx="16" cy="22" rx="13" ry="2" fill="rgba(0,0,0,0.22)" />
      {/* Main boulder */}
      <path d="M3 20 Q 2 11 9 8 Q 14 4 21 8 Q 29 11 28 20 Z" fill="#6B7280" />
      {/* Lit top facet */}
      <path d="M9 8 Q 14 4 21 8 Q 18 11 14 11 Q 11 11 9 8 Z" fill="#9CA3AF" />
      {/* Shaded right facet */}
      <path d="M21 8 Q 29 11 28 20 L 20 20 Q 19 13 21 8 Z" fill="#4B5563" />
      {/* Companion rock */}
      <path d="M22 20 Q 22 15 27 15 Q 31 16 30 20 Z" fill="#6B7280" />
      <path d="M27 15 Q 31 16 30 20 L 26 20 Q 26 17 27 15 Z" fill="#4B5563" />
    </svg>
  )
}

function Goat({ size = 22, flip = false }: { size?: number; flip?: boolean }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 28 28"
      style={{
        display: 'block',
        transform: flip ? 'scaleX(-1)' : undefined,
        filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.4))',
      }}
    >
      {/* Shadow */}
      <ellipse cx="14" cy="25" rx="9" ry="1.6" fill="rgba(0,0,0,0.28)" />
      {/* Legs */}
      <rect x="7"    y="16" width="1.8" height="8" rx="0.6" fill="#9CA3AF" />
      <rect x="10.5" y="16" width="1.8" height="8" rx="0.6" fill="#9CA3AF" />
      <rect x="16"   y="16" width="1.8" height="8" rx="0.6" fill="#9CA3AF" />
      <rect x="19.5" y="16" width="1.8" height="8" rx="0.6" fill="#9CA3AF" />
      {/* Body */}
      <ellipse cx="14" cy="13" rx="9" ry="5.5" fill="#E5E7EB" />
      {/* Tail */}
      <path d="M22.5 10 q 3 -1 1.5 2.5" stroke="#E5E7EB" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      {/* Neck */}
      <path d="M6 12 Q 3 11 4 7 L 7 8 Q 7 11 9 12 Z" fill="#F3F4F6" />
      {/* Head */}
      <ellipse cx="3.8" cy="7.5" rx="3" ry="2.3" fill="#F3F4F6" />
      {/* Snout */}
      <ellipse cx="1.4" cy="8.2" rx="1.2" ry="1" fill="#E5E7EB" />
      {/* Ear */}
      <path d="M5.5 7 q 2.2 -0.8 2.2 1.2 q -1.2 0.8 -2.2 -0.2 Z" fill="#D1D5DB" />
      {/* Horns — dark, thick, swept up and back so they read clearly */}
      <path d="M3 5.2 q -1.4 -3.4 1.6 -4.6" stroke="#5B4636" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M4.7 5.2 q -1 -3.6 2.1 -4.2" stroke="#5B4636" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* Eye */}
      <circle cx="3" cy="7.3" r="0.55" fill="#374151" />
      {/* Beard */}
      <path d="M2 9.4 l 0 2.2" stroke="#D1D5DB" strokeWidth="1" strokeLinecap="round" />
    </svg>
  )
}

// Horizontal avenue Y positions depend on actual tile height (which depends on
// the board container's aspect ratio). They're computed at runtime in the component.

// Grid layout of location ids, mirroring POS, for arrow-key navigation.
// `null` marks the empty cell (col 4, row 3).
const NAV_GRID: (string | null)[][] = [
  ['online_courses', 'library', 'university', 'school', 'hospital'],
  ['apartment_budget', 'employment_office', 'tech_company', 'office_building', 'gym'],
  ['apartment_mid', 'retail_store', 'park', 'art_studio', 'music_studio'],
  ['apartment_luxury', 'market', 'clothing_store', 'social_club', null],
]

// Move selection one step in the given arrow direction, skipping empty cells.
// Returns the next location id, or null if there is none in that direction.
function moveSelection(current: string, key: string): string | null {
  let r = -1
  let c = -1
  for (let i = 0; i < NAV_GRID.length; i++) {
    const j = NAV_GRID[i].indexOf(current)
    if (j !== -1) { r = i; c = j; break }
  }
  if (r === -1) return null
  const dr = key === 'ArrowUp' ? -1 : key === 'ArrowDown' ? 1 : 0
  const dc = key === 'ArrowLeft' ? -1 : key === 'ArrowRight' ? 1 : 0
  let nr = r + dr
  let nc = c + dc
  while (nr >= 0 && nr < NAV_GRID.length && nc >= 0 && nc < NAV_GRID[nr].length) {
    const id = NAV_GRID[nr][nc]
    if (id) return id
    nr += dr
    nc += dc
  }
  return null
}

interface BoardProps {
  gameState: GameState
  localPlayerId: string
  selectedLocationId: string | null
  onSelectLocation: (id: string) => void
  keyboardEnabled?: boolean
}

interface PopupData {
  locationId: string
  l: number
  t: number
}

export function Board({ gameState, localPlayerId, selectedLocationId, onSelectLocation, keyboardEnabled = true }: BoardProps) {
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
    if (pos) {
      setPopup({ locationId, l: pos.l, t: pos.t })
      playWoof()
    }
  }

  // Keyboard navigation: arrows move the selected tile, Enter opens its action
  // popup. While the popup is open it handles its own arrow/Enter navigation,
  // so we bail out here.
  useEffect(() => {
    if (!keyboardEnabled) return
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      if (popup) return

      const current = selectedLocationId ?? localPlayer?.locationId
      if (!current) return

      if (e.key.startsWith('Arrow')) {
        e.preventDefault()
        const next = moveSelection(current, e.key)
        if (next && next !== current) {
          onSelectLocation(next)
          playNav()
        }
      } else if (e.key === 'Enter') {
        e.preventDefault()
        const pos = POS[current]
        if (pos) {
          setPopup({ locationId: current, l: pos.l, t: pos.t })
          playWoof()
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [popup, selectedLocationId, localPlayer?.locationId, onSelectLocation, keyboardEnabled])

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

      {/* Big boulders on the sandy beach */}
      {ROCKS.map((rock, i) => (
        <div
          key={`rock-${i}`}
          className="absolute pointer-events-none"
          style={{
            left: `${rock.x}%`,
            top: `${rock.y}%`,
            transform: 'translate(-50%, -50%)',
            zIndex: 1,
          }}
        >
          <Rock size={rock.size} />
        </div>
      ))}

      {/* Large rock out in the sea */}
      <div
        className="absolute pointer-events-none"
        style={{
          left: `${SEA_ROCK.x}%`,
          top: `${SEA_ROCK.y}%`,
          transform: 'translate(-50%, -50%)',
          zIndex: 1,
        }}
      >
        <Rock size={SEA_ROCK.size} />
      </div>

      {/* Goats grazing on the grass */}
      {GOATS.map((goat, i) => (
        <div
          key={`goat-${i}`}
          className="absolute pointer-events-none"
          style={{
            left: `${goat.x}%`,
            top: `${goat.y}%`,
            transform: 'translate(-50%, -50%)',
            zIndex: 1,
          }}
        >
          <Goat size={goat.size} flip={goat.flip} />
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
              onClick={() => { onSelectLocation(loc.id); setPopup(null); playNav() }}
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
