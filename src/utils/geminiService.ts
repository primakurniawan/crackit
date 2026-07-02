import type { Card, GameCategory } from '../types';

export async function generateAICards(
  apiKey: string,
  category: GameCategory,
  tone: string,
  customPrompt: string = ''
): Promise<Card[]> {
  if (!apiKey) {
    throw new Error('API Key is required to generate AI cards.');
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const promptText = `
You are a master social game designer creating a premium "Truth or Dare" card game.
Generate exactly 10 card questions (5 Truths and 5 Dares) tailored to:
- Category: ${category}
- Specific Tone: ${tone}
${customPrompt ? `- Custom context/theme: "${customPrompt}"` : ''}

CRITICAL INSTRUCTIONS FOR TONE:
- If tone is 'spicy', make the prompts flirtatious, cheeky, and romantic (but respect social boundaries).
- If tone is 'deep', make them insightful, emotional, and relationship-building.
- If tone is 'funny', make them humorous, witty, and slightly silly.
- If tone is 'awkward', make them reveal embarrassing but harmless secrets.
- If tone is 'professional', make them safe for work but still highly engaging and team-building.
- If tone is 'creative', make them out-of-the-box and interactive.

Format guidelines:
- Truth questions should spark interesting conversations, reflections, or fun confessions.
- Dare prompts should specify an action to perform in the room. They must be safe, respectful, and not require external materials other than standard household items or phones.
- Do not repeat standard, generic truths or dares (e.g. "What is your biggest secret?"). Make them specific, creative, and situational.
`;

  const payload = {
    contents: [
      {
        parts: [
          {
            text: promptText
          }
        ]
      }
    ],
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: 'OBJECT',
        properties: {
          cards: {
            type: 'ARRAY',
            description: 'List of truth or dare cards',
            items: {
              type: 'OBJECT',
              properties: {
                type: {
                  type: 'STRING',
                  enum: ['truth', 'dare'],
                  description: 'Whether it is a Truth question or a Dare action'
                },
                text: {
                  type: 'STRING',
                  description: 'The text of the truth question or the action for the dare'
                }
              },
              required: ['type', 'text']
            }
          }
        },
        required: ['cards']
      }
    }
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    const errMsg = errData?.error?.message || response.statusText || 'Unknown error occurred while contacting Gemini API.';
    throw new Error(`Gemini API Error: ${errMsg}`);
  }

  const result = await response.json();
  const rawText = result.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!rawText) {
    throw new Error('Failed to retrieve cards from the AI response. Please try again.');
  }

  const parsed = JSON.parse(rawText);
  if (!parsed.cards || !Array.isArray(parsed.cards)) {
    throw new Error('AI response did not match the expected cards format.');
  }

  // Map to our Card structure
  return parsed.cards.map((c: any, index: number) => ({
    id: `ai_${category}_${tone}_${Date.now()}_${index}`,
    type: c.type as 'truth' | 'dare',
    category,
    tone,
    text: c.text,
    isCustom: true
  }));
}
