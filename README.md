# Prueba Tecnimatica - Sensores y Zonas

Repositorio de entrega para la prueba técnica de sensores y zonas de monitoreo industrial.

## Estructura

- `backend-api` — API REST con Node.js, Express, TypeScript y SQLite
- `frontend` — Aplicación React + TypeScript + Vite + Tailwind CSS

## Requisitos

- Node.js 20.19 o superior (recomendado para Vite sin advertencias)
- npm 9 o superior
- Git

## Cómo ejecutar el proyecto completo

El frontend depende del backend. Hay que abrir 2 terminales por separado:

```bash
# Terminal 1 — API
cd backend-api
npm install
npm run dev

# Terminal 2 — Interfaz web
cd frontend
npm install
npm run dev
```

- API: http://localhost:3000/api
- App web: http://localhost:5173
- Health check: http://localhost:3000/health

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

### Funcionalidades implementadas

| Requisito | Implementación |
|-----------|----------------|
| Listado de zonas con sensores activos | `ZonesPage` — consulta `GET /zones` y `GET /zones/:id/sensors` por zona |
| Detalle de zona con sensores, tipo de lectura y umbral | `ZoneDetailPage` — muestra monitoreos, badges y lectura simulada |
| Formulario para asignar sensor a zona | `AssignSensorForm` — `POST /monitorings` |
| Indicador activo / pausado | `MonitoringStatusBadge` + controles en `MonitoringControls` |
| Alerta cuando supera el umbral | `ThresholdAlert` + barra `ReadingGauge` (lectura vía `getSimulatedReading`) |

> Las lecturas en pantalla son **simuladas de forma determinística** porque no hay tabla de lecturas reales. Esto está documentado en [DECISIONS.md](DECISIONS.md).

## Pruebas unitarias

El proyecto incluye pruebas con **Vitest**. Son opcionales: no se ejecutan al arrancar la app (`npm run dev`) ni se incluyen en el build de producción (`npm run build`).

### Backend (43 tests)

```bash
cd backend-api
npm install
npm test          # ejecuta todas las pruebas una vez
npm run test:watch  # modo interactivo (re-ejecuta al guardar)
```

**Qué se prueba:**

| Capa | Archivo | Descripción |
|------|---------|-------------|
| Servicios | `src/services/*.service.test.ts` | Lógica de negocio: consultas, validaciones, creación y actualización de monitoreos |
| HTTP | `src/test/http.routes.test.ts` | Endpoints REST con **supertest** (códigos 200, 201, 400, 404) |

**Aislamiento:** las pruebas usan SQLite **en memoria** (`src/test/testDatabase.ts`) y un mock de `getDb()` definido en `src/test/setup.ts`. La base de datos real en `data/monitoring.db` no se modifica.

**Estructura de archivos de prueba (backend):**

```
backend-api/
├── vitest.config.ts          # configuración de Vitest (solo para tests)
├── src/
│   ├── app.ts                # app Express exportable (usada por supertest)
│   ├── index.ts              # arranque del servidor en desarrollo/producción
│   ├── test/
│   │   ├── setup.ts          # mock de BD y reinicio entre tests
│   │   ├── testDatabase.ts   # creación de BD en memoria
│   │   └── http.routes.test.ts
│   └── services/
│       ├── monitoring.service.test.ts
│       ├── sensor.service.test.ts
│       └── zone.service.test.ts
```

### Frontend (11 tests)

```bash
cd frontend
npm install
npm test
npm run test:watch
```

**Qué se prueba:**

| Archivo | Descripción |
|---------|-------------|
| `src/utils/simulatedReading.test.ts` | Lecturas simuladas determinísticas y comparación contra umbral |
| `src/components/ThresholdAlert.test.tsx` | Alerta visual cuando el valor supera el umbral |
| `src/components/MonitoringStatusBadge.test.tsx` | Badge de estado activo/pausado |

**Aislamiento:** la configuración de Vitest está en `vitest.config.ts` (separada de `vite.config.ts`). Los archivos `*.test.ts(x)` y la carpeta `src/test/` se excluyen del build de la aplicación.

### Dependencias de prueba

Solo están en `devDependencies` (no se instalan en producción):

- **Backend:** `vitest`, `supertest`
- **Frontend:** `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`

**Total:** 54 pruebas (43 backend + 11 frontend). No se ejecutan al usar `npm run dev`.

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
| GET | `/health` | Verificar que el servidor está activo (extra) |

> `GET /api/zones` no aparece en el enunciado original, pero es necesario para el listado de zonas en el frontend.

## Notas de entrega

- La rama `main` contiene el backend y el frontend.
- El backend y el frontend están preparados para ejecutarse por separado.
