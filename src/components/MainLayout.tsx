import React, { useState } from 'react';
import { Settings, ClipboardList, ShoppingCart, Sparkles, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppStore } from '../store';
import RecipesView from './RecipesView';
import PantryView from './PantryView';
import AvailableView from './AvailableView';
import CalendarView from './CalendarView';
import SettingsView from './SettingsView';
import Modals from './Modals';

export type TabId = 'recipes' | 'pantry' | 'available' | 'calendar' | 'settings';

export default function MainLayout() {
  const [activeTab, setActiveTab] = useState<TabId>('recipes');
  
  const { recipes, pantry } = useAppStore();
  
  const availCount = recipes.filter(r => r.ingredients?.length > 0 && r.ingredients.every(i => pantry[i])).length;

  return (
    <div className="h-[100dvh] w-full max-w-[480px] mx-auto relative overflow-hidden flex flex-col sm:border-x sm:border-[var(--color-dark-border)] bg-[var(--color-dark-bg)]">
      
      {/* CONTENT */}
      <main className="flex-1 overflow-x-hidden overflow-y-auto pt-[max(env(safe-area-inset-top),20px)] pb-[calc(110px)] overflow-scrolling-touch bg-[var(--color-dark-bg)] relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.98 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="w-full h-full p-5"
          >
            {activeTab === 'recipes' && <RecipesView />}
            {activeTab === 'pantry' && <PantryView />}
            {activeTab === 'available' && <AvailableView />}
            {activeTab === 'calendar' && <CalendarView />}
            {activeTab === 'settings' && <SettingsView />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* TAB BAR */}
      <nav className="absolute bottom-0 left-0 right-0 h-[88px] bg-[var(--color-dark-surface)]/90 backdrop-blur-lg border-t border-[var(--color-dark-border)] flex z-[100] pb-[env(safe-area-inset-bottom)]">
        {[
          { id: 'recipes', icon: ClipboardList, label: 'Przepisy' },
          { id: 'pantry', icon: ShoppingCart, label: 'Spiżarnia' },
          { id: 'available', icon: Sparkles, label: 'Dostępne', badge: availCount },
          { id: 'calendar', icon: Calendar, label: 'Dziennik' },
          { id: 'settings', icon: Settings, label: 'Opcje' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as TabId)}
            className={`flex-1 flex flex-col items-center justify-center gap-1.5 bg-transparent border-none font-sans text-[10px] uppercase tracking-wider transition-all relative cursor-pointer pt-2 ${activeTab === t.id ? 'text-[var(--color-accent-gold)]' : 'text-[var(--color-text-secondary)] hover:text-white'}`}
          >
            {activeTab === t.id && (
              <motion.div 
                layoutId="activeTabIndicator"
                className="absolute top-0 w-8 h-[2px] bg-[var(--color-accent-gold)] rounded-b-full shadow-[0_0_10px_rgba(194,163,115,0.5)]" 
              />
            )}
            <t.icon size={24} strokeWidth={activeTab === t.id ? 2 : 1.5} className="mb-0.5" />
            <span className="z-10">{t.label}</span>
            {!!t.badge && t.badge > 0 && (
              <span className="absolute top-2 right-3 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center border border-[var(--color-dark-surface)] shadow-[0_0_8px_rgba(239,68,68,0.5)]">
                {t.badge}
              </span>
            )}
          </button>
        ))}
      </nav>
      
      <Modals />
    </div>
  );
}
