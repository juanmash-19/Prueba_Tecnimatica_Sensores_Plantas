import type { MonitoringStatus } from '../types'

/**
 * Badge visual que indica si un monitoreo está activo o pausado.
 */
export function MonitoringStatusBadge({ status }: { status: MonitoringStatus }) {
  const styles =
    status === 'activo'
      ? 'bg-emerald-500/15 text-emerald-200 ring-emerald-400/30'
      : 'bg-amber-500/15 text-amber-200 ring-amber-400/30'

  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ${styles}`}>
      {status === 'activo' ? 'Activo' : 'Pausado'}
    </span>
  )
}
