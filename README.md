# Prueba_Tecnimatica_Sensores_Plantas

Backend del sistema de sensores y zonas de monitoreo industrial.

## Requisitos

- Node.js 20.18.2 o superior
- npm 10 o superior

## Instalación

```bash
npm install
```

## Desarrollo

```bash
npm run dev
```

El servidor arranca en `http://localhost:3000`.

## Base de datos

La base SQLite se crea automáticamente en `../../data/monitoring.db` cuando el backend inicia por primera vez.
El esquema y los datos de ejemplo se cargan desde `schema.sql` si la base está vacía.

## Endpoints

- `GET /api/sensors`
- `GET /api/sensors/:id/zones`
- `GET /api/zones/:id/sensors`
- `GET /api/monitorings`
- `POST /api/monitorings`
- `PATCH /api/monitorings/:id`
