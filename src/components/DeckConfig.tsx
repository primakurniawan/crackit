import React from 'react';
import { Sparkles, UserPlus, Trash2, ArrowLeft } from 'lucide-react';
import type { GameCategory, Player } from '../types';
import { CATEGORIES, TONE_LABELS } from '../utils/defaultQuestions';
import { soundManager } from '../utils/soundEffects';

interface DeckConfigProps {
  onStartGame: (category: GameCategory, tone: string, players: Player[]) => void;
  onBack: () => void;
}

export const DeckConfig: React.FC<DeckConfigProps> = ({ onStartGame, onBack }) => {
  const [selectedCategory, setSelectedCategory] = React.useState<GameCategory>('relationship');
  const [selectedTone, setSelectedTone] = React.useState<string>('playful');
  
  const [playerName, setPlayerName] = React.useState('');
  const [players, setPlayers] = React.useState<Player[]>([
    { id: '1', name: 'Player 1', score: 0 },
    { id: '2', name: 'Player 2', score: 0 }
  ]);

  React.useEffect(() => {
    const cat = CATEGORIES.find(c => c.id === selectedCategory);
    if (cat && cat.tones.length > 0) {
      setSelectedTone(cat.tones[0]);
    }
  }, [selectedCategory]);

  const handleAddPlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim()) return;
    setPlayers([...players, { id: Date.now().toString(), name: playerName.trim(), score: 0 }]);
    setPlayerName('');
    soundManager.playTick();
  };

  const handleRemovePlayer = (id: string) => {
    setPlayers(players.filter(p => p.id !== id));
    soundManager.playTick();
  };

  const handleStart = () => {
    if (players.length === 0) {
      alert('Add at least one player!');
      return;
    }
    soundManager.playSuccess();
    onStartGame(selectedCategory, selectedTone, players);
  };

  const currentCategoryObj = CATEGORIES.find(c => c.id === selectedCategory);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 fade-in min-h-[80vh] flex flex-col">
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => { soundManager.playTick(); onBack(); }}
          className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-white"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h2 className="text-3xl font-bold text-white">Setup Game</h2>
          <p className="text-sm text-white/50">Pick a deck, set the tone, and add players</p>
        </div>
      </div>

      <div className="bento-grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 items-start">
        {/* Left Column - Category & Tone */}
        <div className="col-span-1 md:col-span-2 space-y-6">
          <div className="bento-item p-6 space-y-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="bg-white/10 px-2 py-0.5 rounded-lg text-sm">1</span> Category
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => { setSelectedCategory(cat.id as GameCategory); soundManager.playTick(); }}
                  className={`p-4 text-left rounded-2xl border transition-all ${
                    selectedCategory === cat.id 
                      ? 'category-card-selected' 
                      : 'border-white/5 hover:border-white/10 bg-black/20'
                  }`}
                >
                  <h4 className="font-bold text-white">{cat.label}</h4>
                  <p className="text-xs text-white/50 mt-1">{cat.description}</p>
                </button>
              ))}
            </div>
          </div>

          {currentCategoryObj && currentCategoryObj.tones.length > 0 && (
            <div className="bento-item p-6 space-y-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="bg-white/10 px-2 py-0.5 rounded-lg text-sm">2</span> Tone
              </h3>
              <div className="flex flex-wrap gap-3">
                {currentCategoryObj.tones.map((tone) => (
                  <button
                    key={tone}
                    onClick={() => { setSelectedTone(tone); soundManager.playTick(); }}
                    className={`px-6 py-3 rounded-xl text-sm font-bold transition-all border ${
                      selectedTone === tone
                        ? 'bg-cyan-500 text-white border-cyan-500 shadow-md'
                        : 'bg-black/20 border-white/5 text-white/60 hover:text-white'
                    }`}
                  >
                    {TONE_LABELS[tone] || tone}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Players */}
        <div className="col-span-1 flex flex-col h-full space-y-6">
          <div className="bento-item p-6 flex flex-col flex-1">
            <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-4">
              <span className="bg-white/10 px-2 py-0.5 rounded-lg text-sm">3</span> Players
            </h3>
            
            <form onSubmit={handleAddPlayer} className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="Name"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                maxLength={20}
                className="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm focus:border-cyan-500"
              />
              <button type="submit" className="px-4 bg-white/10 hover:bg-white/20 text-white rounded-xl">
                <UserPlus size={20} />
              </button>
            </form>

            <div className="space-y-2 flex-1 overflow-y-auto mb-6">
              {players.length === 0 ? (
                <p className="text-sm text-white/30 text-center py-4">Add players to track score!</p>
              ) : (
                players.map((p, i) => (
                  <div key={p.id} className="flex items-center justify-between bg-black/20 p-3 rounded-xl border border-white/5">
                    <span className="text-sm text-white font-bold">
                      <span className="text-white/30 mr-2">#{i + 1}</span> {p.name}
                    </span>
                    <button
                      onClick={() => handleRemovePlayer(p.id)}
                      className="text-white/40 hover:text-red-400 p-1 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>

            <button
              onClick={handleStart}
              disabled={players.length === 0}
              className="w-full py-4 bg-cyan-500 hover:bg-cyan-400 disabled:bg-cyan-900/50 text-white font-black text-lg rounded-2xl flex items-center justify-center gap-2 transition-all mt-auto"
            >
              Start Game <Sparkles size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
