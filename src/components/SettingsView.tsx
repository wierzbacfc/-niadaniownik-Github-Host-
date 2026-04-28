import React, { useState } from 'react';
import { useAppStore } from '../store';
import { Button, Input, SectionHeader } from './ui';
import toast from 'react-hot-toast';
import { Download, Upload, Activity } from 'lucide-react';
import { getAiClient } from '../lib/ai';

export default function SettingsView() {
  const { apiKey, apiProvider, theme, setAppState } = useAppStore();
  const [keyInput, setKeyInput] = useState(apiKey ? '••••••••' + apiKey.slice(-4) : '');
  const [provider, setProvider] = useState(apiProvider);
  const [isTesting, setIsTesting] = useState(false);

  const handleSave = () => {
    let k = keyInput.trim();
    if (k.startsWith('•')) k = apiKey; // no change
    setAppState(s => ({ ...s, apiKey: k, apiProvider: provider }));
    toast.success('Ustawienia zapisane');
  };
  
  const testApi = async () => {
    let k = keyInput.trim();
    if (k.startsWith('•')) k = apiKey;
    
    setIsTesting(true);
    try {
      // Small test prompt
      const ai = await import('../lib/ai');
      await ai.findSubstitute('jabłka', 'test', ['banany'], k);
      toast.success('API odpowiada prawidłowo!');
    } catch(err) {
      toast.error('Błąd testu API. Sprawdź klucz.');
    } finally {
      setIsTesting(false);
    }
  };

  const handleExport = () => {
    const s = localStorage.getItem('sn1') || '{}';
    const b = new Blob([s], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(b);
    a.download = 'sniadanie_backup.json';
    a.click();
  };

    const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = ev => {
        try {
          const data = JSON.parse(ev.target?.result as string);
          // Zustand persist adds data inside state
          const stateData = data.state ? data.state : data;
          
          if (!stateData.recipes || !stateData.pantry) throw new Error();
          
          const hasCalendar = !!stateData.calendar;
          if (confirm(`Wczytać kopię? Zawiera ${stateData.recipes.length} przepisów${hasCalendar ? ' oraz wpisy w dzienniku' : ''}. Obecne dane przepadną!`)) {
            setAppState(s => ({ ...s, ...stateData, apiKey: s.apiKey }));
            toast.success(`Pomyślnie zaimportowano kopię zapasową.`);
          }
        } catch {
          toast.error('Nieprawidłowy plik kopii');
        }
      };
      reader.readAsText(file);
    };

  return (
    <div className="pb-8 mt-2">
      <SectionHeader className="text-base mb-3">Wygląd i Opcje</SectionHeader>
      
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="flex gap-1.5 bg-[var(--color-dark-surface-elevated)] p-1 rounded-xl border border-[var(--color-dark-border)]">
          <button 
            onClick={() => setAppState({ theme: 'dark' })}
            className={`flex-1 py-2 rounded-lg font-sans text-[11px] font-medium transition-all flex items-center justify-center gap-1.5 ${theme === 'dark' ? 'bg-[var(--color-dark-surface)] shadow text-[var(--color-accent-gold)]' : 'text-[var(--color-text-secondary)] hover:text-white'}`}
          >
            <span>🌙</span> Ciemny
          </button>
          <button 
            onClick={() => setAppState({ theme: 'light' })}
            className={`flex-1 py-2 rounded-lg font-sans text-[11px] font-medium transition-all flex items-center justify-center gap-1.5 ${theme === 'light' ? 'bg-[var(--color-dark-surface)] shadow text-[var(--color-accent-gold)]' : 'text-[var(--color-text-secondary)] hover:text-white'}`}
          >
            <span>☀️</span> Jasny
          </button>
        </div>
        
        <div className="flex gap-1.5 bg-[var(--color-dark-surface-elevated)] p-1 rounded-xl border border-[var(--color-dark-border)]">
          <button 
            onClick={() => setAppState({ recipesViewMode: 'list' })}
            className={`flex-1 py-2 rounded-lg font-sans text-[11px] font-medium transition-all flex items-center justify-center gap-1.5 ${useAppStore.getState().recipesViewMode === 'list' ? 'bg-[var(--color-dark-surface)] shadow text-[var(--color-accent-gold)]' : 'text-[var(--color-text-secondary)] hover:text-white'}`}
          >
            <span>☰</span> Lista
          </button>
          <button 
            onClick={() => setAppState({ recipesViewMode: 'grid' })}
            className={`flex-1 py-2 rounded-lg font-sans text-[11px] font-medium transition-all flex items-center justify-center gap-1.5 ${useAppStore.getState().recipesViewMode === 'grid' ? 'bg-[var(--color-dark-surface)] shadow text-[var(--color-accent-gold)]' : 'text-[var(--color-text-secondary)] hover:text-white'}`}
          >
            <span>⊞</span> Siatka
          </button>
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-[10px] font-medium text-[var(--color-text-secondary)] tracking-widest uppercase mb-1.5 mt-4">Klucz API</label>
        <Input 
          type="password" 
          placeholder="Wklej klucz API…" 
          value={keyInput} 
          onChange={e => setKeyInput(e.target.value)} 
          className="text-sm py-2 h-9"
        />
      </div>
      
      <div className="flex gap-2 mb-4">
        <Button variant="primary" className="flex-1 py-2 text-sm h-9" onClick={handleSave}>
          Zapisz Klucz
        </Button>
        <Button variant="secondary" className="basis-1/3 py-2 text-sm h-9 border-[var(--color-dark-border)]" onClick={testApi} disabled={isTesting}>
          {isTesting ? 'Test...' : <><Activity size={14} className="mr-1.5"/> Test</>}
        </Button>
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-[var(--color-dark-border)] to-transparent w-full my-6" />

      {/* Backup */}
      <SectionHeader className="text-base mb-3">Dane zapasowe</SectionHeader>
      <div className="grid grid-cols-2 gap-2">
        <Button size="full" variant="ghost" className="border border-[var(--color-dark-border)] py-2 h-9 text-xs" onClick={handleExport}>
          <Download size={14} className="mr-1.5 text-[var(--color-text-secondary)]" /> Eksportuj
        </Button>
        <Button size="full" variant="ghost" className="border border-[var(--color-dark-border)] py-2 h-9 text-xs" onClick={() => document.getElementById('json-upload')?.click()}>
          <Upload size={14} className="mr-1.5 text-[var(--color-text-secondary)]" /> Importuj
        </Button>
        <input type="file" id="json-upload" accept=".json" className="hidden" onChange={handleImport} />
      </div>
    </div>
  );
}