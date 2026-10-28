import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../theme';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    toggleTheme({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="relative h-9 w-9 rounded-full border border-slate-700 bg-slate-800/60 hover:bg-slate-800 hover:border-brand-500/60 flex items-center justify-center overflow-hidden transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
    >
      <Sun
        className={`theme-toggle-icon absolute h-[18px] w-[18px] text-amber-400 ${
          isDark ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'
        }`}
      />
      <Moon
        className={`theme-toggle-icon absolute h-[18px] w-[18px] text-brand-300 ${
          isDark ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'
        }`}
      />
    </button>
  );
};
