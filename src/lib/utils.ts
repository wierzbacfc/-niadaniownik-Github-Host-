import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

export const todayStr = () => new Date().toISOString().slice(0, 10);

export function last30Days() {
  return Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().slice(0, 10);
  });
}

export function dayLabel(ds: string) {
  return ['Nd', 'Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'Sb'][new Date(ds + 'T12:00:00').getDay()];
}

export function formatMonthDay(ds: string) {
  const d = new Date(ds + 'T12:00:00');
  const months = ['sty', 'lut', 'mar', 'kwi', 'maj', 'cze', 'lip', 'sie', 'wrz', 'paź', 'lis', 'gru'];
  return `${d.getDate()} ${months[d.getMonth()]}`;
}
