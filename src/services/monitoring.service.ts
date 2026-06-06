import { getDb } from '../db/database';
import { Monitoring, MonitoringWithDetails, CreateMonitoringDTO, UpdateMonitoringDTO, SensorType, MonitoringStatus } from '../types';

const validTypes: SensorType[] = ['temperatura','presion','vibracion','flujo'];
const validStatuses: MonitoringStatus[] = ['activo','pausado'];

export async function getAll(status?: MonitoringStatus): Promise<MonitoringWithDetails[]> {
  const db = await getDb();
  let sql = `SELECT m.*, s.name as sensor_name, s.type as sensor_type, z.name as zone_name, z.location as zone_location
    FROM monitorings m
    JOIN sensors s ON m.sensor_id = s.id
    JOIN zones z ON m.zone_id = z.id`;
  const params: any[] = [];
  if (status) {
    sql += ' WHERE m.status = ?';
    params.push(status);
  }
  return db.all(sql, ...params) as MonitoringWithDetails[];
}

export async function getById(id: number): Promise<MonitoringWithDetails | null> {
  const db = await getDb();
  const row = await db.get(
    `SELECT m.*, s.name as sensor_name, s.type as sensor_type, z.name as zone_name, z.location as zone_location
     FROM monitorings m
     JOIN sensors s ON m.sensor_id = s.id
     JOIN zones z ON m.zone_id = z.id
     WHERE m.id = ?`,
    id
  );
  return row || null;
}

export async function create(dto: CreateMonitoringDTO): Promise<MonitoringWithDetails> {
  const db = await getDb();
  if (!validTypes.includes(dto.reading_type)) {
    const err: any = new Error('reading_type inválido'); err.status = 400; throw err;
  }
  if (!(dto.threshold_value > 0)) {
    const err: any = new Error('threshold_value debe ser mayor que 0'); err.status = 400; throw err;
  }
  if (dto.status && !validStatuses.includes(dto.status)) {
    const err: any = new Error('status inválido'); err.status = 400; throw err;
  }

  // Check sensor and zone exist
  const sensor = await db.get('SELECT id FROM sensors WHERE id = ?', dto.sensor_id);
  if (!sensor) { const err: any = new Error('Sensor no existe'); err.status = 404; throw err; }
  const zone = await db.get('SELECT id FROM zones WHERE id = ?', dto.zone_id);
  if (!zone) { const err: any = new Error('Zone no existe'); err.status = 404; throw err; }

  // Check UNIQUE(sensor_id, zone_id)
  const exists = await db.get('SELECT id FROM monitorings WHERE sensor_id = ? AND zone_id = ?', dto.sensor_id, dto.zone_id);
  if (exists) { const err: any = new Error('Monitoring para ese sensor y zona ya existe'); err.status = 400; throw err; }

  const info = await db.run(
    `INSERT INTO monitorings (sensor_id, zone_id, install_date, reading_type, threshold_value, status)
     VALUES (?, ?, ?, ?, ?, ?)`,
    dto.sensor_id, dto.zone_id, dto.install_date, dto.reading_type, dto.threshold_value, dto.status ?? 'activo'
  );

  const id = (info as any).lastID as number;
  const created = await getById(id);
  return created as MonitoringWithDetails;
}

export async function update(id: number, dto: UpdateMonitoringDTO): Promise<MonitoringWithDetails> {
  const db = await getDb();
  if (!dto || (dto.threshold_value === undefined && dto.status === undefined)) {
    const err: any = new Error('Sin campos para actualizar'); err.status = 400; throw err;
  }
  const existing = await db.get('SELECT * FROM monitorings WHERE id = ?', id);
  if (!existing) { const err: any = new Error('Monitoring no encontrado'); err.status = 404; throw err; }

  const updates: string[] = [];
  const params: any[] = [];
  if (dto.threshold_value !== undefined) {
    if (!(dto.threshold_value > 0)) { const err: any = new Error('threshold_value debe ser mayor que 0'); err.status = 400; throw err; }
    updates.push('threshold_value = ?'); params.push(dto.threshold_value);
  }
  if (dto.status !== undefined) {
    if (!validStatuses.includes(dto.status)) { const err: any = new Error('status inválido'); err.status = 400; throw err; }
    updates.push('status = ?'); params.push(dto.status);
  }

  params.push(id);
  const sql = `UPDATE monitorings SET ${updates.join(', ')} WHERE id = ?`;
  await db.run(sql, ...params);

  const updated = await getById(id);
  return updated as MonitoringWithDetails;
}
