import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';

const dbPath = path.resolve(__dirname, '../../data/monitoring.db');
const schemaPath = path.resolve(__dirname, '../../schema.sql');

function ensureDataDir() {
  const directory = path.dirname(dbPath);

  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
}

function createDatabase() {
  ensureDataDir();

  const db = new Database(dbPath);
  db.pragma('foreign_keys = ON');
  db.pragma('journal_mode = WAL');

  const sensorsTable = db.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'sensors'").get();
  const sensorsCount = sensorsTable
    ? (db.prepare('SELECT COUNT(*) as count FROM sensors').get() as { count: number })
    : { count: 0 };

  if (!sensorsTable || sensorsCount.count === 0) {
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    db.exec(schemaSql);
  }

  return db;
}

type DatabaseConnection = ReturnType<typeof createDatabase>;

let databaseInstance: DatabaseConnection | null = null;

export function initDatabase(): DatabaseConnection {
  if (databaseInstance) {
    return databaseInstance;
  }

  databaseInstance = createDatabase();
  return databaseInstance;
}

export function getDb(): DatabaseConnection {
  return databaseInstance ?? initDatabase();
}

export default getDb;