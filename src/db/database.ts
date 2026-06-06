import fs from 'fs';
import path from 'path';
import sqlite3 from 'sqlite3';
import { Database, open } from 'sqlite';

const dbPath = path.resolve(process.cwd(), 'data', 'monitoring.db');
const schemaPath = path.resolve(process.cwd(), 'schema.sql');

async function ensureDataDir() {
  const directory = path.dirname(dbPath);

  if (!fs.existsSync(directory)) {
    await fs.promises.mkdir(directory, { recursive: true });
  }
}

let databaseInstance: Database | null = null;

export async function initDatabase(): Promise<Database> {
  if (databaseInstance) {
    return databaseInstance;
  }

  await ensureDataDir();

  const db = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  });

  await db.exec('PRAGMA foreign_keys = ON;');
  await db.exec('PRAGMA journal_mode = WAL;');

  const table = await db.get("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'sensors'");

  if (!table) {
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    await db.exec(schemaSql);
  }

  databaseInstance = db;
  return db;
}

export async function getDb(): Promise<Database> {
  if (databaseInstance) {
    return databaseInstance;
  }

  return initDatabase();
}

export default getDb;