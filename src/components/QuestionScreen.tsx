import React from 'react';
import { ArrowLeft, Plus, Trash2, CheckCircle2, UserCheck, HelpCircle } from 'lucide-react';
import type { Card, CardType, GameCategory } from '../types';
import { soundManager } from '../utils/soundEffects';

interface QuestionScreenProps {
  customCards: Card[];
  onAddCard: (card: Omit<Card, 'id'>) => void;
  onDeleteCard: (id: string) => void;
  onBack: () => void;
}

export const QuestionScreen: React.FC<QuestionScreenProps> = ({
  customCards,
  onAddCard,
  onDeleteCard,
  onBack
}) => {
  const [activeTab, setActiveTab] = React.useState<'manage' | 'suggest'>('manage');
  
  const [newText, setNewText] = React.useState('');
  const [newType, setNewType] = React.useState<CardType>('truth');
  const [newTone, setNewTone] = React.useState('general');

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

    setSuggestedStatus('submitting');
    soundManager.playTick();

    setTimeout(() => {
      setSuggestedStatus('success');
      soundManager.playSuccess();
      
      onAddCard({
        type: suggestType,
        category: suggestCategory,
        tone: 'user-suggested',
        text: suggestText.trim(),
        isCustom: true
      });

      setSuggestText('');
      
      setTimeout(() => setSuggestedStatus(null), 4000);
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 fade-in min-h-[80vh] flex flex-col">
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => { soundManager.playTick(); onBack(); }}
          className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-white"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h2 className="text-3xl font-bold text-white">Question Bank</h2>
          <p className="text-sm text-white/50">Manage local deck and submit suggestions</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-black/20 p-2 rounded-3xl mb-8 border border-white/5">
        <button
          onClick={() => { setActiveTab('manage'); soundManager.playTick(); }}
          className={`flex-1 py-3 rounded-2xl font-bold text-sm transition-all ${
            activeTab === 'manage'
              ? 'bg-amber-500 text-white shadow-lg'
              : 'text-white/60 hover:text-white'
          }`}
        >
          My Custom Deck ({customCards.length})
        </button>
        <button
          onClick={() => { setActiveTab('suggest'); soundManager.playTick(); }}
          className={`flex-1 py-3 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
            activeTab === 'suggest'
              ? 'bg-purple-500 text-white shadow-lg'
              : 'text-white/60 hover:text-white'
          }`}
        >
          <UserCheck size={18} /> Suggest to DB
        </button>
      </div>

      <div className="bento-grid grid-cols-1 lg:grid-cols-2 flex-1 items-start">
        {activeTab === 'manage' ? (
          <>
            {/* Add Card Form */}
            <div className="bento-item p-6 space-y-6">
              <h3 className="text-xl font-bold text-white">Add New Card</h3>
              <form onSubmit={handleAddCustom} className="space-y-4">
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => { setNewType('truth'); soundManager.playTick(); }}
                    className={`flex-1 py-3 rounded-xl text-sm font-bold border transition-all ${
                      newType === 'truth'
                        ? 'bg-pink-500/20 text-pink-400 border-pink-500'
                        : 'bg-white/5 text-white/55 border-transparent'
                    }`}
                  >
                    TRUTH
                  </button>
                  <button
                    type="button"
                    onClick={() => { setNewType('dare'); soundManager.playTick(); }}
                    className={`flex-1 py-3 rounded-xl text-sm font-bold border transition-all ${
                      newType === 'dare'
                        ? 'bg-amber-500/20 text-amber-400 border-amber-500'
                        : 'bg-white/5 text-white/55 border-transparent'
                    }`}
                  >
                    DARE
                  </button>
                </div>
                
                <input
                  type="text"
                  placeholder="Enter Card Tone (e.g., funny, spicy)"
                  value={newTone}
                  onChange={(e) => setNewTone(e.target.value)}
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30"
                />
                <textarea
                  placeholder="Enter the question or dare prompt..."
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  rows={3}
                  required
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30"
                />
                
                <button type="submit" className="w-full py-4 bg-white hover:bg-gray-200 text-black font-bold rounded-xl flex items-center justify-center gap-2">
                  <Plus size={18} /> Add to Deck
                </button>
              </form>
            </div>

            {/* List */}
            <div className="bento-item p-6 h-[500px] flex flex-col">
              <h3 className="text-xl font-bold text-white mb-4 shrink-0">Saved Cards</h3>
              <div className="overflow-y-auto pr-2 space-y-3 flex-1">
                {customCards.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-white/30">
                    <HelpCircle size={48} strokeWidth={1} />
                    <p className="mt-4 text-sm font-medium">No custom cards created yet.</p>
                  </div>
                ) : (
                  customCards.map((card) => (
                    <div key={card.id} className="p-4 bg-black/20 rounded-2xl border border-white/5 flex gap-4 items-start">
                      <div className="flex-1 space-y-2">
                        <div className="flex gap-2">
                          <span className={`text-[10px] font-black uppercase px-2 py-1 rounded ${
                            card.type === 'truth' ? 'bg-pink-500/20 text-pink-400' : 'bg-amber-500/20 text-amber-400'
                          }`}>
                            {card.type}
                          </span>
                          <span className="text-[10px] bg-white/10 text-white/70 px-2 py-1 rounded uppercase font-bold">
                            #{card.tone}
                          </span>
                        </div>
                        <p className="text-white text-sm font-medium leading-relaxed">{card.text}</p>
                      </div>
                      <button
                        onClick={() => { onDeleteCard(card.id); soundManager.playTick(); }}
                        className="p-2 text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="bento-item p-8 col-span-1 lg:col-span-2 max-w-2xl mx-auto w-full">
            <div className="mb-6 space-y-2">
              <h3 className="text-2xl font-bold text-purple-400 flex items-center gap-2">
                <UserCheck size={24} /> Submit to Database
              </h3>
              <p className="text-white/60 text-sm">
                Suggest cards for the global deck. (Simulated hook for Vercel deployment)
              </p>
            </div>

            {suggestedStatus === 'success' ? (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-4 animate-pulse">
                <CheckCircle2 size={64} className="text-emerald-400" />
                <h4 className="text-xl font-bold text-white">Suggestion Sent!</h4>
                <p className="text-white/60">Your card will be reviewed in the next daily hook.</p>
              </div>
            ) : (
              <form onSubmit={handleSuggest} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-bold text-white/70 block mb-2">Category</label>
                    <select
                      value={suggestCategory}
                      onChange={(e) => setSuggestCategory(e.target.value as GameCategory)}
                      className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white font-medium focus:border-purple-500"
                    >
                      <option value="relationship">Relationship</option>
                      <option value="friends">Friends</option>
                      <option value="family">Family</option>
                      <option value="seminar">Work / Seminar</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-bold text-white/70 block mb-2">Type</label>
                    <select
                      value={suggestType}
                      onChange={(e) => setSuggestType(e.target.value as CardType)}
                      className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white font-medium focus:border-purple-500"
                    >
                      <option value="truth">Truth</option>
                      <option value="dare">Dare</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-bold text-white/70 block mb-2">Card Prompt</label>
                  <textarea
                    placeholder="Write your suggestion..."
                    value={suggestText}
                    onChange={(e) => setSuggestText(e.target.value)}
                    rows={4}
                    required
                    className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-white font-medium focus:border-purple-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={suggestedStatus === 'submitting'}
                  className="w-full py-4 bg-purple-500 hover:bg-purple-400 text-white font-bold rounded-2xl flex justify-center items-center gap-2"
                >
                  {suggestedStatus === 'submitting' ? 'Submitting via hook...' : 'Submit to Database'}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
