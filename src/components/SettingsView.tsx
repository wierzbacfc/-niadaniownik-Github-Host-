import React, { useState } from 'react';
import { useAppStore } from '../store';
import { Button, Input, SectionHeader } from './ui';
import toast from 'react-hot-toast';
import { Download, Upload } from 'lucide-react';

export default function SettingsView() {
  const { apiKey, apiProvider, theme, setAppState } = useAppStore();
  const [keyInput, setKeyInput] = useState(apiKey ? '••••••••' + apiKey.slice(-4) : '');
  const [provider, setProvider] = useState(apiProvider);

  const handleSave = () => {
    let k = keyInput.trim();
    if (k.startsWith('•')) k = apiKey; // no change
    setAppState(s => ({ ...s, apiKey: k, apiProvider: provider }));
    toast.success('Ustawienia zapisane');
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
        if (!data.recipes || !data.pantry) throw new Error();
        if (confirm(`Wczytać kopię? Zawiera ${data.recipes.length} przepisów. Obecne dane przepadną!`)) {
          setAppState(s => ({ ...s, ...data, apiProvider: provider, apiKey: s.apiKey }));
          toast.success(`Zaimportowano ${data.recipes.length} przepisów.`);
        }
      } catch {
        toast.error('Nieprawidłowy plik kopii');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="pb-20 mt-4">
      <SectionHeader className="text-lg mb-4">Wygląd i Personalizacja</SectionHeader>
      
      <div className="flex gap-3 mb-8">
        <button 
          onClick={() => {
            setAppState({ theme: 'dark' });
          }}
          className={`flex-1 py-4 px-4 rounded-xl border text-center font-sans text-xs font-medium transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 ${theme === 'dark' ? 'border-[var(--color-accent-gold)] bg-[var(--color-accent-gold)]/10 text-[var(--color-accent-gold)] shadow-[var(--shadow-glow)]' : 'border-[var(--color-dark-border)] bg-[var(--color-dark-surface-elevated)] text-[var(--color-text-secondary)] hover:border-white/10 hover:text-[var(--color-text-primary)]'}`}
        >
          <span className="text-lg">🌙</span> Ciemny
        </button>
        <button 
          onClick={() => {
            setAppState({ theme: 'light' });
          }}
          className={`flex-1 py-4 px-4 rounded-xl border text-center font-sans text-xs font-medium transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 ${theme === 'light' ? 'border-[var(--color-accent-gold)] bg-[var(--color-accent-gold)]/10 text-[var(--color-accent-gold)] shadow-[var(--shadow-glow)]' : 'border-[var(--color-dark-border)] bg-[var(--color-dark-surface-elevated)] text-[var(--color-text-secondary)] hover:border-white/10 hover:text-[var(--color-text-primary)]'}`}
        >
          <span className="text-lg">☀️</span> Jasny
        </button>
      </div>

      <SectionHeader className="text-lg mb-4">Widok Przepisów</SectionHeader>
      
      <div className="flex gap-3 mb-8">
        <button 
          onClick={() => {
            setAppState({ recipesViewMode: 'list' });
          }}
          className={`flex-1 py-4 px-4 rounded-xl border text-center font-sans text-xs font-medium transition-all duration-300 cursor-pointer flex flex-col items-center justify-center gap-2 ${useAppStore.getState().recipesViewMode === 'list' ? 'border-[var(--color-accent-gold)] bg-[var(--color-accent-gold)]/10 text-[var(--color-accent-gold)] shadow-[var(--shadow-glow)]' : 'border-[var(--color-dark-border)] bg-[var(--color-dark-surface-elevated)] text-[var(--color-text-secondary)] hover:border-white/10 hover:text-[var(--color-text-primary)]'}`}
        >
          <span className="text-lg">☰</span> Lista
        </button>
        <button 
          onClick={() => {
            setAppState({ recipesViewMode: 'grid' });
          }}
          className={`flex-1 py-4 px-4 rounded-xl border text-center font-sans text-xs font-medium transition-all duration-300 cursor-pointer flex flex-col items-center justify-center gap-2 ${useAppStore.getState().recipesViewMode === 'grid' ? 'border-[var(--color-accent-gold)] bg-[var(--color-accent-gold)]/10 text-[var(--color-accent-gold)] shadow-[var(--shadow-glow)]' : 'border-[var(--color-dark-border)] bg-[var(--color-dark-surface-elevated)] text-[var(--color-text-secondary)] hover:border-white/10 hover:text-[var(--color-text-primary)]'}`}
        >
          <span className="text-lg">⊞</span> Kafelki
        </button>
      </div>

      <SectionHeader className="text-lg mb-4">Dostawca AI</SectionHeader>
      
      <div className="flex gap-3 mb-5">
        <button 
          onClick={() => setProvider('gemini')}
          className={`flex-1 py-3 px-4 rounded-xl border text-center font-sans text-xs font-medium transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 ${provider === 'gemini' ? 'border-[var(--color-accent-gold)] bg-[var(--color-accent-gold)]/10 text-[var(--color-accent-gold)] shadow-[var(--shadow-glow)]' : 'border-[var(--color-dark-border)] bg-[var(--color-dark-surface-elevated)] text-[var(--color-text-secondary)] hover:border-white/10 hover:text-white'}`}
        >
          <span className="text-base">🔷</span> Gemini
        </button>
        <button 
          onClick={() => setProvider('claude')}
          className={`flex-1 py-3 px-4 rounded-xl border text-center font-sans text-xs font-medium transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 ${provider === 'claude' ? 'border-[var(--color-accent-gold)] bg-[var(--color-accent-gold)]/10 text-[var(--color-accent-gold)] shadow-[var(--shadow-glow)]' : 'border-[var(--color-dark-border)] bg-[var(--color-dark-surface-elevated)] text-[var(--color-text-secondary)] hover:border-white/10 hover:text-white'}`}
        >
          <span className="text-base">🟣</span> Claude
        </button>
      </div>
      
      <div className="bg-[var(--color-dark-surface-elevated)] border border-[var(--color-dark-border)] rounded-xl p-4 text-[13px] text-[var(--color-text-secondary)] mb-6 leading-relaxed font-sans shadow-inner">
        {provider === 'gemini' 
          ? <>Darmowy model do testów. Uzyskaj klucz z <strong className="text-[var(--color-accent-gold)] font-medium">aistudio.google.com</strong></>
          : <>Świetny do skomplikowanych przepisów. Uzyskaj klucz z <strong className="text-[var(--color-accent-gold)] font-medium">console.anthropic.com</strong></>}
      </div>

      <div className="mb-5">
        <label className="block text-xs font-medium text-[var(--color-text-secondary)] tracking-widest uppercase mb-2">Klucz API</label>
        <Input 
          type="password" 
          placeholder="Wklej klucz API…" 
          value={keyInput} 
          onChange={e => setKeyInput(e.target.value)} 
        />
      </div>
      
      <Button variant="primary" size="full" onClick={handleSave} className="mb-6">
        Zapisz Klucz
      </Button>

      <div className="h-px bg-gradient-to-r from-transparent via-[var(--color-dark-border)] to-transparent w-full my-8" />

      {/* Backup */}
      <SectionHeader className="text-lg mb-4">Kopia Zapasowa</SectionHeader>
      <div className="flex flex-col gap-3">
        <Button size="full" variant="ghost" className="border border-[var(--color-dark-border)]" onClick={handleExport}>
          <Download size={16} className="mr-2 text-[var(--color-text-secondary)]" /> Zapisz kopię (Export)
        </Button>
        <Button size="full" variant="ghost" className="border border-[var(--color-dark-border)]" onClick={() => document.getElementById('json-upload')?.click()}>
          <Upload size={16} className="mr-2 text-[var(--color-text-secondary)]" /> Wczytaj kopię (Import)
        </Button>
        <input type="file" id="json-upload" accept=".json" className="hidden" onChange={handleImport} />
      </div>
    </div>
  );
}