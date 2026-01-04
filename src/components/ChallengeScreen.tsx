import { useState, useEffect, useCallback } from 'react';
import { Clock, HelpCircle, ChevronRight, AlertTriangle, Lightbulb, CheckCircle2, XCircle } from 'lucide-react';
import { Challenge, Question } from '../types';

interface ChallengeScreenProps {
  challenge: Challenge;
  onComplete: (score: number, timeTaken: number) => void;
  level: number;
  totalChallenges: number;
  currentIndex: number;
}

export function ChallengeScreen({ challenge, onComplete, level, totalChallenges, currentIndex }: ChallengeScreenProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showResult, setShowResult] = useState(false);
  const [timeLeft, setTimeLeft] = useState(challenge.time_limit || 0);
  const [timeTaken, setTimeTaken] = useState(0);
  const [showHint, setShowHint] = useState(false);

  const hasTimer = challenge.time_limit !== null && challenge.time_limit > 0;
  const questions: Question[] = challenge.content.questions || [];
  const scenario = challenge.content.scenario;
  const hints = challenge.content.hints;

  useEffect(() => {
    setCurrentQuestion(0);
    setSelectedAnswers({});
    setShowResult(false);
    setTimeLeft(challenge.time_limit || 0);
    setTimeTaken(0);
    setShowHint(false);
  }, [challenge.id, challenge.time_limit]);

  useEffect(() => {
    if (!hasTimer || showResult) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
      setTimeTaken((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [hasTimer, showResult, challenge.id]);

  useEffect(() => {
    if (hasTimer || showResult) return;
    const timer = setInterval(() => {
      setTimeTaken((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [hasTimer, showResult, challenge.id]);

  const handleAnswer = (questionIndex: number, answerIndex: number) => {
    if (showResult) return;
    setSelectedAnswers((prev) => ({ ...prev, [questionIndex]: answerIndex }));
  };

  const handleSubmit = useCallback(() => {
    setShowResult(true);
  }, []);

  const calculateScore = () => {
    let correct = 0;
    questions.forEach((q, i) => {
      if (selectedAnswers[i] === q.correct) {
        correct++;
      }
    });
    return Math.round((correct / questions.length) * 100);
  };

  const handleContinue = () => {
    const score = calculateScore();
    onComplete(score, timeTaken);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyLabel = (diff: number) => {
    const labels = ['Facile', 'Normal', 'Difficile', 'Expert', 'Extreme'];
    return labels[diff - 1] || 'Normal';
  };

  const getDifficultyColor = (diff: number) => {
    const colors = ['text-emerald-400', 'text-blue-400', 'text-amber-400', 'text-orange-400', 'text-rose-400'];
    return colors[diff - 1] || 'text-blue-400';
  };

  const progress = ((currentIndex + 1) / totalChallenges) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-sm font-medium">
              Niveau {level}
            </div>
            <span className="text-slate-400 text-sm">
              Epreuve {currentIndex + 1}/{totalChallenges}
            </span>
          </div>
          {hasTimer && !showResult && (
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${timeLeft <= 30 ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-700/50 text-slate-300'}`}>
              <Clock className="w-4 h-4" />
              <span className="font-mono font-semibold">{formatTime(timeLeft)}</span>
            </div>
          )}
        </div>

        <div className="w-full bg-slate-700/30 rounded-full h-2 mb-8">
          <div
            className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden">
          <div className="p-6 border-b border-slate-700/50">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className={`text-xs font-medium ${getDifficultyColor(challenge.difficulty)}`}>
                    {getDifficultyLabel(challenge.difficulty)}
                  </span>
                  <span className="text-xs text-slate-500">|</span>
                  <span className="text-xs text-amber-400">+{challenge.xp_reward} XP</span>
                </div>
                <h2 className="text-2xl font-bold text-white">{challenge.title}</h2>
              </div>
              {hasTimer && (
                <div className="flex items-center gap-1 text-xs text-slate-400">
                  <AlertTriangle className="w-3 h-3" />
                  <span>Chrono</span>
                </div>
              )}
            </div>
            <p className="text-slate-400">{challenge.description}</p>
          </div>

          {scenario && (
            <div className="p-6 bg-slate-700/20 border-b border-slate-700/50">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <HelpCircle className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-blue-400 mb-1">Scenario</h4>
                  <p className="text-sm text-slate-300">{scenario}</p>
                </div>
              </div>
            </div>
          )}

          <div className="p-6">
            {!showResult ? (
              <>
                <div className="flex items-center gap-2 mb-6">
                  {questions.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentQuestion(i)}
                      className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                        i === currentQuestion
                          ? 'bg-emerald-500 text-white'
                          : selectedAnswers[i] !== undefined
                          ? 'bg-slate-600 text-white'
                          : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-medium text-white mb-4">
                    {questions[currentQuestion]?.question}
                  </h3>
                  <div className="space-y-3">
                    {questions[currentQuestion]?.options.map((option, i) => (
                      <button
                        key={i}
                        onClick={() => handleAnswer(currentQuestion, i)}
                        className={`w-full text-left p-4 rounded-xl border transition-all ${
                          selectedAnswers[currentQuestion] === i
                            ? 'border-emerald-500 bg-emerald-500/10 text-white'
                            : 'border-slate-600 bg-slate-700/30 text-slate-300 hover:border-slate-500 hover:bg-slate-700/50'
                        }`}
                      >
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-slate-600 text-xs font-medium mr-3">
                          {String.fromCharCode(65 + i)}
                        </span>
                        {option}
                      </button>
                    ))}
                  </div>
                </div>

                {hints && hints.length > 0 && (
                  <div className="mb-6">
                    <button
                      onClick={() => setShowHint(!showHint)}
                      className="flex items-center gap-2 text-sm text-amber-400 hover:text-amber-300 transition-colors"
                    >
                      <Lightbulb className="w-4 h-4" />
                      {showHint ? 'Masquer l\'indice' : 'Afficher un indice'}
                    </button>
                    {showHint && (
                      <div className="mt-3 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                        <p className="text-sm text-amber-200">{hints[0]}</p>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between pt-6 border-t border-slate-700/50">
                  <button
                    onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                    disabled={currentQuestion === 0}
                    className="px-4 py-2 text-sm text-slate-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Question precedente
                  </button>
                  {currentQuestion < questions.length - 1 ? (
                    <button
                      onClick={() => setCurrentQuestion(currentQuestion + 1)}
                      className="flex items-center gap-2 px-6 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
                    >
                      Suivante
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmit}
                      disabled={Object.keys(selectedAnswers).length < questions.length}
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-medium rounded-xl hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-emerald-500/25"
                    >
                      Valider mes reponses
                    </button>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-6 ${calculateScore() >= 70 ? 'bg-emerald-500/20' : 'bg-amber-500/20'}`}>
                  {calculateScore() >= 70 ? (
                    <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                  ) : (
                    <XCircle className="w-10 h-10 text-amber-400" />
                  )}
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  {calculateScore() >= 70 ? 'Excellent travail !' : 'Continuez vos efforts !'}
                </h3>
                <p className="text-slate-400 mb-6">
                  Vous avez obtenu {calculateScore()}% de bonnes reponses
                </p>

                <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto mb-8">
                  <div className="bg-slate-700/30 rounded-xl p-4">
                    <p className="text-2xl font-bold text-emerald-400">+{Math.round(challenge.xp_reward * (calculateScore() / 100))}</p>
                    <p className="text-xs text-slate-400">XP gagnes</p>
                  </div>
                  <div className="bg-slate-700/30 rounded-xl p-4">
                    <p className="text-2xl font-bold text-blue-400">{formatTime(timeTaken)}</p>
                    <p className="text-xs text-slate-400">Temps</p>
                  </div>
                </div>

                <div className="space-y-3 text-left max-w-lg mx-auto mb-8">
                  {questions.map((q, i) => {
                    const isCorrect = selectedAnswers[i] === q.correct;
                    return (
                      <div key={i} className={`p-4 rounded-xl border ${isCorrect ? 'border-emerald-500/50 bg-emerald-500/10' : 'border-rose-500/50 bg-rose-500/10'}`}>
                        <div className="flex items-start gap-3">
                          {isCorrect ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                          ) : (
                            <XCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
                          )}
                          <div>
                            <p className="text-sm text-white mb-1">{q.question}</p>
                            {!isCorrect && (
                              <p className="text-xs text-emerald-400">
                                Reponse correcte : {q.options[q.correct]}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <button
                  onClick={handleContinue}
                  className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-medium rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all shadow-lg shadow-emerald-500/25"
                >
                  Continuer
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
