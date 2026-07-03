import { db } from './db';
import type { Card, GameCategory } from '@/types';

export interface QuestionFilter {
  category?: GameCategory;
  tone?: string;
  type?: 'truth' | 'dare';
  source?: 'seed' | 'ai' | 'user';
  approvedOnly?: boolean;
}

export async function getQuestions(filter: QuestionFilter = {}): Promise<Card[]> {
  const conditions: string[] = ['1=1'];
  const args: Record<string, string | number> = {};

  if (filter.category) {
    conditions.push('category = :category');
    args[':category'] = filter.category;
  }
  if (filter.tone) {
    conditions.push('tone = :tone');
    args[':tone'] = filter.tone;
  }
  if (filter.type) {
    conditions.push('type = :type');
    args[':type'] = filter.type;
  }
  if (filter.source) {
    conditions.push('source = :source');
    args[':source'] = filter.source;
  }
  if (filter.approvedOnly !== false) {
    conditions.push('approved = 1');
  }

  const sql = `SELECT id, type, category, tone, text, is_custom, source FROM questions WHERE ${conditions.join(' AND ')} ORDER BY created_at DESC`;
  const result = await db.execute({ sql, args });

  return result.rows.map((row) => ({
    id: row.id as string,
    type: row.type as 'truth' | 'dare',
    category: row.category as GameCategory,
    tone: row.tone as string,
    text: row.text as string,
    isCustom: Boolean(row.is_custom),
    source: row.source as 'seed' | 'ai' | 'user',
  }));
}

export async function insertQuestion(card: Omit<Card, 'id'> & { id?: string }): Promise<string> {
  const id = card.id ?? `q_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  await db.execute({
    sql: `INSERT OR IGNORE INTO questions (id, type, category, tone, text, is_custom, source, approved)
          VALUES (:id, :type, :category, :tone, :text, :is_custom, :source, :approved)`,
    args: {
      ':id': id,
      ':type': card.type,
      ':category': card.category,
      ':tone': card.tone,
      ':text': card.text,
      ':is_custom': card.isCustom ? 1 : 0,
      ':source': card.source ?? 'seed',
      ':approved': card.source === 'user' ? 0 : 1,
    },
  });
  return id;
}

export async function upsertQuestions(cards: Array<Omit<Card, 'id'> & { id?: string }>): Promise<void> {
  for (const card of cards) {
    const id = card.id ?? `q_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    await db.execute({
      sql: `INSERT OR REPLACE INTO questions (id, type, category, tone, text, is_custom, source, approved)
            VALUES (:id, :type, :category, :tone, :text, :is_custom, :source, :approved)`,
      args: {
        ':id': id,
        ':type': card.type,
        ':category': card.category,
        ':tone': card.tone,
        ':text': card.text,
        ':is_custom': card.isCustom ? 1 : 0,
        ':source': card.source ?? 'ai',
        ':approved': 1,
      },
    });
  }
}

export async function deleteQuestion(id: string): Promise<void> {
  await db.execute({ sql: 'DELETE FROM questions WHERE id = :id', args: { ':id': id } });
}

export async function approveQuestion(id: string): Promise<void> {
  await db.execute({
    sql: 'UPDATE questions SET approved = 1 WHERE id = :id',
    args: { ':id': id },
  });
}

export async function getStats(): Promise<{ total: number; ai: number; user: number; seed: number }> {
  const result = await db.execute(`
    SELECT
      COUNT(*) as total,
      SUM(CASE WHEN source='ai' THEN 1 ELSE 0 END) as ai,
      SUM(CASE WHEN source='user' THEN 1 ELSE 0 END) as user_count,
      SUM(CASE WHEN source='seed' THEN 1 ELSE 0 END) as seed
    FROM questions WHERE approved = 1
  `);
  const row = result.rows[0];
  return {
    total: Number(row?.total ?? 0),
    ai: Number(row?.ai ?? 0),
    user: Number(row?.user_count ?? 0),
    seed: Number(row?.seed ?? 0),
  };
}
