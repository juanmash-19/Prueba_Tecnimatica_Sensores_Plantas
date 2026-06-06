export type SensorType = 'temperatura' | 'presion' | 'vibracion' | 'flujo'
export type MonitoringStatus = 'activo' | 'pausado'
export type ZoneStatus = 'activa' | 'inactiva' | 'mantenimiento'

export interface Sensor {
  id: number
  name: string
  type: SensorType
  manufacturer: string
  manufacture_date: string
}

export interface Zone {
  id: number
  name: string
  description: string | null
  location: string | null
  operational_status: ZoneStatus
}

export interface Monitoring {
  id: number
  sensor_id: number
  zone_id: number
  install_date: string
  reading_type: SensorType
  threshold_value: number
  status: MonitoringStatus
}

export interface MonitoringWithDetails extends Monitoring {
  sensor_name: string
  sensor_type: SensorType
  zone_name: string
  zone_location: string
}

export interface ZoneWithCount extends Zone {
  active_sensor_count: number
}

export interface CreateMonitoringDTO {
  sensor_id: number
  zone_id: number
  install_date: string
  reading_type: SensorType
  threshold_value: number
  status?: MonitoringStatus
}

export interface UpdateMonitoringDTO {
  threshold_value?: number
  status?: MonitoringStatus
}

export interface ZoneSensorsResponse {
  zone: Zone
  sensors: Sensor[]
  total: number
}