import React, { useState } from 'react';
import { useAppStore } from '../store';
import { Card, Button, SectionHeader } from './ui';
import { Mic } from 'lucide-react';
import { processVoiceCommand } from '../lib/ai';
import toast from 'react-hot-toast';

const getCategory = (itemName: string) => {
  const n = itemName.toLowerCase();
  if (n.includes('mlek') || n.includes('ser') || n.includes('jogur') || n.includes('masł') || n.includes('jaj') || n.includes('śmietan') || n.includes('twaróg')) return 'Nabiał i Jaja';
  if (n.includes('jabł') || n.includes('banan') || n.includes('truskawk') || n.includes('malin') || n.includes('pomarańcz') || n.includes('cytryn') || n.includes('owoc')) return 'Owoce';
  if (n.includes('pomidor') || n.includes('cebul') || n.includes('czosnek') || n.includes('ziemniak') || n.includes('marchew') || n.includes('papryk') || n.includes('ogórek') || n.includes('warzyw') || n.includes('sałat')) return 'Warzywa';
  if (n.includes('mąka') || n.includes('makaron') || n.includes('ryż') || n.includes('kasz') || n.includes('chleb') || n.includes('płatki') || n.includes('owsian') || n.includes('bułk')) return 'Sypkie & Pieczywo';
  if (n.includes('kurczak') || n.includes('wieprzowina') || n.includes('wołowina') || n.includes('boczek') || n.includes('kiełbasa') || n.includes('szynk') || n.includes('mięs')) return 'Mięso';
  if (n.includes('sól') || n.includes('pieprz') || n.includes('cukier') || n.includes('oliw') || n.includes('olej') || n.includes('ocet') || n.includes('miód') || n.includes('cynamon') || n.includes('ketchup')) return 'Przyprawy & Dodatki';
  return 'Inne';
};

const renderCategorizedList = (items: string[], isOn: boolean, updatePantryItem: any, deletePantryItem: any) => {
  const grouped: Record<string, string[]> = {};
  items.forEach(item => {
    const cat = getCategory(item);
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(item);
  });

  const categories = Object.keys(grouped).sort();

  return (
    <div className="flex flex-col gap-4 w-full">
      {categories.map(cat => (
        <div key={cat} className="flex flex-col gap-2.5">
           <div className="flex items-center gap-3 w-full">
              <div className="h-px bg-[var(--color-dark-border)] flex-1"></div>
              <span className="text-[9px] text-[var(--color-text-secondary)] uppercase tracking-widest font-semibold">{cat}</span>
              <div className="h-px bg-[var(--color-dark-border)] flex-1"></div>
           </div>
           <div className="flex flex-wrap gap-2.5">
             {grouped[cat].map(k => (
                <PantryItem 
                  key={k} 
                  name={k} 
                  isOn={isOn} 
                  onToggle={() => updatePantryItem(k, !isOn)} 
                  onDelete={() => deletePantryItem(k)}
                />
             ))}
           </div>
        </div>
      ))}
    </div>
  );
};

