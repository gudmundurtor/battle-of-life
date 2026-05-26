export type StatKey = 'wealth' | 'knowledge' | 'career' | 'wellbeing' | 'network' | 'reputation'
export type HiddenStatKey = 'luck' | 'stress'
export type AnyStatKey = StatKey | HiddenStatKey | 'money'

export interface PlayerStats {
  wealth: number
  knowledge: number
  career: number
  wellbeing: number
  network: number
  reputation: number
}

export interface PlayerHiddenStats {
  luck: number
  stress: number
}

export interface StatEffect {
  stat: AnyStatKey
  value: number
  isMultiplier?: boolean
}

export const STAT_LABELS: Record<StatKey, string> = {
  wealth: 'Auður',
  knowledge: 'Þekking',
  career: 'Ferill',
  wellbeing: 'Líðan',
  network: 'Tengsl',
  reputation: 'Orðspor',
}

export const STAT_ICONS: Record<StatKey, string> = {
  wealth: '💰',
  knowledge: '🎓',
  career: '💼',
  wellbeing: '❤️',
  network: '🤝',
  reputation: '⭐',
}

export const DEFAULT_STATS: PlayerStats = {
  wealth: 20,
  knowledge: 15,
  career: 0,
  wellbeing: 50,
  network: 20,
  reputation: 10,
}

export const DEFAULT_HIDDEN: PlayerHiddenStats = {
  luck: 50,
  stress: 10,
}

export function clampStat(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)))
}
