'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { X, Check, Menu, AlertTriangle, Shuffle } from 'lucide-react';
import type { Card, GameConfig, GameState } from '@/types';
import Timer from '@/components/game/Timer';
import { CATEGORY_ACCENT } from '@/lib/seed-questions';

const STORAGE_KEY = 'crackit_game_state';

export default function GameBoardPage() {
  const router = useRouter();

  const [gameState, setGameState] = React.useState<GameState | null>(null);
  const [isFlipped, setIsFlipped] = React.useState(false);
  const [timerKey, setTimerKey] = React.useState(0); // increment to reset timer
  const [celebrate, setCelebrate] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [timerRunning, setTimerRunning] = React.useState(false); // only run after flip

  // Load or init game state
  React.useEffect(() => {
    const initGame = async () => {
      // Try to restore existing session
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const parsed: GameState = JSON.parse(saved);
          setGameState(parsed);
          setIsLoading(false);
          return;
        } catch { /* fallthrough */ }
      }

      // Fresh start — read config
      const configRaw = sessionStorage.getItem('crackit_game_config');
      if (!configRaw) {
        router.replace('/game');
        return;
      }

      const config: GameConfig = JSON.parse(configRaw);

      // Fetch cards from API
      const params = new URLSearchParams();
      if (config.category !== 'custom') {
        params.set('category', config.category);
        if (config.tone !== 'custom') params.set('tone', config.tone);
      }

      const res = await fetch(`/api/questions?${params}`);
      const data = await res.json();
      let cards: Card[] = data.questions ?? [];

      // Load custom cards from localStorage
      const customRaw = localStorage.getItem('crackit_custom_cards');
      if (customRaw) {
        const customCards: Card[] = JSON.parse(customRaw);
        if (config.category === 'custom') {
          cards = customCards;
        } else {
          cards = [...cards, ...customCards.filter((c) => c.category === config.category)];
        }
      }

      if (cards.length === 0) {
        alert('No questions found for this category/tone. Try another combination!');
        router.replace('/game');
        return;
      }

      // Shuffle
      const shuffled = [...cards].sort(() => Math.random() - 0.5);

      const newState: GameState = {
        config,
        cards: shuffled,
        currentIndex: 0,
        activePlayerIndex: 0,
        isFlipped: false,
        startedAt: Date.now(),
      };

      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
      setGameState(newState);
      setIsLoading(false);
    };

    initGame();
  }, [router]);

  // Persist on every state change
  React.useEffect(() => {
    if (gameState) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
    }
  }, [gameState]);

  const handleFlip = () => {
    if (!gameState || isFlipped) return;
    setIsFlipped(true);
    setTimerRunning(true);
  };

  const handleAction = (completed: boolean) => {
    if (!gameState) return;
    setTimerRunning(false);

    if (completed) {
      // Award 10 points
      setCelebrate(true);
      const updatedPlayers = gameState.config.players.map((p, i) =>
        i === gameState.activePlayerIndex ? { ...p, score: p.score + 10 } : p
      );
      const updated = {
        ...gameState,
        config: { ...gameState.config, players: updatedPlayers },
      };
      setGameState(updated);
      setTimeout(() => setCelebrate(false), 600);
    }

    // Advance card
    setTimeout(() => {
      setIsFlipped(false);
      setTimeout(() => {
        if (!gameState) return;
        const nextIndex = (gameState.currentIndex + 1) % gameState.cards.length;
        const nextPlayer = (gameState.activePlayerIndex + 1) % gameState.config.players.length;
        const newState = {
          ...gameState,
          currentIndex: nextIndex,
          activePlayerIndex: nextPlayer,
        };
        // Update players from celebrate update too
        setGameState((prev) => prev ? { ...newState, config: { ...newState.config, players: prev.config.players } } : newState);
        setTimerKey((k) => k + 1);
      }, 350);
    }, 300);
  };

  const handleTimerExpire = () => {
    if (!isFlipped) return;
    handleAction(false); // auto-pass on time up
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 16 }}>
        <div style={{ fontSize: 48 }} className="pulse-dot">🃏</div>
        <p style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Shuffling deck...</p>
      </div>
    );
  }

  if (!gameState) return null;

  const { config, cards, currentIndex, activePlayerIndex } = gameState;
  const activePlayer = config.players[activePlayerIndex];
  const currentCard = cards[currentIndex];
  const accent = CATEGORY_ACCENT[config.category] ?? '#06b6d4';

  return (
    <div className={`theme-${config.category}`} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap)' }}>

      {/* Top Bar */}
      <div className="top-bar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <button className="menu-btn" onClick={() => {
          if (confirm('End this game and go back to setup?')) {
            sessionStorage.removeItem(STORAGE_KEY);
            router.push('/game');
          }
        }} style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderRadius: 14,
          background: 'var(--bg-elevated)', border: '1px solid var(--border)',
          color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 13, fontWeight: 600,
        }}>
          <Menu size={16} /> Menu
        </button>

        {/* Player Scores */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          {config.players.map((p, i) => (
            <div key={p.id} style={{
              padding: '6px 14px', borderRadius: 12,
              background: i === activePlayerIndex ? `${accent}22` : 'var(--bg-elevated)',
              border: `1px solid ${i === activePlayerIndex ? accent : 'var(--border)'}`,
              display: 'flex', alignItems: 'center', gap: 8,
              transition: 'all 0.25s',
            }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: i === activePlayerIndex ? accent : 'var(--text-secondary)' }}>
                {p.name}
              </span>
              <span style={{
                fontSize: 11, fontWeight: 800, padding: '2px 8px',
                background: 'rgba(0,0,0,0.3)', borderRadius: 8,
                color: i === activePlayerIndex ? accent : 'var(--text-muted)',
              }}>
                {p.score}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Game Area */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28, paddingTop: 20 }}>

        {/* Active Player */}
        <div className={celebrate ? 'celebrate' : ''} style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: accent, marginBottom: 6 }}>
            YOUR TURN
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>
            {activePlayer?.name}
          </h2>
        </div>

        {/* Card + Timer Row */}
        <div className="card-timer-row" style={{ display: 'flex', alignItems: 'center', gap: 32, width: '100%' }}>

          {/* 3D Card */}
          <div className="card-scene" onClick={handleFlip} style={{ cursor: isFlipped ? 'default' : 'pointer', flexShrink: 0 }}>
            <div className={`card-inner ${isFlipped ? 'flipped' : ''}`}>

              {/* Front */}
              <div className="card-face card-front">
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  <span>{config.category}</span>
                  <Shuffle size={16} />
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
                  <div style={{
                    width: 80, height: 80, borderRadius: '50%',
                    background: 'var(--bg-surface)', border: '1px solid var(--border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 36,
                  }}>🃏</div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, margin: 0, letterSpacing: '0.05em' }}>
                    TRUTH OR DARE
                  </h3>
                </div>
                <div style={{ textAlign: 'center', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  Tap to Reveal
                </div>
              </div>

              {/* Back */}
              <div className="card-face card-back">
                {currentCard ? (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
                      <span style={{
                        padding: '5px 12px', borderRadius: 8, fontSize: 11, fontWeight: 800, textTransform: 'uppercase',
                        background: currentCard.type === 'truth' ? 'rgba(244,63,94,0.2)' : 'rgba(245,158,11,0.2)',
                        color: currentCard.type === 'truth' ? '#f43f5e' : '#f59e0b',
                      }}>
                        {currentCard.type}
                      </span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                        #{currentCard.tone}
                      </span>
                    </div>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px 0' }}>
                      <p style={{
                        fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700,
                        lineHeight: 1.5, textAlign: 'center', margin: 0, color: 'var(--text-primary)',
                      }}>
                        &ldquo;{currentCard.text}&rdquo;
                      </p>
                    </div>
                  </>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#f59e0b' }}>
                    <AlertTriangle size={32} />
                    <p style={{ marginTop: 12, fontWeight: 600 }}>No cards found.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Timer (shows when flipped) */}
          {isFlipped && (
            <div className="fade-up">
              <Timer
                key={timerKey}
                duration={config.timerDuration}
                onExpire={handleTimerExpire}
                paused={!timerRunning}
              />
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', maxWidth: 400 }}>
          {isFlipped ? (
            <div className="fade-up" style={{ display: 'flex', gap: 12, width: '100%' }}>
              <button onClick={() => handleAction(false)} style={{
                flex: 1, padding: '16px', borderRadius: 20,
                background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                color: 'var(--text-secondary)', cursor: 'pointer',
                fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 15,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}>
                <X size={18} /> Pass
              </button>
              <button onClick={() => handleAction(true)} style={{
                flex: 1, padding: '16px', borderRadius: 20,
                background: accent, border: 'none',
                color: 'white', cursor: 'pointer',
                fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 15,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}>
                <Check size={18} /> Done! +10
              </button>
            </div>
          ) : (
            <p className="fade-up" style={{ color: 'var(--text-muted)', fontSize: 13, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Tap the card to reveal
            </p>
          )}
        </div>

        {/* Card counter */}
        <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>
          Card {currentIndex + 1} of {cards.length}
        </div>
      </div>
      <style>{`
        @media (max-width: 768px) {
          .top-bar { flex-direction: column; align-items: stretch !important; }
          .menu-btn { align-self: flex-start; }
          .card-timer-row { flex-direction: column; gap: 20px !important; }
        }
      `}</style>
    </div>
  );
}
