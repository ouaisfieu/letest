import { useState, useEffect, useCallback } from 'react';
import {
  ChevronLeft,
  Clock,
  Star,
  Zap,
  Check,
  Link,
  ArrowRight,
} from 'lucide-react';
import { GameCard, MatchingFrontContent } from '../../types';

interface MatchingGameProps {
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

export function MatchingGame({ cards, onComplete, onExit, mode }: MatchingGameProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [matches, setMatches] = useState<Map<string, string>>(new Map());
  const [showResults, setShowResults] = useState(false);
  const [responses, setResponses] = useState<GameResults['responses']>([]);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [startTime] = useState(Date.now());
  const [cardStartTime, setCardStartTime] = useState(Date.now());
  const [timeRemaining, setTimeRemaining] = useState(mode === 'timed' ? 300 : null);
  const [shuffledRight, setShuffledRight] = useState<{ id: string; text: string }[]>([]);

  const currentCard = cards[currentIndex];
  const frontContent = currentCard?.front_content as MatchingFrontContent;

  useEffect(() => {
    if (frontContent?.right_items) {
      const items = [...frontContent.right_items];
      for (let i = items.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [items[i], items[j]] = [items[j], items[i]];
      }
      setShuffledRight(items);
      setMatches(new Map());
      setSelectedLeft(null);
      setShowResults(false);
    }
  }, [currentIndex]);

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

  const handleSelectLeft = (id: string) => {
    if (showResults) return;
    setSelectedLeft(selectedLeft === id ? null : id);
  };

  const handleSelectRight = (id: string) => {
    if (showResults || !selectedLeft) return;

    const newMatches = new Map(matches);
    for (const [key, value] of newMatches.entries()) {
      if (value === id) {
        newMatches.delete(key);
      }
    }
    newMatches.set(selectedLeft, id);
    setMatches(newMatches);
    setSelectedLeft(null);
  };

  const handleValidate = useCallback(() => {
    const responseTime = Date.now() - cardStartTime;
    const correctPairs = frontContent.correct_pairs;
    let correctCount = 0;

    for (const [leftId, rightId] of matches.entries()) {
      if (correctPairs[leftId] === rightId) {
        correctCount++;
      }
    }

    const totalPairs = Object.keys(correctPairs).length;
    const allCorrect = correctCount === totalPairs;

    let pointsEarned = Math.floor((correctCount / totalPairs) * currentCard.points);
    if (allCorrect) {
      pointsEarned += 10;
      setStreak((prev) => {
        const newStreak = prev + 1;
        if (newStreak > maxStreak) setMaxStreak(newStreak);
        if (newStreak >= 3) pointsEarned += 5;
        return newStreak;
      });
    } else {
      setStreak(0);
    }

    setScore((prev) => prev + pointsEarned);
    setResponses((prev) => [
      ...prev,
      { cardId: currentCard.id, correct: allCorrect, timeMs: responseTime, hintUsed: false },
    ]);
    setShowResults(true);
  }, [matches, frontContent, currentCard, cardStartTime, maxStreak]);

  const handleNext = useCallback(() => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setCardStartTime(Date.now());
    } else {
      handleFinish();
    }
  }, [currentIndex, cards.length]);

  const handleFinish = useCallback(() => {
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    const correctCount = responses.filter((r) => r.correct).length;
    const maxScore = cards.reduce((sum, c) => sum + c.points + 10, 0);

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

  const getLeftItemStyle = (id: string) => {
    const isSelected = selectedLeft === id;
    const isMatched = matches.has(id);
    const isCorrect = showResults && frontContent.correct_pairs[id] === matches.get(id);
    const isWrong = showResults && isMatched && !isCorrect;

    if (isWrong) return 'border-rose-500 bg-rose-500/10';
    if (isCorrect) return 'border-emerald-500 bg-emerald-500/10';
    if (isSelected) return 'border-amber-500 bg-amber-500/10';
    if (isMatched) return 'border-blue-500 bg-blue-500/10';
    return 'border-slate-600 hover:border-slate-500';
  };

  const getRightItemStyle = (id: string) => {
    const isMatched = Array.from(matches.values()).includes(id);
    const leftId = Array.from(matches.entries()).find(([, v]) => v === id)?.[0];
    const isCorrect = showResults && leftId && frontContent.correct_pairs[leftId] === id;
    const isWrong = showResults && isMatched && !isCorrect;

    if (isWrong) return 'border-rose-500 bg-rose-500/10';
    if (isCorrect) return 'border-emerald-500 bg-emerald-500/10';
    if (isMatched) return 'border-blue-500 bg-blue-500/10';
    return 'border-slate-600 hover:border-slate-500';
  };

  const getMatchedRight = (leftId: string) => {
    const rightId = matches.get(leftId);
    if (!rightId) return null;
    return shuffledRight.find((r) => r.id === rightId);
  };

  if (!currentCard) {
    return null;
  }

  const allMatched = matches.size === frontContent?.left_items.length;

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
            Exercice {currentIndex + 1} sur {cards.length}
          </span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="flex-1">
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-2 text-purple-400 mb-2">
            <Link size={18} />
            <span className="font-medium">Association</span>
          </div>
          <p className="text-white">{frontContent?.instruction}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <p className="text-sm text-slate-400 mb-2">Concepts</p>
            {frontContent?.left_items.map((item) => {
              const matchedRight = getMatchedRight(item.id);
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectLeft(item.id)}
                  disabled={showResults}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${getLeftItemStyle(
                    item.id
                  )}`}
                >
                  <p className="text-white font-medium">{item.text}</p>
                  {matchedRight && (
                    <p className="text-sm text-blue-400 mt-2 flex items-center gap-1">
                      <Link size={12} />
                      {matchedRight.text}
                    </p>
                  )}
                </button>
              );
            })}
          </div>

          <div className="space-y-3">
            <p className="text-sm text-slate-400 mb-2">Definitions</p>
            {shuffledRight.map((item) => (
              <button
                key={item.id}
                onClick={() => handleSelectRight(item.id)}
                disabled={showResults || !selectedLeft}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${getRightItemStyle(
                  item.id
                )} ${!selectedLeft && !showResults ? 'opacity-50' : ''}`}
              >
                <p className="text-white">{item.text}</p>
              </button>
            ))}
          </div>
        </div>

        {showResults && (
          <div className="mt-6 p-4 bg-slate-800 border border-slate-700 rounded-xl">
            <p className="text-slate-400 text-sm mb-2">Associations correctes:</p>
            <div className="space-y-2">
              {frontContent?.left_items.map((left) => {
                const correctRightId = frontContent.correct_pairs[left.id];
                const correctRight = frontContent.right_items.find((r) => r.id === correctRightId);
                return (
                  <div key={left.id} className="flex items-center gap-2 text-emerald-400 text-sm">
                    <Check size={14} />
                    <span>
                      {left.text} = {correctRight?.text}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="mt-6">
        {!showResults ? (
          <button
            onClick={handleValidate}
            disabled={!allMatched}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
          >
            <Check size={20} />
            Valider mes associations ({matches.size}/{frontContent?.left_items.length})
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
          >
            {currentIndex < cards.length - 1 ? (
              <>
                Exercice suivant
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
