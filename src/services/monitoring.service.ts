import { getDb } from '../db/database';
import {
  CreateMonitoringDTO,
  MonitoringStatus,
  MonitoringWithDetails,
  SensorType,
  UpdateMonitoringDTO,
} from '../types';

const validTypes: SensorType[] = ['temperatura', 'presion', 'vibracion', 'flujo'];
const validStatuses: MonitoringStatus[] = ['activo', 'pausado'];

export async function getAll(status?: MonitoringStatus): Promise<MonitoringWithDetails[]> {
  const db = getDb();
  let sql = `SELECT m.*, s.name as sensor_name, s.type as sensor_type, z.name as zone_name, z.location as zone_location
    FROM monitorings m
    JOIN sensors s ON m.sensor_id = s.id
    JOIN zones z ON m.zone_id = z.id`;
  const params: any[] = [];

  if (status) {
    sql += ' WHERE m.status = ?';
    params.push(status);
  }

  return db.prepare(sql).all(...params) as MonitoringWithDetails[];
}

export async function getById(id: number): Promise<MonitoringWithDetails | null> {
  const db = getDb();
  const row = db.prepare(
    `SELECT m.*, s.name as sensor_name, s.type as sensor_type, z.name as zone_name, z.location as zone_location
     FROM monitorings m
     JOIN sensors s ON m.sensor_id = s.id
     JOIN zones z ON m.zone_id = z.id
     WHERE m.id = ?`
  ).get(id) as MonitoringWithDetails | undefined;

  return row || null;
}

export async function create(dto: CreateMonitoringDTO): Promise<MonitoringWithDetails> {
  const db = getDb();

  if (!validTypes.includes(dto.reading_type)) {
    const error: any = new Error('reading_type inválido');
    error.status = 400;
    throw error;
  }

  if (!(dto.threshold_value > 0)) {
    const error: any = new Error('threshold_value debe ser mayor que 0');
    error.status = 400;
    throw error;
  }

  if (dto.status && !validStatuses.includes(dto.status)) {
    const error: any = new Error('status inválido');
    error.status = 400;
    throw error;
  }

  const sensor = db.prepare('SELECT id FROM sensors WHERE id = ?').get(dto.sensor_id);

  if (!sensor) {
    const error: any = new Error('Sensor no existe');
    error.status = 404;
    throw error;
  }

  const zone = db.prepare('SELECT id FROM zones WHERE id = ?').get(dto.zone_id);

  if (!zone) {
    const error: any = new Error('Zone no existe');
    error.status = 404;
    throw error;
  }

  const exists = db.prepare('SELECT id FROM monitorings WHERE sensor_id = ? AND zone_id = ?').get(dto.sensor_id, dto.zone_id);

  if (exists) {
    const error: any = new Error('Monitoring para ese sensor y zona ya existe');
    error.status = 400;
    throw error;
  }

  const info = db.prepare(
    `INSERT INTO monitorings (sensor_id, zone_id, install_date, reading_type, threshold_value, status)
     VALUES (?, ?, ?, ?, ?, ?)`,
  ).run(dto.sensor_id, dto.zone_id, dto.install_date, dto.reading_type, dto.threshold_value, dto.status ?? 'activo');

  const id = Number(info.lastInsertRowid);
  const created = await getById(id);

  return created as MonitoringWithDetails;
}

export async function update(id: number, dto: UpdateMonitoringDTO): Promise<MonitoringWithDetails> {
  const db = getDb();

  if (!dto || (dto.threshold_value === undefined && dto.status === undefined)) {
    const error: any = new Error('Sin campos para actualizar');
    error.status = 400;
    throw error;
  }

  const existing = db.prepare('SELECT * FROM monitorings WHERE id = ?').get(id);

  if (!existing) {
    const error: any = new Error('Monitoring no encontrado');
    error.status = 404;
    throw error;
  }

  const updates: string[] = [];
  const params: any[] = [];

  if (dto.threshold_value !== undefined) {
    if (!(dto.threshold_value > 0)) {
      const error: any = new Error('threshold_value debe ser mayor que 0');
      error.status = 400;
      throw error;
    }

    updates.push('threshold_value = ?');
    params.push(dto.threshold_value);
  }

  if (dto.status !== undefined) {
    if (!validStatuses.includes(dto.status)) {
      const error: any = new Error('status inválido');
      error.status = 400;
      throw error;
    }

    updates.push('status = ?');
    params.push(dto.status);
  }

  params.push(id);
  const sql = `UPDATE monitorings SET ${updates.join(', ')} WHERE id = ?`;
  db.prepare(sql).run(...params);

  const updated = await getById(id);

  return updated as MonitoringWithDetails;
}