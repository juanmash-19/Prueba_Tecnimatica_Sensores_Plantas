import express from 'express';
import cors from 'cors';
import routes from './routes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

/**
 * Crea y configura la aplicación Express con middleware, rutas y manejo de errores.
 * No inicia el servidor ni abre la base de datos; eso ocurre en `index.ts`.
 */
export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/api', routes);
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
