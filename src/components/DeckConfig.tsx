import React from 'react';
import { Sparkles, UserPlus, Trash2, ShieldAlert, Cpu } from 'lucide-react';
import type { GameCategory, Player, GameSettings } from '../types';
import { CATEGORIES, TONE_LABELS } from '../utils/defaultQuestions';
import { soundManager } from '../utils/soundEffects';

interface DeckConfigProps {
  settings: GameSettings;
  onStartGame: (category: GameCategory, tone: string, players: Player[], aiMode: boolean, customPrompt: string) => void;
}

export const DeckConfig: React.FC<DeckConfigProps> = ({ settings, onStartGame }) => {
  const [selectedCategory, setSelectedCategory] = React.useState<GameCategory>('relationship');
  const [selectedTone, setSelectedTone] = React.useState<string>('playful');
  
  // Players State
  const [playerName, setPlayerName] = React.useState('');
  const [players, setPlayers] = React.useState<Player[]>([
    { id: '1', name: 'Player 1', score: 0 },
    { id: '2', name: 'Player 2', score: 0 }
  ]);

  // AI Prompt State
  const [aiMode, setAiMode] = React.useState(false);
  const [customPrompt, setCustomPrompt] = React.useState('');

  // Update selected tone automatically when category changes
  React.useEffect(() => {
    const cat = CATEGORIES.find(c => c.id === selectedCategory);
    if (cat && cat.tones.length > 0) {
      // Default to the first tone in the list
      setSelectedTone(cat.tones[0]);
    }
  }, [selectedCategory]);

  const handleAddPlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim()) return;

    const newPlayer: Player = {
      id: Date.now().toString(),
      name: playerName.trim(),
      score: 0
    };

    setPlayers([...players, newPlayer]);
    setPlayerName('');
    soundManager.playTick();
  };

  const handleRemovePlayer = (id: string) => {
    setPlayers(players.filter(p => p.id !== id));
    soundManager.playTick();
  };

  const handleCategorySelect = (catId: GameCategory) => {
    setSelectedCategory(catId);
    soundManager.playTick();
  };

  const handleToneSelect = (tone: string) => {
    setSelectedTone(tone);
    soundManager.playTick();
  };

  const handleStart = () => {
    if (players.length === 0) {
      alert('Please add at least one player to start!');
      return;
    }
    soundManager.playSuccess();
    onStartGame(selectedCategory, selectedTone, players, aiMode && !!settings.geminiApiKey, customPrompt);
  };

  const currentCategoryObj = CATEGORIES.find(c => c.id === selectedCategory);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-5 gap-8 fade-in">
      {/* Left Column (3 cols): Decks, Tones & AI */}
      <div className="md:col-span-3 space-y-8">
        {/* Step 1: Select Category */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 text-sm font-bold border border-cyan-500/30">1</span>
            Select Game Category
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategorySelect(cat.id as GameCategory)}
                  className={`p-5 text-left rounded-2xl glass-card border transition-all ${
                    isSelected 
                      ? 'category-card-selected' 
                      : 'hover:border-white/10'
                  }`}
                >
                  <h3 className="font-bold text-base text-white tracking-wide">{cat.label}</h3>
                  <p className="text-xs text-white/50 mt-1 leading-relaxed">{cat.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: Select Tone */}
        {currentCategoryObj && currentCategoryObj.tones.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 text-sm font-bold border border-cyan-500/30">2</span>
              Choose the Conversation Tone
            </h2>
            <div className="flex flex-wrap gap-3">
              {currentCategoryObj.tones.map((tone) => {
                const isSelected = selectedTone === tone;
                return (
                  <button
                    key={tone}
                    onClick={() => handleToneSelect(tone)}
                    className={`px-5 py-3 rounded-xl text-sm font-semibold transition-all border ${
                      isSelected
                        ? 'bg-cyan-500/20 border-cyan-500 text-white shadow-lg shadow-cyan-500/10'
                        : 'bg-white/5 border-white/5 text-white/60 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {TONE_LABELS[tone] || tone}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 3: AI Mode (Optional) */}
        {selectedCategory !== 'custom' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 text-sm font-bold border border-cyan-500/30">3</span>
                AI Prompt Options (Optional)
              </h2>
              {settings.geminiApiKey ? (
                <span className="px-2.5 py-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center gap-1">
                  <Cpu size={10} /> AI Active
                </span>
              ) : (
                <span className="px-2.5 py-1 text-[10px] font-bold text-white/40 bg-white/5 border border-white/5 rounded-full">
                  Offline Deck
                </span>
              )}
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-sm font-bold text-white flex items-center gap-2">
                    <Sparkles size={16} className="text-cyan-400 animate-pulse" /> Use Gemini AI Mode
                  </span>
                  <p className="text-xs text-white/50">Generates custom card questions dynamically</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (!settings.geminiApiKey) {
                      alert('Please set your Gemini API Key in Settings first to enable AI Mode.');
                      return;
                    }
                    setAiMode(!aiMode);
                    soundManager.playTick();
                  }}
                  className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 focus:outline-none ${
                    aiMode && settings.geminiApiKey ? 'bg-cyan-500' : 'bg-white/10'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
                    aiMode && settings.geminiApiKey ? 'translate-x-6' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              {aiMode && settings.geminiApiKey && (
                <div className="space-y-3 pt-2 border-t border-white/5 fade-in">
                  <label className="text-xs font-semibold text-white/70 block">
                    Describe your custom hangout setup / theme details
                  </label>
                  <textarea
                    placeholder="Example: We are classmates who haven't met for 10 years. Make it nostalgic but funny... or We are astronauts on Mars looking to pass the time."
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    rows={3}
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                  />
                  <p className="text-[10px] text-cyan-400/80 leading-relaxed font-medium">
                    ✨ Gemini will design a personalized 10-card deck specifically for this theme!
                  </p>
                </div>
              )}

              {!settings.geminiApiKey && (
                <div className="flex items-start gap-2.5 text-white/50 bg-white/5 p-3 rounded-xl border border-white/5">
                  <ShieldAlert size={16} className="text-amber-500 shrink-0 mt-0.5" />
                  <span className="text-[11px] leading-relaxed">
                    Set a Gemini API Key in the top-right settings to unlock custom theme-generation using AI. Default questions will be used otherwise.
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Right Column (2 cols): Players Setup */}
      <div className="md:col-span-2 space-y-6">
        <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-6 flex flex-col h-full justify-between">
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2 border-b border-white/5 pb-4">
              👥 Players Setup
            </h2>

            {/* Add Player Input Form */}
            <form onSubmit={handleAddPlayer} className="flex gap-2">
              <input
                type="text"
                placeholder="Enter player name"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                maxLength={20}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-white placeholder-white/20 text-sm focus:outline-none focus:border-cyan-500"
              />
              <button
                type="submit"
                className="p-2.5 bg-cyan-500 hover:bg-cyan-400 text-white rounded-xl flex items-center justify-center transition-all shadow-md"
              >
                <UserPlus size={18} />
              </button>
            </form>

            {/* List of active players */}
            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {players.length === 0 ? (
                <p className="text-xs text-white/30 text-center py-6">Add players to keep score!</p>
              ) : (
                players.map((p, index) => (
                  <div 
                    key={p.id} 
                    className="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/5"
                  >
                    <span className="text-xs text-white font-semibold flex items-center gap-2">
                      <span className="text-white/40">#{index + 1}</span> {p.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemovePlayer(p.id)}
                      className="p-1 text-white/40 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-6 border-t border-white/5">
            <button
              onClick={handleStart}
              disabled={players.length === 0}
              className="w-full py-4 bg-cyan-500 hover:bg-cyan-400 disabled:bg-cyan-950 disabled:text-white/25 rounded-2xl text-base font-extrabold text-white transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-100"
            >
              START GAME <Sparkles size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
