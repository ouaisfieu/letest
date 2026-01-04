import { useState, useEffect, useCallback } from 'react';
import {
  ChevronLeft,
  Clock,
  Star,
  Zap,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ArrowRight,
  Users,
} from 'lucide-react';
import { GameCard } from '../../types';

interface ScenarioGameProps {
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

interface ScenarioContent {
  type: string;
  context: string;
  scenario: string;
  choices: {
    id: string;
    text: string;
    consequence: 'positive' | 'negative' | 'neutral';
    feedback: string;
  }[];
}

export function ScenarioGame({ cards, onComplete, onExit, mode }: ScenarioGameProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [responses, setResponses] = useState<GameResults['responses']>([]);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [startTime] = useState(Date.now());
  const [cardStartTime, setCardStartTime] = useState(Date.now());
  const [timeRemaining, setTimeRemaining] = useState(mode === 'timed' ? 600 : null);

  const currentCard = cards[currentIndex];
  const frontContent = currentCard?.front_content as ScenarioContent;

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

  const handleSelectChoice = (choiceId: string) => {
    if (showFeedback) return;
    setSelectedChoice(choiceId);
  };

  const handleConfirm = useCallback(() => {
    if (!selectedChoice) return;

    const responseTime = Date.now() - cardStartTime;
    const choice = frontContent.choices.find((c) => c.id === selectedChoice);
    const isPositive = choice?.consequence === 'positive';

    let pointsEarned = 0;
    if (isPositive) {
      pointsEarned = currentCard.points;
      setStreak((prev) => {
        const newStreak = prev + 1;
        if (newStreak > maxStreak) setMaxStreak(newStreak);
        if (newStreak >= 3) pointsEarned += 10;
        return newStreak;
      });
    } else if (choice?.consequence === 'neutral') {
      pointsEarned = Math.floor(currentCard.points / 2);
    } else {
      setStreak(0);
    }

    setScore((prev) => prev + pointsEarned);
    setResponses((prev) => [
      ...prev,
      { cardId: currentCard.id, correct: isPositive, timeMs: responseTime, hintUsed: false },
    ]);
    setShowFeedback(true);
  }, [selectedChoice, frontContent, currentCard, cardStartTime, maxStreak]);

  const handleNext = useCallback(() => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedChoice(null);
      setShowFeedback(false);
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
  const selectedChoiceData = frontContent?.choices.find((c) => c.id === selectedChoice);

  const getConsequenceIcon = (consequence: string) => {
    switch (consequence) {
      case 'positive':
        return <CheckCircle className="text-emerald-400" size={20} />;
      case 'negative':
        return <XCircle className="text-rose-400" size={20} />;
      default:
        return <AlertTriangle className="text-amber-400" size={20} />;
    }
  };

  const getConsequenceStyle = (consequence: string, isSelected: boolean) => {
    if (!showFeedback) {
      return isSelected
        ? 'border-amber-500 bg-amber-500/10'
        : 'border-slate-600 hover:border-slate-500';
    }
    switch (consequence) {
      case 'positive':
        return 'border-emerald-500 bg-emerald-500/10';
      case 'negative':
        return 'border-rose-500 bg-rose-500/10';
      default:
        return 'border-amber-500 bg-amber-500/10';
    }
  };

  if (!currentCard) return null;

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
          <span>Scenario {currentIndex + 1} sur {cards.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="flex-1">
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-2 text-amber-400 mb-3">
            <Users size={18} />
            <span className="font-medium">Situation</span>
          </div>
          <p className="text-slate-300 mb-4">{frontContent?.context}</p>
          <div className="bg-slate-700/50 rounded-lg p-4">
            <p className="text-white font-medium">{frontContent?.scenario}</p>
          </div>
        </div>

        <div className="space-y-3 mb-6">
          <p className="text-sm text-slate-400">Que faites-vous?</p>
          {frontContent?.choices.map((choice) => {
            const isSelected = selectedChoice === choice.id;
            return (
              <button
                key={choice.id}
                onClick={() => handleSelectChoice(choice.id)}
                disabled={showFeedback}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${getConsequenceStyle(
                  choice.consequence,
                  isSelected
                )}`}
              >
                <div className="flex items-start gap-3">
                  {showFeedback && getConsequenceIcon(choice.consequence)}
                  <p className="text-white flex-1">{choice.text}</p>
                </div>
              </button>
            );
          })}
        </div>

        {showFeedback && selectedChoiceData && (
          <div
            className={`p-4 rounded-xl mb-6 ${
              selectedChoiceData.consequence === 'positive'
                ? 'bg-emerald-500/10 border border-emerald-500/30'
                : selectedChoiceData.consequence === 'negative'
                ? 'bg-rose-500/10 border border-rose-500/30'
                : 'bg-amber-500/10 border border-amber-500/30'
            }`}
          >
            <div className="flex items-start gap-3">
              {getConsequenceIcon(selectedChoiceData.consequence)}
              <p
                className={`${
                  selectedChoiceData.consequence === 'positive'
                    ? 'text-emerald-300'
                    : selectedChoiceData.consequence === 'negative'
                    ? 'text-rose-300'
                    : 'text-amber-300'
                }`}
              >
                {selectedChoiceData.feedback}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6">
        {!showFeedback ? (
          <button
            onClick={handleConfirm}
            disabled={!selectedChoice}
            className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
          >
            Confirmer mon choix
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
          >
            {currentIndex < cards.length - 1 ? (
              <>
                Scenario suivant
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
