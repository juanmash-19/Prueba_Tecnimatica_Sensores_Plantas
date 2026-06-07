import { NextFunction, Request, Response } from 'express';
import * as zoneService from '../services/zone.service';

/**
 * GET /api/zones — Devuelve la lista completa de zonas de monitoreo.
 */
export async function getAll(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await zoneService.getAll();
    res.json({ data, total: data.length });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/zones/:id/sensors — Devuelve los sensores activos asignados a una zona.
 * Valida que el parámetro `id` sea un entero y que la zona exista.
 */
export async function getActiveSensors(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({ error: 'id debe ser entero' });
    }

    const zone = await zoneService.getById(id);

    if (!zone) {
      return res.status(404).json({ error: `Zona con ID ${id} no encontrada` });
    }

    const sensors = await zoneService.getActiveSensorsByZone(id);
    res.json({ zone, sensors, total: sensors.length });
  } catch (error) {
    next(error);
  }
}
