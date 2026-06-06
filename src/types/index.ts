export type SensorType = 'temperatura' | 'presion' | 'vibracion' | 'flujo';
export type MonitoringStatus = 'activo' | 'pausado';
export type ZoneStatus = 'activa' | 'inactiva' | 'mantenimiento';

export interface Sensor {
  id: number;
  name: string;
  type: SensorType;
  manufacturer: string;
  manufacture_date: string;
  created_at?: string;
}

export interface Zone {
  id: number;
  name: string;
  description: string;
  location: string;
  operational_status: ZoneStatus;
  created_at?: string;
}

export interface Monitoring {
  id: number;
  sensor_id: number;
  zone_id: number;
  install_date: string;
  reading_type: SensorType;
  threshold_value: number;
  status: MonitoringStatus;
  created_at?: string;
}

export interface CreateMonitoringDTO {
  sensor_id: number;
  zone_id: number;
  install_date: string;
  reading_type: SensorType;
  threshold_value: number;
  status?: MonitoringStatus;
}

export interface UpdateMonitoringDTO {
  threshold_value?: number;
  status?: MonitoringStatus;
}

export interface MonitoringWithDetails extends Monitoring {
  sensor_name: string;
  sensor_type: SensorType;
  zone_name: string;
  zone_location: string;
}
