import { useState, useEffect, useCallback, useRef } from 'react';

interface SessionStats {
  totalSeconds: number;
  activeSeconds: number;
  idleSeconds: number;
  startTime: Date;
  breaks: { start: Date; end?: Date }[];
}

interface UseSessionTrackerOptions {
  idleThreshold?: number;
  onIdleWarning?: () => void;
  onLongSession?: (minutes: number) => void;
}

export function useSessionTracker(options: UseSessionTrackerOptions = {}) {
  const { idleThreshold = 60, onIdleWarning, onLongSession } = options;

  const [stats, setStats] = useState<SessionStats>({
    totalSeconds: 0,
    activeSeconds: 0,
    idleSeconds: 0,
    startTime: new Date(),
    breaks: [],
  });

  const [isIdle, setIsIdle] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const lastActivityRef = useRef(Date.now());
  const idleTimerRef = useRef<number | null>(null);
  const longSessionNotified = useRef<Set<number>>(new Set());

  const handleActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
    if (isIdle) {
      setIsIdle(false);
    }
  }, [isIdle]);

  useEffect(() => {
    const events = ['mousemove', 'keydown', 'scroll', 'touchstart', 'click'];
    events.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [handleActivity]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (isPaused) return;

      const now = Date.now();
      const idleTime = (now - lastActivityRef.current) / 1000;

      setStats((prev) => {
        const newTotal = prev.totalSeconds + 1;
        const newIdle = idleTime > idleThreshold ? prev.idleSeconds + 1 : prev.idleSeconds;
        const newActive = idleTime <= idleThreshold ? prev.activeSeconds + 1 : prev.activeSeconds;

        const sessionMinutes = Math.floor(newActive / 60);
        const milestones = [30, 60, 90, 120];
        milestones.forEach((m) => {
          if (sessionMinutes >= m && !longSessionNotified.current.has(m)) {
            longSessionNotified.current.add(m);
            onLongSession?.(m);
          }
        });

        return {
          ...prev,
          totalSeconds: newTotal,
          activeSeconds: newActive,
          idleSeconds: newIdle,
        };
      });

      if (idleTime > idleThreshold && !isIdle) {
        setIsIdle(true);
        onIdleWarning?.();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isPaused, idleThreshold, isIdle, onIdleWarning, onLongSession]);

  const pause = useCallback(() => {
    setIsPaused(true);
    setStats((prev) => ({
      ...prev,
      breaks: [...prev.breaks, { start: new Date() }],
    }));
  }, []);

  const resume = useCallback(() => {
    setIsPaused(false);
    lastActivityRef.current = Date.now();
    setStats((prev) => {
      const breaks = [...prev.breaks];
      if (breaks.length > 0 && !breaks[breaks.length - 1].end) {
        breaks[breaks.length - 1].end = new Date();
      }
      return { ...prev, breaks };
    });
  }, []);

  const reset = useCallback(() => {
    setStats({
      totalSeconds: 0,
      activeSeconds: 0,
      idleSeconds: 0,
      startTime: new Date(),
      breaks: [],
    });
    longSessionNotified.current.clear();
    lastActivityRef.current = Date.now();
    setIsIdle(false);
    setIsPaused(false);
  }, []);

  const formatTime = useCallback((seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}h ${mins}m`;
    }
    return `${mins}m ${secs}s`;
  }, []);

  return {
    stats,
    isIdle,
    isPaused,
    pause,
    resume,
    reset,
    formatTime,
  };
}
