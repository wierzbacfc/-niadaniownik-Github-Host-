import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store';
import { Button, Input, Textarea } from './ui';
import { detectIngredients } from '../lib/ai';
import toast from 'react-hot-toast';
import { Cpu, Loader2, Sparkles } from 'lucide-react';
import { uid, last30Days } from '../lib/utils';
import { Recipe } from '../types';

export function RecipeModal({ onClose, editId, prefill }: { onClose: () => void, editId?: string, prefill?: any }) {
  const { recipes, addRecipe, updateRecipe, apiKey, calendar } = useAppStore();
  
  const existing = editId ? recipes.find(r => r.id === editId) : null;
  
  const [name, setName] = useState(existing?.name || prefill?.name || '');
  const [text, setText] = useState('');
  const [ingStr, setIngStr] = useState((existing?.ingredients || prefill?.ingredients || []).join(', '));
  const [tagsStr, setTagsStr] = useState((existing?.tags || prefill?.tags || []).join(', '));
  const [inst, setInst] = useState(existing?.instructions || prefill?.instructions || '');
  
  const [isDetecting, setIsDetecting] = useState(false);

  const handleDetect = async () => {
    if (!text.trim()) return toast.error('Wklej tekst przepisu!');
    if (!apiKey && !process.env.GEMINI_API_KEY) return toast.error('Brak klucza API');
    
    setIsDetecting(true);
    try {
      const result = await detectIngredients(text, apiKey);
      if (result.ingredients?.length) {
        setIngStr(result.ingredients.join(', '));
      }
      if (result.instructions) {
         setInst(result.instructions);
      }
      if (result.tags?.length) {
         setTagsStr(result.tags.join(', '));
      }
      toast.success(`Wykryto ${result.ingredients?.length || 0} składników`);
    } catch (e) {
      toast.error('Błąd wyciągania z tekstu');
    } finally {
      setIsDetecting(false);
    }
  };

  const handleSave = () => {
    if (!name.trim()) return toast.error('Podaj nazwę przepisu');
    
    const ings = ingStr.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
    const tags = tagsStr.split(',').map(s => s.trim() || s).filter(Boolean);
    
    const recData = {
      name: name.trim(),
      ingredients: ings,
      tags,
      instructions: inst.trim()
    };

    if (editId) {
      updateRecipe(editId, recData);
      toast.success('Zaktualizowano przepis');
    } else {
      addRecipe({ id: uid(), ...recData });
      toast.success('Dodano przepis');
    }
    onClose();
  };

  return (
    <div className="bg-[var(--color-dark-surface)] border-t border-[var(--color-dark-border)] p-6 pb-top-safe w-full max-h-[92dvh] overflow-y-auto animate-in slide-in-from-bottom duration-300 mx-auto max-w-[480px] rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
      <div className="font-display text-2xl font-medium text-white mb-8 leading-none">
        {editId ? 'Edytuj Przepis' : prefill ? 'Cudowny Pomysł AI' : 'Nowy Przepis'}
      </div>

      {editId && (
        <div className="mb-8">
          <label className="block text-xs font-medium text-[var(--color-text-secondary)] tracking-widest uppercase mb-3">
             Historia: Ostatnie 30 dni
          </label>
          <div className="flex gap-[2px]">
            {last30Days().reverse().map((ds, idx) => {
               const isActive = calendar[ds] === editId;
               return (
                 <div 
                   key={idx} 
                   title={ds}
                   className={`flex-1 h-3 rounded-[1px] transition-all ${isActive ? 'bg-[var(--color-accent-gold)] scale-y-125 shadow-[0_0_8px_rgba(251,191,36,0.6)] z-10 relative' : 'bg-[var(--color-dark-border)] opacity-30'}`}
                 />
               );
            })}
          </div>
          <div className="flex justify-between text-[9px] text-[var(--color-text-secondary)] mt-2.5 uppercase tracking-widest font-semibold flex-wrap">
             <span>30 Dni Temu</span>
             <span className="text-[var(--color-accent-gold)] font-bold">{Object.values(calendar).filter(v => v === editId).length}x RAZEM</span>
             <span>Dziś</span>
          </div>
        </div>
      )}

      <div className="mb-5">
        <label className="block text-xs font-medium text-[var(--color-text-secondary)] tracking-widest uppercase mb-2">Nazwa</label>
        <Input placeholder="np. Owsianka z bananem i miodem" value={name} onChange={e => setName(e.target.value)} />
      </div>

      <div className="mb-5">
        <label className="block text-xs font-medium text-[var(--color-text-secondary)] tracking-widest uppercase mb-2">Składniki (Ręcznie po przecinku)</label>
        <Textarea 
          placeholder="np. owsianka, banan, miód" 
          value={ingStr} 
          onChange={e => setIngStr(e.target.value)}
          className="min-h-[60px]"
        />
      </div>

      <div className="mb-5">
        <label className="block text-xs font-medium text-[var(--color-text-secondary)] tracking-widest uppercase mb-2">Kategoria</label>
        <div className="flex gap-3">
          <button 
            type="button"
            className={`flex-1 py-3 px-4 rounded-xl border text-center font-sans text-sm font-medium transition-all duration-300 cursor-pointer ${tagsStr.toLowerCase().includes('słodkie') ? 'border-[#f472b6] bg-[#f472b6]/10 text-[#f472b6]' : 'border-[var(--color-dark-border)] bg-[var(--color-dark-surface-elevated)] text-[var(--color-text-secondary)] hover:border-white/10 hover:text-[var(--color-text-primary)]'}`}
            onClick={() => {
              let tags = tagsStr.split(',').map(s => s.trim()).filter(Boolean);
              const isSelected = tags.some(x => x.toLowerCase() === 'słodkie');
              tags = tags.filter(x => x.toLowerCase() !== 'słodkie' && x.toLowerCase() !== 'słone' && x.toLowerCase() !== 'slone');
              if (!isSelected) tags.push('Słodkie');
              setTagsStr(tags.join(', '));
            }}
          >
            🍩 Słodkie
          </button>
          <button 
            type="button"
            className={`flex-1 py-3 px-4 rounded-xl border text-center font-sans text-sm font-medium transition-all duration-300 cursor-pointer ${tagsStr.toLowerCase().includes('słone') || tagsStr.toLowerCase().includes('slone') ? 'border-[#38bdf8] bg-[#38bdf8]/10 text-[#38bdf8]' : 'border-[var(--color-dark-border)] bg-[var(--color-dark-surface-elevated)] text-[var(--color-text-secondary)] hover:border-white/10 hover:text-[var(--color-text-primary)]'}`}
            onClick={() => {
              let tags = tagsStr.split(',').map(s => s.trim()).filter(Boolean);
              const isSelected = tags.some(x => x.toLowerCase() === 'słone' || x.toLowerCase() === 'slone');
              tags = tags.filter(x => x.toLowerCase() !== 'słodkie' && x.toLowerCase() !== 'słone' && x.toLowerCase() !== 'slone');
              if (!isSelected) tags.push('Słone');
              setTagsStr(tags.join(', '));
            }}
          >
            🥓 Słone
          </button>
        </div>
      </div>

      <div className="mb-10">
        <label className="block text-xs font-medium text-[var(--color-text-secondary)] tracking-widest uppercase mb-2">Instrukcje wykonania</label>
        <Textarea 
          placeholder="Jak zrobić to śniadanie..." 
          value={inst} 
          onChange={e => setInst(e.target.value)}
          className="min-h-[100px]"
        />
      </div>

      {(!editId && !prefill) && <div className="h-px bg-gradient-to-r from-transparent via-[var(--color-dark-border)] to-transparent w-full my-8" />}

      {(!editId && !prefill) && (
        <div className="mb-10 bg-[var(--color-dark-surface-elevated)] border border-[var(--color-accent-gold)]/20 p-4 rounded-2xl">
          <label className="block text-[11px] font-medium text-[var(--color-accent-gold)] tracking-widest uppercase mb-2 flex items-center gap-1.5">
            <Sparkles size={14} /> AI ODNAJDZIE SKŁADNIKI I INSTRUKCJĘ
          </label>
          <Textarea 
            placeholder="Wklej tutaj treść z bloga lub notatki..." 
            value={text} 
            onChange={e => setText(e.target.value)}
            className="min-h-[80px] bg-[var(--color-dark-surface)] border-none mb-3 text-sm focus:ring-0"
          />
          <Button variant="secondary" size="sm" onClick={handleDetect} disabled={isDetecting} className="w-full border-[var(--color-accent-gold)]/30 text-[var(--color-accent-gold)] hover:bg-[var(--color-accent-gold)]/10">
            {isDetecting ? <Loader2 className="animate-spin mr-2" size={16} /> : <Sparkles size={16} className="mr-2" />} 
            {isDetecting ? 'Analizowanie...' : 'Wykryj z tekstu'}
          </Button>
        </div>
      )}

      <div className="flex gap-4 mb-safe pb-8">
        <Button onClick={onClose} variant="ghost" className="basis-1/4 border border-[var(--color-dark-border)]">Anuluj</Button>
        {editId && (
          <Button 
            variant="danger" 
            className="basis-1/4 bg-red-500/10 text-red-500 border border-red-500/20" 
            onClick={() => {
              if (confirm('Usunąć ten przepis?')) {
                useAppStore.getState().deleteRecipe(editId);
                toast.success('Usunięto przepis');
                onClose();
              }
            }}
          >Usuń</Button>
        )}
        <Button variant="primary" className="flex-1" onClick={handleSave}>Zapisz</Button>
      </div>

    </div>
  );
}

export default function Modals() {
  const [recipeModalState, setRecipeModalState] = useState<{ open: boolean, editId?: string, prefill?: any }>({ open: false });

  useEffect(() => {
    const handleOpen = (e: Event) => {
      const ev = e as CustomEvent;
      setRecipeModalState({ open: true, editId: ev.detail?.id, prefill: ev.detail?.prefill });
    };
    window.addEventListener('open-recipe-modal', handleOpen);
    return () => window.removeEventListener('open-recipe-modal', handleOpen);
  }, []);

  if (!recipeModalState.open) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-end animate-in fade-in duration-300" 
      onClick={(e) => { 
        if (e.target === e.currentTarget) {
          setRecipeModalState({ open: false });
        }
      }}
    >
      {recipeModalState.open && <RecipeModal onClose={() => setRecipeModalState({ open: false })} editId={recipeModalState.editId} prefill={recipeModalState.prefill} />}
    </div>
  );
}
