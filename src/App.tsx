import React from 'react';
import { Settings, Edit3, AlertCircle, Sparkles, Volume2, VolumeX } from 'lucide-react';
import type { GameCategory, Card, Player, GameSettings } from './types';
import { DeckConfig } from './components/DeckConfig';
import { CardTable } from './components/CardTable';
import { SettingsModal } from './components/SettingsModal';
import { QuestionEditor } from './components/QuestionEditor';
import { DEFAULT_QUESTIONS } from './utils/defaultQuestions';
import { generateAICards } from './utils/geminiService';
import { soundManager } from './utils/soundEffects';

export default function App() {
  // Load settings from localStorage
  const [settings, setSettings] = React.useState<GameSettings>(() => {
    const saved = localStorage.getItem('icebreaker_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Sync with soundManager
        soundManager.setEnabled(parsed.soundEnabled ?? true);
        soundManager.setVolume(parsed.soundVolume ?? 0.5);
        return parsed;
      } catch (e) {
        console.error('Failed to parse settings', e);
      }
    }
    return {
      geminiApiKey: '',
      soundEnabled: true,
      soundVolume: 0.5,
      aiMode: false
    };
  });

  // Load custom questions from localStorage
  const [customCards, setCustomCards] = React.useState<Card[]>(() => {
    const saved = localStorage.getItem('icebreaker_custom_cards');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse custom cards', e);
      }
    }
    // Default custom cards if empty
    return [
      { id: 'c1', type: 'truth', category: 'custom', tone: 'custom', text: 'What is the most adventurous thing you\'ve ever done in public?', isCustom: true },
      { id: 'c2', type: 'dare', category: 'custom', tone: 'custom', text: 'Do your best impression of a celebrity until someone guesses who it is!', isCustom: true }
    ];
  });

  // Game Play States
  const [activeCategory, setActiveCategory] = React.useState<GameCategory>('relationship');
  const [activeTone, setActiveTone] = React.useState('playful');
  const [gameStarted, setGameStarted] = React.useState(false);
  const [gameCards, setGameCards] = React.useState<Card[]>([]);
  const [players, setPlayers] = React.useState<Player[]>([]);
  
  // Modal/UI States
  const [showSettings, setShowSettings] = React.useState(false);
  const [showEditor, setShowEditor] = React.useState(false);
  const [loadingCards, setLoadingCards] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  // Sync settings & custom cards to localStorage on changes
  React.useEffect(() => {
    localStorage.setItem('icebreaker_settings', JSON.stringify(settings));
  }, [settings]);

  React.useEffect(() => {
    localStorage.setItem('icebreaker_custom_cards', JSON.stringify(customCards));
  }, [customCards]);

  // Audio initialize on first click
  const handleUserInteraction = () => {
    soundManager.init();
  };

  const handleUpdateSettings = (newSettings: GameSettings) => {
    setSettings(newSettings);
  };

  const handleResetCustomBank = () => {
    setCustomCards([]);
    soundManager.playSuccess();
  };

  const handleAddCustomCard = (cardData: Omit<Card, 'id'>) => {
    const newCard: Card = {
      ...cardData,
      id: `custom_${Date.now()}`
    };
    setCustomCards([newCard, ...customCards]);
  };

  const handleDeleteCustomCard = (id: string) => {
    setCustomCards(customCards.filter(c => c.id !== id));
  };

  const handleStartGame = async (
    category: GameCategory,
    tone: string,
    setupPlayers: Player[],
    useAiMode: boolean,
    customPromptText: string
  ) => {
    handleUserInteraction();
    setActiveCategory(category);
    setActiveTone(tone);
    setPlayers(setupPlayers);
    setErrorMsg(null);

    // If Custom Category is chosen, load custom cards
    if (category === 'custom') {
      if (customCards.length === 0) {
        setErrorMsg('Your Custom Deck is currently empty! Please open the Question Manager to add cards first.');
        return;
      }
      setGameCards(customCards);
      setGameStarted(true);
      return;
    }

    // Load AI cards if AI mode is enabled
    if (useAiMode && settings.geminiApiKey) {
      setLoadingCards(true);
      try {
        const generated = await generateAICards(
          settings.geminiApiKey,
          category,
          tone,
          customPromptText
        );
        if (generated.length === 0) {
          throw new Error('Zero cards returned from Gemini. Falling back.');
        }
        setGameCards(generated);
        setGameStarted(true);
      } catch (err: any) {
        console.error(err);
        const fallbackMsg = `Failed to generate AI questions (${err.message || 'API error'}). Would you like to play with offline default questions instead?`;
        setErrorMsg(fallbackMsg);
      } finally {
        setLoadingCards(false);
      }
    } else {
      // Offline mode - Filter pre-coded questions matching category & tone
      const filtered = DEFAULT_QUESTIONS.filter(
        (c) => c.category === category && c.tone === tone
      );
      
      // If we also have custom cards in this category (e.g. from user suggestions), mix them in!
      const userCategoryCustoms = customCards.filter(
        (c) => c.category === category
      );

      const mixedDeck = [...filtered, ...userCategoryCustoms];

      if (mixedDeck.length === 0) {
        setErrorMsg(`No offline questions found matching Category: ${category} and Tone: ${tone}.`);
        return;
      }
      
      setGameCards(mixedDeck);
      setGameStarted(true);
    }
  };

  const handlePlayOfflineFallback = () => {
    setErrorMsg(null);
    // Filter matching offline questions
    const filtered = DEFAULT_QUESTIONS.filter(
      (c) => c.category === activeCategory && c.tone === activeTone
    );

    const userCategoryCustoms = customCards.filter(
      (c) => c.category === activeCategory
    );

    const mixedDeck = [...filtered, ...userCategoryCustoms];

    if (mixedDeck.length === 0) {
      setErrorMsg('No offline fallback questions found for this configuration.');
      return;
    }

    setGameCards(mixedDeck);
    setGameStarted(true);
  };

  const handleQuitGame = () => {
    setGameStarted(false);
    setErrorMsg(null);
    soundManager.playTick();
  };

  const handleSoundToggle = () => {
    const newVal = !settings.soundEnabled;
    setSettings({ ...settings, soundEnabled: newVal });
    soundManager.setEnabled(newVal);
    if (newVal) soundManager.playTick();
  };

  // Determine current category theme class
  const themeClass = `theme-${activeCategory}`;

  return (
    <div className={`min-h-screen flex flex-col justify-between ${themeClass}`} onClick={handleUserInteraction}>
      
      {/* Background glowing blobs */}
      <div className="bg-blobs">
        <div className="bg-blob bg-blob-1" />
        <div className="bg-blob bg-blob-2" />
      </div>

      {/* Header Panel */}
      <header className="glass-panel sticky top-0 z-40 px-6 py-4 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center shadow-lg shadow-black/25">
            <Sparkles size={20} className="text-white animate-pulse" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight text-white flex items-center gap-1.5">
              Icebreaker <span className="text-cyan-400 font-medium text-sm hidden sm:inline px-2 py-0.5 bg-cyan-500/10 border border-cyan-500/20 rounded-full">Cards</span>
            </h1>
            <p className="text-[10px] text-white/40 font-semibold tracking-wider uppercase hidden xs:block">
              Truth or Dare Social Game
            </p>
          </div>
        </div>

        {/* Global Controls */}
        <div className="flex items-center gap-2">
          {/* Audio Quick Toggle */}
          <button
            onClick={handleSoundToggle}
            className={`p-2.5 rounded-xl border transition-all ${
              settings.soundEnabled 
                ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400' 
                : 'bg-white/5 border-white/5 text-white/40'
            }`}
            title={settings.soundEnabled ? 'Mute Sounds' : 'Unmute Sounds'}
          >
            {settings.soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>

          {/* Question Manager Button */}
          <button
            onClick={() => { setShowEditor(true); soundManager.playTick(); }}
            className="p-2.5 bg-white/5 border border-white/10 hover:border-cyan-500/30 hover:bg-cyan-500/5 text-white/80 hover:text-white rounded-xl flex items-center gap-2 transition-all text-xs font-bold"
            title="Question Manager & Suggestions"
          >
            <Edit3 size={18} />
            <span className="hidden md:inline">Question Bank</span>
          </button>

          {/* Settings Trigger */}
          <button
            onClick={() => { setShowSettings(true); soundManager.playTick(); }}
            className="p-2.5 bg-white/5 border border-white/10 hover:border-cyan-500/30 hover:bg-cyan-500/5 text-white/80 hover:text-white rounded-xl flex items-center gap-2 transition-all text-xs font-bold"
            title="AI and System Settings"
          >
            <Settings size={18} />
            <span className="hidden md:inline">Settings</span>
          </button>
        </div>
      </header>

      {/* Main Board Container */}
      <main className="flex-1 flex flex-col justify-center py-6 sm:py-10">
        
        {/* API Error Dialog */}
        {errorMsg && (
          <div className="max-w-xl mx-auto px-4 mb-6 fade-in">
            <div className="bg-red-500/10 border border-red-500/20 p-5 rounded-2xl flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
              <AlertCircle size={28} className="text-red-400 shrink-0 mt-0.5" />
              <div className="space-y-3 flex-1">
                <h4 className="font-bold text-red-400 text-sm">Action Required</h4>
                <p className="text-xs text-white/70 leading-relaxed">{errorMsg}</p>
                <div className="flex flex-wrap gap-2.5 justify-center sm:justify-start">
                  {errorMsg.includes('Fallback') && (
                    <button
                      onClick={handlePlayOfflineFallback}
                      className="py-1.5 px-3 bg-cyan-500 hover:bg-cyan-400 text-white rounded-lg text-xs font-bold transition-all shadow-md"
                    >
                      Play Offline Questions
                    </button>
                  )}
                  <button
                    onClick={() => { setErrorMsg(null); soundManager.playTick(); }}
                    className="py-1.5 px-3 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-lg text-xs font-semibold transition-all border border-white/5"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading Spinner */}
        {loadingCards ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="relative w-16 h-16 flex items-center justify-center">
              <div className="absolute inset-0 border-4 border-cyan-500/20 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-t-cyan-400 rounded-full animate-spin"></div>
            </div>
            <div className="text-center space-y-1.5">
              <h3 className="font-bold text-white text-base flex items-center gap-1.5 justify-center">
                <Sparkles size={16} className="text-cyan-400 animate-pulse" /> Generating AI Cards
              </h3>
              <p className="text-xs text-white/40">Gemini is curating custom Truth or Dares...</p>
            </div>
          </div>
        ) : gameStarted ? (
          /* Game Playing view */
          <CardTable
            category={activeCategory}
            tone={activeTone}
            initialCards={gameCards}
            players={players}
            onQuit={handleQuitGame}
          />
        ) : (
          /* Landing/Setup config view */
          <DeckConfig settings={settings} onStartGame={handleStartGame} />
        )}
      </main>

      {/* Footer Details */}
      <footer className="glass-panel py-5 border-t border-white/5 text-center space-y-1">
        <p className="text-[11px] font-medium text-white/30 tracking-wide uppercase">
          Icebreaker Cards © 2026 • Curated with 🤍 for socializing
        </p>
        <p className="text-[10px] text-white/20">
          Powered by Gemini AI (Client-side integration) • Procedural Audio Engine
        </p>
      </footer>

      {/* Settings Modal overlay */}
      {showSettings && (
        <SettingsModal
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
          onClose={() => { setShowSettings(false); soundManager.playTick(); }}
          onResetCustomBank={handleResetCustomBank}
        />
      )}

      {/* Question Editor Overlay */}
      {showEditor && (
        <QuestionEditor
          customCards={customCards}
          onAddCard={handleAddCustomCard}
          onDeleteCard={handleDeleteCustomCard}
          onClose={() => { setShowEditor(false); soundManager.playTick(); }}
        />
      )}

    </div>
  );
}
