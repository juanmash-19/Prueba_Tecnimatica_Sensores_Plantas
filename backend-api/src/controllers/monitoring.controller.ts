import { NextFunction, Request, Response } from 'express';
import * as monitoringService from '../services/monitoring.service';
import { CreateMonitoringDTO, UpdateMonitoringDTO } from '../types';

/**
 * GET /api/monitorings — Lista monitoreos, con filtro opcional por `?status=activo|pausado`.
 */
export async function getAll(req: Request, res: Response, next: NextFunction) {
  try {
    const status = req.query.status as any;

    if (status && status !== 'activo' && status !== 'pausado') {
      return res.status(400).json({ error: 'status inválido' });
    }

    const data = await monitoringService.getAll(status as any);
    res.json({ data, total: data.length });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/monitorings — Crea una nueva asignación sensor-zona.
 * Valida campos obligatorios antes de delegar al servicio de negocio.
 */
export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const dto = req.body as CreateMonitoringDTO;

    if (
      !dto ||
      dto.sensor_id === undefined ||
      dto.zone_id === undefined ||
      !dto.install_date ||
      !dto.reading_type ||
      dto.threshold_value === undefined
    ) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    const created = await monitoringService.create(dto);
    res.status(201).json(created);
  } catch (error: any) {
    if (error.status) {
      return res.status(error.status).json({ error: error.message });
    }

    next(error);
  }
}

/**
 * PATCH /api/monitorings/:id — Actualiza umbral y/o estado de un monitoreo.
 * Valida que el parámetro `id` sea un entero antes de aplicar cambios.
 */
export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({ error: 'id debe ser entero' });
    }

    const dto = req.body as UpdateMonitoringDTO;
    const updated = await monitoringService.update(id, dto);
    res.json(updated);
  } catch (error: any) {
    if (error.status) {
      return res.status(error.status).json({ error: error.message });
    }

    next(error);
  }
}
