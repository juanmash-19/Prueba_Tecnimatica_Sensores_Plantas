import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AssignSensorForm } from '../components/AssignSensorForm'
import { getZoneSensors, getZones } from '../services/api'
import type { ZoneWithCount } from '../types'

/** Estilos visuales del badge según el estado operativo de la zona. */
const STATUS_STYLES: Record<ZoneWithCount['operational_status'], string> = {
  activa: 'bg-emerald-500/15 text-emerald-300 ring-emerald-400/30',
  inactiva: 'bg-rose-500/15 text-rose-300 ring-rose-400/30',
  mantenimiento: 'bg-amber-500/15 text-amber-300 ring-amber-400/30',
}

/** Placeholder animado mientras se cargan las tarjetas de zonas. */
function LoadingCard() {
  return <div className="h-40 animate-pulse rounded-3xl border border-slate-800 bg-slate-900/80" />
}

/**
 * Página principal del panel de zonas.
 * Lista todas las zonas con su estado operativo y cantidad de sensores activos,
 * y permite abrir el formulario para asignar un sensor a una zona.
 */
export function ZonesPage() {
  const navigate = useNavigate()
  const [zones, setZones] = useState<ZoneWithCount[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  /** Carga las zonas y enriquece cada una con el conteo de sensores activos. */
  async function loadZones() {
    setLoading(true)
    setError(null)

    try {
      const baseZones = await getZones()
      const counts = await Promise.all(
        baseZones.map(async (zone) => {
          const response = await getZoneSensors(zone.id)
          return { ...zone, active_sensor_count: response.total }
        }),
      )
      setZones(counts)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'No se pudieron cargar las zonas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadZones()
  }, [])

  const totalActiveSensors = useMemo(() => zones.reduce((sum, zone) => sum + zone.active_sensor_count, 0), [zones])

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/70">Panel general</p>
          <h1 className="mt-2 text-4xl font-bold text-slate-50 md:text-5xl">Zonas de Monitoreo</h1>
          <p className="mt-3 max-w-2xl text-slate-400">Visualiza el estado operativo de cada zona, su carga de sensores activos y abre el formulario de asignación cuando necesites enlazar un nuevo dispositivo.</p>
        </div>
        <button type="button" onClick={() => setShowForm((value) => !value)} className="w-fit rounded-xl bg-cyan-400 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300">
          {showForm ? 'Cerrar formulario' : 'Asignar sensor'}
        </button>
      </div>

      {showForm ? (
        <AssignSensorForm
          onCreated={() => {
            setShowForm(false)
            void loadZones()
          }}
        />
      ) : null}

      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5 text-sm text-slate-300">
        Sensores activos totales: <span className="font-semibold text-cyan-300">{totalActiveSensors}</span>
      </div>

      {error ? <div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-rose-200">{error}</div> : null}

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {loading ? Array.from({ length: 6 }).map((_, index) => <LoadingCard key={index} />) : null}

        {!loading
          ? zones.map((zone) => (
              <button key={zone.id} type="button" onClick={() => navigate(`/zones/${zone.id}`)} className="group rounded-3xl border border-slate-800 bg-slate-900/90 p-6 text-left transition hover:-translate-y-1 hover:border-cyan-400/40 hover:shadow-2xl hover:shadow-cyan-950/20">
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-50">{zone.name}</h2>
                    <p className="mt-1 text-sm text-slate-400">{zone.location}</p>
                  </div>
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ${STATUS_STYLES[zone.operational_status]}`}>
                    {zone.operational_status}
                  </span>
                </div>

                <p className="text-sm leading-6 text-slate-300">{zone.description}</p>

                <div className="mt-5 flex items-center justify-between border-t border-slate-800 pt-4 text-sm text-slate-400">
                  <span>Sensores activos</span>
                  <span className="text-lg font-semibold text-cyan-300">{zone.active_sensor_count}</span>
                </div>
              </button>
            ))
          : null}
      </section>
    </div>
  )
}
