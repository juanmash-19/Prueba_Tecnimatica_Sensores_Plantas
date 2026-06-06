import fs from 'fs';
import path from 'path';
import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';

// Use the absolute path requested by the user
const DB_PATH = path.resolve('C:/Users/juanm/Downloads/Prueba/monitoring.db');

async function ensureDataDir() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) await fs.promises.mkdir(dir, { recursive: true });
}

let _db: Database | null = null;

export async function initDatabase(): Promise<Database> {
  if (_db) return _db;
  await ensureDataDir();
  const db = await open({ filename: DB_PATH, driver: sqlite3.Database });
  await db.exec("PRAGMA foreign_keys = ON;");
  await db.exec("PRAGMA journal_mode = WAL;");

  const row = await db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='sensors'");
  if (!row) {
    const schemaSql = fs.readFileSync(path.resolve(__dirname, '../../schema.sql'), 'utf8');
    await db.exec(schemaSql);
  }

  _db = db;
  return db;
}

export async function getDb(): Promise<Database> {
  if (_db) return _db;
  return initDatabase();
}

export default getDb;
