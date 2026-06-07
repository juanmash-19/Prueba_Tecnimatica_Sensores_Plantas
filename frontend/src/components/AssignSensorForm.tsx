import { useEffect, useState, type FormEvent } from 'react'
import { createMonitoring, getSensors, getZones } from '../services/api'
import type { MonitoringStatus, Sensor, SensorType, Zone } from '../types'

const SENSOR_TYPES: SensorType[] = ['temperatura', 'presion', 'vibracion', 'flujo']
const MONITORING_STATUSES: MonitoringStatus[] = ['activo', 'pausado']

interface AssignSensorFormProps {
  onCreated?: () => void
}

/**
 * Formulario para asignar un sensor a una zona (POST /monitorings).
 * Campos del enunciado: sensor, zona, tipo de lectura y umbral.
 * También incluye fecha de instalación y estado inicial del monitoreo.
 */
export function AssignSensorForm({ onCreated }: AssignSensorFormProps) {
  const [sensors, setSensors] = useState<Sensor[]>([])
  const [zones, setZones] = useState<Zone[]>([])
  const [sensorId, setSensorId] = useState('')
  const [zoneId, setZoneId] = useState('')
  const [readingType, setReadingType] = useState<SensorType>('temperatura')
  const [thresholdValue, setThresholdValue] = useState('')
  const [installDate, setInstallDate] = useState('')
  const [status, setStatus] = useState<MonitoringStatus>('activo')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function load() {
      setLoading(true)
      try {
        const [sensorList, zoneList] = await Promise.all([getSensors(), getZones()])
        if (!active) return
        setSensors(sensorList)
        setZones(zoneList)
        setSensorId(String(sensorList[0]?.id ?? ''))
        setZoneId(String(zoneList[0]?.id ?? ''))
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : 'No se pudo cargar el formulario')
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    void load()

    return () => {
      active = false
    }
  }, [])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage('')
    setError('')

    try {
      setSaving(true)
      await createMonitoring({
        sensor_id: Number(sensorId),
        zone_id: Number(zoneId),
        install_date: installDate,
        reading_type: readingType,
        threshold_value: Number(thresholdValue),
        status,
      })
      setMessage('Monitoreo creado correctamente')
      onCreated?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear el monitoreo')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="glass-card relative overflow-hidden p-6 md:p-8">
      <div className="pointer-events-none absolute -left-10 -top-10 h-40 w-40 rounded-full bg-cyan-400/10 blur-3xl" />

      <div className="relative mb-6 flex items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-300 ring-1 ring-cyan-400/20">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-50">Asignar sensor</h2>
            <p className="text-sm text-slate-400">Vincula un sensor a una zona de monitoreo</p>
          </div>
        </div>
        {loading ? (
          <span className="flex items-center gap-2 text-sm text-cyan-300">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-cyan-400/30 border-t-cyan-300" />
            Cargando...
          </span>
        ) : null}
      </div>

      <form className="relative grid gap-5 md:grid-cols-2" onSubmit={handleSubmit}>
        <label className="grid gap-2 text-sm font-medium text-slate-300">
          Sensor
          <select className="input-field" value={sensorId} onChange={(event) => setSensorId(event.target.value)} required>
            <option value="">Selecciona un sensor</option>
            {sensors.map((sensor) => (
              <option key={sensor.id} value={sensor.id}>{sensor.name} — {sensor.manufacturer}</option>
            ))}
          </select>
        </label>

        <label className="grid gap-2 text-sm font-medium text-slate-300">
          Zona
          <select className="input-field" value={zoneId} onChange={(event) => setZoneId(event.target.value)} required>
            <option value="">Selecciona una zona</option>
            {zones.map((zone) => (
              <option key={zone.id} value={zone.id}>{zone.name}</option>
            ))}
          </select>
        </label>

        <label className="grid gap-2 text-sm font-medium text-slate-300">
          Tipo de lectura
          <select className="input-field" value={readingType} onChange={(event) => setReadingType(event.target.value as SensorType)}>
            {SENSOR_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
          </select>
        </label>

        <label className="grid gap-2 text-sm font-medium text-slate-300">
          Estado
          <select className="input-field" value={status} onChange={(event) => setStatus(event.target.value as MonitoringStatus)}>
            {MONITORING_STATUSES.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>

        <label className="grid gap-2 text-sm font-medium text-slate-300">
          Umbral
          <input className="input-field" type="number" min="0" step="0.1" value={thresholdValue} onChange={(event) => setThresholdValue(event.target.value)} placeholder="95.5" required />
        </label>

        <label className="grid gap-2 text-sm font-medium text-slate-300">
          Fecha de instalación
          <input className="input-field" type="date" value={installDate} onChange={(event) => setInstallDate(event.target.value)} required />
        </label>

        <div className="flex flex-wrap items-center gap-3 md:col-span-2">
          <button className="btn-primary" type="submit" disabled={saving}>
            {saving ? 'Guardando...' : 'Asignar sensor'}
          </button>
          {message ? (
            <span className="flex items-center gap-2 text-sm text-emerald-300">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              {message}
            </span>
          ) : null}
          {error ? (
            <span className="flex items-center gap-2 text-sm text-rose-300">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              {error}
            </span>
          ) : null}
        </div>
      </form>
    </section>
  )
}
