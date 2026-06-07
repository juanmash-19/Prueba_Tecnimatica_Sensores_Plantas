import type { SensorType } from '../types'

const TYPE_STYLES: Record<SensorType, string> = {
  temperatura: 'bg-red-500/15 text-red-200 ring-red-400/30',
  presion: 'bg-sky-500/15 text-sky-200 ring-sky-400/30',
  vibracion: 'bg-violet-500/15 text-violet-200 ring-violet-400/30',
  flujo: 'bg-emerald-500/15 text-emerald-200 ring-emerald-400/30',
}

/**
 * Badge con color según el tipo de sensor (temperatura, presión, vibración o flujo).
 */
export function SensorBadge({ type }: { type: SensorType }) {
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ${TYPE_STYLES[type]}`}>
      {type}
    </span>
  )
}
