import { getDb } from '../db/database';
import { Zone } from '../types';

/**
 * Obtiene todas las zonas de monitoreo registradas.
 */
export async function getAll(): Promise<Zone[]> {
  const db = getDb();
  return db.prepare('SELECT * FROM zones').all() as Zone[];
}

/**
 * Busca una zona por su identificador numérico.
 * @returns La zona encontrada o `null` si no existe.
 */
export async function getById(id: number): Promise<Zone | null> {
  const db = getDb();
  return (db.prepare('SELECT * FROM zones WHERE id = ?').get(id) as Zone | undefined) || null;
}

/**
 * Devuelve los sensores con monitoreo activo en una zona específica.
 * Solo incluye asignaciones cuyo estado de monitoreo es `activo`.
 * @param zoneId - ID de la zona a consultar.
 */
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
