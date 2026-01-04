import { useState, useEffect, useCallback, useRef } from 'react';

interface BlinkConfig {
  interval: number;
  duration: number;
  enabled: boolean;
}

const DEFAULT_CONFIG: BlinkConfig = {
  interval: 20000,
  duration: 3000,
  enabled: true,
};

const MESSAGES = [
  'Clignez des yeux doucement',
  'Prenez une respiration profonde',
  'Detendez vos epaules',
  'Regardez au loin quelques secondes',
  'Fermez les yeux 2-3 secondes',
];

export function useBlinkReminder(config: Partial<BlinkConfig> = {}) {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };
  const [showReminder, setShowReminder] = useState(false);
  const [message, setMessage] = useState(MESSAGES[0]);
  const [reminderCount, setReminderCount] = useState(0);
  const timeoutRef = useRef<number | null>(null);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (!mergedConfig.enabled) return;

    intervalRef.current = window.setInterval(() => {
      if (document.hidden) return;

      const randomMessage = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
      setMessage(randomMessage);
      setShowReminder(true);
      setReminderCount((prev) => prev + 1);

      timeoutRef.current = window.setTimeout(() => {
        setShowReminder(false);
      }, mergedConfig.duration);
    }, mergedConfig.interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [mergedConfig.enabled, mergedConfig.interval, mergedConfig.duration]);

  const dismiss = useCallback(() => {
    setShowReminder(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  const disable = useCallback(() => {
    setShowReminder(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  return {
    showReminder,
    message,
    reminderCount,
    dismiss,
    disable,
  };
}
