import { GoogleGenerativeAI } from '@google/generative-ai';
import type { Card, GameCategory } from '@/types';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const CATEGORY_CONFIGS: Array<{ category: GameCategory; tone: string; context: string }> = [
  { category: 'relationship', tone: 'playful', context: 'fun, lighthearted questions for couples' },
  { category: 'relationship', tone: 'deep', context: 'meaningful, emotionally deep questions for couples' },
  { category: 'relationship', tone: 'spicy', context: 'flirty, romantic, slightly daring questions for couples (keep tasteful)' },
  { category: 'friends', tone: 'funny', context: 'hilarious, embarrassing questions for friend groups' },
  { category: 'friends', tone: 'deep', context: 'deep friendship bonding questions' },
  { category: 'friends', tone: 'awkward', context: 'fun, awkward icebreaker questions for friend groups' },
  { category: 'family', tone: 'warm', context: 'warm, loving questions for family gatherings' },
  { category: 'family', tone: 'nostalgic', context: 'memory-based nostalgic questions for family reunions' },
  { category: 'seminar', tone: 'professional', context: 'professional icebreaker questions for work events' },
  { category: 'seminar', tone: 'creative', context: 'fun, creative questions for workshops and seminars' },
];

export async function generateQuestionsForConfig(
  category: GameCategory,
  tone: string,
  count: number = 5
): Promise<Array<Omit<Card, 'id'>>> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const config = CATEGORY_CONFIGS.find((c) => c.category === category && c.tone === tone);
  const context = config?.context ?? `${tone} questions for ${category}`;

  const prompt = `Generate exactly ${count} unique Truth or Dare card prompts for a Truth or Dare card game.
Context: ${context}
Category: ${category}, Tone: ${tone}

Requirements:
- Mix of "truth" (revealing, thoughtful questions) and "dare" (action challenges) cards
- Creative, fresh, and not generic or overused
- Appropriate for the tone and category context
- Truth questions should be answerable in 1-2 sentences
- Dare challenges should be completable in a group setting

Return ONLY valid JSON (no markdown, no comments) in this exact format:
[
  { "type": "truth", "text": "question here" },
  { "type": "dare", "text": "challenge here" }
]`;

  const result = await model.generateContent(prompt);
  const responseText = result.response.text().trim();

  // Extract JSON from response
  const jsonMatch = responseText.match(/\[[\s\S]*\]/);
  if (!jsonMatch) throw new Error('No valid JSON found in AI response');

  const parsed: Array<{ type: string; text: string }> = JSON.parse(jsonMatch[0]);

  return parsed.slice(0, count).map((item) => ({
    type: item.type === 'dare' ? 'dare' : 'truth',
    category,
    tone,
    text: item.text,
    isCustom: false,
    source: 'ai' as const,
  }));
}

export async function generateAllCategories(): Promise<Array<Omit<Card, 'id'>>> {
  const allCards: Array<Omit<Card, 'id'>> = [];

  for (const config of CATEGORY_CONFIGS) {
    try {
      const cards = await generateQuestionsForConfig(config.category, config.tone, 5);
      allCards.push(...cards);
      // Small delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (err) {
      console.error(`Failed to generate for ${config.category}/${config.tone}:`, err);
    }
  }

  return allCards;
}
