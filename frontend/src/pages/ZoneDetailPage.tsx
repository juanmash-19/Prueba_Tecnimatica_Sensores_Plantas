import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { MonitoringControls } from '../components/MonitoringControls'
import { MonitoringStatusBadge } from '../components/MonitoringStatusBadge'
import { ReadingGauge } from '../components/ReadingGauge'
import { SensorBadge } from '../components/SensorBadge'
import { ThresholdAlert } from '../components/ThresholdAlert'
import { getMonitorings, getSensors, getZones } from '../services/api'
import type { MonitoringWithDetails, Sensor, Zone } from '../types'
import { getSimulatedReading } from '../utils/simulatedReading'

const STATUS_CONFIG: Record<Zone['operational_status'], { label: string; styles: string }> = {
  activa: { label: 'Activa', styles: 'text-emerald-300 bg-emerald-500/10 border-emerald-400/25' },
  inactiva: { label: 'Inactiva', styles: 'text-slate-300 bg-slate-500/10 border-slate-400/25' },
  mantenimiento: { label: 'Mantenimiento', styles: 'text-amber-300 bg-amber-500/10 border-amber-400/25' },
}

type SensorViewModel = MonitoringWithDetails & { currentValue: number }

export function ZoneDetailPage() {
  const { id } = useParams()
  const zoneId = Number(id)
  const [zone, setZone] = useState<Zone | null>(null)
  const [monitorings, setMonitorings] = useState<MonitoringWithDetails[]>([])
  const [sensors, setSensors] = useState<Sensor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadZoneDetail = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      if (!Number.isInteger(zoneId)) {
        throw new Error('Identificador de zona inválido')
      }

      const [zonesResponse, allMonitorings, allSensors] = await Promise.all([
        getZones(),
        getMonitorings(),
        getSensors(),
      ])
      const currentZone = zonesResponse.find((item) => item.id === zoneId) ?? null

      if (!currentZone) {
        throw new Error('Zona no encontrada')
      }

      setZone(currentZone)
      setMonitorings(allMonitorings.filter((item) => item.zone_id === zoneId))
      setSensors(allSensors)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'No se pudo cargar la zona')
    } finally {
      setLoading(false)
    }
  }, [zoneId])

  useEffect(() => {
    void loadZoneDetail()
  }, [loadZoneDetail])

  const sensorCards = useMemo<SensorViewModel[]>(
    () =>
      monitorings.map((monitoring) => ({
        ...monitoring,
        currentValue: getSimulatedReading(monitoring.id, monitoring.sensor_id, monitoring.threshold_value),
      })),
    [monitorings],
  )

  const alertCount = useMemo(
    () => sensorCards.filter((s) => s.currentValue > s.threshold_value).length,
    [sensorCards],
  )

  function handleMonitoringUpdated(updated: MonitoringWithDetails) {
    setMonitorings((current) => current.map((item) => (item.id === updated.id ? updated : item)))
  }

  if (loading) {
    return (
      <div className="glass-card flex items-center gap-4 px-6 py-8">
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-cyan-400/20 border-t-cyan-300" />
        <div>
          <p className="font-medium text-slate-200">Cargando detalle de la zona</p>
          <p className="text-sm text-slate-500">Obteniendo sensores y monitoreos...</p>
        </div>
      </div>
    )
  }

  if (error || !zone) {
    return (
      <div className="animate-fade-up space-y-5">
        <div className="glass-card flex items-start gap-4 border-rose-400/20 p-6 text-rose-200">
          <svg className="mt-0.5 h-6 w-6 shrink-0 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <p className="font-semibold">No se pudo cargar la zona</p>
            <p className="mt-1 text-sm text-rose-300/80">{error || 'Zona no encontrada'}</p>
          </div>
        </div>
        <Link to="/" className="btn-primary">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver a Zonas
        </Link>
      </div>
    )
  }

  const statusConfig = STATUS_CONFIG[zone.operational_status]

  return (
    <div className="animate-fade-up space-y-8">
      <nav className="flex items-center gap-2 text-sm text-slate-500">
        <Link to="/" className="transition hover:text-cyan-300">Zonas</Link>
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-slate-300">{zone.name}</span>
      </nav>

      <section className="glass-card relative overflow-hidden p-6 md:p-8">
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-cyan-400/10 blur-3xl" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-4">
            <p className="section-label">Detalle de zona</p>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-50 md:text-4xl">{zone.name}</h1>
            <p className="max-w-3xl text-base leading-relaxed text-slate-400">{zone.description}</p>
            <p className="flex items-center gap-2 text-sm text-slate-400">
              <svg className="h-4 w-4 text-cyan-400/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              {zone.location}
            </p>
          </div>

          <span className={`inline-flex shrink-0 items-center rounded-full border px-4 py-1.5 text-xs font-semibold ${statusConfig.styles}`}>
            {statusConfig.label}
          </span>
        </div>

        <div className="relative mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/5 bg-slate-950/50 px-4 py-4">
            <p className="text-xs text-slate-500">Sensores asociados</p>
            <p className="mt-1 text-2xl font-bold text-cyan-300">{sensorCards.length}</p>
          </div>
          <div className="rounded-2xl border border-white/5 bg-slate-950/50 px-4 py-4">
            <p className="text-xs text-slate-500">Activos</p>
            <p className="mt-1 text-2xl font-bold text-emerald-300">
              {sensorCards.filter((s) => s.status === 'activo').length}
            </p>
          </div>
          <div className="rounded-2xl border border-white/5 bg-slate-950/50 px-4 py-4">
            <p className="text-xs text-slate-500">Alertas de umbral</p>
            <p className={`mt-1 text-2xl font-bold ${alertCount > 0 ? 'text-amber-300' : 'text-slate-400'}`}>
              {alertCount}
            </p>
          </div>
        </div>
      </section>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold text-slate-50">Sensores monitoreados</h2>
        <Link to="/" className="btn-secondary">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver a Zonas
        </Link>
      </div>

      <div className="grid gap-5">
        {sensorCards.length === 0 ? (
          <div className="glass-card flex flex-col items-center gap-3 px-6 py-12 text-center">
            <svg className="h-12 w-12 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <p className="text-slate-400">No hay sensores asociados a esta zona.</p>
            <Link to="/" className="btn-primary mt-2 text-sm">Asignar un sensor</Link>
          </div>
        ) : null}

        {sensorCards.map((sensor) => {
          const sensorData = sensors.find((candidate) => candidate.id === sensor.sensor_id)
          const isOver = sensor.currentValue > sensor.threshold_value

          return (
            <article
              key={sensor.id}
              className={`glass-card overflow-hidden p-6 transition ${
                isOver ? 'border-amber-400/25 shadow-amber-950/10' : ''
              }`}
            >
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-xl font-bold text-slate-50">{sensor.sensor_name}</h3>
                    <SensorBadge type={sensor.reading_type} />
                    <MonitoringStatusBadge status={sensor.status} />
                  </div>
                  <div className="grid gap-1.5 text-sm text-slate-400 sm:grid-cols-2">
                    <p>
                      Fabricante: <span className="text-slate-200">{sensorData?.manufacturer ?? 'No disponible'}</span>
                    </p>
                    <p>
                      Instalado: <span className="text-slate-200">{sensor.install_date}</span>
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 flex-col items-end gap-1 rounded-2xl border border-cyan-400/20 bg-cyan-400/5 px-5 py-3">
                  <span className="text-xs text-slate-500">Lectura actual</span>
                  <span className={`text-3xl font-bold tabular-nums ${isOver ? 'text-amber-300' : 'text-cyan-300'}`}>
                    {sensor.currentValue.toFixed(1)}
                  </span>
                  <span className="text-xs text-slate-500">
                    Umbral: <span className="text-slate-300">{sensor.threshold_value}</span>
                  </span>
                </div>
              </div>

              <div className="mt-5">
                <ReadingGauge
                  currentValue={sensor.currentValue}
                  threshold={sensor.threshold_value}
                />
              </div>

              <ThresholdAlert currentValue={sensor.currentValue} threshold={sensor.threshold_value} />
              <MonitoringControls monitoring={sensor} onUpdated={handleMonitoringUpdated} />
            </article>
          )
        })}
      </div>
    </div>
  )
}
