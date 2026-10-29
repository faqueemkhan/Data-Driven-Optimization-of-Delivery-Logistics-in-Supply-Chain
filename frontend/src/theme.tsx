import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { flushSync } from 'react-dom';

export type Theme = 'dark' | 'light';

const STORAGE_KEY = 'routeiq-theme';

// Hex values for libraries (Recharts, Leaflet) that need literal colours instead of Tailwind classes
export const chartPalettes = {
  dark: {
    grid: '#1e293b',
    axis: '#64748b',
    tick: '#94a3b8',
    tooltipBg: '#0f172a',
    tooltipBorder: '#334155',
    tooltipText: '#e2e8f0',
    cursor: 'rgba(148, 163, 184, 0.08)',
  },
  light: {
    grid: '#e2e8f0',
    axis: '#94a3b8',
    tick: '#475569',
    tooltipBg: '#ffffff',
    tooltipBorder: '#d3dbe6',
    tooltipText: '#0f172a',
    cursor: 'rgba(15, 23, 42, 0.05)',
  },
};

interface ThemeContextValue {
  theme: Theme;
  chart: (typeof chartPalettes)[Theme];
  toggleTheme: (origin?: { x: number; y: number }) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function getInitialTheme(): Theme {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {
    // storage unavailable: fall through to system preference
  }
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle('light', theme === 'light');
  document.documentElement.classList.toggle('dark', theme === 'dark');
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    applyTheme(theme);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // ignore
    }
  }, [theme]);

  const toggleTheme = useCallback((origin?: { x: number; y: number }) => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const doc = document as Document & {
      startViewTransition?: (cb: () => void) => { ready: Promise<void> };
    };

    const commit = () => {
      flushSync(() => setTheme(next));
      applyTheme(next);
    };

    if (reduceMotion) {
      commit();
      return;
    }

    // Preferred: circular reveal expanding from the toggle button
    if (doc.startViewTransition) {
      const x = origin?.x ?? window.innerWidth - 40;
      const y = origin?.y ?? 32;
      const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
      const transition = doc.startViewTransition(commit);
      transition.ready.then(() => {
        document.documentElement.animate(
          { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
          { duration: 650, easing: 'cubic-bezier(0.4, 0, 0.2, 1)', pseudoElement: '::view-transition-new(root)' }
        );
      });
      return;
    }

    // Fallback: smooth colour cross-fade
    const root = document.documentElement;
    root.classList.add('theme-transition');
    commit();
    window.setTimeout(() => root.classList.remove('theme-transition'), 500);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, chart: chartPalettes[theme], toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
}
