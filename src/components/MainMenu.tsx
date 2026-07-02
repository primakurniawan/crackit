import React from 'react';
import { Play, Settings, Edit3, Heart, Users, Briefcase, User, Sparkles } from 'lucide-react';
import { soundManager } from '../utils/soundEffects';

interface MainMenuProps {
  onNavigate: (screen: 'setup' | 'settings' | 'editor') => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 fade-in flex flex-col justify-center min-h-[80vh]">
      <div className="mb-10 text-center md:text-left px-2">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white flex flex-col md:flex-row items-center gap-3">
          <div className="w-14 h-14 rounded-3xl bg-cyan-500 text-white flex items-center justify-center shadow-lg shadow-cyan-500/20 shrink-0">
            <Sparkles size={28} />
          </div>
          Icebreaker Cards
        </h1>
        <p className="text-white/50 font-medium mt-3 text-sm md:text-base">
          The ultimate Truth or Dare experience.
        </p>
      </div>

      <div className="bento-grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 auto-rows-[140px]">
        {/* Play Game - Large spanning tile */}
        <button
          onClick={() => { soundManager.playSuccess(); onNavigate('setup'); }}
          className="bento-item primary interactive col-span-2 md:col-span-4 lg:col-span-4 row-span-2 flex flex-col items-center justify-center p-8 gap-4"
        >
          <Play size={48} className="fill-white" />
          <h2 className="text-3xl font-black tracking-wide">Play Game</h2>
          <span className="text-white/80 text-sm font-medium">Start a new session</span>
        </button>

        {/* Quick Stats or Categories info */}
        <div className="bento-item col-span-1 md:col-span-2 lg:col-span-2 row-span-1 flex items-center p-6 gap-4">
          <div className="p-3 bg-pink-500/10 text-pink-500 rounded-2xl">
            <Heart size={24} />
          </div>
          <div>
            <h3 className="font-bold text-white">Relationship</h3>
            <p className="text-xs text-white/50 mt-0.5">Deep & Spicy</p>
          </div>
        </div>

        <div className="bento-item col-span-1 md:col-span-2 lg:col-span-2 row-span-1 flex items-center p-6 gap-4">
          <div className="p-3 bg-purple-500/10 text-purple-500 rounded-2xl">
            <Users size={24} />
          </div>
          <div>
            <h3 className="font-bold text-white">Friends</h3>
            <p className="text-xs text-white/50 mt-0.5">Funny & Awkward</p>
          </div>
        </div>

        {/* Action Tiles */}
        <button
          onClick={() => { soundManager.playTick(); onNavigate('editor'); }}
          className="bento-item interactive col-span-2 md:col-span-3 lg:col-span-3 row-span-1 flex items-center justify-center p-6 gap-4"
        >
          <div className="p-3 bg-amber-500/10 text-amber-500 rounded-2xl">
            <Edit3 size={24} />
          </div>
          <div className="text-left">
            <h3 className="font-bold text-white">Question Bank</h3>
            <p className="text-xs text-white/50 mt-0.5">Manage custom cards</p>
          </div>
        </button>

        <button
          onClick={() => { soundManager.playTick(); onNavigate('settings'); }}
          className="bento-item interactive col-span-2 md:col-span-3 lg:col-span-3 row-span-1 flex items-center justify-center p-6 gap-4"
        >
          <div className="p-3 bg-white/5 text-white/70 rounded-2xl border border-white/5">
            <Settings size={24} />
          </div>
          <div className="text-left">
            <h3 className="font-bold text-white">Settings</h3>
            <p className="text-xs text-white/50 mt-0.5">Audio preferences</p>
          </div>
        </button>
      </div>
    </div>
  );
};
