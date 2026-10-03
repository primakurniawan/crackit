export type CardType = 'truth' | 'dare';
export type GameCategory = 'relationship' | 'friends' | 'family' | 'seminar' | 'custom';

export interface Card {
  id: string;
  type: CardType;
  category: GameCategory;
  tone: string;
  text: string;
  isCustom?: boolean;
  source?: 'seed' | 'ai' | 'user';
}

export interface Player {
  id: string;
  name: string;
  score: number;
}

export type BillSplitMode = 'tiered' | 'proportional' | 'loser_pays_all';

export interface BillSplitConfig {
  enabled: boolean;
  totalAmount: number;
  currency: string;
  splitMode: BillSplitMode;
}

export interface PlayerBillShare {
  playerId: string;
  playerName: string;
  score: number;
  rank: number;
  amountOwed: number;
  percentage: number;
}

export interface GameConfig {
  category: GameCategory;
  tone: string;
  players: Player[];
  timerDuration: number; // seconds
  billSplit?: BillSplitConfig;
}

export interface GameState {
  config: GameConfig;
  cards: Card[];
  currentIndex: number;
  activePlayerIndex: number;
  isFlipped: boolean;
  startedAt: number;
}

export interface AppSettings {
  soundEnabled: boolean;
  soundVolume: number;
  defaultTimerDuration: number; // seconds, 30-300
}
