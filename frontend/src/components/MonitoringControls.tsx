import { useState } from 'react'
import { updateMonitoring } from '../services/api'
import type { MonitoringStatus, MonitoringWithDetails } from '../types'
import { MonitoringStatusBadge } from './MonitoringStatusBadge'

interface MonitoringControlsProps {
  monitoring: MonitoringWithDetails
  onUpdated: (updated: MonitoringWithDetails) => void
}

export function MonitoringControls({ monitoring, onUpdated }: MonitoringControlsProps) {
  const [threshold, setThreshold] = useState(String(monitoring.threshold_value))
  const [status, setStatus] = useState<MonitoringStatus>(monitoring.status)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  async function handleSave() {
    setSaving(true)
    setError('')
    setMessage('')

    try {
      const nextThreshold = Number(threshold)

      if (!Number.isFinite(nextThreshold) || nextThreshold <= 0) {
        throw new Error('El umbral debe ser un número mayor que 0')
      }

      const updated = await updateMonitoring(monitoring.id, {
        threshold_value: nextThreshold,
        status,
      })

      onUpdated({
        ...monitoring,
        threshold_value: updated.threshold_value,
        status: updated.status,
      })
      setMessage('Monitoreo actualizado')
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'No se pudo actualizar el monitoreo')
    } finally {
      setSaving(false)
    }
  }

  async function handleToggleStatus() {
    const nextStatus: MonitoringStatus = status === 'activo' ? 'pausado' : 'activo'
    setStatus(nextStatus)
    setSaving(true)
    setError('')
    setMessage('')

    try {
      const updated = await updateMonitoring(monitoring.id, { status: nextStatus })
      onUpdated({
        ...monitoring,
        threshold_value: updated.threshold_value,
        status: updated.status,
      })
      setMessage(nextStatus === 'activo' ? 'Monitoreo activado' : 'Monitoreo pausado')
    } catch (toggleError) {
      setStatus(monitoring.status)
      setError(toggleError instanceof Error ? toggleError.message : 'No se pudo cambiar el estado')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-medium text-slate-200">Configuración del monitoreo</p>
        <MonitoringStatusBadge status={status} />
      </div>

      <div className="grid gap-4 md:grid-cols-[1fr_auto_auto] md:items-end">
        <label className="grid gap-2 text-sm text-slate-300">
          Umbral
          <input
            className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100"
            type="number"
            min="0.1"
            step="0.1"
            value={threshold}
            onChange={(event) => setThreshold(event.target.value)}
          />
        </label>

        <button
          type="button"
          className="rounded-xl bg-cyan-400 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
          onClick={() => void handleSave()}
          disabled={saving}
        >
          {saving ? 'Guardando...' : 'Guardar umbral'}
        </button>

        <button
          type="button"
          className="rounded-xl border border-slate-700 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:border-cyan-400/40 hover:text-cyan-200 disabled:cursor-not-allowed disabled:opacity-60"
          onClick={() => void handleToggleStatus()}
          disabled={saving}
        >
          {status === 'activo' ? 'Pausar' : 'Activar'}
        </button>
      </div>

      {message ? <p className="mt-3 text-sm text-emerald-300">{message}</p> : null}
      {error ? <p className="mt-3 text-sm text-rose-300">{error}</p> : null}
    </div>
  )
}
