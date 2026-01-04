import { useState, useEffect, useCallback } from 'react';
import {
  RotateCcw,
  Check,
  X,
  Lightbulb,
  ChevronLeft,
  ChevronRight,
  Clock,
  Zap,
  Star,
} from 'lucide-react';
import { GameCard, FlashcardFrontContent, FlashcardBackContent } from '../../types';

interface FlashcardGameProps {
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

export function FlashcardGame({ cards, onComplete, onExit, mode }: FlashcardGameProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [responses, setResponses] = useState<GameResults['responses']>([]);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [startTime] = useState(Date.now());
  const [cardStartTime, setCardStartTime] = useState(Date.now());
  const [timeRemaining, setTimeRemaining] = useState(mode === 'timed' ? 300 : null);

  const currentCard = cards[currentIndex];
  const frontContent = currentCard?.front_content as FlashcardFrontContent;
  const backContent = currentCard?.back_content as FlashcardBackContent;
  const hints = currentCard?.hints || [];

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

  const handleFlip = useCallback(() => {
    setIsFlipped(!isFlipped);
  }, [isFlipped]);

  const handleResponse = useCallback(
    (correct: boolean) => {
      const responseTime = Date.now() - cardStartTime;
      const hintUsed = showHint;

      let pointsEarned = 0;
      if (correct) {
        pointsEarned = currentCard.points;
        if (!hintUsed) pointsEarned += 5;
        if (responseTime < 5000) pointsEarned += 3;
        setStreak((prev) => {
          const newStreak = prev + 1;
          if (newStreak > maxStreak) setMaxStreak(newStreak);
          if (newStreak >= 5) pointsEarned += 10;
          return newStreak;
        });
      } else {
        setStreak(0);
      }

      setScore((prev) => prev + pointsEarned);
      setResponses((prev) => [
        ...prev,
        { cardId: currentCard.id, correct, timeMs: responseTime, hintUsed },
      ]);

      setTimeout(() => {
        if (currentIndex < cards.length - 1) {
          setCurrentIndex((prev) => prev + 1);
          setIsFlipped(false);
          setShowHint(false);
          setCardStartTime(Date.now());
        } else {
          handleFinish();
        }
      }, 500);
    },
    [currentCard, cardStartTime, showHint, currentIndex, cards.length, maxStreak]
  );

  const handleFinish = useCallback(() => {
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    const correctCount = responses.filter((r) => r.correct).length + (responses.length < cards.length ? 0 : 0);
    const maxScore = cards.reduce((sum, c) => sum + c.points + 8, 0);

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

      <div className="mb-4">
        <div className="flex items-center justify-between text-sm text-slate-400 mb-2">
          <span>
            Carte {currentIndex + 1} sur {cards.length}
          </span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center py-8">
        <div
          className="relative w-full max-w-2xl cursor-pointer perspective-1000"
          onClick={handleFlip}
        >
          <div
            className={`relative transition-transform duration-500 transform-style-3d ${
              isFlipped ? 'rotate-y-180' : ''
            }`}
            style={{
              transformStyle: 'preserve-3d',
              transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            }}
          >
            <div
              className="bg-slate-800 border border-slate-700 rounded-2xl p-8 min-h-[300px] flex flex-col justify-center backface-hidden"
              style={{ backfaceVisibility: 'hidden' }}
            >
              <div className="absolute top-4 right-4 flex items-center gap-2">
                {Array.from({ length: currentCard.difficulty }).map((_, i) => (
                  <div key={i} className="w-2 h-2 rounded-full bg-amber-400" />
                ))}
                {Array.from({ length: 5 - currentCard.difficulty }).map((_, i) => (
                  <div key={i} className="w-2 h-2 rounded-full bg-slate-600" />
                ))}
              </div>
              <p className="text-xl text-white text-center leading-relaxed">
                {frontContent?.text}
              </p>
              {!isFlipped && (
                <p className="text-center text-slate-500 text-sm mt-6">
                  Cliquez pour reveler la reponse
                </p>
              )}
            </div>

            <div
              className="absolute inset-0 bg-gradient-to-br from-emerald-900/50 to-teal-900/50 border border-emerald-500/30 rounded-2xl p-8 min-h-[300px] flex flex-col justify-center backface-hidden"
              style={{
                backfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)',
              }}
            >
              <div className="text-center">
                <p className="text-2xl font-bold text-emerald-400 mb-4">{backContent?.text}</p>
                {backContent?.explanation && (
                  <p className="text-slate-300 text-sm mb-4">{backContent.explanation}</p>
                )}
                {backContent?.sources && backContent.sources.length > 0 && (
                  <p className="text-slate-500 text-xs">Source: {backContent.sources.join(', ')}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {!isFlipped && hints.length > 0 && (
        <div className="mb-4">
          {showHint ? (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
              <p className="text-sm text-amber-400 flex items-center gap-2">
                <Lightbulb size={16} />
                {hints[0]}
              </p>
            </div>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowHint(true);
              }}
              className="flex items-center gap-2 text-amber-400 hover:text-amber-300 transition-colors"
            >
              <Lightbulb size={18} />
              Voir un indice (-5 points)
            </button>
          )}
        </div>
      )}

      {isFlipped && (
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => handleResponse(false)}
            className="flex items-center gap-2 px-8 py-4 bg-rose-500/20 text-rose-400 rounded-xl hover:bg-rose-500/30 transition-colors"
          >
            <X size={20} />
            Je ne savais pas
          </button>
          <button
            onClick={() => setIsFlipped(false)}
            className="flex items-center gap-2 px-6 py-4 bg-slate-700 text-slate-300 rounded-xl hover:bg-slate-600 transition-colors"
          >
            <RotateCcw size={20} />
            Revoir
          </button>
          <button
            onClick={() => handleResponse(true)}
            className="flex items-center gap-2 px-8 py-4 bg-emerald-500/20 text-emerald-400 rounded-xl hover:bg-emerald-500/30 transition-colors"
          >
            <Check size={20} />
            Je savais!
          </button>
        </div>
      )}

      <div className="flex justify-center gap-2 mt-6">
        {cards.map((_, idx) => (
          <div
            key={idx}
            className={`w-2 h-2 rounded-full transition-colors ${
              idx < currentIndex
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
