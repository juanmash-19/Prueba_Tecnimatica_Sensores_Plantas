import { describe, expect, it } from 'vitest';
import * as zoneService from './zone.service';

describe('zone.service', () => {
  describe('getAll', () => {
    it('devuelve las 6 zonas del esquema de prueba', async () => {
      const zones = await zoneService.getAll();
      expect(zones).toHaveLength(6);
      expect(zones[0]).toHaveProperty('operational_status');
    });
  });

  describe('getById', () => {
    it('encuentra una zona existente', async () => {
      const zone = await zoneService.getById(1);
      expect(zone).not.toBeNull();
      expect(zone?.name).toBe('Calderas');
    });

    it('devuelve null para un ID inexistente', async () => {
      const zone = await zoneService.getById(999);
      expect(zone).toBeNull();
    });
  });

  describe('getActiveSensorsByZone', () => {
    it('devuelve solo sensores con monitoreo activo en la zona', async () => {
      const sensors = await zoneService.getActiveSensorsByZone(1);
      expect(sensors.length).toBeGreaterThan(0);
      expect(sensors[0]).toHaveProperty('type');
    });

    it('no incluye sensores de monitoreos pausados', async () => {
      const sensorsActivos = await zoneService.getActiveSensorsByZone(3);
      const ids = sensorsActivos.map((s: any) => s.id);
      expect(ids).not.toContain(6);
    });

    it('devuelve array vacío para zona sin sensores activos', async () => {
      const sensors = await zoneService.getActiveSensorsByZone(5);
      expect(sensors).toHaveLength(0);
    });
  });
});
