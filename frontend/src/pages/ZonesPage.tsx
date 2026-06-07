import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { AssignSensorForm } from '../components/AssignSensorForm'
import { getZoneSensors, getZones } from '../services/api'
import type { ZoneWithCount } from '../types'

/** Configuración visual del estado operativo de cada zona (activa, inactiva, mantenimiento). */
const STATUS_CONFIG: Record<
  ZoneWithCount['operational_status'],
  { label: string; styles: string; accent: string; dot: string }
> = {
  activa: {
    label: 'Activa',
    styles: 'bg-emerald-500/15 text-emerald-300 ring-emerald-400/30',
    accent: 'from-emerald-400/80 to-emerald-600/0',
    dot: 'bg-emerald-400',
  },
  inactiva: {
    label: 'Inactiva',
    styles: 'bg-rose-500/15 text-rose-300 ring-rose-400/30',
    accent: 'from-rose-400/80 to-rose-600/0',
    dot: 'bg-rose-400',
  },
  mantenimiento: {
    label: 'Mantenimiento',
    styles: 'bg-amber-500/15 text-amber-300 ring-amber-400/30',
    accent: 'from-amber-400/80 to-amber-600/0',
    dot: 'bg-amber-400',
  },
}

/** Placeholder de carga mientras se obtienen las zonas desde la API. */
function LoadingCard() {
  return (
    <div className="glass-card h-52 animate-pulse overflow-hidden p-6">
      <div className="mb-4 h-4 w-1/3 rounded-lg bg-slate-800" />
      <div className="mb-2 h-3 w-2/3 rounded-lg bg-slate-800/80" />
      <div className="h-3 w-full rounded-lg bg-slate-800/60" />
      <div className="mt-8 h-8 w-full rounded-xl bg-slate-800/50" />
    </div>
  )
}

function StatCard({ label, value, hint, icon }: { label: string; value: string | number; hint?: string; icon: ReactNode }) {
  return (
    <div className="glass-card glass-card-hover p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-slate-400">{label}</p>
          <p className="mt-1 text-3xl font-bold tracking-tight text-slate-50">{value}</p>
          {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-300 ring-1 ring-cyan-400/20">
          {icon}
        </div>
      </div>
    </div>
  )
}

/**
 * Vista principal: listado de zonas con la cantidad de sensores activos en cada una.
 * Permite abrir el formulario de asignación sensor-zona (POST /monitorings).
 */
export function ZonesPage() {
  const navigate = useNavigate()
  const [zones, setZones] = useState<ZoneWithCount[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  /** Carga zonas y consulta GET /zones/:id/sensors para contar solo monitoreos activos. */
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

  const stats = useMemo(() => {
    const totalActiveSensors = zones.reduce((sum, zone) => sum + zone.active_sensor_count, 0)
    const activeZones = zones.filter((z) => z.operational_status === 'activa').length
    const maintenanceZones = zones.filter((z) => z.operational_status === 'mantenimiento').length
    return { totalActiveSensors, activeZones, maintenanceZones, totalZones: zones.length }
  }, [zones])

  return (
    <div className="animate-fade-up space-y-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <p className="section-label">Panel general</p>
          <h1 className="page-title mt-2 bg-gradient-to-br from-white via-slate-100 to-cyan-200 bg-clip-text text-transparent">
            Zonas de Monitoreo
          </h1>
          <p className="mt-4 text-base leading-relaxed text-slate-400">
            Supervisa el estado operativo de cada área de planta, revisa la carga de sensores activos y asigna nuevos dispositivos en segundos.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((value) => !value)}
          className="btn-primary shrink-0"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            {showForm ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            )}
          </svg>
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

      {!loading && zones.length > 0 ? (
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Zonas registradas"
            value={stats.totalZones}
            hint="Áreas de planta monitoreadas"
            icon={
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            }
          />
          <StatCard
            label="Sensores activos"
            value={stats.totalActiveSensors}
            hint="Dispositivos en operación"
            icon={
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            }
          />
          <StatCard
            label="Zonas activas"
            value={stats.activeZones}
            hint="Operando con normalidad"
            icon={
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <StatCard
            label="En mantenimiento"
            value={stats.maintenanceZones}
            hint="Requieren atención"
            icon={
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            }
          />
        </section>
      ) : null}

      {error ? (
        <div className="flex items-center gap-3 rounded-2xl border border-rose-400/30 bg-rose-500/10 px-5 py-4 text-rose-200">
          <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      ) : null}

      <section>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-200">Todas las zonas</h2>
          {!loading ? <span className="text-sm text-slate-500">{zones.length} resultados</span> : null}
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {loading ? Array.from({ length: 6 }).map((_, index) => <LoadingCard key={index} />) : null}

          {!loading
            ? zones.map((zone, index) => {
                const config = STATUS_CONFIG[zone.operational_status]

                return (
                  <button
                    key={zone.id}
                    type="button"
                    onClick={() => navigate(`/zones/${zone.id}`)}
                    className="glass-card glass-card-hover group relative overflow-hidden p-6 text-left"
                    style={{ animationDelay: `${index * 60}ms` }}
                  >
                    <div className={`absolute inset-y-0 left-0 w-1 bg-gradient-to-b ${config.accent}`} />

                    <div className="mb-4 flex items-start justify-between gap-4 pl-2">
                      <div>
                        <h2 className="text-xl font-bold text-slate-50 transition group-hover:text-cyan-100">{zone.name}</h2>
                        <p className="mt-1.5 flex items-center gap-1.5 text-sm text-slate-400">
                          <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {zone.location}
                        </p>
                      </div>
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1 ${config.styles}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
                        {config.label}
                      </span>
                    </div>

                    <p className="line-clamp-2 pl-2 text-sm leading-6 text-slate-400">{zone.description}</p>

                    <div className="mt-5 flex items-center justify-between border-t border-white/5 pt-4 pl-2">
                      <span className="flex items-center gap-2 text-sm text-slate-500">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Sensores activos
                      </span>
                      <span className="text-2xl font-bold text-cyan-300">{zone.active_sensor_count}</span>
                    </div>

                    <div className="mt-4 flex items-center gap-1 pl-2 text-xs font-medium text-cyan-400/0 transition group-hover:text-cyan-400/90">
                      Ver detalle
                      <svg className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>
                )
              })
            : null}
        </div>
      </section>
    </div>
  )
}
