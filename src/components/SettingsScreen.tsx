import React from 'react';
import { ArrowLeft, Volume2, VolumeX, RotateCcw } from 'lucide-react';
import type { GameSettings } from '../types';
import { soundManager } from '../utils/soundEffects';

interface SettingsScreenProps {
  settings: GameSettings;
  onUpdateSettings: (settings: GameSettings) => void;
  onBack: () => void;
  onResetCustomBank?: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  settings,
  onUpdateSettings,
  onBack,
  onResetCustomBank
}) => {
  const [soundEnabled, setSoundEnabled] = React.useState(settings.soundEnabled);
  const [volume, setVolume] = React.useState(settings.soundVolume);

  const handleBack = () => {
    soundManager.setEnabled(soundEnabled);
    soundManager.setVolume(volume);
    
    onUpdateSettings({
      soundEnabled,
      soundVolume: volume
    });
    soundManager.playTick();
    onBack();
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
    soundManager.playTick();
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 fade-in min-h-[80vh] flex flex-col">
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={handleBack}
          className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-white"
        >
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-3xl font-bold text-white">Settings</h2>
      </div>

      <div className="bento-grid grid-cols-1 md:grid-cols-2">
        {/* Audio Controls */}
        <div className="bento-item col-span-1 md:col-span-2 p-6 space-y-6">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-cyan-500/10 text-cyan-400 rounded-2xl shrink-0">
              {soundEnabled ? <Volume2 size={32} /> : <VolumeX size={32} />}
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Audio & Sound Effects</h3>
              <p className="text-sm text-white/50">Procedural sounds for shuffling and actions</p>
            </div>
          </div>

          <div className="flex items-center gap-6 bg-black/20 p-5 rounded-2xl border border-white/5">
            <button
              onClick={handleSoundToggle}
              className={`px-6 py-3 rounded-xl font-bold transition-colors ${
                soundEnabled 
                  ? 'bg-cyan-500 text-white' 
                  : 'bg-white/10 text-white/50'
              }`}
            >
              {soundEnabled ? 'Enabled' : 'Disabled'}
            </button>
            
            <div className="flex-1 space-y-2">
              <div className="flex justify-between text-xs text-white/50 font-semibold uppercase tracking-wider">
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
                className="w-full cursor-pointer accent-cyan-500 disabled:opacity-40"
              />
            </div>
          </div>
        </div>

        {/* Question Bank Reset */}
        {onResetCustomBank && (
          <div className="bento-item col-span-1 md:col-span-2 p-6 space-y-4">
            <h3 className="text-lg font-bold text-red-400">Danger Zone</h3>
            <p className="text-sm text-white/50">Clear out your locally saved custom questions.</p>
            <button
              onClick={() => {
                if (confirm('Are you sure you want to reset the Custom Question Bank? This deletes all custom cards permanently.')) {
                  onResetCustomBank();
                }
              }}
              className="w-full sm:w-auto py-3 px-6 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
            >
              <RotateCcw size={18} /> Reset Custom Deck
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
