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
    <div className="mt-5 rounded-2xl border border-white/5 bg-slate-950/50 p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-sm font-semibold text-slate-200">
          <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
          Configuración del monitoreo
        </p>
        <MonitoringStatusBadge status={status} />
      </div>

      <div className="grid gap-4 md:grid-cols-[1fr_auto_auto] md:items-end">
        <label className="grid gap-2 text-sm font-medium text-slate-300">
          Umbral
          <input
            className="input-field"
            type="number"
            min="0.1"
            step="0.1"
            value={threshold}
            onChange={(event) => setThreshold(event.target.value)}
          />
        </label>

        <button
          type="button"
          className="btn-primary"
          onClick={() => void handleSave()}
          disabled={saving}
        >
          {saving ? 'Guardando...' : 'Guardar umbral'}
        </button>

        <button
          type="button"
          className="btn-secondary"
          onClick={() => void handleToggleStatus()}
          disabled={saving}
        >
          {status === 'activo' ? 'Pausar' : 'Activar'}
        </button>
      </div>

      {message ? (
        <p className="mt-3 flex items-center gap-2 text-sm text-emerald-300">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          {message}
        </p>
      ) : null}
      {error ? (
        <p className="mt-3 flex items-center gap-2 text-sm text-rose-300">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
          {error}
        </p>
      ) : null}
    </div>
  )
}
