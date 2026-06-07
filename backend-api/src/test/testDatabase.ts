import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';

const schemaPath = path.resolve(__dirname, '../../schema.sql');

/**
 * Crea una base de datos SQLite en memoria con el esquema completo.
 * Solo se usa en pruebas unitarias; no forma parte del runtime de la API.
 */
export function createTestDatabase(): Database.Database {
  const db = new Database(':memory:');
  db.pragma('foreign_keys = ON');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');
  db.exec(schemaSql);
  return db;
}

/**
 * Cierra una base de datos de prueba en memoria.
 */
export function closeTestDatabase(db: Database.Database): void {
  db.close();
}
