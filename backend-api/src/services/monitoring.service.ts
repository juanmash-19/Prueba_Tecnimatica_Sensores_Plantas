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

/**
 * Lista todos los monitoreos con detalles del sensor y la zona asociados.
 * @param status - Filtro opcional por estado (`activo` o `pausado`).
 */
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

/**
 * Busca un monitoreo por ID, incluyendo nombre del sensor y de la zona.
 * @returns El monitoreo con detalles o `null` si no existe.
 */
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

/**
 * Asigna un sensor a una zona creando un nuevo monitoreo.
 * Valida tipo de lectura, umbral positivo, existencia de entidades y unicidad sensor-zona.
 * @throws Error con `status` 400 o 404 según el tipo de validación fallida.
 */
export async function create(dto: CreateMonitoringDTO): Promise<MonitoringWithDetails> {
  const db = getDb();

  if (!validTypes.includes(dto.reading_type)) {
    const error: any = new Error(
      `Tipo de lectura inválido: "${dto.reading_type}". Valores permitidos: ${validTypes.join(', ')}`
    );
    error.status = 400;
    throw error;
  }

  if (!(dto.threshold_value > 0)) {
    const error: any = new Error(
      `El valor umbral debe ser mayor que 0, se recibió: ${dto.threshold_value}`
    );
    error.status = 400;
    throw error;
  }

  if (dto.status && !validStatuses.includes(dto.status)) {
    const error: any = new Error(
      `Estado inválido: "${dto.status}". Valores permitidos: ${validStatuses.join(', ')}`
    );
    error.status = 400;
    throw error;
  }

  const sensor = db.prepare('SELECT id FROM sensors WHERE id = ?').get(dto.sensor_id);

  if (!sensor) {
    const error: any = new Error(`No existe un sensor con ID ${dto.sensor_id}`);
    error.status = 404;
    throw error;
  }

  const zone = db.prepare('SELECT id FROM zones WHERE id = ?').get(dto.zone_id);

  if (!zone) {
    const error: any = new Error(`No existe una zona con ID ${dto.zone_id}`);
    error.status = 404;
    throw error;
  }

  const exists = db.prepare('SELECT id FROM monitorings WHERE sensor_id = ? AND zone_id = ?').get(dto.sensor_id, dto.zone_id);

  if (exists) {
    const error: any = new Error(
      `El sensor ${dto.sensor_id} ya está asignado a la zona ${dto.zone_id}`
    );
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

/**
 * Actualiza el umbral y/o el estado de un monitoreo existente.
 * Requiere al menos uno de los campos `threshold_value` o `status`.
 * @throws Error con `status` 400 o 404 según el tipo de validación fallida.
 */
export async function update(id: number, dto: UpdateMonitoringDTO): Promise<MonitoringWithDetails> {
  const db = getDb();

  if (!dto || (dto.threshold_value === undefined && dto.status === undefined)) {
    const error: any = new Error(
      'Se debe enviar al menos un campo para actualizar: threshold_value o status'
    );
    error.status = 400;
    throw error;
  }

  const existing = db.prepare('SELECT * FROM monitorings WHERE id = ?').get(id);

  if (!existing) {
    const error: any = new Error(`No existe un monitoreo con ID ${id}`);
    error.status = 404;
    throw error;
  }

  const updates: string[] = [];
  const params: any[] = [];

  if (dto.threshold_value !== undefined) {
    if (!(dto.threshold_value > 0)) {
      const error: any = new Error(
        `El valor umbral debe ser mayor que 0, se recibió: ${dto.threshold_value}`
      );
      error.status = 400;
      throw error;
    }

    updates.push('threshold_value = ?');
    params.push(dto.threshold_value);
  }

  if (dto.status !== undefined) {
    if (!validStatuses.includes(dto.status)) {
      const error: any = new Error(
        `Estado inválido: "${dto.status}". Valores permitidos: ${validStatuses.join(', ')}`
      );
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
