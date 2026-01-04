import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { ThemePreset, ThemeColors } from '../types';

interface ThemeContextType {
  currentTheme: ThemePreset | null;
  themes: ThemePreset[];
  setTheme: (themeId: string) => Promise<void>;
  customColors: ThemeColors | null;
  setCustomColors: (colors: ThemeColors) => Promise<void>;
  loading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themes, setThemes] = useState<ThemePreset[]>([]);
  const [currentTheme, setCurrentTheme] = useState<ThemePreset | null>(null);
  const [customColors, setCustomColorsState] = useState<ThemeColors | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadThemes();
  }, []);

  useEffect(() => {
    if (currentTheme) {
      applyTheme(customColors || currentTheme.colors);
    }
  }, [currentTheme, customColors]);

  async function loadThemes() {
    const { data } = await supabase
      .from('theme_presets')
      .select('*')
      .order('is_default', { ascending: false });

    if (data) {
      setThemes(data);
      const defaultTheme = data.find((t) => t.is_default) || data[0];
      setCurrentTheme(defaultTheme);
    }
    setLoading(false);
  }

  function applyTheme(colors: ThemeColors) {
    const root = document.documentElement;
    root.style.setProperty('--color-primary', colors.primary);
    root.style.setProperty('--color-secondary', colors.secondary);
    root.style.setProperty('--color-accent', colors.accent);
    root.style.setProperty('--color-background', colors.background);
    root.style.setProperty('--color-surface', colors.surface);
    root.style.setProperty('--color-text', colors.text);
  }

  async function setTheme(themeId: string) {
    const theme = themes.find((t) => t.id === themeId);
    if (theme) {
      setCurrentTheme(theme);
      setCustomColorsState(null);
    }
  }

  async function setCustomColors(colors: ThemeColors) {
    setCustomColorsState(colors);
  }

  return (
    <ThemeContext.Provider
      value={{
        currentTheme,
        themes,
        setTheme,
        customColors,
        setCustomColors,
        loading,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
