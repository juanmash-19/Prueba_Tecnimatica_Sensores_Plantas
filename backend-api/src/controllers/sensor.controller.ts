import { NextFunction, Request, Response } from 'express';
import * as sensorService from '../services/sensor.service';

/**
 * GET /api/sensors — Devuelve la lista completa de sensores.
 */
export async function getAll(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await sensorService.getAll();
    res.json({ data, total: data.length });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/sensors/:id/zones — Devuelve las zonas monitoreadas por un sensor.
 * Valida que el parámetro `id` sea un entero y que el sensor exista.
 */
export async function getZones(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({ error: 'id debe ser entero' });
    }

    const sensor = await sensorService.getById(id);

    if (!sensor) {
      return res.status(404).json({ error: 'Sensor no encontrado' });
    }

    const zones = await sensorService.getZonesBySensor(id);
    res.json({ sensor, zones, total: zones.length });
  } catch (error) {
    next(error);
  }
}
