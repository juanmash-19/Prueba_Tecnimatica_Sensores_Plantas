import { afterEach, beforeEach, vi } from 'vitest';
import { closeTestDatabase, createTestDatabase } from './testDatabase';

let testDb = createTestDatabase();

vi.mock('../db/database', () => ({
  getDb: () => testDb,
  initDatabase: () => testDb,
  default: () => testDb,
}));

beforeEach(() => {
  closeTestDatabase(testDb);
  testDb = createTestDatabase();
});

afterEach(() => {
  closeTestDatabase(testDb);
});
