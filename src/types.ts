export type CardType = 'truth' | 'dare';

export type GameCategory = 'relationship' | 'friends' | 'family' | 'seminar' | 'custom';

export type AppScreen = 'intro' | 'menu' | 'setup' | 'game' | 'settings' | 'editor';

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
  soundEnabled: boolean;
  soundVolume: number; // 0 to 1
}
