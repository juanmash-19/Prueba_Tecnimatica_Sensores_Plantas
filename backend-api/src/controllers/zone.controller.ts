import { NextFunction, Request, Response } from 'express';
import * as zoneService from '../services/zone.service';

export async function getActiveSensors(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({ error: 'id debe ser entero' });
    }

    const zone = await zoneService.getById(id);

    if (!zone) {
      return res.status(404).json({ error: 'Zone no encontrada' });
    }

    const sensors = await zoneService.getActiveSensorsByZone(id);
    res.json({ zone, sensors, total: sensors.length });
  } catch (error) {
    next(error);
  }
}