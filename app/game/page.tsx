'use client';
import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { UserPlus, Trash2, Sparkles, ArrowRight, DollarSign, Receipt, Award } from 'lucide-react';
import { CATEGORIES, TONE_LABELS, CATEGORY_ACCENT } from '@/lib/seed-questions';
import type { GameCategory, Player, GameConfig, BillSplitMode } from '@/types';

function GameSetupPageContent() {
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

  // Bill Split state
  const [enableBillSplit, setEnableBillSplit] = React.useState(false);
  const [totalBillAmount, setTotalBillAmount] = React.useState(100);
  const [currency, setCurrency] = React.useState('$');
  const [splitMode, setSplitMode] = React.useState<BillSplitMode>('tiered');

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
      billSplit: enableBillSplit ? {
        enabled: true,
        totalAmount: Number(totalBillAmount) || 0,
        currency,
        splitMode,
      } : undefined,
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

      <div className="bento bento-3 setup-grid" style={{ alignItems: 'start' }}>

        {/* LEFT: Category + Tone */}
        <div className="col-span-2 setup-left" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap)' }}>

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

          {/* Step 3: Bill Split & Betting Stakes */}
          <div className="tile" style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{
                  background: 'rgba(255,255,255,0.06)', padding: '4px 10px',
                  borderRadius: 8, fontSize: 11, fontWeight: 800, letterSpacing: '0.06em', color: 'var(--text-muted)',
                }}>STEP 3</span>
                <h2 style={{ fontSize: 18, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Receipt size={20} color="#10b981" /> Bill Split & Stakes
                </h2>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, fontWeight: 700, color: enableBillSplit ? '#10b981' : 'var(--text-muted)' }}>
                <input
                  type="checkbox"
                  checked={enableBillSplit}
                  onChange={(e) => setEnableBillSplit(e.target.checked)}
                  style={{ width: 18, height: 18, accentColor: '#10b981', cursor: 'pointer' }}
                />
                Enable Stakes
              </label>
            </div>

            {enableBillSplit ? (
              <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6 }}>
                      TOTAL BILL AMOUNT
                    </label>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <span style={{ position: 'absolute', left: 14, fontSize: 16, fontWeight: 800, color: '#10b981' }}>{currency}</span>
                      <input
                        type="number"
                        min="1"
                        step="any"
                        value={totalBillAmount}
                        onChange={(e) => setTotalBillAmount(Math.max(1, Number(e.target.value)))}
                        style={{ width: '100%', padding: '10px 14px 10px 32px', fontSize: 16, fontWeight: 700 }}
                      />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6 }}>
                      CURRENCY
                    </label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', fontSize: 14, fontWeight: 700 }}
                    >
                      <option value="$">$ (USD)</option>
                      <option value="€">€ (EUR)</option>
                      <option value="£">£ (GBP)</option>
                      <option value="₹">₹ (INR)</option>
                      <option value="₩">₩ (KRW)</option>
                      <option value="¥">¥ (JPY/CNY)</option>
                    </select>
                  </div>
                </div>

                {/* Preset bill buttons */}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {[25, 50, 100, 150, 200].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setTotalBillAmount(amt)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 10,
                        border: totalBillAmount === amt ? '1px solid #10b981' : '1px solid var(--border)',
                        background: totalBillAmount === amt ? 'rgba(16,185,129,0.15)' : 'var(--bg-surface)',
                        color: totalBillAmount === amt ? '#10b981' : 'var(--text-secondary)',
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      {currency}{amt}
                    </button>
                  ))}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8 }}>
                    SPLIT STRATEGY BASED ON RANK
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      {
                        mode: 'tiered',
                        title: 'Rank Tiered (Top pays $0 / lowest)',
                        desc: '#1 pays $0 (or minimum), lower ranks pay larger share of bill.',
                      },
                      {
                        mode: 'proportional',
                        title: 'Proportional to Score Deficit',
                        desc: 'Players with lower points pay larger share based on points behind leader.',
                      },
                      {
                        mode: 'loser_pays_all',
                        title: 'Loser Pays All (Bottom Rank)',
                        desc: 'The player(s) in last place pay 100% of the bill.',
                      },
                    ].map((item) => {
                      const isActive = splitMode === item.mode;
                      return (
                        <button
                          key={item.mode}
                          type="button"
                          onClick={() => setSplitMode(item.mode as BillSplitMode)}
                          style={{
                            padding: '12px 14px',
                            borderRadius: 14,
                            textAlign: 'left',
                            cursor: 'pointer',
                            border: `1px solid ${isActive ? '#10b981' : 'var(--border)'}`,
                            background: isActive ? 'rgba(16,185,129,0.12)' : 'var(--bg-surface)',
                            transition: 'all 0.15s',
                          }}
                        >
                          <div style={{ fontSize: 14, fontWeight: 700, color: isActive ? '#10b981' : 'var(--text-primary)', marginBottom: 2 }}>
                            {item.title}
                          </div>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                            {item.desc}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
                Split dinner, drinks, or coffee bills based on final game ranking! Check &apos;Enable Stakes&apos; to set total bill amount and payout strategy.
              </p>
            )}
          </div>
        </div>

        {/* RIGHT: Players */}
        <div className="tile setup-right" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{
              background: 'rgba(255,255,255,0.06)', padding: '4px 10px',
              borderRadius: 8, fontSize: 11, fontWeight: 800, letterSpacing: '0.06em', color: 'var(--text-muted)',
            }}>STEP 4</span>
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
      <style>{`
        @media (max-width: 1023px) {
           .setup-grid { display: flex; flex-direction: column; }
           .setup-left, .setup-right { width: 100%; }
        }
      `}</style>
    </div>
  );
}

export default function GameSetupPage() {
  return (
    <React.Suspense fallback={
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Loading setup screen...</p>
      </div>
    }>
      <GameSetupPageContent />
    </React.Suspense>
  );
}
