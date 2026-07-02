import React from 'react';
import { X, Plus, Trash2, CheckCircle2, Sparkles, UserCheck, HelpCircle } from 'lucide-react';
import type { Card, CardType, GameCategory } from '../types';
import { soundManager } from '../utils/soundEffects';

interface QuestionEditorProps {
  customCards: Card[];
  onAddCard: (card: Omit<Card, 'id'>) => void;
  onDeleteCard: (id: string) => void;
  onClose: () => void;
}

export const QuestionEditor: React.FC<QuestionEditorProps> = ({
  customCards,
  onAddCard,
  onDeleteCard,
  onClose
}) => {
  const [activeTab, setActiveTab] = React.useState<'manage' | 'suggest'>('manage');
  
  // Custom Card State
  const [newText, setNewText] = React.useState('');
  const [newType, setNewType] = React.useState<CardType>('truth');
  const [newTone, setNewTone] = React.useState('general');

  // Suggestion State
  const [suggestText, setSuggestText] = React.useState('');
  const [suggestCategory, setSuggestCategory] = React.useState<GameCategory>('friends');
  const [suggestType, setSuggestType] = React.useState<CardType>('truth');
  const [suggestedStatus, setSuggestedStatus] = React.useState<string | null>(null);

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;

    onAddCard({
      type: newType,
      category: 'custom',
      tone: newTone.trim() || 'general',
      text: newText.trim(),
      isCustom: true
    });

    setNewText('');
    soundManager.playSuccess();
  };

  const handleSuggest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!suggestText.trim()) return;

    // Simulate sending to global question bank for moderation
    setSuggestedStatus('submitting');
    soundManager.playTick();

    setTimeout(() => {
      setSuggestedStatus('success');
      soundManager.playSuccess();
      
      // Auto-add to their local custom pool too so they can use it immediately!
      onAddCard({
        type: suggestType,
        category: suggestCategory,
        tone: 'user-suggested',
        text: suggestText.trim(),
        isCustom: true
      });

      setSuggestText('');
      
      setTimeout(() => {
        setSuggestedStatus(null);
      }, 4000);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md fade-in">
      <div className="w-full max-w-lg h-[90vh] md:h-[650px] overflow-hidden glass-panel rounded-3xl border border-white/10 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Question Manager
            </h2>
            <p className="text-xs text-white/50 mt-1">Customize your cards or submit suggestions to super users</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full text-white/50 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex border-b border-white/5 p-2 bg-black/20 gap-2">
          <button
            onClick={() => { setActiveTab('manage'); soundManager.playTick(); }}
            className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
              activeTab === 'manage'
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Sparkles size={16} /> My Custom Deck ({customCards.length})
          </button>
          <button
            onClick={() => { setActiveTab('suggest'); soundManager.playTick(); }}
            className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
              activeTab === 'suggest'
                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <UserCheck size={16} /> Suggest to Super User
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'manage' ? (
            <>
              {/* Add Card Form */}
              <form onSubmit={handleAddCustom} className="space-y-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                <h3 className="text-sm font-semibold text-white/80">Add Card to Custom Deck</h3>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => { setNewType('truth'); soundManager.playTick(); }}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                      newType === 'truth'
                        ? 'bg-pink-500/20 text-pink-400 border-pink-500/30'
                        : 'bg-white/5 text-white/55 border-transparent hover:bg-white/10'
                    }`}
                  >
                    TRUTH
                  </button>
                  <button
                    type="button"
                    onClick={() => { setNewType('dare'); soundManager.playTick(); }}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                      newType === 'dare'
                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                        : 'bg-white/5 text-white/55 border-transparent hover:bg-white/10'
                    }`}
                  >
                    DARE
                  </button>
                </div>

                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Enter Card Tone / Tag (e.g. funny, spicy, deep)"
                    value={newTone}
                    onChange={(e) => setNewTone(e.target.value)}
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-white placeholder-white/20 text-sm focus:outline-none focus:border-cyan-500"
                  />
                  <textarea
                    placeholder="Enter your truth question or dare prompt..."
                    value={newText}
                    onChange={(e) => setNewText(e.target.value)}
                    rows={2}
                    required
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/20 text-sm focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-cyan-500 hover:bg-cyan-400 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-1 shadow-lg shadow-cyan-500/10 transition-all"
                >
                  <Plus size={14} /> Add Card to Custom Deck
                </button>
              </form>

              {/* Card List */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-white/80">Your Custom Cards</h3>
                {customCards.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-white/30 space-y-2">
                    <HelpCircle size={32} strokeWidth={1.5} />
                    <p className="text-xs">No custom cards created yet.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {customCards.map((card) => (
                      <div 
                        key={card.id} 
                        className="flex items-center justify-between p-3.5 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-all text-sm gap-4"
                      >
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                              card.type === 'truth' ? 'bg-pink-500/20 text-pink-400' : 'bg-amber-500/20 text-amber-400'
                            }`}>
                              {card.type}
                            </span>
                            <span className="text-[10px] text-white/40 uppercase tracking-wider font-semibold">
                              #{card.tone}
                            </span>
                          </div>
                          <p className="text-white/90 text-xs font-medium leading-relaxed">{card.text}</p>
                        </div>
                        <button
                          onClick={() => { onDeleteCard(card.id); soundManager.playTick(); }}
                          className="p-2 text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all shrink-0"
                          title="Delete Card"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Suggest to Super User */
            <div className="space-y-6">
              <div className="bg-purple-500/10 border border-purple-500/20 p-4 rounded-2xl text-purple-300 space-y-2">
                <h4 className="text-sm font-bold flex items-center gap-2">
                  <UserCheck size={16} /> Global Question Suggestion Box
                </h4>
                <p className="text-xs leading-relaxed text-purple-300/80">
                  Suggest questions to be added to the global game deck. When approved by a Super User, your cards will become available in the official categories for all players worldwide!
                </p>
              </div>

              {suggestedStatus === 'success' ? (
                <div className="flex flex-col items-center justify-center py-12 text-center space-y-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl animate-pulse">
                  <CheckCircle2 size={48} className="text-emerald-400" />
                  <div className="space-y-1 px-4">
                    <h4 className="text-base font-bold text-emerald-400">Suggestion Sent Successfully!</h4>
                    <p className="text-xs text-white/70">
                      Super Users will review your suggestion. We have also added this card to your local custom deck in the meantime so you can play with it immediately!
                    </p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSuggest} className="space-y-4">
                  <div className="space-y-3">
                    <label className="text-xs font-semibold text-white/70 block">Select Category Suggestion</label>
                    <select
                      value={suggestCategory}
                      onChange={(e) => setSuggestCategory(e.target.value as GameCategory)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500"
                    >
                      <option value="relationship">Relationship</option>
                      <option value="friends">Friends</option>
                      <option value="family">Family</option>
                      <option value="seminar">Work & Seminar</option>
                    </select>
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-semibold text-white/70 block">Card Type</label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => { setSuggestType('truth'); soundManager.playTick(); }}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                          suggestType === 'truth'
                            ? 'bg-pink-500/20 text-pink-400 border-pink-500/30'
                            : 'bg-white/5 text-white/55 border-transparent hover:bg-white/10'
                        }`}
                      >
                        TRUTH QUESTION
                      </button>
                      <button
                        type="button"
                        onClick={() => { setSuggestType('dare'); soundManager.playTick(); }}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                          suggestType === 'dare'
                            ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                            : 'bg-white/5 text-white/55 border-transparent hover:bg-white/10'
                        }`}
                      >
                        DARE PROMPT
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-semibold text-white/70 block">Your Suggestion Prompt</label>
                    <textarea
                      placeholder="Write your creative truth or dare card content here..."
                      value={suggestText}
                      onChange={(e) => setSuggestText(e.target.value)}
                      rows={4}
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 text-sm focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={suggestedStatus === 'submitting'}
                    className="w-full py-3 bg-purple-500 hover:bg-purple-400 disabled:bg-purple-900/40 text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-500/10 transition-all"
                  >
                    {suggestedStatus === 'submitting' ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
                        Submitting to Super Users...
                      </>
                    ) : (
                      <>
                        <UserCheck size={16} />
                        Submit Suggestion
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
