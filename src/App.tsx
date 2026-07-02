import React from 'react';
import type { GameCategory, Card, Player, GameSettings, AppScreen } from './types';
import { MainMenu } from './components/MainMenu';
import { DeckConfig } from './components/DeckConfig';
import { CardTable } from './components/CardTable';
import { SettingsScreen } from './components/SettingsScreen';
import { QuestionScreen } from './components/QuestionScreen';
import { DEFAULT_QUESTIONS } from './utils/defaultQuestions';
import { soundManager } from './utils/soundEffects';

export default function App() {
  const [currentScreen, setCurrentScreen] = React.useState<AppScreen>('intro');
  
  const [settings, setSettings] = React.useState<GameSettings>(() => {
    const saved = localStorage.getItem('icebreaker_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        soundManager.setEnabled(parsed.soundEnabled ?? true);
        soundManager.setVolume(parsed.soundVolume ?? 0.5);
        return parsed;
      } catch (e) {
        console.error('Failed to parse settings', e);
      }
    }
    return { soundEnabled: true, soundVolume: 0.5 };
  });

  const [customCards, setCustomCards] = React.useState<Card[]>(() => {
    const saved = localStorage.getItem('icebreaker_custom_cards');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [
      { id: 'c1', type: 'truth', category: 'custom', tone: 'custom', text: 'What is the most adventurous thing you\'ve ever done in public?', isCustom: true },
      { id: 'c2', type: 'dare', category: 'custom', tone: 'custom', text: 'Do your best impression of a celebrity until someone guesses who it is!', isCustom: true }
    ];
  });

  const [activeCategory, setActiveCategory] = React.useState<GameCategory>('relationship');
  const [activeTone, setActiveTone] = React.useState('playful');
  const [gameCards, setGameCards] = React.useState<Card[]>([]);
  const [players, setPlayers] = React.useState<Player[]>([]);

  React.useEffect(() => {
    localStorage.setItem('icebreaker_settings', JSON.stringify(settings));
  }, [settings]);

  React.useEffect(() => {
    localStorage.setItem('icebreaker_custom_cards', JSON.stringify(customCards));
  }, [customCards]);

  const handleUserInteraction = () => {
    soundManager.init();
  };

  const handleStartGame = (category: GameCategory, tone: string, setupPlayers: Player[]) => {
    setActiveCategory(category);
    setActiveTone(tone);
    setPlayers(setupPlayers);

    if (category === 'custom') {
      if (customCards.length === 0) {
        alert('Your Custom Deck is empty! Please add cards in the Question Bank first.');
        return;
      }
      setGameCards(customCards);
    } else {
      const filtered = DEFAULT_QUESTIONS.filter(c => c.category === category && c.tone === tone);
      const userCategoryCustoms = customCards.filter(c => c.category === category);
      const mixedDeck = [...filtered, ...userCategoryCustoms];

      if (mixedDeck.length === 0) {
        alert(`No questions found matching Category: ${category} and Tone: ${tone}.`);
        return;
      }
      setGameCards(mixedDeck);
    }
    
    setCurrentScreen('game');
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'intro':
        return (
          <div className="flex-1 flex flex-col items-center justify-center text-center fade-in space-y-8 px-4">
            <div className="w-24 h-24 rounded-full bg-cyan-500 flex items-center justify-center shadow-lg shadow-cyan-500/20 mb-4 animate-bounce">
              <span className="text-4xl">🃏</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-white tracking-tight">
              Icebreaker <span className="text-cyan-400">Cards</span>
            </h1>
            <p className="text-white/50 text-lg font-medium max-w-sm">
              The ultimate truth or dare experience.
            </p>
            <button
              onClick={() => { soundManager.playTick(); setCurrentScreen('menu'); }}
              className="mt-8 px-10 py-5 bg-white hover:bg-gray-200 text-black rounded-full font-black text-xl transition-transform hover:scale-105 active:scale-95"
            >
              TAP TO START
            </button>
          </div>
        );
      case 'menu':
        return <MainMenu onNavigate={(screen) => setCurrentScreen(screen)} />;
      case 'setup':
        return <DeckConfig onStartGame={handleStartGame} onBack={() => setCurrentScreen('menu')} />;
      case 'settings':
        return (
          <SettingsScreen 
            settings={settings} 
            onUpdateSettings={setSettings} 
            onBack={() => setCurrentScreen('menu')}
            onResetCustomBank={() => setCustomCards([])}
          />
        );
      case 'editor':
        return (
          <QuestionScreen 
            customCards={customCards}
            onAddCard={(cardData) => setCustomCards([{ ...cardData, id: `custom_${Date.now()}` }, ...customCards])}
            onDeleteCard={(id) => setCustomCards(customCards.filter(c => c.id !== id))}
            onBack={() => setCurrentScreen('menu')}
          />
        );
      case 'game':
        return (
          <CardTable
            category={activeCategory}
            tone={activeTone}
            initialCards={gameCards}
            players={players}
            onMenu={() => setCurrentScreen('menu')}
          />
        );
      default:
        return null;
    }
  };

  const themeClass = currentScreen === 'game' ? `theme-${activeCategory}` : 'theme-custom';

  return (
    <div className={`min-h-screen flex flex-col ${themeClass}`} onClick={handleUserInteraction}>
      <main className="flex-1 flex flex-col pt-4 pb-8 sm:py-8">
        {renderScreen()}
      </main>
      
      {currentScreen !== 'game' && currentScreen !== 'intro' && (
        <footer className="py-6 text-center text-[11px] font-bold text-white/30 tracking-widest uppercase">
          Icebreaker Cards © 2026 • Local Data Mode
        </footer>
      )}
    </div>
  );
}
