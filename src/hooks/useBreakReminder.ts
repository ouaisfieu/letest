import { useState, useEffect, useCallback, useRef } from 'react';

interface BreakConfig {
  microBreakInterval: number;
  microBreakDuration: number;
  mediumBreakInterval: number;
  mediumBreakDuration: number;
  intensity: 'gentle' | 'medium' | 'strict';
  enabled: boolean;
}

interface BreakState {
  activeTimeSeconds: number;
  breakDue: boolean;
  breakType: 'micro' | 'medium' | 'long' | null;
  breaksTaken: number;
  skipsRemaining: number;
}

const DEFAULT_CONFIG: BreakConfig = {
  microBreakInterval: 20 * 60,
  microBreakDuration: 20,
  mediumBreakInterval: 45 * 60,
  mediumBreakDuration: 5 * 60,
  intensity: 'medium',
  enabled: true,
};

export function useBreakReminder(config: Partial<BreakConfig> = {}) {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };
  const [state, setState] = useState<BreakState>({
    activeTimeSeconds: 0,
    breakDue: false,
    breakType: null,
    breaksTaken: 0,
    skipsRemaining: mergedConfig.intensity === 'strict' ? 0 : mergedConfig.intensity === 'medium' ? 1 : 2,
  });

  const intervalRef = useRef<number | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  useEffect(() => {
    if (!mergedConfig.enabled) return;

    const handleActivity = () => {
      lastActivityRef.current = Date.now();
    };

    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);

    intervalRef.current = window.setInterval(() => {
      const isActive = Date.now() - lastActivityRef.current < 30000;
      if (!isActive || document.hidden) return;

      setState((prev) => {
        if (prev.breakDue) return prev;

        const newActiveTime = prev.activeTimeSeconds + 1;

        if (newActiveTime >= mergedConfig.mediumBreakInterval) {
          return {
            ...prev,
            activeTimeSeconds: newActiveTime,
            breakDue: true,
            breakType: 'medium',
          };
        }

        if (newActiveTime >= mergedConfig.microBreakInterval && newActiveTime % mergedConfig.microBreakInterval < 1) {
          return {
            ...prev,
            activeTimeSeconds: newActiveTime,
            breakDue: true,
            breakType: 'micro',
          };
        }

        return { ...prev, activeTimeSeconds: newActiveTime };
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
    };
  }, [mergedConfig.enabled, mergedConfig.microBreakInterval, mergedConfig.mediumBreakInterval]);

  const takeBreak = useCallback(() => {
    setState((prev) => ({
      ...prev,
      breakDue: false,
      breakType: null,
      activeTimeSeconds: 0,
      breaksTaken: prev.breaksTaken + 1,
    }));
  }, []);

  const skipBreak = useCallback(() => {
    setState((prev) => {
      if (prev.skipsRemaining <= 0) return prev;
      return {
        ...prev,
        breakDue: false,
        breakType: null,
        skipsRemaining: prev.skipsRemaining - 1,
      };
    });
  }, []);

  const resetTimer = useCallback(() => {
    setState((prev) => ({
      ...prev,
      activeTimeSeconds: 0,
      breakDue: false,
      breakType: null,
    }));
  }, []);

  return {
    ...state,
    takeBreak,
    skipBreak,
    resetTimer,
    canSkip: state.skipsRemaining > 0 && mergedConfig.intensity !== 'strict',
    breakDuration:
      state.breakType === 'micro'
        ? mergedConfig.microBreakDuration
        : state.breakType === 'medium'
        ? mergedConfig.mediumBreakDuration
        : 0,
  };
}
