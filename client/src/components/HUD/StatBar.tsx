import { STAT_ICONS } from '@jones/shared'
import type { StatKey } from '@jones/shared'
import { useT } from '../../i18n'

const STAT_COLORS: Record<StatKey, string> = {
  wealth:     '#F59E0B',
  knowledge:  '#3B82F6',
  career:     '#8B5CF6',
  wellbeing:  '#EF4444',
  network:    '#10B981',
  reputation: '#F97316',
}

interface StatBarProps {
  stat: StatKey
  value: number
  compact?: boolean
}

export function StatBar({ stat, value, compact = false }: StatBarProps) {
  const t = useT()
  const color = STAT_COLORS[stat]
  const pct = Math.max(0, Math.min(100, value))
  const label = t.stats[stat]

  if (compact) {
    return (
      <div className="flex items-center gap-1.5">
        <span className="text-xs w-4">{STAT_ICONS[stat]}</span>
        <div className="flex-1 h-1.5 rounded-full bg-slate-800">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${pct}%`, background: color }}
          />
        </div>
        <span className="text-xs text-slate-400 w-6 text-right">{value}</span>
      </div>
    )
  }

  return (
    <div className="space-y-0.5">
      <div className="flex justify-between items-center">
        <span className="text-xs text-slate-400 flex items-center gap-1">
          <span>{STAT_ICONS[stat]}</span>
          <span>{label}</span>
        </span>
        <span className="text-xs font-mono" style={{ color }}>{value}</span>
      </div>
      <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  )
}
