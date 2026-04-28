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
  const [prepTime, setPrepTime] = useState<string>(existing?.prepTime?.toString() || prefill?.prepTime?.toString() || '');
  
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
      if (result.prepTime) {
         setPrepTime(result.prepTime.toString());
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
      instructions: inst.trim(),
      prepTime: prepTime.trim() ? parseInt(prepTime.trim(), 10) : undefined
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
    <div className="bg-[var(--color-dark-surface)] border-t border-[var(--color-dark-border)] p-4 sm:p-5 pb-top-safe w-full max-h-[95dvh] overflow-y-auto animate-in slide-in-from-bottom duration-300 mx-auto max-w-[480px] rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)] flex flex-col gap-3.5">
      <div className="font-display text-xl font-medium text-white leading-none">
        {editId ? 'Edytuj Przepis' : prefill ? 'Cudowny Pomysł AI' : 'Nowy Przepis'}
      </div>

      {editId && (
        <div className="mb-0.5 mt-1">
          <label className="block text-[10px] font-medium text-[var(--color-text-secondary)] tracking-widest uppercase mb-1.5">
             Historia: Ostatnie 30 dni
          </label>
          <div className="flex gap-[2px]">
            {last30Days().reverse().map((ds, idx) => {
               const isActive = calendar[ds] === editId;
               return (
                 <div 
                   key={idx} 
                   title={ds}
                   className={`flex-1 h-[10px] rounded-[1px] transition-all ${isActive ? 'bg-[var(--color-accent-gold)] scale-y-125 z-10 relative' : 'bg-[var(--color-dark-border)] opacity-30'}`}
                 />
               );
            })}
          </div>
          <div className="flex justify-between text-[8px] text-[var(--color-text-secondary)] mt-1 uppercase tracking-widest font-semibold">
             <span>30 Dni Temu</span>
             <span className="text-[var(--color-accent-gold)]">{Object.values(calendar).filter(v => v === editId).length}x RAZEM</span>
             <span>Dziś</span>
          </div>
        </div>
      )}

      <div>
        <label className="block text-[10px] font-medium text-[var(--color-text-secondary)] tracking-widest uppercase mb-1.5">Nazwa</label>
        <Input placeholder="Owsianka..." value={name} onChange={e => setName(e.target.value)} className="py-2.5 px-3 text-sm h-10 w-full" />
      </div>

      <div className="flex gap-3">
        <div className="flex-1">
          <label className="block text-[10px] font-medium text-[var(--color-text-secondary)] tracking-widest uppercase mb-1.5 text-center">Kategoria</label>
          <div className="flex gap-1.5 h-10">
            <button 
              type="button"
              className={`flex-1 rounded-xl border flex items-center justify-center font-sans text-xs font-medium transition-all duration-300 cursor-pointer ${tagsStr.toLowerCase().includes('słodkie') ? 'border-[#f472b6] bg-[#f472b6]/10 text-[#f472b6]' : 'border-[var(--color-dark-border)] bg-[var(--color-dark-surface-elevated)] text-[var(--color-text-secondary)] hover:border-white/10 hover:text-[var(--color-text-primary)]'}`}
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
              className={`flex-1 rounded-xl border flex items-center justify-center font-sans text-xs font-medium transition-all duration-300 cursor-pointer ${tagsStr.toLowerCase().includes('słone') || tagsStr.toLowerCase().includes('slone') ? 'border-[#38bdf8] bg-[#38bdf8]/10 text-[#38bdf8]' : 'border-[var(--color-dark-border)] bg-[var(--color-dark-surface-elevated)] text-[var(--color-text-secondary)] hover:border-white/10 hover:text-[var(--color-text-primary)]'}`}
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
        <div className="w-[80px]">
          <label className="block text-[10px] font-medium text-[var(--color-text-secondary)] tracking-widest uppercase mb-1.5 text-center">Minuty</label>
          <Input placeholder="np. 15" type="number" value={prepTime} onChange={e => setPrepTime(e.target.value)} className="py-2.5 px-1 text-center text-sm h-10 w-full" />
        </div>
      </div>

      <div>
        <label className="block text-[10px] font-medium text-[var(--color-text-secondary)] tracking-widest uppercase mb-1.5">Składniki (Ręcznie po przecinku)</label>
        <Textarea 
          placeholder="np. owsianka, banan, miód" 
          value={ingStr} 
          onChange={e => setIngStr(e.target.value)}
          className="min-h-[44px] h-[44px] py-2.5 px-3 text-sm resize-none"
        />
      </div>

      <div>
        <label className="block text-[10px] font-medium text-[var(--color-text-secondary)] tracking-widest uppercase mb-1.5">Instrukcje wykonania</label>
        <Textarea 
          placeholder="Jak zrobić to śniadanie..." 
          value={inst} 
          onChange={e => setInst(e.target.value)}
          className="min-h-[70px] h-[70px] py-2.5 px-3 text-sm resize-none"
        />
      </div>

      {(!editId && !prefill) && (
        <div className="bg-[var(--color-dark-surface-elevated)] border border-[var(--color-accent-gold)]/20 p-3 rounded-2xl flex flex-col gap-2 mt-1">
          <label className="block text-[10px] font-medium text-[var(--color-accent-gold)] tracking-widest uppercase flex items-center gap-1.5">
            <Sparkles size={12} /> AI Auto-wypełnianie
          </label>
          <div className="flex gap-2">
            <Textarea 
              placeholder="Wklej treść z bloga lub opisz, a ja uzupełnię resztę..." 
              value={text} 
              onChange={e => setText(e.target.value)}
              className="min-h-[44px] bg-[var(--color-dark-surface)] border-none text-xs focus:ring-0 py-2.5 resize-none flex-1"
              rows={2}
            />
            <Button variant="secondary" size="sm" onClick={handleDetect} disabled={isDetecting} className="border-[var(--color-accent-gold)]/30 text-[var(--color-accent-gold)] hover:bg-[var(--color-accent-gold)]/10 px-3 shrink-0 h-auto min-h-[44px]">
              {isDetecting ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />} 
            </Button>
          </div>
        </div>
      )}

      <div className="flex gap-3 mt-1 mb-safe pb-4">
        <Button onClick={onClose} variant="ghost" className="basis-1/4 border border-[var(--color-dark-border)] py-2 text-sm h-10">Anuluj</Button>
        {editId && (
          <Button 
            variant="danger" 
            className="basis-1/4 bg-red-500/10 text-red-500 border border-red-500/20 py-2 text-sm h-10" 
            onClick={() => {
              if (confirm('Usunąć ten przepis?')) {
                useAppStore.getState().deleteRecipe(editId);
                toast.success('Usunięto przepis');
                onClose();
              }
            }}
          >Usuń</Button>
        )}
        <Button variant="primary" className="flex-1 py-2 text-sm h-10" onClick={handleSave}>Zapisz</Button>
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
