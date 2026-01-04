import { useState, useEffect } from 'react';
import { Coffee, Eye, Footprints, Droplets, Star, X } from 'lucide-react';

interface BreakModalProps {
  breakType: 'micro' | 'medium' | 'long';
  duration: number;
  onComplete: () => void;
  onSkip?: () => void;
  canSkip: boolean;
  xpReward: number;
}

const MICRO_EXERCISES = [
  { icon: Eye, text: 'Fermez les yeux pendant 5 secondes', duration: 5 },
  { icon: Eye, text: 'Regardez un point eloigne (6m+) pendant 20 secondes', duration: 20 },
];

const MEDIUM_EXERCISES = [
  { icon: Footprints, text: 'Levez-vous et marchez quelques pas', duration: 60 },
  { icon: Droplets, text: 'Buvez un verre d\'eau', duration: 30 },
  { icon: Coffee, text: 'Etirez vos bras au-dessus de la tete', duration: 15 },
  { icon: Coffee, text: 'Roulez vos epaules en arriere 5 fois', duration: 15 },
];

export function BreakModal({
  breakType,
  duration,
  onComplete,
  onSkip,
  canSkip,
  xpReward,
}: BreakModalProps) {
  const [timeRemaining, setTimeRemaining] = useState(duration);
  const [currentExercise, setCurrentExercise] = useState(0);

  const exercises = breakType === 'micro' ? MICRO_EXERCISES : MEDIUM_EXERCISES;
  const exercise = exercises[currentExercise % exercises.length];
  const Icon = exercise.icon;

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (timeRemaining === 0) {
      const timer = setTimeout(onComplete, 500);
      return () => clearTimeout(timer);
    }
  }, [timeRemaining, onComplete]);

  useEffect(() => {
    if (breakType !== 'micro') {
      const exerciseTimer = setInterval(() => {
        setCurrentExercise((prev) => prev + 1);
      }, 30000);
      return () => clearInterval(exerciseTimer);
    }
  }, [breakType]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs}s`;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((duration - timeRemaining) / duration) * 100;

  return (
    <div className="fixed inset-0 bg-slate-900/95 z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-md w-full p-8 text-center">
        {canSkip && onSkip && (
          <button
            onClick={onSkip}
            className="absolute top-4 right-4 text-slate-500 hover:text-slate-400"
          >
            <X size={20} />
          </button>
        )}

        <div className="w-24 h-24 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6 relative">
          <Icon size={40} className="text-emerald-400" />
          <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="46"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              className="text-slate-700"
            />
            <circle
              cx="50"
              cy="50"
              r="46"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeDasharray={`${progress * 2.89} 289`}
              className="text-emerald-500 transition-all duration-1000"
            />
          </svg>
        </div>

        <h2 className="text-xl font-bold text-white mb-2">
          {breakType === 'micro' ? 'Micro-pause' : breakType === 'medium' ? 'Pause bien-etre' : 'Grande pause'}
        </h2>

        <p className="text-slate-300 mb-6">{exercise.text}</p>

        <div className="text-4xl font-mono font-bold text-emerald-400 mb-6">
          {formatTime(timeRemaining)}
        </div>

        <div className="h-2 bg-slate-700 rounded-full overflow-hidden mb-6">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-1000"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center justify-center gap-2 text-amber-400 mb-6">
          <Star size={18} />
          <span className="font-medium">+{xpReward} XP pour cette pause</span>
        </div>

        {breakType !== 'micro' && (
          <div className="flex justify-center gap-2">
            {exercises.map((_, idx) => (
              <div
                key={idx}
                className={`w-2 h-2 rounded-full transition-colors ${
                  idx === currentExercise % exercises.length
                    ? 'bg-emerald-400'
                    : 'bg-slate-600'
                }`}
              />
            ))}
          </div>
        )}

        {canSkip && onSkip && (
          <button
            onClick={onSkip}
            className="mt-6 text-slate-500 hover:text-slate-400 text-sm"
          >
            Passer cette fois (deconseille)
          </button>
        )}
      </div>
    </div>
  );
}
