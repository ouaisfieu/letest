import { useState, useEffect, useCallback } from 'react';
import {
  ChevronLeft,
  Clock,
  Star,
  Zap,
  Check,
  X,
  ArrowRight,
} from 'lucide-react';
import { GameCard, MCQFrontContent, MCQBackContent } from '../../types';

interface MCQGameProps {
  cards: GameCard[];
  onComplete: (results: GameResults) => void;
  onExit: () => void;
  mode: 'practice' | 'timed' | 'challenge';
}

interface GameResults {
  cardsCorrect: number;
  cardsSeen: number;
  score: number;
  maxScore: number;
  timeSpentSeconds: number;
  streak: number;
  responses: { cardId: string; correct: boolean; timeMs: number; hintUsed: boolean }[];
}

export function MCQGame({ cards, onComplete, onExit, mode }: MCQGameProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [responses, setResponses] = useState<GameResults['responses']>([]);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [startTime] = useState(Date.now());
  const [cardStartTime, setCardStartTime] = useState(Date.now());
  const [timeRemaining, setTimeRemaining] = useState(mode === 'timed' ? 300 : null);
  const [shuffledOptions, setShuffledOptions] = useState<{ text: string; originalIndex: number }[]>([]);

  const currentCard = cards[currentIndex];
  const frontContent = currentCard?.front_content as MCQFrontContent;
  const backContent = currentCard?.back_content as MCQBackContent;

  useEffect(() => {
    if (frontContent?.options) {
      const options = frontContent.options.map((text, originalIndex) => ({
        text,
        originalIndex,
      }));
      if (frontContent.shuffle_options !== false) {
        for (let i = options.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [options[i], options[j]] = [options[j], options[i]];
        }
      }
      setShuffledOptions(options);
    }
  }, [currentIndex, frontContent]);

  useEffect(() => {
    if (mode === 'timed' && timeRemaining !== null) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev === null || prev <= 0) {
            clearInterval(timer);
            handleFinish();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [mode]);

  const handleSelectOption = (displayIndex: number) => {
    if (hasAnswered) return;
    setSelectedOption(displayIndex);
  };

  const handleConfirm = useCallback(() => {
    if (selectedOption === null) return;

    const responseTime = Date.now() - cardStartTime;
    const originalIndex = shuffledOptions[selectedOption].originalIndex;
    const correct = frontContent.correct_indices.includes(originalIndex);

    let pointsEarned = 0;
    if (correct) {
      pointsEarned = currentCard.points;
      if (responseTime < 10000) pointsEarned += 5;
      setStreak((prev) => {
        const newStreak = prev + 1;
        if (newStreak > maxStreak) setMaxStreak(newStreak);
        if (newStreak >= 3) pointsEarned += 5;
        if (newStreak >= 5) pointsEarned += 10;
        return newStreak;
      });
    } else {
      setStreak(0);
    }

    setScore((prev) => prev + pointsEarned);
    setResponses((prev) => [
      ...prev,
      { cardId: currentCard.id, correct, timeMs: responseTime, hintUsed: false },
    ]);
    setHasAnswered(true);
  }, [selectedOption, shuffledOptions, frontContent, currentCard, cardStartTime, maxStreak]);

  const handleNext = useCallback(() => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setHasAnswered(false);
      setCardStartTime(Date.now());
    } else {
      handleFinish();
    }
  }, [currentIndex, cards.length]);

  const handleFinish = useCallback(() => {
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    const correctCount = responses.filter((r) => r.correct).length;
    const maxScore = cards.reduce((sum, c) => sum + c.points + 15, 0);

    onComplete({
      cardsCorrect: correctCount,
      cardsSeen: responses.length,
      score,
      maxScore,
      timeSpentSeconds: timeSpent,
      streak: maxStreak,
      responses,
    });
  }, [startTime, responses, cards, score, maxStreak, onComplete]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((currentIndex + 1) / cards.length) * 100;

  const getOptionStyle = (displayIndex: number) => {
    const originalIndex = shuffledOptions[displayIndex]?.originalIndex;
    const isCorrect = frontContent?.correct_indices.includes(originalIndex);
    const isSelected = selectedOption === displayIndex;

    if (!hasAnswered) {
      return isSelected
        ? 'border-emerald-500 bg-emerald-500/10'
        : 'border-slate-600 hover:border-slate-500 hover:bg-slate-700/50';
    }

    if (isCorrect) {
      return 'border-emerald-500 bg-emerald-500/20';
    }

    if (isSelected && !isCorrect) {
      return 'border-rose-500 bg-rose-500/20';
    }

    return 'border-slate-700 opacity-50';
  };

  if (!currentCard) {
    return null;
  }

  return (
    <div className="min-h-[80vh] flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onExit}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
        >
          <ChevronLeft size={20} />
          Quitter
        </button>
        <div className="flex items-center gap-6">
          {mode === 'timed' && timeRemaining !== null && (
            <div className="flex items-center gap-2 text-amber-400">
              <Clock size={18} />
              <span className="font-mono font-bold">{formatTime(timeRemaining)}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-emerald-400">
            <Star size={18} />
            <span className="font-bold">{score}</span>
          </div>
          {streak > 0 && (
            <div className="flex items-center gap-1 text-orange-400">
              <Zap size={18} />
              <span className="font-bold">{streak}x</span>
            </div>
          )}
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between text-sm text-slate-400 mb-2">
          <span>
            Question {currentIndex + 1} sur {cards.length}
          </span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="flex-1">
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            {Array.from({ length: currentCard.difficulty }).map((_, i) => (
              <div key={i} className="w-2 h-2 rounded-full bg-amber-400" />
            ))}
            {Array.from({ length: 5 - currentCard.difficulty }).map((_, i) => (
              <div key={i} className="w-2 h-2 rounded-full bg-slate-600" />
            ))}
          </div>
          <p className="text-xl text-white leading-relaxed">{frontContent?.text}</p>
        </div>

        <div className="space-y-3">
          {shuffledOptions.map((option, displayIndex) => {
            const isCorrect = frontContent?.correct_indices.includes(option.originalIndex);
            const isSelected = selectedOption === displayIndex;

            return (
              <button
                key={displayIndex}
                onClick={() => handleSelectOption(displayIndex)}
                disabled={hasAnswered}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${getOptionStyle(
                  displayIndex
                )}`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold ${
                    hasAnswered && isCorrect
                      ? 'bg-emerald-500 text-white'
                      : hasAnswered && isSelected && !isCorrect
                      ? 'bg-rose-500 text-white'
                      : isSelected
                      ? 'bg-emerald-500/30 text-emerald-400'
                      : 'bg-slate-700 text-slate-400'
                  }`}
                >
                  {hasAnswered && isCorrect ? (
                    <Check size={16} />
                  ) : hasAnswered && isSelected && !isCorrect ? (
                    <X size={16} />
                  ) : (
                    String.fromCharCode(65 + displayIndex)
                  )}
                </div>
                <span className="text-left text-white flex-1">{option.text}</span>
              </button>
            );
          })}
        </div>

        {hasAnswered && backContent?.text && (
          <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
            <p className="text-blue-300 text-sm">{backContent.text}</p>
          </div>
        )}
      </div>

      <div className="mt-6">
        {!hasAnswered ? (
          <button
            onClick={handleConfirm}
            disabled={selectedOption === null}
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
          >
            <Check size={20} />
            Valider ma reponse
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
          >
            {currentIndex < cards.length - 1 ? (
              <>
                Question suivante
                <ArrowRight size={20} />
              </>
            ) : (
              <>
                Voir les resultats
                <Star size={20} />
              </>
            )}
          </button>
        )}
      </div>

      <div className="flex justify-center gap-2 mt-6">
        {cards.map((_, idx) => (
          <div
            key={idx}
            className={`w-2 h-2 rounded-full transition-colors ${
              idx < responses.length
                ? responses[idx]?.correct
                  ? 'bg-emerald-400'
                  : 'bg-rose-400'
                : idx === currentIndex
                ? 'bg-white'
                : 'bg-slate-600'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
