# Prueba Tecnimatica - Sensores y Zonas

Repositorio de entrega para la prueba técnica de sensores y zonas de monitoreo industrial.

## Estructura

- [backend-api/backend](backend-api/backend) - API REST con Node.js, Express, TypeScript y SQLite
- [frontend](frontend) - Aplicación React + TypeScript + Vite + Tailwind CSS

## Requisitos

- Node.js 20.19 o superior para ejecutar Vite sin advertencias
- npm 9 o superior
- Git

## Backend

```bash
cd backend-api/backend
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

- [DECISIONS.md](DECISIONS.md)
- [backend-api/backend/schema.sql](backend-api/backend/schema.sql)
- [backend-api/backend/README.md](backend-api/backend/README.md)

## Notas de entrega

- La rama `main` contiene el backend y el frontend.
- El backend y el frontend están preparados para ejecutarse por separado.