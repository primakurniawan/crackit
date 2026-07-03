import Link from 'next/link';
import { Sparkles, Heart, Users, Home, Briefcase, ArrowRight, Zap, Clock } from 'lucide-react';
import { CATEGORIES } from '@/lib/seed-questions';

// Stat cards data
const STATS = [
  { label: 'Categories', value: '5', icon: '🎯' },
  { label: 'Questions', value: '150+', icon: '📝' },
  { label: 'AI Refresh', value: 'Daily', icon: '🤖' },
  { label: 'Players', value: '2–12', icon: '👥' },
];

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  relationship: <Heart size={22} />,
  friends:      <Users size={22} />,
  family:       <Home size={22} />,
  seminar:      <Briefcase size={22} />,
  custom:       <Zap size={22} />,
};

const CATEGORY_ACCENTS: Record<string, string> = {
  relationship: '#f43f5e',
  friends:      '#a855f7',
  family:       '#f59e0b',
  seminar:      '#10b981',
  custom:       '#0ea5e9',
};

export default function HomePage() {
  return (
    <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap)' }}>

      {/* ── Hero Bento Row ───────────────────────────────────────────────── */}
      <div className="bento bento-6" style={{ gridAutoRows: 180 }}>

        {/* Play Now — biggest tile */}
        <Link href="/game" className="tile tile-accent tile-interactive col-span-4 row-span-2" style={{
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          gap: 16, textDecoration: 'none', color: 'white',
        }}>
          <div style={{ fontSize: 64 }}>🃏</div>
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 900, marginBottom: 6 }}>
              Play CrackIt
            </h1>
            <p style={{ margin: 0, fontSize: 16, opacity: 0.8, fontWeight: 500 }}>
              Truth or Dare — for every occasion
            </p>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'rgba(255,255,255,0.2)', padding: '10px 20px', borderRadius: 50,
            fontSize: 14, fontWeight: 700,
          }}>
            Start Game <ArrowRight size={16} />
          </div>
        </Link>

        {/* Stat tiles */}
        {STATS.map((stat) => (
          <div key={stat.label} className="tile" style={{
            display: 'flex', flexDirection: 'column',
            justifyContent: 'center', padding: '20px 24px',
            gap: 8,
          }}>
            <span style={{ fontSize: 28 }}>{stat.icon}</span>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, color: 'var(--text-primary)' }}>
              {stat.value}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* ── How It Works ─────────────────────────────────────────────────── */}
      <div className="bento bento-3">
        {[
          { step: '01', title: 'Pick a Deck', desc: 'Choose your category and vibe — Relationship, Friends, Family, or Work.', color: '#f43f5e' },
          { step: '02', title: 'Add Players', desc: 'Add all players by name. Scores are tracked automatically through the game.', color: '#a855f7' },
          { step: '03', title: 'Flip & Answer', desc: 'Tap the card to reveal your Truth or Dare. You have a timer — no stalling!', color: '#06b6d4' },
        ].map((item) => (
          <div key={item.step} className="tile" style={{ padding: '28px 24px' }}>
            <div style={{
              fontFamily: 'var(--font-display)', fontSize: 42, fontWeight: 900,
              color: item.color, marginBottom: 12, lineHeight: 1,
            }}>
              {item.step}
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{item.title}</h3>
            <p style={{ margin: 0, fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{item.desc}</p>
          </div>
        ))}
      </div>

      {/* ── Category Tiles ────────────────────────────────────────────────── */}
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, margin: '8px 0 0' }}>
        Choose your vibe
      </h2>
      <div className="bento bento-2" style={{ gridAutoRows: 'auto' }}>
        {CATEGORIES.filter(c => c.id !== 'custom').map((cat) => {
          const accent = CATEGORY_ACCENTS[cat.id];
          return (
            <Link key={cat.id} href={`/game?category=${cat.id}`} className="tile tile-interactive" style={{
              padding: '24px 28px', display: 'flex', alignItems: 'center',
              gap: 20, textDecoration: 'none', color: 'var(--text-primary)',
            }}>
              <div style={{
                width: 52, height: 52, borderRadius: 16,
                background: `${accent}22`,
                color: accent,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                {CATEGORY_ICONS[cat.id]}
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 4 }}>{cat.label}</h3>
                <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)' }}>{cat.description}</p>
                <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
                  {cat.tones.map((tone) => (
                    <span key={tone} style={{
                      fontSize: 11, fontWeight: 700, padding: '3px 10px',
                      borderRadius: 50, border: `1px solid ${accent}44`,
                      color: accent, textTransform: 'capitalize',
                    }}>
                      {tone}
                    </span>
                  ))}
                </div>
              </div>
              <ArrowRight size={18} color="var(--text-muted)" />
            </Link>
          );
        })}
      </div>

      {/* ── Timer Feature Callout ─────────────────────────────────────────── */}
      <div className="tile" style={{
        padding: '28px 32px',
        display: 'flex', alignItems: 'center', gap: 24,
        background: 'rgba(6,182,212,0.06)', borderColor: 'rgba(6,182,212,0.2)',
      }}>
        <div style={{
          width: 56, height: 56, borderRadius: 18,
          background: 'rgba(6,182,212,0.15)', color: '#06b6d4',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Clock size={28} />
        </div>
        <div>
          <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 4, color: '#06b6d4' }}>Built-in Answer Timer</h3>
          <p style={{ margin: 0, fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Each card comes with a countdown — no more stalling! Configure from 30 seconds to 5 minutes in Settings. Game state is saved on refresh.
          </p>
        </div>
      </div>

    </div>
  );
}
