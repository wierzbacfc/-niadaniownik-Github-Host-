import React, { useState } from 'react';
import { useAppStore } from '../store';
import { Button, Card, Badge, SectionHeader } from './ui';
import { Plus } from 'lucide-react';
import { todayStr } from '../lib/utils';
import toast from 'react-hot-toast';

export default function RecipesView() {
  const { recipes, pantry, calendar, recipesViewMode } = useAppStore();
  const [filter, setFilter] = useState<'all' | 'słodkie' | 'słone'>('all');

  const availableIds = recipes
    .filter(r => r.ingredients?.length > 0 && r.ingredients.every(i => pantry[i]))
    .map(r => r.id);

  const openAdd = () => {
    window.dispatchEvent(new CustomEvent('open-recipe-modal'));
  };

  const openEdit = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    window.dispatchEvent(new CustomEvent('open-recipe-modal', { detail: { id } }));
  };

  const getStats = (id: string) => {
    let count = 0, lastDate = null;
    for (const [date, rid] of Object.entries(calendar)) {
      if (rid === id) {
        count++;
        if (!lastDate || date > lastDate) lastDate = date;
      }
    }
    let diffDays: number | null = null;
    if (lastDate) {
      const todayDate = new Date(todayStr());
      const pastDate = new Date(lastDate);
      todayDate.setHours(0, 0, 0, 0);
      pastDate.setHours(0, 0, 0, 0);
      diffDays = Math.round((todayDate.getTime() - pastDate.getTime()) / (1000 * 60 * 60 * 24));
    }
    return { count, diffDays };
  };

  const filteredRecipes = recipes.filter(r => {
    if (filter === 'all') return true;
    const isMatched = r.tags && r.tags.some(t => {
      const lower = t.toLowerCase();
      // specifically match variations of the words
      if (filter === 'słodkie' && (lower.includes('słodk') || lower.includes('slodk'))) return true;
      if (filter === 'słone' && (lower.includes('słon') || lower.includes('slon') || lower.includes('wytrawn'))) return true;
      return false;
    });
    return isMatched;
  });

  return (
    <div className="relative min-h-full pb-20">
      {!recipes.length ? (
        <div className="text-center py-16 px-6 border border-[var(--color-dark-border)] bg-[var(--color-dark-surface)] rounded-2xl shadow-lg mt-4">
          <div className="text-5xl mb-6 opacity-80">🥣</div>
          <div className="text-2xl font-display font-medium text-white mb-2">Brak przepisów</div>
          <div className="text-[15px] text-[var(--color-text-secondary)] leading-relaxed">
            Dodaj pierwsze śniadanie.<br/>AI zautomatyzuje składniki.
          </div>
        </div>
      ) : (
        <>
          <h2 className="text-center font-display text-xl font-medium text-[var(--color-text-secondary)] tracking-widest uppercase mb-4 mt-2">
            Przepisy
          </h2>
          
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
          
          {filteredRecipes.length === 0 ? (
             <div className="text-center py-10 px-6 border border-[var(--color-dark-border)] bg-[var(--color-dark-surface)] rounded-2xl text-[var(--color-text-secondary)] text-sm">
                Brak przepisów w tej kategorii.
             </div>
          ) : (
            <div className={recipesViewMode === 'grid' ? "grid grid-cols-2 gap-3 mb-24" : "flex flex-col gap-3 mb-24"}>
              {filteredRecipes.map(r => {
                const ingN = r.ingredients?.length || 0;
                const hasN = r.ingredients?.filter(i => pantry[i]).length || 0;
                const isAv = availableIds.includes(r.id);
                const stats = getStats(r.id);

                let availColor = 'bg-red-500';
                if (ingN > 0) {
                   if (isAv) availColor = 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]';
                   else if (hasN > 0) availColor = 'bg-yellow-500';
                }

                // Check if it's sweet or salty to render a tiny indicator
                const isSweet = r.tags && r.tags.some(t => t.toLowerCase().includes('słodk') || t.toLowerCase().includes('slodk'));
                const isSalty = r.tags && r.tags.some(t => t.toLowerCase().includes('słon') || t.toLowerCase().includes('slon') || t.toLowerCase().includes('wytrawn'));

                if (recipesViewMode === 'list') {
                   return (
                     <Card 
                       key={r.id} 
                       className={`p-4 flex flex-col justify-between cursor-pointer transition-all hover:border-[var(--color-accent-gold)] relative active:scale-95 ${isAv ? "bg-gradient-to-br from-[var(--color-dark-surface)] to-emerald-950/10 border-emerald-500/30 ring-1 ring-emerald-500/10" : ""}`}
                       onClick={(e) => openEdit(r.id, e)}
                     >
                        <div className="flex items-center justify-between mb-2">
                           <div className="font-display text-lg font-medium text-[var(--color-text-primary)] leading-tight">
                             {r.name}
                           </div>
                           <div className={`w-3 h-3 rounded-full shrink-0 ${availColor}`} title={isAv ? 'Dostępne' : hasN > 0 ? `Częściowo (${hasN}/${ingN})` : 'Brak składników'} />
                        </div>
                        <div className="flex gap-2 mb-4">
                           {isSweet && <span className="text-[10px] uppercase tracking-wider font-semibold text-[#f472b6]">Słodkie</span>}
                           {isSalty && <span className="text-[10px] uppercase tracking-wider font-semibold text-[#38bdf8]">Słone</span>}
                        </div>
                        <div className="text-[12px] text-[var(--color-text-secondary)] line-clamp-2 mb-4">
                           {ingN > 0 ? r.ingredients.join(', ') : 'Brak podanych składników'}
                        </div>
                        <div className="flex justify-between items-center pt-3 border-t border-[var(--color-dark-border)]/60 text-sm">
                           <div>
                             <span className="text-[10px] text-[var(--color-text-secondary)] uppercase tracking-wider mr-2">Zjedzono:</span>
                             <span className="font-medium text-[var(--color-text-primary)]">{stats.count}x</span>
                           </div>
                           <div>
                             <span className="text-[10px] text-[var(--color-text-secondary)] uppercase tracking-wider mr-2">Ostatnio:</span>
                             <span className="font-medium text-[var(--color-text-primary)]">{stats.diffDays !== null ? `${stats.diffDays} dni temu` : 'nigdy'}</span>
                           </div>
                        </div>
                     </Card>
                   );
                }

                // Grid view
                return (
                  <Card 
                    key={r.id} 
                    className={`p-4 flex flex-col justify-between cursor-pointer transition-all hover:border-[var(--color-accent-gold)] relative active:scale-95 ${isAv ? "bg-gradient-to-br from-[var(--color-dark-surface)] to-emerald-950/10 border-emerald-500/30 ring-1 ring-emerald-500/10" : ""}`}
                    onClick={(e) => openEdit(r.id, e)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex gap-1.5 flex-wrap">
                        {isSweet && <span className="text-[9px] uppercase tracking-wider font-semibold text-[#f472b6]">Słodkie</span>}
                        {isSalty && <span className="text-[9px] uppercase tracking-wider font-semibold text-[#38bdf8]">Słone</span>}
                      </div>
                      <div className={`w-2 h-2 rounded-full mt-0.5 shrink-0 ${availColor}`} title={isAv ? 'Dostępne' : hasN > 0 ? `Częściowo (${hasN}/${ingN})` : 'Brak składników'} />
                    </div>
                    
                    {/* Zmniejszona przestrzeń dla nazwy przepisu (min-h, tekst, paddingi) */}
                    <div className="font-display text-[15px] font-medium text-[var(--color-text-primary)] leading-tight mb-3 line-clamp-2 h-10">
                      {r.name}
                    </div>
                    
                    <div className="flex justify-between items-end mt-auto pt-2 border-t border-[var(--color-dark-border)]/60">
                       <div className="col-span-1">
                         <div className="text-[8px] text-[var(--color-text-secondary)] uppercase tracking-wider mb-0.5">Zjedzono</div>
                         <div className="text-[13px] font-medium text-[var(--color-text-primary)]">{stats.count}x</div>
                       </div>
                       <div className="col-span-1 text-right">
                         <div className="text-[8px] text-[var(--color-text-secondary)] uppercase tracking-wider mb-0.5">Ostatnio</div>
                         <div className="text-[13px] font-medium text-[var(--color-text-primary)]">{stats.diffDays !== null ? `${stats.diffDays}d` : '-'}</div>
                       </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </>
      )}

      {/* Primary Action Positioned at Bottom (Sticky) */}
      <div className="fixed bottom-[104px] left-[50%] -translate-x-[50%] w-full max-w-[480px] px-5 z-40">
        <button 
          onClick={openAdd}
          className="w-full p-4 bg-gradient-to-r from-[var(--color-dark-surface-elevated)] to-[var(--color-dark-surface)] border border-[var(--color-accent-gold)]/30 rounded-2xl text-[var(--color-accent-gold)] font-medium text-[15px] tracking-wide cursor-pointer transition-all hover:bg-[var(--color-accent-gold)]/10 active:scale-[0.98] flex items-center justify-center gap-2 shadow-[0_-5px_40px_rgba(0,0,0,0.6)] backdrop-blur-md"
        >
          <Plus size={20} strokeWidth={2.5} /> DODAJ NOWY PRZEPIS
        </button>
      </div>

    </div>
  );
}
