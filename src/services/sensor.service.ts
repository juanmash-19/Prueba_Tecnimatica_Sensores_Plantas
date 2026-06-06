import { getDb } from '../db/database';
import { Sensor } from '../types';

export async function getAll(): Promise<Sensor[]> {
  const db = await getDb();
  return db.all('SELECT * FROM sensors');
}

export async function getById(id: number): Promise<Sensor | null> {
  const db = await getDb();
  return (await db.get('SELECT * FROM sensors WHERE id = ?', id)) || null;
}

export async function getZonesBySensor(sensorId: number) {
  const db = await getDb();
  const rows = await db.all(
    `SELECT z.id as zone_id, z.name as zone_name, z.description, z.location, z.operational_status,
           m.id as monitoring_id, m.install_date, m.reading_type, m.threshold_value, m.status as monitoring_status
     FROM monitorings m
     JOIN zones z ON m.zone_id = z.id
     WHERE m.sensor_id = ?`,
    sensorId
  );

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