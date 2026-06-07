import { getDb } from '../db/database';
import { Sensor } from '../types';

/**
 * Obtiene todos los sensores registrados en el sistema.
 */
export async function getAll(): Promise<Sensor[]> {
  const db = getDb();
  return db.prepare('SELECT * FROM sensors').all() as Sensor[];
}

/**
 * Busca un sensor por su identificador numérico.
 * @returns El sensor encontrado o `null` si no existe.
 */
export async function getById(id: number): Promise<Sensor | null> {
  const db = getDb();
  return (db.prepare('SELECT * FROM sensors WHERE id = ?').get(id) as Sensor | undefined) || null;
}

/**
 * Lista las zonas monitoreadas por un sensor (GET /sensors/:id/zones).
 * Incluye datos de la relación: fecha de instalación, tipo de lectura, umbral y estado.
 * @param sensorId - ID del sensor a consultar.
 */
export async function getZonesBySensor(sensorId: number) {
  const db = getDb();
  const rows = db
    .prepare(
    `SELECT z.id as zone_id, z.name as zone_name, z.description, z.location, z.operational_status,
           m.id as monitoring_id, m.install_date, m.reading_type, m.threshold_value, m.status as monitoring_status
     FROM monitorings m
     JOIN zones z ON m.zone_id = z.id
     WHERE m.sensor_id = ?`
    )
    .all(sensorId) as Array<{
      zone_id: number;
      zone_name: string;
      description: string;
      location: string;
      operational_status: string;
      monitoring_id: number;
      install_date: string;
      reading_type: string;
      threshold_value: number;
      monitoring_status: string;
    }>;

  return rows.map((row: any) => ({
    zone: {
      id: row.zone_id,
      name: row.zone_name,
      description: row.description,
      location: row.location,
      operational_status: row.operational_status,
    },
    monitoring: {
      id: row.monitoring_id,
      install_date: row.install_date,
      reading_type: row.reading_type,
      threshold_value: row.threshold_value,
      status: row.monitoring_status,
    },
  }));
}
