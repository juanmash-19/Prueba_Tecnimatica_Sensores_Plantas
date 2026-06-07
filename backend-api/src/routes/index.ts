/**
 * Rutas de la API REST de monitoreo industrial.
 * Prefijo montado en /api desde app.ts (p. ej. GET /api/sensors).
 */
import { Router } from 'express';
import * as sensorController from '../controllers/sensor.controller';
import * as zoneController from '../controllers/zone.controller';
import * as monitoringController from '../controllers/monitoring.controller';

const router = Router();

router.get('/sensors', sensorController.getAll);
router.get('/sensors/:id/zones', sensorController.getZones);
router.get('/zones', zoneController.getAll);
router.get('/zones/:id/sensors', zoneController.getActiveSensors);
router.get('/monitorings', monitoringController.getAll);
router.post('/monitorings', monitoringController.create);
router.patch('/monitorings/:id', monitoringController.update);

export default router;