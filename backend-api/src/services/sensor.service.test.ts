import { describe, expect, it } from 'vitest';
import * as sensorService from './sensor.service';

describe('sensor.service', () => {
  describe('getAll', () => {
    it('devuelve los 10 sensores del esquema de prueba', async () => {
      const sensors = await sensorService.getAll();
      expect(sensors).toHaveLength(10);
      expect(sensors[0]).toHaveProperty('name');
      expect(sensors[0]).toHaveProperty('type');
    });
  });

  describe('getById', () => {
    it('encuentra un sensor existente', async () => {
      const sensor = await sensorService.getById(1);
      expect(sensor).not.toBeNull();
      expect(sensor?.name).toBe('TempSensor-A');
      expect(sensor?.type).toBe('temperatura');
    });

    it('devuelve null para un ID inexistente', async () => {
      const sensor = await sensorService.getById(999);
      expect(sensor).toBeNull();
    });
  });

  describe('getZonesBySensor', () => {
    it('devuelve las zonas monitoreadas por un sensor', async () => {
      const zones = await sensorService.getZonesBySensor(1);
      expect(zones.length).toBeGreaterThanOrEqual(2);
      expect(zones[0]).toHaveProperty('zone');
      expect(zones[0]).toHaveProperty('monitoring');
      expect(zones[0].zone).toHaveProperty('name');
      expect(zones[0].monitoring).toHaveProperty('threshold_value');
    });

    it('devuelve array vacío para sensor sin asignaciones', async () => {
      const zones = await sensorService.getZonesBySensor(999);
      expect(zones).toHaveLength(0);
    });
  });
});
