import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { ThemePreset, ThemeColors } from '../types';

export interface ThemeUnlockRequirement {
  themeSlug: string;
  requiredLevel: number;
  requiredModules?: number;
  description: string;
}

const THEME_UNLOCK_REQUIREMENTS: ThemeUnlockRequirement[] = [
  { themeSlug: 'emerald-dark', requiredLevel: 1, description: 'Theme par defaut' },
  { themeSlug: 'ocean-blue', requiredLevel: 3, description: 'Atteindre le niveau 3' },
  { themeSlug: 'amber-gold', requiredLevel: 5, description: 'Atteindre le niveau 5' },
  { themeSlug: 'forest-green', requiredLevel: 7, description: 'Atteindre le niveau 7' },
  { themeSlug: 'rose-pink', requiredLevel: 10, description: 'Atteindre le niveau 10' },
  { themeSlug: 'light-minimal', requiredLevel: 5, requiredModules: 3, description: 'Niveau 5 + 3 modules completes' },
];

const CUSTOMIZATION_UNLOCKS = {
  avatar: { requiredLevel: 1, description: 'Disponible des le debut' },
  banner: { requiredLevel: 3, description: 'Atteindre le niveau 3' },
  portfolioLinks: { requiredLevel: 5, description: 'Atteindre le niveau 5' },
  customColors: { requiredLevel: 8, description: 'Atteindre le niveau 8' },
  publicPortfolio: { requiredLevel: 10, description: 'Atteindre le niveau 10' },
};

interface ThemeContextType {
  currentTheme: ThemePreset | null;
  themes: ThemePreset[];
  setTheme: (themeId: string, userId?: string) => Promise<boolean>;
  customColors: ThemeColors | null;
  setCustomColors: (colors: ThemeColors, userId?: string) => Promise<void>;
  loading: boolean;
  isThemeUnlocked: (themeSlug: string, userLevel: number, completedModules?: number) => boolean;
  getThemeRequirement: (themeSlug: string) => ThemeUnlockRequirement | undefined;
  isFeatureUnlocked: (feature: keyof typeof CUSTOMIZATION_UNLOCKS, userLevel: number) => boolean;
  getFeatureRequirement: (feature: keyof typeof CUSTOMIZATION_UNLOCKS) => { requiredLevel: number; description: string };
  unlockRequirements: typeof THEME_UNLOCK_REQUIREMENTS;
  customizationUnlocks: typeof CUSTOMIZATION_UNLOCKS;
  loadUserTheme: (themePresetId?: string, userCustomColors?: ThemeColors) => void;
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

  const loadUserTheme = useCallback((themePresetId?: string, userCustomColors?: ThemeColors) => {
    if (themePresetId && themes.length > 0) {
      const userTheme = themes.find(t => t.id === themePresetId);
      if (userTheme) {
        setCurrentTheme(userTheme);
      }
    }
    if (userCustomColors && Object.keys(userCustomColors).length > 0) {
      setCustomColorsState(userCustomColors);
    }
  }, [themes]);

  function applyTheme(colors: ThemeColors) {
    const root = document.documentElement;
    root.style.setProperty('--color-primary', colors.primary);
    root.style.setProperty('--color-secondary', colors.secondary);
    root.style.setProperty('--color-accent', colors.accent);
    root.style.setProperty('--color-background', colors.background);
    root.style.setProperty('--color-surface', colors.surface);
    root.style.setProperty('--color-text', colors.text);
  }

  function isThemeUnlocked(themeSlug: string, userLevel: number, completedModules = 0): boolean {
    const req = THEME_UNLOCK_REQUIREMENTS.find(r => r.themeSlug === themeSlug);
    if (!req) return true;
    const levelOk = userLevel >= req.requiredLevel;
    const modulesOk = !req.requiredModules || completedModules >= req.requiredModules;
    return levelOk && modulesOk;
  }

  function getThemeRequirement(themeSlug: string): ThemeUnlockRequirement | undefined {
    return THEME_UNLOCK_REQUIREMENTS.find(r => r.themeSlug === themeSlug);
  }

  function isFeatureUnlocked(feature: keyof typeof CUSTOMIZATION_UNLOCKS, userLevel: number): boolean {
    return userLevel >= CUSTOMIZATION_UNLOCKS[feature].requiredLevel;
  }

  function getFeatureRequirement(feature: keyof typeof CUSTOMIZATION_UNLOCKS) {
    return CUSTOMIZATION_UNLOCKS[feature];
  }

  async function setTheme(themeId: string, userId?: string): Promise<boolean> {
    const theme = themes.find((t) => t.id === themeId);
    if (theme) {
      setCurrentTheme(theme);
      setCustomColorsState(null);
      if (userId) {
        await supabase
          .from('user_profiles')
          .update({ theme_preset_id: themeId, custom_colors: {} })
          .eq('id', userId);
      }
      return true;
    }
    return false;
  }

  async function setCustomColors(colors: ThemeColors, userId?: string) {
    setCustomColorsState(colors);
    if (userId) {
      await supabase
        .from('user_profiles')
        .update({ custom_colors: colors })
        .eq('id', userId);
    }
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
        isThemeUnlocked,
        getThemeRequirement,
        isFeatureUnlocked,
        getFeatureRequirement,
        unlockRequirements: THEME_UNLOCK_REQUIREMENTS,
        customizationUnlocks: CUSTOMIZATION_UNLOCKS,
        loadUserTheme,
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
