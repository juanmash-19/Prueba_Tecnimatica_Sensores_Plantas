import { Request, Response, NextFunction } from 'express';

/**
 * Middleware para rutas no registradas. Responde con HTTP 404 y el método/ruta solicitados.
 */
export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({ error: `Ruta no encontrada: ${req.method} ${req.originalUrl}` });
}

/**
 * Middleware global de errores. Oculta detalles internos en errores 500
 * y expone el stack trace solo en entorno de desarrollo.
 */
export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error(err);
  const status = err.status || 500;
  const isDev = process.env.NODE_ENV === 'development';
  const message = status === 500 ? 'Error interno del servidor' : err.message;
  const payload: any = { error: message };

  if (isDev && err.stack) {
    payload.stack = err.stack;
  }

  res.status(status).json(payload);
}