export default function PantryView() {
  const { pantry, updatePantryItem, deletePantryItem, fillPantry, clearPantry, apiKey } = useAppStore();
  const [isListening, setIsListening] = useState(false);
  const [micStatus, setMicStatus] = useState("Skanuj głosem");

  const keys = Object.keys(pantry).sort();
  const missing = keys.filter(k => !pantry[k]);
  const inHome = keys.filter(k => pantry[k]);

  const copyShoppingList = () => {
    if (!missing.length) return;
    const text = "Lista zakupów:\n- " + missing.join("\n- ");
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => toast.success('Skopiowano listę zakupów'));
    } else {
      toast.error('Kopiowanie nie powiodło się');
    }
  };

  const handleMicClick = async () => {
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return toast.error("Przeglądarka nie obsługuje mikrofonu");
    if (!apiKey && !process.env.GEMINI_API_KEY) return toast.error("Brak klucza API (dodaj w ustawieniach)!");

    const rec = new SpeechRecognition();
    rec.lang = 'pl-PL';
    
    setIsListening(true);
    setMicStatus("Słucham... (Mów teraz)");

    rec.onresult = async (e: any) => {
      const transcript = e.results[0][0].transcript;
      setMicStatus("Analizuję...");
      
      try {
        const result = await processVoiceCommand(transcript, keys, apiKey);
        let changes = 0;
        result.add?.forEach(i => {
          const k = keys.find(x => x.toLowerCase() === i.toLowerCase()) || i;
          updatePantryItem(k, true);
          changes++;
        });
        result.remove?.forEach(i => {
          const k = keys.find(x => x.toLowerCase() === i.toLowerCase());
          if (k) { updatePantryItem(k, false); changes++; }
        });
        toast.success(`Zaktualizowano (zmiany: ${changes})`);
      } catch (err) {
        toast.error("Błąd AI");
      }
    };
    
    rec.onerror = () => {
      setIsListening(false);
      setMicStatus("Błąd. Kliknij ponownie");
    };
    
    rec.onend = () => {
      setIsListening(false);
      if (micStatus === "Słucham... (Mów teraz)") {
         setMicStatus("Skanuj głosem");
      } else {
        setTimeout(() => setMicStatus("Skanuj głosem"), 2000);
      }
    };

    rec.start();
  };

  return (
    <>
      <Card className="flex flex-row items-center gap-4 bg-[var(--color-dark-surface-elevated)] p-5 border-[var(--color-dark-border)] border">
        <button 
          onClick={handleMicClick}
          className={`w-14 h-14 shrink-0 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-gold)] ${isListening ? 'bg-[var(--color-danger)] text-white shadow-[0_0_20px_rgba(239,68,68,0.4)] animate-pulse scale-105' : 'bg-white/5 text-[var(--color-accent-gold)] border border-[var(--color-dark-border)] hover:bg-white/10'}`}
        >
          <Mic size={24} strokeWidth={isListening ? 2 : 1.5} />
        </button>
        <div>
          <h2 className="text-xl font-display font-medium text-white tracking-wide">Szybka Akcja</h2>
          <p className={`text-xs mt-1 transition-colors ${isListening ? 'text-[var(--color-danger)]' : 'text-[var(--color-text-secondary)]'}`}>{micStatus}</p>
        </div>
      </Card>

      {!keys.length ? (
        <div className="text-center py-16 px-6 border border-[var(--color-dark-border)] bg-[var(--color-dark-surface)] rounded-2xl shadow-lg mt-8">
          <div className="text-5xl mb-6 opacity-80">🛒</div>
          <div className="text-2xl font-display font-medium text-white mb-2">Spiżarnia pusta</div>
          <div className="text-sm font-sans text-[var(--color-text-secondary)] leading-relaxed">
            Dodaj przepisy, aby zobaczyć składniki
          </div>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-6 px-1 mt-6">
            <div className="text-[11px] font-medium text-[var(--color-accent-gold)] tracking-widest bg-[var(--color-accent-gold)]/10 border border-[var(--color-accent-gold)]/20 px-3 py-1.5 rounded-full">
              {inHome.length} / {keys.length} W DOMU
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" onClick={fillPantry}>Wszystko</Button>
              <Button size="sm" variant="danger" onClick={clearPantry}>Nic</Button>
            </div>
          </div>

          {missing.length > 0 && (
            <div className="mb-8">
              <SectionHeader className="justify-between items-center flex border-none">
                <span className="text-[var(--color-danger)] text-xl">BRAKUJE ({missing.length})</span>
                <button className="text-[11px] bg-[var(--color-dark-surface)] border border-[var(--color-dark-border)] text-[var(--color-text-primary)] px-3 py-1.5 rounded-lg cursor-pointer active:scale-95 transition-all hover:bg-[var(--color-dark-surface-elevated)]" onClick={copyShoppingList}>Kopiuj</button>
              </SectionHeader>
              <div className="bg-[var(--color-dark-surface)] border border-[var(--color-dark-border)] rounded-2xl p-5 shadow-xl">
                {renderCategorizedList(missing, false, updatePantryItem, deletePantryItem)}
              </div>
            </div>
          )}

          {inHome.length > 0 && (
            <div className="mb-8">
              <SectionHeader className="text-emerald-500 text-xl border-none">W DOMU ({inHome.length})</SectionHeader>
              <div className="bg-[var(--color-dark-surface)] border border-[var(--color-dark-border)] rounded-2xl p-5 shadow-xl">
                {renderCategorizedList(inHome, true, updatePantryItem, deletePantryItem)}
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}

const PantryItem: React.FC<{ name: string, isOn: boolean, onToggle: () => void, onDelete: () => void }> = ({ name, isOn, onToggle, onDelete }) => {
  const [showDelete, setShowDelete] = React.useState(false);
  const timerRef = React.useRef<any>(null);

  const startPress = () => {
    timerRef.current = setTimeout(() => {
      setShowDelete(true);
    }, 600); // 600ms long press
  };

  const cancelPress = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  if (showDelete) {
    return (
      <div className="px-3 py-2 border border-red-500/50 bg-red-500/10 rounded-xl flex items-center gap-3 animate-in fade-in duration-200">
        <span className="text-[12px] font-medium tracking-wide text-red-400 max-w-[100px] truncate">{name}</span>
        <div className="flex gap-1">
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="text-[10px] bg-red-500 text-white px-2 py-1 rounded-md font-medium"
          >
            Usuń
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); setShowDelete(false); }}
            className="text-[10px] bg-white/10 text-white px-2 py-1 rounded-md font-medium"
          >
            Anuluj
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`px-3 py-2 border transition-all duration-300 select-none shadow-sm cursor-pointer rounded-xl flex items-center gap-2.5 active:scale-95 ${isOn ? 'border-emerald-500/30 bg-emerald-500/10' : 'border-[var(--color-dark-border)] bg-[var(--color-dark-surface-elevated)] hover:border-[var(--color-text-secondary)]'}`}
      onClick={onToggle}
      onPointerDown={startPress}
      onPointerUp={cancelPress}
      onPointerLeave={cancelPress}
      onContextMenu={(e) => { e.preventDefault(); setShowDelete(true); }} // Support for context menu (right click / long press fallback)
    >
      <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors text-xs shrink-0 ${isOn ? 'bg-emerald-500 text-[var(--color-white)]' : 'border border-[var(--color-dark-border)] bg-[var(--color-dark-surface)] text-transparent'}`}>
        {isOn ? '✓' : ''}
      </div>
      <span className={`text-[12px] font-medium tracking-wide ${isOn ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'}`}>{name}</span>
    </div>
  );
}
