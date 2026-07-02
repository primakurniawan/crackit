import React from 'react';
import { X, Volume2, VolumeX, Key, RotateCcw, ShieldCheck } from 'lucide-react';
import type { GameSettings } from '../types';
import { soundManager } from '../utils/soundEffects';

interface SettingsModalProps {
  settings: GameSettings;
  onUpdateSettings: (settings: GameSettings) => void;
  onClose: () => void;
  onResetCustomBank?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onUpdateSettings,
  onClose,
  onResetCustomBank
}) => {
  const [apiKey, setApiKey] = React.useState(settings.geminiApiKey);
  const [soundEnabled, setSoundEnabled] = React.useState(settings.soundEnabled);
  const [volume, setVolume] = React.useState(settings.soundVolume);

  const handleSave = () => {
    soundManager.setEnabled(soundEnabled);
    soundManager.setVolume(volume);
    
    onUpdateSettings({
      geminiApiKey: apiKey,
      soundEnabled,
      soundVolume: volume,
      aiMode: settings.aiMode
    });
    soundManager.playSuccess();
    onClose();
  };

  const handleSoundToggle = () => {
    const newVal = !soundEnabled;
    setSoundEnabled(newVal);
    soundManager.setEnabled(newVal);
    if (newVal) soundManager.playTick();
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    soundManager.setVolume(val);
    // play a quick click to let the user hear the volume level
    soundManager.playTick();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md fade-in">
      <div className="w-full max-w-md overflow-hidden glass-panel rounded-3xl border border-white/10 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            Game Settings
          </h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-full text-white/50 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Sound Controls */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-white/70 block">Audio & Sounds</label>
            <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
              <button
                type="button"
                onClick={handleSoundToggle}
                className={`p-3 rounded-xl transition-all ${
                  soundEnabled 
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' 
                    : 'bg-white/5 text-white/40 border border-white/5'
                }`}
              >
                {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
              </button>
              <div className="flex-1 space-y-1">
                <div className="flex justify-between text-xs text-white/50">
                  <span>Volume</span>
                  <span>{Math.round(volume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={volume}
                  disabled={!soundEnabled}
                  onChange={handleVolumeChange}
                  className="w-full cursor-pointer accent-cyan-500 disabled:opacity-40 disabled:cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* AI Settings */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-white/70 flex items-center gap-2">
              <Key size={16} /> Gemini AI API Key
            </label>
            <div className="space-y-2">
              <input
                type="password"
                placeholder="Enter Gemini API Key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all text-sm"
              />
              <p className="text-[11px] text-white/40 leading-relaxed">
                Your key is stored <strong>locally in your browser</strong> and sent directly to Google's API endpoint. We do not store or transmit it anywhere else.
              </p>
              <div className="flex items-start gap-2 bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl text-emerald-400">
                <ShieldCheck size={16} className="shrink-0 mt-0.5" />
                <span className="text-[11px] leading-snug">
                  Adding an API key unlocks <strong>AI Mode</strong>, which generates dynamic card decks matching any custom prompt or theme you describe!
                </span>
              </div>
            </div>
          </div>

          {/* Question Bank Reset */}
          {onResetCustomBank && (
            <div className="pt-2 border-t border-white/5 space-y-2">
              <label className="text-sm font-semibold text-white/70 block">Developer / Reset Tools</label>
              <button
                type="button"
                onClick={() => {
                  if (confirm('Are you sure you want to reset the Custom Question Bank? This deletes all custom cards.')) {
                    onResetCustomBank();
                  }
                }}
                className="w-full py-2.5 px-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/30 text-red-400 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all"
              >
                <RotateCcw size={14} /> Reset Custom Cards
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-black/20 border-t border-white/5 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl border border-white/10 text-white/70 hover:text-white hover:bg-white/5 font-semibold text-sm transition-all"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 py-3 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white font-semibold text-sm shadow-lg shadow-cyan-500/20 transition-all"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};
