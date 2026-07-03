import { createClient } from '@libsql/client';

let _db: ReturnType<typeof createClient> | null = null;

export function getDb() {
  if (_db) return _db;

  const url = process.env.TURSO_DATABASE_URL;
  if (!url) throw new Error('TURSO_DATABASE_URL is not set');

  _db = createClient({
    url,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
  return _db;
}

// Alias for convenience
export const db = new Proxy({} as ReturnType<typeof createClient>, {
  get(_, prop) {
    return (getDb() as any)[prop];
  },
});

export async function initDb() {
  const client = getDb();
  await client.executeMultiple(`
    CREATE TABLE IF NOT EXISTS questions (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL CHECK(type IN ('truth', 'dare')),
      category TEXT NOT NULL,
      tone TEXT NOT NULL,
      text TEXT NOT NULL,
      is_custom INTEGER NOT NULL DEFAULT 0,
      source TEXT NOT NULL DEFAULT 'seed' CHECK(source IN ('seed', 'ai', 'user')),
      approved INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_questions_category ON questions(category);
    CREATE INDEX IF NOT EXISTS idx_questions_tone ON questions(tone);
    CREATE INDEX IF NOT EXISTS idx_questions_source ON questions(source);
  `);
}
