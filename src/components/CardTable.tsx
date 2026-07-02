import React from 'react';
import { Shuffle, ArrowRight, AlertTriangle, Trophy, Check, X } from 'lucide-react';
import type { Card, GameCategory, Player } from '../types';
import { soundManager } from '../utils/soundEffects';

interface CardTableProps {
  category: GameCategory;
  tone: string;
  initialCards: Card[];
  players: Player[];
  onQuit: () => void;
}

export const CardTable: React.FC<CardTableProps> = ({
  category,
  tone,
  initialCards,
  players: initialPlayers,
  onQuit
}) => {
  const [cards, setCards] = React.useState<Card[]>([]);
  const [players, setPlayers] = React.useState<Player[]>(initialPlayers);
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [isFlipped, setIsFlipped] = React.useState(false);
  const [activePlayerIndex, setActivePlayerIndex] = React.useState(0);
  const [isShuffling, setIsShuffling] = React.useState(false);
  const [celebrateClass, setCelebrateClass] = React.useState(false);
  const [shuffleEffectStage, setShuffleEffectStage] = React.useState(0); // For shuffling cards pile

  // Initialize and shuffle cards on mount
  React.useEffect(() => {
    shuffleDeck(initialCards);
  }, [initialCards]);

  const shuffleDeck = (deckToShuffle: Card[]) => {
    setIsShuffling(true);
    setIsFlipped(false);
    soundManager.playShuffle();
    
    // Animate pile cards fanning out
    let stage = 0;
    const interval = setInterval(() => {
      stage = (stage + 1) % 4;
      setShuffleEffectStage(stage);
    }, 200);

    setTimeout(() => {
      clearInterval(interval);
      const shuffled = [...deckToShuffle].sort(() => Math.random() - 0.5);
      setCards(shuffled);
      setCurrentIndex(0);
      setIsShuffling(false);
      setShuffleEffectStage(0);
    }, 1000);
  };

  const handleCardClick = () => {
    if (isShuffling) return;
    setIsFlipped(!isFlipped);
    soundManager.playFlip();
  };

  const handleAction = (completed: boolean) => {
    if (completed) {
      soundManager.playSuccess();
      setCelebrateClass(true);
      // Give points to active player
      const updatedPlayers = players.map((p, idx) => {
        if (idx === activePlayerIndex) {
          return { ...p, score: p.score + 10 };
        }
        return p;
      });
      setPlayers(updatedPlayers);
      setTimeout(() => setCelebrateClass(false), 600);
    } else {
      soundManager.playTick();
    }

    // Go to next card and next player
    setTimeout(() => {
      setIsFlipped(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % cards.length);
        setActivePlayerIndex((prev) => (prev + 1) % players.length);
      }, 300);
    }, 400);
  };

  const handleReshuffle = () => {
    shuffleDeck(cards);
  };

  const activePlayer = players[activePlayerIndex];
  const currentCard = cards[currentIndex];

  // Leaderboard sorting
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-4 gap-8 items-start fade-in">
      
      {/* Sidebar: Leaderboard & Stats */}
      <div className="lg:col-span-1 space-y-6">
        {/* Game Stats */}
        <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-3.5">
          <h3 className="text-sm font-bold text-white/50 uppercase tracking-wider">Game Status</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-white/60">Deck Category:</span>
              <span className="text-white font-semibold capitalize">{category}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-white/60">Tone Set:</span>
              <span className="text-white font-semibold capitalize">{tone}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-white/60">Cards Remaining:</span>
              <span className="text-cyan-400 font-bold">
                {cards.length - currentIndex} / {cards.length}
              </span>
            </div>
          </div>
          
          <div className="pt-3 border-t border-white/5 flex gap-2">
            <button
              onClick={handleReshuffle}
              disabled={isShuffling}
              className="flex-1 py-2 px-3 text-xs btn-glow font-semibold flex items-center justify-center gap-1.5"
            >
              <Shuffle size={12} /> Reshuffle
            </button>
            <button
              onClick={onQuit}
              className="flex-1 py-2 px-3 text-xs bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-xl font-semibold flex items-center justify-center"
            >
              Quit Game
            </button>
          </div>
        </div>

        {/* Players Standings */}
        <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-4">
          <h3 className="text-sm font-bold text-white/50 uppercase tracking-wider flex items-center gap-2">
            <Trophy size={16} className="text-amber-400" /> Leaderboard
          </h3>
          <div className="space-y-2.5">
            {sortedPlayers.map((player, idx) => {
              const isActive = player.id === activePlayer?.id;
              return (
                <div 
                  key={player.id}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                    isActive 
                      ? 'bg-cyan-500/10 border-cyan-500 shadow-md shadow-cyan-500/5' 
                      : 'bg-white/5 border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center ${
                      idx === 0 
                        ? 'bg-amber-400 text-black' 
                        : idx === 1 
                        ? 'bg-slate-300 text-black' 
                        : idx === 2 
                        ? 'bg-amber-700 text-white' 
                        : 'bg-white/10 text-white/70'
                    }`}>
                      {idx + 1}
                    </span>
                    <span className={`text-xs font-bold ${isActive ? 'text-white' : 'text-white/70'}`}>
                      {player.name}
                    </span>
                  </div>
                  <span className="text-xs font-black text-white/90">{player.score} pts</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Play Area */}
      <div className="lg:col-span-3 flex flex-col items-center justify-center space-y-8">
        
        {/* Active Player Prompt */}
        {activePlayer && (
          <div className={`text-center space-y-2 ${celebrateClass ? 'celebrate-card' : ''}`}>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-cyan-400 px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-full shadow-md text-glow">
              Active Player
            </span>
            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              👉 {activePlayer.name}'s Turn!
            </h2>
            <p className="text-xs text-white/50">
              {!isFlipped ? 'Click the card to reveal your challenge' : 'Complete the task or pass!'}
            </p>
          </div>
        )}

        {/* 3D Card Deck Scene */}
        <div className="relative py-4">
          {/* Deck pile graphics behind the main card (only visible if not shuffling) */}
          {!isShuffling && cards.length - currentIndex > 1 && (
            <>
              <div className="deck-pile-card" style={{ transform: 'translate(4px, 4px) rotate(1.5deg)' }} />
              {cards.length - currentIndex > 2 && (
                <div className="deck-pile-card" style={{ transform: 'translate(-4px, -4px) rotate(-1.5deg)' }} />
              )}
            </>
          )}

          {/* Shuffle Effect overlay card states */}
          {isShuffling && (
            <>
              <div className={`deck-pile-card ${shuffleEffectStage === 1 ? 'shuffling-card-1' : ''}`} />
              <div className={`deck-pile-card ${shuffleEffectStage === 2 ? 'shuffling-card-2' : ''}`} />
              <div className={`deck-pile-card ${shuffleEffectStage === 3 ? 'shuffling-card-3' : ''}`} />
            </>
          )}

          <div className="card-scene">
            <div 
              onClick={handleCardClick}
              className={`card-inner ${isFlipped ? 'is-flipped' : ''}`}
            >
              {/* CARD FRONT (Card Cover) */}
              <div className="card-face card-front">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-extrabold text-white/30 uppercase tracking-widest">
                    Icebreaker Game
                  </span>
                  <Shuffle size={16} className="text-white/20" />
                </div>
                
                <div className="flex flex-col items-center justify-center space-y-4 py-8">
                  <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center shadow-lg shadow-black/30">
                    <span className="text-3xl font-black text-white text-glow">?</span>
                  </div>
                  <div className="text-center space-y-1">
                    <h3 className="text-lg font-black tracking-wide text-white uppercase">Truth or Dare</h3>
                    <p className="text-[10px] text-white/40 font-semibold uppercase tracking-wider">
                      Click to Draw
                    </p>
                  </div>
                </div>

                <div className="flex justify-between items-end border-t border-white/5 pt-4">
                  <span className="text-xs font-bold text-white/50 capitalize">
                    {category}
                  </span>
                  <span className="text-[10px] font-black text-white/30">
                    № {currentIndex + 1}
                  </span>
                </div>
              </div>

              {/* CARD BACK (Question Face) */}
              <div className="card-face card-back">
                {currentCard ? (
                  <>
                    <div className="flex justify-between items-center border-b border-white/5 pb-3">
                      <span className={`text-xs font-black uppercase tracking-widest px-2.5 py-0.5 rounded ${
                        currentCard.type === 'truth' 
                          ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30' 
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}>
                        {currentCard.type}
                      </span>
                      <span className="text-[10px] text-white/40 uppercase tracking-wider font-semibold">
                        #{currentCard.tone}
                      </span>
                    </div>

                    <div className="flex-1 flex flex-col justify-center items-center py-6 px-1">
                      <p className="text-white text-base md:text-lg font-bold leading-relaxed text-center font-outfit">
                        "{currentCard.text}"
                      </p>
                    </div>

                    <div className="border-t border-white/5 pt-4 flex justify-between items-center text-[10px] text-white/30 font-bold uppercase tracking-wider">
                      <span>{category}</span>
                      <span>№ {currentIndex + 1}</span>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full space-y-4">
                    <AlertTriangle size={32} className="text-amber-400" />
                    <p className="text-xs text-white/60 text-center">No cards loaded.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        {isFlipped && (
          <div className="flex gap-4 w-full max-w-sm px-4 fade-in">
            <button
              onClick={() => handleAction(false)}
              className="flex-1 py-3.5 px-4 rounded-2xl bg-white/5 hover:bg-red-500/10 border border-white/10 hover:border-red-500/30 text-white/70 hover:text-red-400 font-extrabold text-xs tracking-wider uppercase flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5"
            >
              <X size={15} /> Pass (0 pts)
            </button>
            <button
              onClick={() => handleAction(true)}
              className="flex-1 py-3.5 px-4 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-white font-extrabold text-xs tracking-wider uppercase flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 shadow-lg shadow-cyan-500/20"
            >
              <Check size={15} /> Done (+10 pts)
            </button>
          </div>
        )}

        {!isFlipped && (
          <button
            onClick={handleCardClick}
            disabled={isShuffling}
            className="py-4 px-8 bg-cyan-500 hover:bg-cyan-400 disabled:bg-cyan-900/30 text-white font-extrabold text-sm tracking-wider uppercase rounded-2xl flex items-center gap-2 shadow-lg shadow-cyan-500/20 hover:scale-[1.03] active:scale-100 transition-all"
          >
            Reveal Card <ArrowRight size={16} />
          </button>
        )}
      </div>

    </div>
  );
};
