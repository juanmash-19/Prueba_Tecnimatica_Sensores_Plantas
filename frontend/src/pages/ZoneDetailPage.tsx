import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { MonitoringControls } from '../components/MonitoringControls'
import { MonitoringStatusBadge } from '../components/MonitoringStatusBadge'
import { SensorBadge } from '../components/SensorBadge'
import { ThresholdAlert } from '../components/ThresholdAlert'
import { getMonitorings, getSensors, getZones } from '../services/api'
import type { MonitoringWithDetails, Sensor, Zone } from '../types'
import { getSimulatedReading } from '../utils/simulatedReading'

/** Estilos del indicador de estado operativo de la zona. */
const STATUS_STYLES: Record<Zone['operational_status'], string> = {
  activa: 'text-emerald-300 bg-emerald-500/10 border-emerald-400/20',
  inactiva: 'text-slate-300 bg-slate-500/10 border-slate-400/20',
  mantenimiento: 'text-amber-300 bg-amber-500/10 border-amber-400/20',
}

/** Monitoreo enriquecido con la lectura simulada actual del sensor. */
type SensorViewModel = MonitoringWithDetails & { currentValue: number }

/**
 * Página de detalle de una zona.
 * Muestra información de la zona, los monitoreos asociados, lecturas simuladas,
 * alertas de umbral y controles para pausar o ajustar cada monitoreo.
 */
export function ZoneDetailPage() {
  const { id } = useParams()
  const zoneId = Number(id)
  const [zone, setZone] = useState<Zone | null>(null)
  const [monitorings, setMonitorings] = useState<MonitoringWithDetails[]>([])
  const [sensors, setSensors] = useState<Sensor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  /** Carga la zona, sus monitoreos y el catálogo de sensores para mostrar fabricante. */
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

  /** Combina cada monitoreo con su lectura simulada determinística. */
  const sensorCards = useMemo<SensorViewModel[]>(
    () =>
      monitorings.map((monitoring) => ({
        ...monitoring,
        currentValue: getSimulatedReading(monitoring.id, monitoring.sensor_id, monitoring.threshold_value),
      })),
    [monitorings],
  )

  /** Actualiza en memoria un monitoreo tras pausar, reactivar o cambiar su umbral. */
  function handleMonitoringUpdated(updated: MonitoringWithDetails) {
    setMonitorings((current) => current.map((item) => (item.id === updated.id ? updated : item)))
  }

  if (loading) {
    return (
      <div className="flex items-center gap-3 rounded-3xl border border-slate-800 bg-slate-900/60 px-5 py-6 text-slate-300">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-cyan-400/30 border-t-cyan-300" />
        Cargando detalle de la zona...
      </div>
    )
  }

  if (error || !zone) {
    return (
      <div className="space-y-4">
        <div className="rounded-3xl border border-rose-400/30 bg-rose-500/10 px-5 py-6 text-rose-200">{error || 'Zona no encontrada'}</div>
        <Link to="/" className="inline-flex rounded-2xl bg-cyan-400 px-5 py-3 font-semibold text-slate-950 hover:bg-cyan-300">
          Volver a Zonas
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-cyan-400/20 bg-slate-900/70 p-6 shadow-2xl shadow-cyan-950/20">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.35em] text-cyan-300/70">Detalle de zona</p>
            <h1 className="text-3xl font-semibold text-slate-50 md:text-4xl">{zone.name}</h1>
            <p className="max-w-3xl text-sm leading-6 text-slate-300 md:text-base">{zone.description}</p>
            <p className="text-sm text-slate-400">
              Ubicación: <span className="text-slate-200">{zone.location}</span>
            </p>
          </div>

          <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold capitalize ${STATUS_STYLES[zone.operational_status]}`}>
            {zone.operational_status}
          </span>
        </div>

        <div className="mt-6 flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-slate-300">
          <span>Sensores asociados</span>
          <span className="text-lg font-semibold text-cyan-300">{sensorCards.length}</span>
        </div>
      </section>

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-slate-50">Sensores monitoreados</h2>
        <Link to="/" className="rounded-2xl border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:border-cyan-400/40 hover:text-cyan-200">
          Volver a Zonas
        </Link>
      </div>

      <div className="grid gap-5">
        {sensorCards.length === 0 ? (
          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 px-5 py-6 text-slate-300">
            No hay sensores asociados a esta zona.
          </div>
        ) : null}

        {sensorCards.map((sensor) => {
          const sensorData = sensors.find((candidate) => candidate.id === sensor.sensor_id)

          return (
            <article key={sensor.id} className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-lg shadow-slate-950/20">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-xl font-semibold text-slate-50">{sensor.sensor_name}</h3>
                    <SensorBadge type={sensor.reading_type} />
                    <MonitoringStatusBadge status={sensor.status} />
                  </div>
                  <p className="text-sm text-slate-400">
                    Fabricante: <span className="text-slate-200">{sensorData?.manufacturer ?? 'No disponible'}</span>
                  </p>
                  <p className="text-sm text-slate-400">
                    Tipo de lectura configurado: <span className="text-slate-200">{sensor.reading_type}</span>
                  </p>
                  <p className="text-sm text-slate-400">
                    Instalado: <span className="text-slate-200">{sensor.install_date}</span>
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-slate-300">
                  Umbral: <span className="text-cyan-300">{sensor.threshold_value}</span>
                </div>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-slate-300">
                  Valor actual simulado: <span className="text-slate-100">{sensor.currentValue.toFixed(1)}</span>
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-slate-300">
                  Estado operativo del sensor: <span className="text-slate-100">{sensor.status}</span>
                </div>
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
