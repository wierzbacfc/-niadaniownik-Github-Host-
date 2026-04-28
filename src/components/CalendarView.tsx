import React, { useState, useMemo } from 'react';
import { useAppStore } from '../store';
import { Button, SectionHeader } from './ui';
import { last30Days, dayLabel, formatMonthDay, todayStr } from '../lib/utils';
import { ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function CalendarView() {
  const { calendar, recipes, setCalendarDay } = useAppStore();
  const [pickerDate, setPickerDate] = useState<string | null>(null);

  const td = todayStr();
  const days = last30Days();

  const handlePick = (date: string, rid: string) => {
    setCalendarDay(date, rid);
    setPickerDate(null);
    toast.success('Zapisano do dziennika!');
  };

  const handleClear = (date: string) => {
    setCalendarDay(date, null);
    setPickerDate(null);
  };

  const chartData = useMemo(() => {
    const counts: Record<string, number> = {};
    days.forEach(ds => {
      const rid = calendar[ds];
      if (rid) {
        counts[rid] = (counts[rid] || 0) + 1;
      }
    });

    return Object.entries(counts)
      .map(([rid, count]) => {
        const recipe = recipes.find(r => r.id === rid);
        return {
          name: recipe ? recipe.name : 'Nieznany przepis',
          count,
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // top 5
  }, [calendar, days, recipes]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[var(--color-dark-surface-elevated)] border border-[var(--color-dark-border)] p-3 rounded-lg shadow-xl shrink-0 backdrop-blur-md">
          <p className="text-sm font-medium text-[var(--color-text-primary)] mb-1">{label}</p>
          <p className="text-xs text-[var(--color-accent-gold)] font-medium">Zjedzono: {payload[0].value} razy</p>
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <SectionHeader className="text-xl">Ostatnie 30 dni</SectionHeader>
      
      {chartData.length > 0 && (
        <div className="mb-10 bg-[var(--color-dark-surface)] border border-[var(--color-dark-border)] rounded-2xl p-5 shadow-xl">
          <SectionHeader className="text-sm mb-4 border-none p-0 tracking-wide text-[var(--color-text-secondary)]">Ulubione przepisy (30 dni)</SectionHeader>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: 'var(--color-text-secondary)', fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => value.length > 10 ? value.substring(0, 10) + '...' : value}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                <Bar dataKey="count" radius={[4, 4, 4, 4]} barSize={30}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? 'var(--color-accent-gold)' : 'var(--color-dark-border)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
      
      {days.map(ds => {
        const rid = calendar[ds];
        const r = rid ? recipes.find(x => x.id === rid) : null;
        const isTd = ds === td;
        const d = new Date(ds + 'T12:00:00');

        return (
          <div 
            key={ds}
            onClick={() => setPickerDate(ds)}
            className={`flex items-center gap-4 p-4 border rounded-2xl mb-4 cursor-pointer transition-all active:scale-[0.98] shadow-sm ${isTd ? 'bg-[var(--color-dark-surface-elevated)] border-[var(--color-accent-gold)] shadow-[0_0_15px_rgba(194,163,115,0.1)]' : 'bg-[var(--color-dark-surface)] border-[var(--color-dark-border)] hover:border-white/10'}`}
          >
            <div className={`text-center min-w-[50px] shrink-0 border-r border-[var(--color-dark-border)] pr-4`}>
              <div className={`font-display text-2xl font-medium mb-1 ${isTd ? 'text-[var(--color-accent-gold)]' : 'text-white'}`}>
                {d.getDate()}
              </div>
              <div className={`text-[10px] uppercase font-medium tracking-widest ${isTd ? 'text-[var(--color-accent-gold)]' : 'text-[var(--color-text-secondary)]'}`}>
                {isTd ? 'DZIŚ' : dayLabel(ds).slice(0, 3)}
              </div>
            </div>
            
            <div className="flex-1 overflow-hidden pl-2">
              {r ? (
                <>
                  <div className="text-lg font-medium text-white whitespace-nowrap overflow-hidden text-ellipsis">{r.name}</div>
                  <div className="text-xs text-[var(--color-text-secondary)] mt-1">{formatMonthDay(ds)}</div>
                </>
              ) : (
                <div className="text-lg text-[var(--color-text-secondary)] opacity-50 font-medium">Brak</div>
              )}
            </div>
            
            <ChevronRight className="shrink-0 text-[var(--color-text-secondary)] opacity-50" size={24} strokeWidth={2} />
          </div>
        );
      })}

      {/* Picker Modal inline */}
      {pickerDate && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-end animate-in fade-in duration-300" onClick={(e) => { if (e.target === e.currentTarget) setPickerDate(null) }}>
          <div className="bg-[var(--color-dark-surface)] border-t border-[var(--color-dark-border)] p-6 w-full max-h-[92dvh] overflow-y-auto animate-in slide-in-from-bottom duration-300 mx-auto max-w-[480px] rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
            <div className="font-display text-2xl font-medium text-white mb-8 flex items-center justify-between">
              <span>{formatMonthDay(pickerDate)}</span>
              {calendar[pickerDate] && (
                <button onClick={() => handleClear(pickerDate)} className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-medium px-4 py-2 rounded-lg active:scale-95 transition-all cursor-pointer hover:bg-red-500/20">
                  Wyczyść
                </button>
              )}
            </div>

            <SectionHeader className="mb-6 text-lg">Wybierz Menu</SectionHeader>
            
            {!recipes.length ? (
              <div className="text-[var(--color-text-secondary)] text-center py-10 text-sm bg-[var(--color-dark-surface-elevated)] rounded-2xl border border-[var(--color-dark-border)]">
                Brak przepisów w bazie!
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {recipes.map(r => {
                  const isCur = calendar[pickerDate] === r.id;
                  return (
                    <div 
                      key={r.id}
                      onClick={() => handlePick(pickerDate, r.id)}
                      className={`p-5 rounded-2xl cursor-pointer select-none transition-all active:scale-[0.98] border ${isCur ? 'bg-[var(--color-accent-gold)]/10 border-[var(--color-accent-gold)]/50 shadow-[var(--shadow-glow)]' : 'bg-[var(--color-dark-surface-elevated)] border-[var(--color-dark-border)] hover:border-white/10'}`}
                    >
                      <div className={`text-lg font-medium leading-tight ${isCur ? 'text-[var(--color-accent-gold)]' : 'text-white'}`}>{r.name}</div>
                      <div className="text-xs mt-2 text-[var(--color-text-secondary)]">Składniki: {r.ingredients?.length || 0}</div>
                    </div>
                  );
                })}
              </div>
            )}
            
            <Button size="full" onClick={() => setPickerDate(null)} className="mt-8 mb-4" variant="secondary">
              Zamknij
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
