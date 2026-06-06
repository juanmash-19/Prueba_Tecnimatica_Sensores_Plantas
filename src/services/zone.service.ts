import { getDb } from '../db/database';
import { Zone } from '../types';

export async function getAll(): Promise<Zone[]> {
  const db = await getDb();
  return db.all('SELECT * FROM zones');
}

export async function getById(id: number): Promise<Zone | null> {
  const db = await getDb();
  return (await db.get('SELECT * FROM zones WHERE id = ?', id)) || null;
}

export async function getActiveSensorsByZone(zoneId: number) {
  const db = await getDb();
  return db.all(
    `SELECT s.* FROM sensors s
     JOIN monitorings m ON m.sensor_id = s.id
     WHERE m.zone_id = ? AND m.status = 'activo'`,
    zoneId
  );
}