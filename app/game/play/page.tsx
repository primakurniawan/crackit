'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { X, Check, Menu, AlertTriangle, Shuffle, Receipt, Trophy, Copy, CheckCircle2, RotateCcw } from 'lucide-react';
import type { Card, GameConfig, GameState } from '@/types';
import Timer from '@/components/game/Timer';
import { CATEGORY_ACCENT } from '@/lib/seed-questions';
import { calculateBillShares } from '@/lib/bill-split';

const STORAGE_KEY = 'crackit_game_state';

export default function GameBoardPage() {
  const router = useRouter();

  const [gameState, setGameState] = React.useState<GameState | null>(null);
  const [isFlipped, setIsFlipped] = React.useState(false);
  const [timerKey, setTimerKey] = React.useState(0); // increment to reset timer
  const [celebrate, setCelebrate] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [timerRunning, setTimerRunning] = React.useState(false); // only run after flip
  const [showStakesModal, setShowStakesModal] = React.useState(false);
  const [showEndGameModal, setShowEndGameModal] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

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

  const billShares = calculateBillShares(config.players, config.billSplit);

  const handleCopySummary = () => {
    if (!config.billSplit?.enabled) return;
    const lines = [
      `🧾 *CrackIt Bill Split Summary* 🧾`,
      `Total Bill: ${config.billSplit.currency}${config.billSplit.totalAmount.toFixed(2)}`,
      `Split Strategy: ${config.billSplit.splitMode.toUpperCase()}`,
      `----------------------------`,
      ...billShares.map(
        (s) =>
          `#${s.rank} ${s.playerName}: ${s.score} pts ➔ ${config.billSplit?.currency}${s.amountOwed.toFixed(2)} (${s.percentage}%)`
      ),
      `----------------------------`,
      `Generated by CrackIt Truth or Dare`,
    ];
    navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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

        {/* Player Scores & Live Stakes Button */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          {config.billSplit?.enabled && (
            <button
              onClick={() => setShowStakesModal(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '7px 12px', borderRadius: 12,
                background: 'rgba(16,185,129,0.15)', border: '1px solid #10b981',
                color: '#10b981', cursor: 'pointer', fontSize: 12, fontWeight: 800,
              }}
            >
              <Receipt size={14} /> Live Stakes ({config.billSplit.currency}{config.billSplit.totalAmount})
            </button>
          )}

          <button
            onClick={() => setShowEndGameModal(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '7px 12px', borderRadius: 12,
              background: 'var(--bg-elevated)', border: '1px solid var(--border)',
              color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 12, fontWeight: 700,
            }}
          >
            <Trophy size={14} color="#f59e0b" /> Standings
          </button>

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

      {/* ── Live Stakes Modal ────────────────────────────────────────── */}
      {showStakesModal && config.billSplit?.enabled && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100,
          background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
        }}>
          <div className="tile fade-up" style={{ width: '100%', maxWidth: 440, padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(16,185,129,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
                  <Receipt size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 800 }}>Live Bill Allocation</h3>
                  <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)' }}>
                    Total: {config.billSplit.currency}{config.billSplit.totalAmount.toFixed(2)} &bull; Strategy: {config.billSplit.splitMode}
                  </p>
                </div>
              </div>
              <button onClick={() => setShowStakesModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4 }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {billShares.map((share) => (
                <div key={share.playerId} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px 16px', borderRadius: 16,
                  background: 'var(--bg-surface)', border: '1px solid var(--border)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{
                      fontWeight: 800, fontSize: 12, width: 24, height: 24, borderRadius: '50%',
                      background: share.rank === 1 ? '#f59e0b' : 'rgba(255,255,255,0.1)',
                      color: share.rank === 1 ? '#000' : 'var(--text-primary)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {share.rank}
                    </span>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700 }}>{share.playerName}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{share.score} pts</div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: share.amountOwed === 0 ? '#10b981' : 'var(--text-primary)' }}>
                      {config.billSplit?.currency}{share.amountOwed.toFixed(2)}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      {share.percentage}% of bill
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={handleCopySummary} style={{
                flex: 1, padding: '12px', borderRadius: 14,
                background: 'var(--bg-surface)', border: '1px solid var(--border)',
                color: 'var(--text-primary)', fontWeight: 700, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 13,
              }}>
                {copied ? <CheckCircle2 size={16} color="#10b981" /> : <Copy size={16} />}
                {copied ? 'Copied to Clipboard!' : 'Copy Breakdown'}
              </button>
              <button onClick={() => setShowStakesModal(false)} style={{
                padding: '12px 20px', borderRadius: 14,
                background: 'var(--accent)', border: 'none',
                color: 'white', fontWeight: 800, cursor: 'pointer', fontSize: 13,
              }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Standings / End Game Modal ──────────────────────────────── */}
      {showEndGameModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100,
          background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(10px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
        }}>
          <div className="tile fade-up" style={{ width: '100%', maxWidth: 460, padding: 28, display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 44, marginBottom: 8 }}>🏆</div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 900, margin: 0 }}>
                Game Standings
              </h2>
              <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-secondary)' }}>
                {config.billSplit?.enabled ? 'Final rankings and bill split allocation' : 'Current player ranks & scores'}
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {billShares.map((share) => (
                <div key={share.playerId} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '14px 18px', borderRadius: 18,
                  background: share.rank === 1 ? 'rgba(245,158,11,0.12)' : 'var(--bg-surface)',
                  border: `1px solid ${share.rank === 1 ? '#f59e0b' : 'var(--border)'}`,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%',
                      background: share.rank === 1 ? '#f59e0b' : 'rgba(255,255,255,0.08)',
                      color: share.rank === 1 ? '#000' : 'var(--text-primary)',
                      fontWeight: 900, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      #{share.rank}
                    </div>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 800, color: share.rank === 1 ? '#f59e0b' : 'var(--text-primary)' }}>
                        {share.playerName}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        {share.score} points
                      </div>
                    </div>
                  </div>

                  {config.billSplit?.enabled && (
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 16, fontWeight: 900, color: share.amountOwed === 0 ? '#10b981' : 'var(--text-primary)' }}>
                        {config.billSplit.currency}{share.amountOwed.toFixed(2)}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        {share.percentage}% share
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
              {config.billSplit?.enabled && (
                <button onClick={handleCopySummary} style={{
                  padding: '14px', borderRadius: 16,
                  background: 'rgba(16,185,129,0.15)', border: '1px solid #10b981',
                  color: '#10b981', fontWeight: 800, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 14,
                }}>
                  {copied ? <CheckCircle2 size={18} /> : <Copy size={18} />}
                  {copied ? 'Summary Copied to Clipboard!' : 'Copy Bill Summary'}
                </button>
              )}

              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setShowEndGameModal(false)} style={{
                  flex: 1, padding: '14px', borderRadius: 16,
                  background: 'var(--bg-surface)', border: '1px solid var(--border)',
                  color: 'var(--text-secondary)', fontWeight: 700, cursor: 'pointer', fontSize: 14,
                }}>
                  Continue Playing
                </button>
                <button onClick={() => {
                  sessionStorage.removeItem(STORAGE_KEY);
                  router.push('/game');
                }} style={{
                  flex: 1, padding: '14px', borderRadius: 16,
                  background: accent, border: 'none',
                  color: 'white', fontWeight: 800, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 14,
                }}>
                  <RotateCcw size={16} /> New Game
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
