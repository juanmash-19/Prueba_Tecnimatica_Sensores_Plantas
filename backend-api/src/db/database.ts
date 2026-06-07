import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';

const dbPath = path.resolve(__dirname, '../../data/monitoring.db');
const schemaPath = path.resolve(__dirname, '../../schema.sql');

/**
 * Crea el directorio `data/` si no existe para almacenar el archivo SQLite.
 */
function ensureDataDir() {
  const directory = path.dirname(dbPath);

  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
}

/**
 * Abre o inicializa la base de datos SQLite.
 * Si las tablas no existen o están vacías, ejecuta el esquema con datos de prueba.
 */
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

/**
 * Inicializa la conexión singleton a la base de datos de producción/desarrollo.
 * Reutiliza la instancia existente si ya fue creada.
 */
export function initDatabase(): DatabaseConnection {
  if (databaseInstance) {
    return databaseInstance;
  }

  databaseInstance = createDatabase();
  return databaseInstance;
}

/**
 * Devuelve la instancia activa de la base de datos, inicializándola si es necesario.
 */
export function getDb(): DatabaseConnection {
  return databaseInstance ?? initDatabase();
}

export default getDb;
