import { NextRequest, NextResponse } from 'next/server';
import { SEED_QUESTIONS } from '@/lib/seed-questions';
import type { GameCategory, Card } from '@/types';

// Try to import DB — gracefully fail if not configured
async function tryGetFromDb(params: { category?: string; tone?: string; type?: string }): Promise<Card[] | null> {
  const dbUrl = process.env.TURSO_DATABASE_URL;
  if (!dbUrl || dbUrl.includes('localhost:8080') || dbUrl === 'placeholder') {
    return null; // Use seed fallback
  }

  try {
    const { initDb } = await import('@/lib/db');
    const { getQuestions } = await import('@/lib/questions');
    await initDb();

    // Seed on first run
    const existing = await getQuestions({ approvedOnly: false });
    if (existing.length === 0) {
      const { insertQuestion } = await import('@/lib/questions');
      for (const q of SEED_QUESTIONS) {
        await insertQuestion(q);
      }
    }

    return getQuestions({
      ...(params.category && { category: params.category as GameCategory }),
      ...(params.tone && { tone: params.tone }),
      ...(params.type && { type: params.type as 'truth' | 'dare' }),
      approvedOnly: true,
    });
  } catch (err) {
    console.warn('DB unavailable, using seed fallback:', err);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const tone = searchParams.get('tone');
    const type = searchParams.get('type');

    // Try DB first, fall back to seed data
    let questions = await tryGetFromDb({ category: category ?? undefined, tone: tone ?? undefined, type: type ?? undefined });

    if (!questions) {
      // Seed fallback — filter in memory
      questions = SEED_QUESTIONS.filter((q) => {
        if (category && q.category !== category) return false;
        if (tone && q.tone !== tone) return false;
        if (type && q.type !== type) return false;
        return true;
      }) as Card[];
    }

    return NextResponse.json({ questions, count: questions.length });
  } catch (error) {
    console.error('GET /api/questions error:', error);
    return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, category, tone, text } = body;

    if (!type || !category || !tone || !text) {
      return NextResponse.json({ error: 'Missing required fields: type, category, tone, text' }, { status: 400 });
    }

    const dbUrl = process.env.TURSO_DATABASE_URL;
    if (!dbUrl || dbUrl.includes('localhost:8080')) {
      // In dev/no-DB mode, just acknowledge the submission
      return NextResponse.json({
        success: true,
        id: `local_${Date.now()}`,
        message: 'Suggestion received! (Running in local mode — connect Turso DB for persistence)',
      }, { status: 201 });
    }

    const { initDb } = await import('@/lib/db');
    const { insertQuestion } = await import('@/lib/questions');
    await initDb();

    const id = await insertQuestion({
      type,
      category,
      tone,
      text: text.trim(),
      isCustom: true,
      source: 'user',
    });

    return NextResponse.json({ success: true, id, message: 'Question submitted for review!' }, { status: 201 });
  } catch (error) {
    console.error('POST /api/questions error:', error);
    return NextResponse.json({ error: 'Failed to submit question' }, { status: 500 });
  }
}
