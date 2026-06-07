import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../app';

const app = createApp();

describe('Rutas HTTP /api', () => {
  describe('GET /api/sensors', () => {
    it('devuelve la lista de sensores con total', async () => {
      const response = await request(app).get('/api/sensors');

      expect(response.status).toBe(200);
      expect(response.body.total).toBe(10);
      expect(response.body.data).toHaveLength(10);
      expect(response.body.data[0]).toHaveProperty('name');
    });
  });

  describe('GET /api/sensors/:id/zones', () => {
    it('devuelve zonas monitoreadas por un sensor existente', async () => {
      const response = await request(app).get('/api/sensors/1/zones');

      expect(response.status).toBe(200);
      expect(response.body.sensor.id).toBe(1);
      expect(response.body.zones.length).toBeGreaterThan(0);
      expect(response.body.total).toBe(response.body.zones.length);
    });

    it('responde 404 si el sensor no existe', async () => {
      const response = await request(app).get('/api/sensors/999/zones');

      expect(response.status).toBe(404);
      expect(response.body.error).toMatch(/no encontrado/i);
    });

    it('responde 400 si el id no es entero', async () => {
      const response = await request(app).get('/api/sensors/abc/zones');

      expect(response.status).toBe(400);
      expect(response.body.error).toMatch(/entero/i);
    });
  });

  describe('GET /api/zones', () => {
    it('devuelve la lista de zonas con total', async () => {
      const response = await request(app).get('/api/zones');

      expect(response.status).toBe(200);
      expect(response.body.total).toBe(6);
      expect(response.body.data).toHaveLength(6);
    });
  });

  describe('GET /api/zones/:id/sensors', () => {
    it('devuelve sensores activos de una zona existente', async () => {
      const response = await request(app).get('/api/zones/1/sensors');

      expect(response.status).toBe(200);
      expect(response.body.zone.id).toBe(1);
      expect(response.body.sensors.length).toBeGreaterThan(0);
    });

    it('responde 404 si la zona no existe', async () => {
      const response = await request(app).get('/api/zones/999/sensors');

      expect(response.status).toBe(404);
      expect(response.body.error).toMatch(/no encontrada/i);
    });

    it('responde 400 si el id no es entero', async () => {
      const response = await request(app).get('/api/zones/1.5/sensors');

      expect(response.status).toBe(400);
      expect(response.body.error).toMatch(/entero/i);
    });
  });

  describe('GET /api/monitorings', () => {
    it('devuelve todos los monitoreos', async () => {
      const response = await request(app).get('/api/monitorings');

      expect(response.status).toBe(200);
      expect(response.body.total).toBe(12);
    });

    it('filtra por status=activo', async () => {
      const response = await request(app).get('/api/monitorings?status=activo');

      expect(response.status).toBe(200);
      expect(response.body.data.every((m: { status: string }) => m.status === 'activo')).toBe(true);
    });

    it('responde 400 con status inválido', async () => {
      const response = await request(app).get('/api/monitorings?status=invalido');

      expect(response.status).toBe(400);
      expect(response.body.error).toMatch(/inválido/i);
    });
  });

  describe('POST /api/monitorings', () => {
    it('crea un monitoreo válido', async () => {
      const response = await request(app).post('/api/monitorings').send({
        sensor_id: 2,
        zone_id: 5,
        install_date: '2024-01-01',
        reading_type: 'flujo',
        threshold_value: 8.5,
      });

      expect(response.status).toBe(201);
      expect(response.body.sensor_id).toBe(2);
      expect(response.body.zone_id).toBe(5);
      expect(response.body.threshold_value).toBe(8.5);
    });

    it('responde 400 si faltan campos obligatorios', async () => {
      const response = await request(app).post('/api/monitorings').send({
        sensor_id: 1,
        zone_id: 2,
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toMatch(/obligatorios/i);
    });

    it('responde 400 si la asignación sensor-zona ya existe', async () => {
      const response = await request(app).post('/api/monitorings').send({
        sensor_id: 1,
        zone_id: 1,
        install_date: '2024-06-01',
        reading_type: 'temperatura',
        threshold_value: 60,
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toMatch(/ya está asignado/i);
    });
  });

  describe('PATCH /api/monitorings/:id', () => {
    it('actualiza el umbral de un monitoreo existente', async () => {
      const response = await request(app).patch('/api/monitorings/1').send({
        threshold_value: 88,
      });

      expect(response.status).toBe(200);
      expect(response.body.threshold_value).toBe(88);
    });

    it('responde 400 si no se envía ningún campo', async () => {
      const response = await request(app).patch('/api/monitorings/1').send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toMatch(/al menos un campo/i);
    });

    it('responde 404 si el monitoreo no existe', async () => {
      const response = await request(app).patch('/api/monitorings/999').send({
        status: 'pausado',
      });

      expect(response.status).toBe(404);
      expect(response.body.error).toMatch(/No existe un monitoreo/i);
    });

    it('responde 400 si el id no es entero', async () => {
      const response = await request(app).patch('/api/monitorings/abc').send({
        status: 'pausado',
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toMatch(/entero/i);
    });
  });

  describe('Rutas no registradas', () => {
    it('responde 404 para endpoints inexistentes', async () => {
      const response = await request(app).get('/api/desconocido');

      expect(response.status).toBe(404);
      expect(response.body.error).toMatch(/no encontrada/i);
    });
  });
});
