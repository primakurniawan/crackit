import { NextRequest, NextResponse } from 'next/server';
import { initDb } from '@/lib/db';
import { upsertQuestions } from '@/lib/questions';
import { generateAllCategories } from '@/lib/gemini';

export async function GET(request: NextRequest) {
  // Verify cron secret to prevent unauthorized calls
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({ error: 'GEMINI_API_KEY not configured' }, { status: 500 });
  }

  try {
    await initDb();

    console.log('[Cron] Starting AI question generation...');
    const newCards = await generateAllCategories();

    if (newCards.length === 0) {
      return NextResponse.json({ message: 'No new cards generated', count: 0 });
    }

    await upsertQuestions(newCards);

    console.log(`[Cron] Successfully added ${newCards.length} AI-generated questions`);
    return NextResponse.json({
      success: true,
      count: newCards.length,
      message: `Generated and saved ${newCards.length} new questions`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Cron] refresh-questions error:', error);
    return NextResponse.json({ error: 'Cron job failed', details: String(error) }, { status: 500 });
  }
}
