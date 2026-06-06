import { useEffect, useState, type FormEvent } from 'react'
import { createMonitoring, getSensors, getZones } from '../services/api'
import type { MonitoringStatus, Sensor, SensorType, Zone } from '../types'

const SENSOR_TYPES: SensorType[] = ['temperatura', 'presion', 'vibracion', 'flujo']
const MONITORING_STATUSES: MonitoringStatus[] = ['activo', 'pausado']

interface AssignSensorFormProps {
  onCreated?: () => void
}

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
    <section className="rounded-3xl border border-cyan-400/20 bg-slate-900/90 p-6 shadow-2xl shadow-cyan-950/20">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-50">Asignar sensor</h2>
          <p className="text-sm text-slate-400">Crea un monitoreo entre un sensor y una zona</p>
        </div>
        {loading ? <span className="text-sm text-cyan-300">Cargando...</span> : null}
      </div>

      <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
        <label className="grid gap-2 text-sm text-slate-300">
          Sensor
          <select className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100" value={sensorId} onChange={(event) => setSensorId(event.target.value)} required>
            <option value="">Selecciona un sensor</option>
            {sensors.map((sensor) => (
              <option key={sensor.id} value={sensor.id}>{sensor.name} - {sensor.manufacturer}</option>
            ))}
          </select>
        </label>

        <label className="grid gap-2 text-sm text-slate-300">
          Zona
          <select className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100" value={zoneId} onChange={(event) => setZoneId(event.target.value)} required>
            <option value="">Selecciona una zona</option>
            {zones.map((zone) => (
              <option key={zone.id} value={zone.id}>{zone.name}</option>
            ))}
          </select>
        </label>

        <label className="grid gap-2 text-sm text-slate-300">
          Tipo de lectura
          <select className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100" value={readingType} onChange={(event) => setReadingType(event.target.value as SensorType)}>
            {SENSOR_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
          </select>
        </label>

        <label className="grid gap-2 text-sm text-slate-300">
          Estado
          <select className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100" value={status} onChange={(event) => setStatus(event.target.value as MonitoringStatus)}>
            {MONITORING_STATUSES.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>

        <label className="grid gap-2 text-sm text-slate-300">
          Umbral
          <input className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100" type="number" min="0" step="0.1" value={thresholdValue} onChange={(event) => setThresholdValue(event.target.value)} placeholder="95.5" required />
        </label>

        <label className="grid gap-2 text-sm text-slate-300">
          Fecha de instalación
          <input className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100" type="date" value={installDate} onChange={(event) => setInstallDate(event.target.value)} required />
        </label>

        <div className="md:col-span-2 flex items-center gap-3">
          <button className="rounded-xl bg-cyan-400 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60" type="submit" disabled={saving}>
            {saving ? 'Guardando...' : 'Asignar sensor'}
          </button>
          {message ? <span className="text-sm text-emerald-300">{message}</span> : null}
          {error ? <span className="text-sm text-rose-300">{error}</span> : null}
        </div>
      </form>
    </section>
  )
}