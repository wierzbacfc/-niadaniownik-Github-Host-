import React from 'react';
import { cn } from '../lib/utils';
import { LucideIcon } from 'lucide-react';

export const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'ghost' | 'danger' | 'secondary' | 'cyan', size?: 'default' | 'sm' | 'full' }
>(({ className, variant = 'primary', size = 'default', ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-2 font-sans font-medium tracking-wide transition-all duration-300 border focus:outline-none focus:ring-1 focus:ring-[var(--color-accent-gold)] active:scale-[0.98] whitespace-nowrap cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100",
        {
          "bg-[var(--color-accent-gold)] text-black border-transparent hover:bg-[var(--color-accent-gold-hover)] shadow-[var(--shadow-glow)]": variant === 'primary' || variant === 'cyan',
          "bg-transparent border-[var(--color-dark-border)] text-white hover:bg-[var(--color-dark-surface-elevated)]": variant === 'ghost' || variant === 'secondary',
          "bg-transparent border-red-900/50 text-red-500 hover:bg-red-950/40": variant === 'danger',
          "px-5 py-2.5 rounded-xl text-sm": size === 'default',
          "px-4 py-2 rounded-lg text-xs": size === 'sm',
          "w-full px-5 py-3 rounded-xl text-sm": size === 'full',
        },
        className
      )}
      {...props}
    />
  );
});
Button.displayName = "Button";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "w-full bg-[var(--color-dark-surface)] border border-[var(--color-dark-border)] rounded-xl px-4 py-3 text-sm font-sans text-white placeholder:text-[var(--color-text-secondary)] focus:outline-none focus:border-[var(--color-accent-gold)] focus:ring-1 focus:ring-[var(--color-accent-gold)] transition-all outline-none",
      className
    )}
    {...props}
  />
));
Input.displayName = "Input";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "w-full bg-[var(--color-dark-surface)] border border-[var(--color-dark-border)] rounded-xl px-4 py-3 text-sm font-sans text-white placeholder:text-[var(--color-text-secondary)] focus:outline-none focus:border-[var(--color-accent-gold)] focus:ring-1 focus:ring-[var(--color-accent-gold)] transition-all outline-none resize-y min-h-[100px]",
      className
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";

export const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, children, ...props }, ref) => (
  <div ref={ref} className={cn("bg-[var(--color-dark-surface)] border border-[var(--color-dark-border)] rounded-2xl p-6 shadow-2xl mb-4 flex flex-col", className)} {...props}>
    {children}
  </div>
));
Card.displayName = "Card";

export const Badge = ({ children, variant = 'muted', className }: { children: React.ReactNode, variant?: 'success' | 'danger' | 'muted' | 'mint', className?: string }) => (
  <span className={cn(
    "inline-block px-3 py-1 text-[11px] font-medium tracking-widest border rounded-full shrink-0 uppercase",
    {
      "bg-emerald-500/10 text-emerald-400 border-emerald-500/20": variant === 'success' || variant === 'mint',
      "bg-red-500/10 text-red-400 border-red-500/20": variant === 'danger',
      "bg-white/5 text-[var(--color-text-secondary)] border-white/10": variant === 'muted',
    },
    className
  )}>
    {children}
  </span>
);

export const SectionHeader = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={cn("text-2xl font-display font-medium text-white mb-6 flex items-center justify-between gap-4 w-full", className)}>
    <span>{children}</span>
    <div className="flex-1 h-px bg-gradient-to-r from-[var(--color-dark-border)] to-transparent" />
  </div>
);
