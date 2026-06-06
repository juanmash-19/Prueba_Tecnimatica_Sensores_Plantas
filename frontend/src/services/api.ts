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

const ZONE_CATALOG: Zone[] = [
  { id: 1, name: 'Calderas', description: 'Zona de calderas', location: 'Planta A - Sector 1', operational_status: 'activa' },
  { id: 2, name: 'Compresores', description: 'Sala de compresores', location: 'Planta A - Sector 2', operational_status: 'activa' },
  { id: 3, name: 'Tuberías', description: 'Red de tuberías principales', location: 'Planta B - Sector 1', operational_status: 'mantenimiento' },
  { id: 4, name: 'Motores', description: 'Banco de motores', location: 'Planta B - Sector 3', operational_status: 'activa' },
  { id: 5, name: 'Almacenamiento', description: 'Área de almacenamiento', location: 'Planta C - Sector 1', operational_status: 'inactiva' },
  { id: 6, name: 'Empaque', description: 'Línea de empaque', location: 'Planta C - Sector 2', operational_status: 'activa' },
]

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

export async function getSensors(): Promise<Sensor[]> {
  const response = await request<{ data: Sensor[] }>('/sensors')
  return response.data
}

export async function getZones(): Promise<Zone[]> {
  return ZONE_CATALOG
}

export async function getZoneSensors(zoneId: number): Promise<ZoneSensorsResponse> {
  return request<ZoneSensorsResponse>(`/zones/${zoneId}/sensors`)
}

export async function getMonitorings(status?: MonitoringStatus): Promise<MonitoringWithDetails[]> {
  const query = status ? `?status=${status}` : ''
  const response = await request<{ data: MonitoringWithDetails[] }>(`/monitorings${query}`)
  return response.data
}

export async function createMonitoring(dto: CreateMonitoringDTO): Promise<Monitoring> {
  return request<Monitoring>('/monitorings', {
    method: 'POST',
    body: JSON.stringify(dto),
  })
}

export async function updateMonitoring(id: number, dto: UpdateMonitoringDTO): Promise<Monitoring> {
  return request<Monitoring>(`/monitorings/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(dto),
  })
}