import type { SensorType } from '../types'

const TYPE_CONFIG: Record<SensorType, { label: string; styles: string }> = {
  temperatura: { label: 'Temperatura', styles: 'bg-red-500/15 text-red-200 ring-red-400/30' },
  presion: { label: 'Presión', styles: 'bg-sky-500/15 text-sky-200 ring-sky-400/30' },
  vibracion: { label: 'Vibración', styles: 'bg-violet-500/15 text-violet-200 ring-violet-400/30' },
  flujo: { label: 'Flujo', styles: 'bg-emerald-500/15 text-emerald-200 ring-emerald-400/30' },
}

export function SensorBadge({ type }: { type: SensorType }) {
  const config = TYPE_CONFIG[type]

  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold capitalize ring-1 ${config.styles}`}>
      {config.label}
    </span>
  )
}
