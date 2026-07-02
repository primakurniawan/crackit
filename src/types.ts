export type CardType = 'truth' | 'dare';

export type GameCategory = 'relationship' | 'friends' | 'family' | 'seminar' | 'custom';

export interface Card {
  id: string;
  type: CardType;
  category: GameCategory;
  tone: string;
  text: string;
  isCustom?: boolean;
}

export interface Player {
  id: string;
  name: string;
  score: number;
}

export interface GameSettings {
  geminiApiKey: string;
  soundEnabled: boolean;
  soundVolume: number; // 0 to 1
  customPrompt?: string;
  aiMode: boolean; // whether to generate cards dynamically using Gemini API
}
