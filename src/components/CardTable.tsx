import React from 'react';
import { Menu, Shuffle, ArrowRight, AlertTriangle, Trophy, Check, X } from 'lucide-react';
import type { Card, GameCategory, Player } from '../types';
import { soundManager } from '../utils/soundEffects';

interface CardTableProps {
  category: GameCategory;
  tone: string;
  initialCards: Card[];
  players: Player[];
  onMenu: () => void;
}

export const CardTable: React.FC<CardTableProps> = ({
  category,
  tone,
  initialCards,
  players: initialPlayers,
  onMenu
}) => {
  const [cards, setCards] = React.useState<Card[]>([]);
  const [players, setPlayers] = React.useState<Player[]>(initialPlayers);
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [isFlipped, setIsFlipped] = React.useState(false);
  const [activePlayerIndex, setActivePlayerIndex] = React.useState(0);
  const [isShuffling, setIsShuffling] = React.useState(false);
  const [celebrateClass, setCelebrateClass] = React.useState(false);

  React.useEffect(() => {
    shuffleDeck(initialCards);
  }, [initialCards]);

  const shuffleDeck = (deckToShuffle: Card[]) => {
    setIsShuffling(true);
    setIsFlipped(false);
    soundManager.playShuffle();

    setTimeout(() => {
      const shuffled = [...deckToShuffle].sort(() => Math.random() - 0.5);
      setCards(shuffled);
      setCurrentIndex(0);
      setIsShuffling(false);
    }, 800);
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
      const updatedPlayers = players.map((p, idx) => {
        if (idx === activePlayerIndex) return { ...p, score: p.score + 10 };
        return p;
      });
      setPlayers(updatedPlayers);
      setTimeout(() => setCelebrateClass(false), 600);
    } else {
      soundManager.playTick();
    }

    setTimeout(() => {
      setIsFlipped(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % cards.length);
        setActivePlayerIndex((prev) => (prev + 1) % players.length);
      }, 300);
    }, 400);
  };

  const activePlayer = players[activePlayerIndex];
  const currentCard = cards[currentIndex];

  return (
    <div className="flex-1 flex flex-col items-center justify-center fade-in px-4 relative min-h-screen">
      
      {/* Top Menu / Scores Bar */}
      <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start">
        <button 
          onClick={() => { soundManager.playTick(); onMenu(); }}
          className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 text-white transition-colors"
        >
          <Menu size={24} />
        </button>
        
        <div className="flex flex-col items-end gap-2">
          {players.map((p, i) => (
            <div key={p.id} className={`px-4 py-2 rounded-xl flex items-center gap-3 transition-colors ${i === activePlayerIndex ? 'bg-cyan-500/20 text-white border border-cyan-500/30' : 'bg-black/20 text-white/60 border border-white/5'}`}>
              <span className="text-sm font-bold">{p.name}</span>
              <span className="text-xs font-black px-2 py-1 bg-black/40 rounded-lg">{p.score} pts</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Focus Area */}
      <div className="w-full max-w-md flex flex-col items-center space-y-10 mt-16 md:mt-0">
        
        {/* Active Player Announcer */}
        <div className={`text-center space-y-2 ${celebrateClass ? 'celebrate-card' : ''}`}>
          <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">
            {activePlayer ? "Your Turn" : "Game Over"}
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-white">
            {activePlayer?.name}
          </h2>
        </div>

        {/* 3D Card Scene */}
        <div className="relative py-4 w-full">
          <div className="card-scene">
            <div 
              onClick={handleCardClick}
              className={`card-inner ${isFlipped ? 'is-flipped' : ''}`}
            >
              {/* Card Front */}
              <div className="card-face card-front">
                <div className="flex justify-between items-center text-white/30">
                  <span className="text-xs font-bold uppercase">{category}</span>
                  <Shuffle size={18} />
                </div>
                
                <div className="flex-1 flex flex-col items-center justify-center space-y-6">
                  <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                    <span className="text-4xl font-black text-white">?</span>
                  </div>
                  <h3 className="text-2xl font-black tracking-widest text-white uppercase text-center">Truth or Dare</h3>
                </div>

                <div className="text-center text-xs text-white/40 uppercase font-bold tracking-widest">
                  Tap to Reveal
                </div>
              </div>

              {/* Card Back */}
              <div className="card-face card-back">
                {currentCard ? (
                  <>
                    <div className="flex justify-between items-center pb-4 border-b border-white/10">
                      <span className={`text-sm font-black uppercase tracking-widest px-3 py-1 rounded-lg ${
                        currentCard.type === 'truth' 
                          ? 'bg-pink-500/20 text-pink-400' 
                          : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        {currentCard.type}
                      </span>
                      <span className="text-xs text-white/40 uppercase font-bold">
                        #{currentCard.tone}
                      </span>
                    </div>

                    <div className="flex-1 flex items-center justify-center p-2">
                      <p className="text-white text-xl md:text-2xl font-bold leading-relaxed text-center font-outfit">
                        "{currentCard.text}"
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-amber-400">
                    <AlertTriangle size={32} />
                    <p className="mt-4 font-bold">No cards left.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="h-16 w-full flex justify-center items-center">
          {isFlipped ? (
            <div className="flex gap-4 w-full fade-in">
              <button
                onClick={() => handleAction(false)}
                className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all border border-white/10"
              >
                <X size={20} /> Pass
              </button>
              <button
                onClick={() => handleAction(true)}
                className="flex-1 py-4 bg-cyan-500 hover:bg-cyan-400 text-white rounded-2xl font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
              >
                <Check size={20} /> Done
              </button>
            </div>
          ) : (
            <p className="text-white/40 text-sm font-bold tracking-widest uppercase fade-in">Tap card to read</p>
          )}
        </div>

      </div>
    </div>
  );
};
