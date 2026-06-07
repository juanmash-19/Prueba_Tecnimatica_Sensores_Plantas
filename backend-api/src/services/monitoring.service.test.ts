import { describe, expect, it } from 'vitest';
import * as monitoringService from './monitoring.service';

describe('monitoring.service', () => {
  describe('getAll', () => {
    it('devuelve todos los monitoreos del esquema de prueba', async () => {
      const monitorings = await monitoringService.getAll();
      expect(monitorings.length).toBe(12);
    });

    it('filtra por estado activo', async () => {
      const activos = await monitoringService.getAll('activo');
      expect(activos.every((m) => m.status === 'activo')).toBe(true);
      expect(activos.length).toBeGreaterThan(0);
    });

    it('filtra por estado pausado', async () => {
      const pausados = await monitoringService.getAll('pausado');
      expect(pausados.every((m) => m.status === 'pausado')).toBe(true);
      expect(pausados.length).toBe(3);
    });
  });

  describe('create', () => {
    it('crea un monitoreo válido con sensor y zona existentes', async () => {
      const created = await monitoringService.create({
        sensor_id: 2,
        zone_id: 5,
        install_date: '2024-01-01',
        reading_type: 'flujo',
        threshold_value: 8.5,
      });

      expect(created.sensor_id).toBe(2);
      expect(created.zone_id).toBe(5);
      expect(created.threshold_value).toBe(8.5);
      expect(created.status).toBe('activo');
      expect(created.sensor_name).toBeTruthy();
      expect(created.zone_name).toBeTruthy();
    });

    it('rechaza tipo de lectura inválido', async () => {
      await expect(
        monitoringService.create({
          sensor_id: 1,
          zone_id: 3,
          install_date: '2024-01-01',
          reading_type: 'humedad' as any,
          threshold_value: 10,
        }),
      ).rejects.toMatchObject({ status: 400, message: expect.stringContaining('Tipo de lectura inválido') });
    });

    it('rechaza umbral menor o igual a cero', async () => {
      await expect(
        monitoringService.create({
          sensor_id: 1,
          zone_id: 3,
          install_date: '2024-01-01',
          reading_type: 'temperatura',
          threshold_value: 0,
        }),
      ).rejects.toMatchObject({ status: 400, message: expect.stringContaining('umbral') });
    });

    it('rechaza sensor inexistente', async () => {
      await expect(
        monitoringService.create({
          sensor_id: 999,
          zone_id: 1,
          install_date: '2024-01-01',
          reading_type: 'temperatura',
          threshold_value: 50,
        }),
      ).rejects.toMatchObject({ status: 404 });
    });

    it('rechaza asignación duplicada sensor-zona', async () => {
      await expect(
        monitoringService.create({
          sensor_id: 1,
          zone_id: 1,
          install_date: '2024-06-01',
          reading_type: 'temperatura',
          threshold_value: 60,
        }),
      ).rejects.toMatchObject({
        status: 400,
        message: expect.stringContaining('ya está asignado'),
      });
    });
  });

  describe('update', () => {
    it('actualiza el umbral de un monitoreo existente', async () => {
      const updated = await monitoringService.update(1, { threshold_value: 90 });
      expect(updated.threshold_value).toBe(90);
    });

    it('actualiza el estado a pausado', async () => {
      const updated = await monitoringService.update(1, { status: 'pausado' });
      expect(updated.status).toBe('pausado');
    });

    it('rechaza actualización sin campos', async () => {
      await expect(monitoringService.update(1, {})).rejects.toMatchObject({ status: 400 });
    });

    it('rechaza umbral inválido en actualización', async () => {
      await expect(monitoringService.update(1, { threshold_value: -5 })).rejects.toMatchObject({ status: 400 });
    });

    it('rechaza monitoreo inexistente', async () => {
      await expect(monitoringService.update(999, { status: 'pausado' })).rejects.toMatchObject({ status: 404 });
    });
  });
});
