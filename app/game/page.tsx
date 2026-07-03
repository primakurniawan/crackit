'use client';
import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { UserPlus, Trash2, Sparkles, ArrowRight } from 'lucide-react';
import { CATEGORIES, TONE_LABELS, CATEGORY_ACCENT } from '@/lib/seed-questions';
import type { GameCategory, Player, GameConfig } from '@/types';

export default function GameSetupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [category, setCategory] = React.useState<GameCategory>(
    (searchParams.get('category') as GameCategory) ?? 'friends'
  );
  const [tone, setTone] = React.useState<string>('');
  const [playerName, setPlayerName] = React.useState('');
  const [players, setPlayers] = React.useState<Player[]>([
    { id: '1', name: 'Player 1', score: 0 },
    { id: '2', name: 'Player 2', score: 0 },
  ]);

  const categoryObj = CATEGORIES.find((c) => c.id === category);

  // Sync tone when category changes
  React.useEffect(() => {
    if (categoryObj && categoryObj.tones.length > 0) {
      setTone(categoryObj.tones[0]);
    } else {
      setTone('custom');
    }
  }, [category, categoryObj]);

  const handleAddPlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim()) return;
    setPlayers((prev) => [...prev, { id: Date.now().toString(), name: playerName.trim(), score: 0 }]);
    setPlayerName('');
  };

  const handleStart = () => {
    if (players.length === 0) {
      alert('Add at least one player!');
      return;
    }

    const savedSettings = typeof window !== 'undefined'
      ? JSON.parse(localStorage.getItem('crackit_settings') ?? '{}')
      : {};

    const config: GameConfig = {
      category,
      tone,
      players,
      timerDuration: savedSettings.defaultTimerDuration ?? 60,
    };

    sessionStorage.setItem('crackit_game_config', JSON.stringify(config));
    router.push('/game/play');
  };

  const accent = CATEGORY_ACCENT[category] ?? '#06b6d4';

  return (
    <div className="fade-up">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 900, marginBottom: 6 }}>Set Up Game</h1>
        <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: 15 }}>Choose your deck, set the vibe, and add players.</p>
      </div>

      <div className="bento bento-3" style={{ alignItems: 'start' }}>

        {/* LEFT: Category + Tone */}
        <div className="col-span-2" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap)' }}>

          {/* Step 1: Category */}
          <div className="tile" style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <span style={{
                background: 'rgba(255,255,255,0.06)', padding: '4px 10px',
                borderRadius: 8, fontSize: 11, fontWeight: 800, letterSpacing: '0.06em', color: 'var(--text-muted)',
              }}>STEP 1</span>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>Choose Category</h2>
            </div>
            <div className="bento bento-2" style={{ gridAutoRows: 'auto' }}>
              {CATEGORIES.filter(c => c.id !== 'custom').map((cat) => {
                const isActive = category === cat.id;
                const catAccent = CATEGORY_ACCENT[cat.id];
                return (
                  <button key={cat.id} onClick={() => setCategory(cat.id as GameCategory)} style={{
                    padding: '16px 20px', borderRadius: 20, textAlign: 'left', cursor: 'pointer',
                    border: `1px solid ${isActive ? catAccent : 'var(--border)'}`,
                    background: isActive ? `${catAccent}18` : 'var(--bg-surface)',
                    transition: 'all 0.15s',
                  }}>
                    <h3 style={{ fontWeight: 700, fontSize: 15, color: isActive ? catAccent : 'var(--text-primary)', marginBottom: 4 }}>{cat.label}</h3>
                    <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)' }}>{cat.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Tone */}
          {categoryObj && categoryObj.tones.length > 0 && (
            <div className="tile" style={{ padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <span style={{
                  background: 'rgba(255,255,255,0.06)', padding: '4px 10px',
                  borderRadius: 8, fontSize: 11, fontWeight: 800, letterSpacing: '0.06em', color: 'var(--text-muted)',
                }}>STEP 2</span>
                <h2 style={{ fontSize: 18, fontWeight: 700 }}>Pick the Tone</h2>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {categoryObj.tones.map((t) => {
                  const isActive = tone === t;
                  return (
                    <button key={t} onClick={() => setTone(t)} style={{
                      padding: '10px 20px', borderRadius: 50, cursor: 'pointer',
                      border: `1px solid ${isActive ? accent : 'var(--border)'}`,
                      background: isActive ? accent : 'var(--bg-surface)',
                      color: isActive ? 'white' : 'var(--text-secondary)',
                      fontSize: 14, fontWeight: 700, transition: 'all 0.15s',
                    }}>
                      {TONE_LABELS[t] ?? t}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: Players */}
        <div className="tile" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{
              background: 'rgba(255,255,255,0.06)', padding: '4px 10px',
              borderRadius: 8, fontSize: 11, fontWeight: 800, letterSpacing: '0.06em', color: 'var(--text-muted)',
            }}>STEP 3</span>
            <h2 style={{ fontSize: 18, fontWeight: 700 }}>Add Players</h2>
          </div>

          <form onSubmit={handleAddPlayer} style={{ display: 'flex', gap: 8 }}>
            <input
              type="text" placeholder="Player name..."
              value={playerName} onChange={(e) => setPlayerName(e.target.value)}
              maxLength={20}
              style={{ flex: 1, padding: '10px 14px', fontSize: 14 }}
            />
            <button type="submit" style={{
              padding: '10px 14px', borderRadius: 14,
              background: 'var(--bg-hover)', border: '1px solid var(--border)',
              color: 'var(--text-primary)', cursor: 'pointer',
            }}>
              <UserPlus size={18} />
            </button>
          </form>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minHeight: 120 }}>
            {players.length === 0 && (
              <p style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', margin: '24px 0' }}>
                Add at least one player to start.
              </p>
            )}
            {players.map((p, i) => (
              <div key={p.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 14px', borderRadius: 14,
                background: 'var(--bg-surface)', border: '1px solid var(--border)',
              }}>
                <span style={{ fontSize: 14, fontWeight: 700 }}>
                  <span style={{ color: 'var(--text-muted)', marginRight: 8 }}>#{i + 1}</span>
                  {p.name}
                </span>
                <button onClick={() => setPlayers(players.filter(pl => pl.id !== p.id))}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}>
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          <button onClick={handleStart} disabled={players.length === 0} style={{
            width: '100%', padding: '16px', borderRadius: 20,
            background: players.length > 0 ? accent : 'var(--bg-hover)',
            border: 'none', cursor: players.length > 0 ? 'pointer' : 'not-allowed',
            color: 'white', fontFamily: 'var(--font-display)',
            fontSize: 17, fontWeight: 800,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            transition: 'all 0.15s',
          }}>
            <Sparkles size={20} /> Start Game <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
