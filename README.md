# Prueba Tecnimatica - Sensores y Zonas

Repositorio de entrega para la prueba técnica de sensores y zonas de monitoreo industrial.

## Estructura

- `backend-api` — API REST con Node.js, Express, TypeScript y SQLite
- `frontend` — Aplicación React + TypeScript + Vite + Tailwind CSS

## Requisitos

- Node.js 20.19 o superior (recomendado para Vite sin advertencias)
- npm 9 o superior
- Git

## Backend

```bash
cd backend-api
npm install
npm run dev
```

El backend corre en http://localhost:3000 y crea la base de datos automáticamente en `backend-api/data/monitoring.db`.

## Frontend

```bash
cd frontend
npm install
npm run dev
```

El frontend corre en http://localhost:5173 y consume la API en http://localhost:3000/api.

## Archivos importantes

- [DECISIONS.md](DECISIONS.md) — Decisiones técnicas del proyecto
- [backend-api/schema.sql](backend-api/schema.sql) — Esquema SQL y datos de prueba
- [README.md](README.md) — Este archivo

## Endpoints de la API

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/sensors` | Listar todos los sensores |
| GET | `/api/sensors/:id/zones` | Zonas monitoreadas por un sensor |
| GET | `/api/zones` | Listar todas las zonas |
| GET | `/api/zones/:id/sensors` | Sensores activos en una zona |
| GET | `/api/monitorings` | Listar monitoreos (filtro opcional `?status=activo\|pausado`) |
| POST | `/api/monitorings` | Asignar un sensor a una zona |
| PATCH | `/api/monitorings/:id` | Actualizar umbral o estado de un monitoreo |

## Notas de entrega

- La rama `main` contiene el backend y el frontend.
- El backend y el frontend están preparados para ejecutarse por separado.
