'use client';
import React from 'react';
import { Plus, Trash2, CheckCircle2, Filter, UserCheck } from 'lucide-react';
import type { Card, GameCategory } from '@/types';
import { CATEGORIES, TONE_LABELS, CATEGORY_ACCENT } from '@/lib/seed-questions';

const CUSTOM_KEY = 'crackit_custom_cards';

export default function QuestionsPage() {
  const [activeTab, setActiveTab] = React.useState<'browse' | 'custom' | 'suggest'>('browse');
  const [questions, setQuestions] = React.useState<Card[]>([]);
  const [customCards, setCustomCards] = React.useState<Card[]>([]);
  const [filterCat, setFilterCat] = React.useState<string>('');
  const [filterType, setFilterType] = React.useState<string>('');
  const [isLoading, setIsLoading] = React.useState(true);

  // Add card form
  const [newText, setNewText] = React.useState('');
  const [newType, setNewType] = React.useState<'truth' | 'dare'>('truth');
  const [newTone, setNewTone] = React.useState('general');

  // Suggest form
  const [suggestText, setSuggestText] = React.useState('');
  const [suggestCat, setSuggestCat] = React.useState<GameCategory>('friends');
  const [suggestType, setSuggestType] = React.useState<'truth' | 'dare'>('truth');
  const [submitStatus, setSubmitStatus] = React.useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  // Fetch questions
  React.useEffect(() => {
    const params = new URLSearchParams();
    if (filterCat) params.set('category', filterCat);
    if (filterType) params.set('type', filterType);

    setIsLoading(true);
    fetch(`/api/questions?${params}`)
      .then((r) => r.json())
      .then((data) => { setQuestions(data.questions ?? []); setIsLoading(false); })
      .catch(() => setIsLoading(false));
  }, [filterCat, filterType]);

  // Load custom cards from localStorage
  React.useEffect(() => {
    const raw = localStorage.getItem(CUSTOM_KEY);
    if (raw) setCustomCards(JSON.parse(raw));
  }, []);

  const saveCustom = (cards: Card[]) => {
    setCustomCards(cards);
    localStorage.setItem(CUSTOM_KEY, JSON.stringify(cards));
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;
    const newCard: Card = {
      id: `custom_${Date.now()}`,
      type: newType,
      category: 'custom',
      tone: newTone.trim() || 'custom',
      text: newText.trim(),
      isCustom: true,
      source: 'user',
    };
    saveCustom([newCard, ...customCards]);
    setNewText('');
  };

  const handleSuggest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!suggestText.trim()) return;
    setSubmitStatus('loading');
    try {
      const res = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: suggestType, category: suggestCat, tone: 'user-suggested', text: suggestText.trim() }),
      });
      if (res.ok) {
        setSubmitStatus('success');
        setSuggestText('');
        setTimeout(() => setSubmitStatus('idle'), 5000);
      } else {
        setSubmitStatus('error');
      }
    } catch {
      setSubmitStatus('error');
    }
  };

  const TAB_STYLES = (active: boolean, color = 'var(--accent)') => ({
    flex: 1, padding: '10px', borderRadius: 16,
    background: active ? color : 'transparent',
    border: 'none', cursor: 'pointer',
    color: active ? 'white' : 'var(--text-secondary)',
    fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13,
    transition: 'all 0.15s',
  });

  return (
    <div className="fade-up">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 900, marginBottom: 6 }}>Question Bank</h1>
        <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: 15 }}>
          Browse the full deck, manage your custom cards, or suggest new questions.
        </p>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex', gap: 6, padding: 6,
        background: 'var(--bg-elevated)', borderRadius: 22,
        marginBottom: 20, border: '1px solid var(--border)',
      }}>
        <button style={TAB_STYLES(activeTab === 'browse', '#06b6d4')} onClick={() => setActiveTab('browse')}>
          🌐 Browse All
        </button>
        <button style={TAB_STYLES(activeTab === 'custom', '#f59e0b')} onClick={() => setActiveTab('custom')}>
          ✏️ My Custom ({customCards.length})
        </button>
        <button style={TAB_STYLES(activeTab === 'suggest', '#a855f7')} onClick={() => setActiveTab('suggest')}>
          <UserCheck size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
          Suggest
        </button>
      </div>

      {/* Browse Tab */}
      {activeTab === 'browse' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Filters */}
          <div className="tile" style={{ padding: '16px 20px', display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <Filter size={16} color="var(--text-muted)" />
            <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)}
              style={{ padding: '8px 12px', fontSize: 13, borderRadius: 12, flex: 1, minWidth: 160 }}>
              <option value="">All Categories</option>
              {CATEGORIES.filter(c => c.id !== 'custom').map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)}
              style={{ padding: '8px 12px', fontSize: 13, borderRadius: 12, flex: 1, minWidth: 120 }}>
              <option value="">All Types</option>
              <option value="truth">Truth</option>
              <option value="dare">Dare</option>
            </select>
          </div>

          {/* Question List */}
          {isLoading ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px 0' }}>Loading questions...</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {questions.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px 0' }}>No questions found for these filters.</p>
              ) : (
                questions.map((q) => {
                  const accent = CATEGORY_ACCENT[q.category] ?? 'var(--accent)';
                  return (
                    <div key={q.id} className="tile" style={{ padding: '14px 20px', display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                      <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-start', paddingTop: 2 }}>
                        <span style={{
                          fontSize: 10, fontWeight: 800, padding: '3px 8px', borderRadius: 6, textTransform: 'uppercase',
                          background: q.type === 'truth' ? 'rgba(244,63,94,0.15)' : 'rgba(245,158,11,0.15)',
                          color: q.type === 'truth' ? '#f43f5e' : '#f59e0b',
                        }}>{q.type}</span>
                        <span style={{
                          fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 6,
                          background: `${accent}22`, color: accent, textTransform: 'capitalize',
                        }}>{q.category}</span>
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.5 }}>{q.text}</p>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>
                          {TONE_LABELS[q.tone] ?? q.tone} · {q.source}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      )}

      {/* Custom Tab */}
      {activeTab === 'custom' && (
        <div className="bento bento-2" style={{ alignItems: 'start' }}>
          {/* Form */}
          <div className="tile" style={{ padding: 24 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Add New Card</h2>
            <form onSubmit={handleAddCustom} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                {(['truth', 'dare'] as const).map((t) => (
                  <button key={t} type="button" onClick={() => setNewType(t)} style={{
                    flex: 1, padding: '10px', borderRadius: 14,
                    border: `1px solid ${newType === t ? (t === 'truth' ? '#f43f5e' : '#f59e0b') : 'var(--border)'}`,
                    background: newType === t ? (t === 'truth' ? 'rgba(244,63,94,0.15)' : 'rgba(245,158,11,0.15)') : 'var(--bg-surface)',
                    color: newType === t ? (t === 'truth' ? '#f43f5e' : '#f59e0b') : 'var(--text-muted)',
                    fontWeight: 800, fontSize: 13, textTransform: 'uppercase', cursor: 'pointer',
                  }}>{t}</button>
                ))}
              </div>
              <input type="text" placeholder="Tone (e.g. funny, spicy)" value={newTone} onChange={(e) => setNewTone(e.target.value)}
                style={{ padding: '10px 14px', fontSize: 13 }} />
              <textarea placeholder="Write the question or dare prompt..." value={newText} onChange={(e) => setNewText(e.target.value)}
                rows={3} required style={{ padding: '10px 14px', fontSize: 13, resize: 'vertical' }} />
              <button type="submit" style={{
                padding: '14px', borderRadius: 16, background: 'white', border: 'none',
                color: '#0c0e13', fontWeight: 800, fontSize: 14, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}>
                <Plus size={16} /> Add to My Deck
              </button>
            </form>
          </div>

          {/* List */}
          <div className="tile" style={{ padding: 24, maxHeight: 600, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, flexShrink: 0 }}>
              My Cards ({customCards.length})
            </h2>
            <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {customCards.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '32px 0', fontSize: 14 }}>
                  No custom cards yet. Add one!
                </p>
              ) : (
                customCards.map((c) => (
                  <div key={c.id} style={{
                    padding: '12px 16px', borderRadius: 16,
                    background: 'var(--bg-surface)', border: '1px solid var(--border)',
                    display: 'flex', gap: 12, alignItems: 'flex-start',
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
                        <span style={{
                          fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 6, textTransform: 'uppercase',
                          background: c.type === 'truth' ? 'rgba(244,63,94,0.15)' : 'rgba(245,158,11,0.15)',
                          color: c.type === 'truth' ? '#f43f5e' : '#f59e0b',
                        }}>{c.type}</span>
                        <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)' }}>#{c.tone}</span>
                      </div>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 600, lineHeight: 1.5 }}>{c.text}</p>
                    </div>
                    <button onClick={() => saveCustom(customCards.filter((x) => x.id !== c.id))}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4, flexShrink: 0 }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Suggest Tab */}
      {activeTab === 'suggest' && (
        <div className="tile" style={{ padding: 32, maxWidth: 600, margin: '0 auto' }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8, color: '#a855f7' }}>
            Suggest a Question
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 }}>
            Your suggestion goes into our review queue and may be added to the global deck.
          </p>

          {submitStatus === 'success' ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <CheckCircle2 size={64} color="#10b981" style={{ display: 'block', margin: '0 auto 16px' }} />
              <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Thanks for your suggestion!</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>It will be reviewed and added in the next daily refresh.</p>
            </div>
          ) : (
            <form onSubmit={handleSuggest} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Category</label>
                  <select value={suggestCat} onChange={(e) => setSuggestCat(e.target.value as GameCategory)}
                    style={{ width: '100%', padding: '10px 14px', fontSize: 14, borderRadius: 14 }}>
                    {CATEGORIES.filter(c => c.id !== 'custom').map((c) => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Type</label>
                  <select value={suggestType} onChange={(e) => setSuggestType(e.target.value as 'truth' | 'dare')}
                    style={{ width: '100%', padding: '10px 14px', fontSize: 14, borderRadius: 14 }}>
                    <option value="truth">Truth</option>
                    <option value="dare">Dare</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Your Question</label>
                <textarea placeholder="Write your suggested question or dare..." value={suggestText} onChange={(e) => setSuggestText(e.target.value)}
                  rows={4} required style={{ width: '100%', padding: '12px 16px', fontSize: 14, borderRadius: 16 }} />
              </div>
              <button type="submit" disabled={submitStatus === 'loading' || !suggestText.trim()} style={{
                padding: '15px', borderRadius: 18, background: '#a855f7', border: 'none',
                color: 'white', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 15,
                cursor: 'pointer', opacity: submitStatus === 'loading' ? 0.7 : 1,
              }}>
                {submitStatus === 'loading' ? 'Submitting...' : '✨ Submit Suggestion'}
              </button>
              {submitStatus === 'error' && (
                <p style={{ color: '#ef4444', fontSize: 13, textAlign: 'center', margin: 0 }}>Failed to submit. Please try again.</p>
              )}
            </form>
          )}
        </div>
      )}
    </div>
  );
}
