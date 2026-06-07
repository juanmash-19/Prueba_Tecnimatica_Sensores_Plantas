import type {
  CreateMonitoringDTO,
  Monitoring,
  MonitoringStatus,
  MonitoringWithDetails,
  Sensor,
  UpdateMonitoringDTO,
  Zone,
  ZoneSensorsResponse,
} from '../types'

const API_BASE = 'http://localhost:3000/api'

/**
 * Realiza una petición HTTP a la API y parsea la respuesta JSON.
 * Lanza un error con el mensaje del servidor si la respuesta no es exitosa.
 */
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    ...init,
  })

  const payload = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(payload?.error ?? payload?.message ?? 'Error inesperado')
  }

  return payload as T
}

/** Obtiene todos los sensores disponibles. */
export async function getSensors(): Promise<Sensor[]> {
  const response = await request<{ data: Sensor[] }>('/sensors')
  return response.data
}

/** Obtiene todas las zonas de monitoreo. */
export async function getZones(): Promise<Zone[]> {
  const response = await request<{ data: Zone[] }>('/zones')
  return response.data
}

/** Obtiene una zona con los sensores activos asignados a ella. */
export async function getZoneSensors(zoneId: number): Promise<ZoneSensorsResponse> {
  return request<ZoneSensorsResponse>(`/zones/${zoneId}/sensors`)
}

/** Lista monitoreos, con filtro opcional por estado. */
export async function getMonitorings(status?: MonitoringStatus): Promise<MonitoringWithDetails[]> {
  const query = status ? `?status=${status}` : ''
  const response = await request<{ data: MonitoringWithDetails[] }>(`/monitorings${query}`)
  return response.data
}

/** Crea una nueva asignación sensor-zona. */
export async function createMonitoring(dto: CreateMonitoringDTO): Promise<Monitoring> {
  return request<Monitoring>('/monitorings', {
    method: 'POST',
    body: JSON.stringify(dto),
  })
}

/** Actualiza el umbral y/o estado de un monitoreo existente. */
export async function updateMonitoring(id: number, dto: UpdateMonitoringDTO): Promise<Monitoring> {
  return request<Monitoring>(`/monitorings/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(dto),
  })
}
