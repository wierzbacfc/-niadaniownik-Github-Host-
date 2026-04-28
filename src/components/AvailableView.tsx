import React, { useState } from 'react';
import { useAppStore } from '../store';
import { Card, Button, SectionHeader } from './ui';
import { Sparkles, Loader2, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { findSubstitute, generateMagicRecipe } from '../lib/ai';

export default function AvailableView() {
  const { recipes, pantry, apiKey } = useAppStore();
  const [substituteInfo, setSubstituteInfo] = useState<{ item: string, recipeName: string, sub: string } | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'słodkie' | 'słone'>('all');
  
  const inHome = Object.keys(pantry).filter(k => pantry[k]);
  
  // Base filtered lists
  let available = recipes.filter(r => r.ingredients?.length > 0 && r.ingredients.every(i => pantry[i]));
  let almost = recipes.filter(r => r.ingredients?.length > 0 && r.ingredients.filter(i => !pantry[i]).length === 1);

  // Apply tag filters
  const applyFilter = (list: typeof recipes) => {
    return list.filter(r => {
      if (filter === 'all') return true;
      return r.tags && r.tags.some(t => {
        const lower = t.toLowerCase();
        if (filter === 'słodkie' && (lower.includes('słodk') || lower.includes('slodk'))) return true;
        if (filter === 'słone' && (lower.includes('słon') || lower.includes('slon') || lower.includes('wytrawn'))) return true;
        return false;
      });
    });
  };

  available = applyFilter(available);
  almost = applyFilter(almost);

  const handleMagic = async () => {
    if (!apiKey && !process.env.GEMINI_API_KEY) return toast.error('Wymagany klucz API w ustawieniach!');
    if (inHome.length === 0) return toast.error('Spiżarnia pusta, dodaj składniki!');

    const toastId = toast.loading('✨ Wymyślam przepis...');
    try {
      const generated = await generateMagicRecipe(inHome, apiKey);
      toast.dismiss(toastId);
      toast.success('Gotowe! Zapisz przepis.');
      window.dispatchEvent(new CustomEvent('open-recipe-modal', { detail: { prefill: generated } }));
    } catch (e) {
      toast.dismiss(toastId);
      toast.error('Błąd wyobraźni AI :( Spróbuj jeszcze raz');
    }
  };

  const handleFindSub = async (missing: string, recipeName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!apiKey && !process.env.GEMINI_API_KEY) return toast.error('Wymagany klucz API!');
    
    const toastId = toast.loading(`Szukam zamiennika: ${missing}...`);
    try {
      const sub = await findSubstitute(missing, recipeName, inHome, apiKey);
      toast.dismiss(toastId);
      setSubstituteInfo({ item: missing, recipeName, sub });
    } catch (e) {
      toast.dismiss(toastId);
      toast.error('Błąd pobierania zamiennika');
    }
  };

  return (
    <div className="pb-8">
      {/* AI Bento Block */}
      <div className="bg-gradient-to-br from-[var(--color-dark-surface-elevated)] to-[var(--color-dark-surface)] border border-[var(--color-dark-border)] rounded-2xl p-5 flex items-center justify-between gap-4 shadow-xl mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--color-accent-gold)]/5 rounded-full blur-2xl" />
        <div className="flex items-center gap-4 relative z-10 flex-1">
          <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-xl shrink-0 shadow-sm">✨</div>
          <div className="flex-1 pr-2">
            <h2 className="text-white text-lg font-display font-medium leading-tight mb-0.5">AI Creator</h2>
            <p className="text-[var(--color-text-secondary)] font-sans text-xs line-clamp-1">Kreatywne z tego co masz</p>
          </div>
        </div>
        <button 
          onClick={handleMagic}
          className="relative z-10 shrink-0 px-4 py-2 bg-[var(--color-accent-gold)] text-black rounded-lg font-medium text-xs shadow-[var(--shadow-glow)] active:scale-95 transition-all cursor-pointer hover:bg-[var(--color-accent-gold-hover)]"
        >
          Generuj
        </button>
      </div>

      <div className="flex justify-center gap-2 mb-6">
        <button 
          onClick={() => setFilter('all')}
          className={`px-4 py-1.5 rounded-full border text-[11px] font-medium tracking-wide transition-all ${filter === 'all' ? 'bg-[var(--color-accent-gold)] text-black border-[var(--color-accent-gold)]' : 'bg-transparent text-[var(--color-text-secondary)] border-[var(--color-dark-border)] hover:bg-white/5'}`}
        >
          Wszystkie
        </button>
        <button 
          onClick={() => setFilter('słodkie')}
          className={`px-4 py-1.5 rounded-full border text-[11px] font-medium tracking-wide transition-all ${filter === 'słodkie' ? 'bg-[#f472b6] text-white border-[#f472b6]' : 'bg-transparent text-[var(--color-text-secondary)] border-[var(--color-dark-border)] hover:bg-white/5'}`}
        >
          🍩 Słodkie
        </button>
        <button 
          onClick={() => setFilter('słone')}
          className={`px-4 py-1.5 rounded-full border text-[11px] font-medium tracking-wide transition-all ${filter === 'słone' ? 'bg-[#38bdf8] text-white border-[#38bdf8]' : 'bg-transparent text-[var(--color-text-secondary)] border-[var(--color-dark-border)] hover:bg-white/5'}`}
        >
          🍳 Słone
        </button>
      </div>

      {!available.length && !almost.length ? (
        <div className="text-center py-16 px-6 border border-[var(--color-dark-border)] bg-[var(--color-dark-surface)] rounded-2xl shadow-lg mt-4">
          <div className="text-5xl mb-6 opacity-60">🌅</div>
          <div className="text-2xl font-display font-medium text-white mb-2">Brak możliwości</div>
          <div className="text-[14px] text-[var(--color-text-secondary)] leading-relaxed mt-2">
            {filter === 'all' ? "Spróbuj dodać więcej składników do spiżarni, aby coś przyrządzić." : "Brak zgodnych przepisów w tej kategorii."}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          
          {available.length > 0 && <h3 className="font-display text-[var(--color-text-secondary)] text-lg mb-1 px-1 uppercase tracking-widest text-center mt-2">Gotowe do zrobienia</h3>}
          {available.map(r => {
            const isExpanded = expandedId === r.id;
            const isSweet = r.tags && r.tags.some(t => t.toLowerCase().includes('słodk') || t.toLowerCase().includes('slodk'));
            const isSalty = r.tags && r.tags.some(t => t.toLowerCase().includes('słon') || t.toLowerCase().includes('slon') || t.toLowerCase().includes('wytrawn'));

            return (
              <Card key={r.id} className="p-0 !mb-0 overflow-hidden ring-1 ring-[var(--color-success)]/30 bg-gradient-to-br from-[var(--color-dark-surface)] to-emerald-950/10">
                <div 
                  className="flex justify-between items-center cursor-pointer select-none p-4"
                  onClick={() => setExpandedId(isExpanded ? null : r.id)}
                >
                  <div className="flex-1 pr-3 flex flex-col justify-center">
                    <div className="font-display text-lg font-medium text-white leading-tight flex items-center gap-2">
                      {r.name}
                    </div>
                    <div className="flex gap-1.5 mt-1">
                      {isSweet && <span className="text-[10px] uppercase tracking-wider font-semibold text-[#f472b6]">Słodkie</span>}
                      {isSalty && <span className="text-[10px] uppercase tracking-wider font-semibold text-[#38bdf8]">Słone</span>}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 shrink-0 pr-1">
                    <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-medium tracking-widest shrink-0 uppercase">100%</span>
                    <ChevronDown size={20} className={`shrink-0 text-[var(--color-accent-gold)] transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                  </div>
                </div>

                <div className={`grid transition-all duration-300 ${isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                  <div className="overflow-hidden">
                    <div className="border-t border-white/5 p-4 sm:p-5 pt-3">
                      <div className="text-[13px] leading-relaxed text-[var(--color-text-secondary)] mb-4">
                        {r.ingredients.map((i, iIdx) => (
                          <React.Fragment key={i}>
                            <span className="text-white">{i}</span>
                            {iIdx < r.ingredients.length - 1 && <span className="opacity-40 mx-1.5">•</span>}
                          </React.Fragment>
                        ))}
                      </div>
                      {r.instructions && (
                        <div className="text-[13px] text-[var(--color-text-secondary)] bg-[var(--color-dark-bg)] p-4 rounded-xl whitespace-pre-wrap font-sans leading-relaxed">
                          {r.instructions}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            )
          })}

          {almost.length > 0 && <h3 className="font-display text-[var(--color-text-secondary)] opacity-50 text-base mb-1 px-1 uppercase tracking-widest text-center mt-6">Brakuje 1 składnika</h3>}
          {almost.map(r => {
            const isExpanded = expandedId === r.id;
            const missing = r.ingredients.find(i => !pantry[i])!;
            const isSweet = r.tags && r.tags.some(t => t.toLowerCase().includes('słodk') || t.toLowerCase().includes('slodk'));
            const isSalty = r.tags && r.tags.some(t => t.toLowerCase().includes('słon') || t.toLowerCase().includes('slon') || t.toLowerCase().includes('wytrawn'));

            return (
              <Card key={r.id} className="p-0 !mb-0 overflow-hidden bg-[var(--color-dark-surface-elevated)] border border-white/5 opacity-85 hover:opacity-100 transition-opacity">
                <div 
                  className="flex justify-between items-center cursor-pointer select-none p-4"
                  onClick={() => setExpandedId(isExpanded ? null : r.id)}
                >
                  <div className="flex-1 pr-3 flex flex-col justify-center">
                    <div className="font-display text-lg font-medium text-[var(--color-text-secondary)] leading-tight flex items-center gap-2">
                      {r.name}
                    </div>
                    <div className="flex gap-1.5 mt-1 items-center flex-wrap">
                      <span className="text-[10px] uppercase tracking-wider font-semibold text-red-400">Brak: {missing}</span>
                      {isSweet && <span className="text-[10px] uppercase tracking-wider font-semibold text-[#f472b6]/70 ml-2">Słodkie</span>}
                      {isSalty && <span className="text-[10px] uppercase tracking-wider font-semibold text-[#38bdf8]/70 ml-2">Słone</span>}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 shrink-0 pr-1">
                    <span className="text-[10px] bg-red-500/10 border border-red-500/20 text-red-400 px-2 py-0.5 rounded-full font-medium tracking-widest shrink-0 uppercase">Braki</span>
                    <ChevronDown size={20} className={`shrink-0 text-[var(--color-accent-gold)] transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                  </div>
                </div>

                <div className={`grid transition-all duration-300 ${isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                  <div className="overflow-hidden">
                    <div className="border-t border-white/5 p-4 sm:p-5 pt-3">
                      <div className="text-[13px] leading-relaxed text-[var(--color-text-secondary)] mb-4">
                        {r.ingredients.map((i, iIdx) => (
                          <React.Fragment key={i}>
                            <span className={pantry[i] ? "text-white opacity-60" : "text-red-400 font-medium"}>{i}</span>
                            {iIdx < r.ingredients.length - 1 && <span className="opacity-40 mx-1.5">•</span>}
                          </React.Fragment>
                        ))}
                      </div>
                      
                      <button 
                        onClick={(e) => handleFindSub(missing, r.name, e)}
                        className="bg-white/5 text-[var(--color-accent-gold)] px-4 py-3 border border-[var(--color-accent-gold)]/20 rounded-xl text-xs hover:bg-[var(--color-accent-gold)] hover:text-black active:scale-95 transition-all cursor-pointer w-full text-center flex items-center justify-center gap-2 font-medium"
                      >
                        <Sparkles size={14} /> Wyszukaj Zamiennik (AI)
                      </button>

                      {r.instructions && (
                        <div className="text-[13px] mt-4 text-[var(--color-text-secondary)] bg-[var(--color-dark-bg)] p-4 rounded-xl whitespace-pre-wrap font-sans leading-relaxed">
                          {r.instructions}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Substitute Modal inline */}
      {substituteInfo && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-in fade-in duration-300" onClick={(e) => { if (e.target === e.currentTarget) setSubstituteInfo(null) }}>
          <div className="bg-[var(--color-dark-surface)] border border-[var(--color-dark-border)] rounded-3xl p-8 w-full max-w-sm animate-in zoom-in-95 duration-300 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-accent-gold)]/5 rounded-full blur-3xl" />
            <div className="font-display text-2xl font-medium text-white mb-6 leading-tight relative z-10">Zamiennik znaleziony</div>
            <p className="text-[var(--color-text-secondary)] text-sm mb-6 leading-relaxed relative z-10">
              Zamiast <span className="text-red-400 font-medium px-1">{substituteInfo.item}</span> w przepisie <span className="text-[var(--color-accent-gold)] font-medium px-1">{substituteInfo.recipeName}</span> eksperymentuj używając:
            </p>
            <div className="bg-[var(--color-dark-surface-elevated)] border border-white/5 rounded-2xl p-6 text-[15px] text-white mb-8 shadow-inner leading-relaxed relative z-10 font-medium">
              {substituteInfo.sub.trim()}
            </div>
            <button 
              className="w-full text-center py-3 bg-[var(--color-dark-surface-elevated)] border border-[var(--color-dark-border)] rounded-xl text-white text-sm font-medium hover:bg-white/10 transition-colors"
              onClick={() => setSubstituteInfo(null)}
            >
              Zamknij
            </button>
          </div>
        </div>
      )}
    </div>
  );
}