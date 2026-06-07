import type { MonitoringStatus } from '../types'

const STATUS_CONFIG: Record<MonitoringStatus, { label: string; styles: string; dot: string }> = {
  activo: {
    label: 'Activo',
    styles: 'bg-emerald-500/15 text-emerald-200 ring-emerald-400/30',
    dot: 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]',
  },
  pausado: {
    label: 'Pausado',
    styles: 'bg-amber-500/15 text-amber-200 ring-amber-400/30',
    dot: 'bg-amber-400',
  },
}

export function MonitoringStatusBadge({ status }: { status: MonitoringStatus }) {
  const config = STATUS_CONFIG[status]

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1 ${config.styles}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  )
}
