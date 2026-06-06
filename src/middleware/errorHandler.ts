import { Request, Response, NextFunction } from 'express';

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({ error: `Ruta no encontrada: ${req.method} ${req.originalUrl}` });
}

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error(err);
  const status = err.status || 500;
  const isDev = process.env.NODE_ENV === 'development';
  const message = status === 500 ? 'Error interno del servidor' : err.message;
  const payload: any = { error: message };
  if (isDev && err.stack) payload.stack = err.stack;
  res.status(status).json(payload);
}
