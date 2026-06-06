import { getDb } from '../db/database';
import { Zone } from '../types';

export async function getAll(): Promise<Zone[]> {
  const db = getDb();
  return db.prepare('SELECT * FROM zones').all() as Zone[];
}

export async function getById(id: number): Promise<Zone | null> {
  const db = getDb();
  return (db.prepare('SELECT * FROM zones WHERE id = ?').get(id) as Zone | undefined) || null;
}

export async function getActiveSensorsByZone(zoneId: number) {
  const db = getDb();
  return db
    .prepare(
    `SELECT s.* FROM sensors s
     JOIN monitorings m ON m.sensor_id = s.id
     WHERE m.zone_id = ? AND m.status = 'activo'`
    )
    .all(zoneId);
}