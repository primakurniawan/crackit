'use client';
import React from 'react';
import { Volume2, VolumeX, Clock, RotateCcw, Save } from 'lucide-react';
import type { AppSettings } from '@/types';

const SETTINGS_KEY = 'crackit_settings';

const DEFAULT_SETTINGS: AppSettings = {
  soundEnabled: true,
  soundVolume: 0.6,
  defaultTimerDuration: 60,
};

export default function SettingsPage() {
  const [settings, setSettings] = React.useState<AppSettings>(DEFAULT_SETTINGS);
  const [saved, setSaved] = React.useState(false);

  React.useEffect(() => {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      try { setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(raw) }); } catch { /* ignore */ }
    }
  }, []);

  const update = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const formatTimer = (s: number) => {
    if (s < 60) return `${s} seconds`;
    const m = Math.floor(s / 60);
    const rem = s % 60;
    return rem === 0 ? `${m} minute${m > 1 ? 's' : ''}` : `${m}m ${rem}s`;
  };

  return (
    <div className="fade-up" style={{ maxWidth: 640 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 900, marginBottom: 6 }}>Settings</h1>
        <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: 15 }}>Customize your CrackIt experience.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap)' }}>

        {/* Sound Settings */}
        <div className="tile" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 16,
              background: 'rgba(6,182,212,0.12)', color: '#06b6d4',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              {settings.soundEnabled ? <Volume2 size={24} /> : <VolumeX size={24} />}
            </div>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Sound Effects</h2>
              <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)' }}>Procedural audio for card flips and actions</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '20px', background: 'var(--bg-surface)', borderRadius: 20, border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 14, fontWeight: 600 }}>Enable Sounds</span>
              <button onClick={() => update('soundEnabled', !settings.soundEnabled)} style={{
                width: 52, height: 28, borderRadius: 14, border: 'none', cursor: 'pointer',
                background: settings.soundEnabled ? '#06b6d4' : 'var(--bg-hover)',
                position: 'relative', transition: 'background 0.2s',
              }}>
                <div style={{
                  width: 20, height: 20, borderRadius: '50%', background: 'white',
                  position: 'absolute', top: 4,
                  left: settings.soundEnabled ? 28 : 4,
                  transition: 'left 0.2s',
                }} />
              </button>
            </div>

            {settings.soundEnabled && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>Volume</span>
                  <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 700 }}>{Math.round(settings.soundVolume * 100)}%</span>
                </div>
                <input type="range" min="0" max="1" step="0.05"
                  value={settings.soundVolume}
                  onChange={(e) => update('soundVolume', parseFloat(e.target.value))} />
              </div>
            )}
          </div>
        </div>

        {/* Timer Settings */}
        <div className="tile" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 16,
              background: 'rgba(245,158,11,0.12)', color: '#f59e0b',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <Clock size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Answer Timer</h2>
              <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)' }}>How long players have to answer after flipping a card</p>
            </div>
          </div>

          <div style={{ padding: '20px', background: 'var(--bg-surface)', borderRadius: 20, border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 14, fontWeight: 600 }}>Duration</span>
              <span style={{
                fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 800, color: '#f59e0b',
              }}>{formatTimer(settings.defaultTimerDuration)}</span>
            </div>
            <input type="range" min="30" max="300" step="15"
              value={settings.defaultTimerDuration}
              onChange={(e) => update('defaultTimerDuration', parseInt(e.target.value))} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>
              <span>30s</span>
              <span>2min</span>
              <span>5min</span>
            </div>
            {/* Preset buttons */}
            <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
              {[30, 60, 90, 120, 180, 300].map((s) => (
                <button key={s} onClick={() => update('defaultTimerDuration', s)} style={{
                  padding: '6px 14px', borderRadius: 10,
                  border: `1px solid ${settings.defaultTimerDuration === s ? '#f59e0b' : 'var(--border)'}`,
                  background: settings.defaultTimerDuration === s ? 'rgba(245,158,11,0.15)' : 'var(--bg-hover)',
                  color: settings.defaultTimerDuration === s ? '#f59e0b' : 'var(--text-muted)',
                  fontWeight: 700, fontSize: 12, cursor: 'pointer',
                }}>
                  {formatTimer(s)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="tile" style={{ padding: 24, borderColor: 'rgba(239,68,68,0.2)' }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: '#ef4444' }}>Danger Zone</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 16 }}>
            Clear all locally stored custom questions and game states.
          </p>
          <button onClick={() => {
            if (confirm('This will delete all your custom cards and saved game state. Continue?')) {
              localStorage.removeItem('crackit_custom_cards');
              sessionStorage.removeItem('crackit_game_state');
              alert('Local data cleared.');
            }
          }} style={{
            padding: '12px 20px', borderRadius: 14,
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
            color: '#ef4444', cursor: 'pointer', fontWeight: 700, fontSize: 13,
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <RotateCcw size={16} /> Clear Local Data
          </button>
        </div>

        {/* Save Button */}
        <button onClick={handleSave} style={{
          padding: '16px', borderRadius: 20,
          background: saved ? '#10b981' : 'var(--accent)',
          border: 'none', color: 'white', cursor: 'pointer',
          fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 16,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          transition: 'background 0.3s',
        }}>
          {saved ? '✓ Saved!' : <><Save size={18} /> Save Settings</>}
        </button>
      </div>
    </div>
  );
}
