import {
  Trophy,
  Star,
  Clock,
  Zap,
  Target,
  RotateCcw,
  Home,
  TrendingUp,
  Award,
} from 'lucide-react';

interface GameResultsProps {
  results: {
    cardsCorrect: number;
    cardsSeen: number;
    score: number;
    maxScore: number;
    timeSpentSeconds: number;
    streak: number;
    xpEarned: number;
  };
  collectionTitle: string;
  onPlayAgain: () => void;
  onExit: () => void;
}

export function GameResults({ results, collectionTitle, onPlayAgain, onExit }: GameResultsProps) {
  const percentage = Math.round((results.cardsCorrect / results.cardsSeen) * 100);
  const scorePercentage = Math.round((results.score / results.maxScore) * 100);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs}s`;
    return `${mins}m ${secs}s`;
  };

  const getGrade = () => {
    if (percentage >= 90) return { letter: 'A', color: 'text-emerald-400', bg: 'bg-emerald-500/20' };
    if (percentage >= 80) return { letter: 'B', color: 'text-blue-400', bg: 'bg-blue-500/20' };
    if (percentage >= 70) return { letter: 'C', color: 'text-amber-400', bg: 'bg-amber-500/20' };
    if (percentage >= 60) return { letter: 'D', color: 'text-orange-400', bg: 'bg-orange-500/20' };
    return { letter: 'E', color: 'text-rose-400', bg: 'bg-rose-500/20' };
  };

  const getMessage = () => {
    if (percentage >= 90) return 'Excellent! Vous maitrisez ce sujet!';
    if (percentage >= 80) return 'Tres bien! Continuez comme ca!';
    if (percentage >= 70) return 'Bien joue! Quelques points a revoir.';
    if (percentage >= 60) return 'Pas mal! La pratique rend parfait.';
    return 'Continuez a vous entrainer, vous progresserez!';
  };

  const grade = getGrade();

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div
          className={`w-24 h-24 rounded-full ${grade.bg} flex items-center justify-center mx-auto mb-4`}
        >
          <span className={`text-5xl font-bold ${grade.color}`}>{grade.letter}</span>
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Session terminee!</h1>
        <p className="text-slate-400">{collectionTitle}</p>
        <p className="text-lg text-slate-300 mt-4">{getMessage()}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 text-center">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center mx-auto mb-2">
            <Target size={20} className="text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-white">{percentage}%</p>
          <p className="text-xs text-slate-400">Precision</p>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 text-center">
          <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center mx-auto mb-2">
            <Star size={20} className="text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-white">{results.score}</p>
          <p className="text-xs text-slate-400">Points</p>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 text-center">
          <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center mx-auto mb-2">
            <Zap size={20} className="text-orange-400" />
          </div>
          <p className="text-2xl font-bold text-white">{results.streak}x</p>
          <p className="text-xs text-slate-400">Meilleure serie</p>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 text-center">
          <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center mx-auto mb-2">
            <Clock size={20} className="text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-white">{formatTime(results.timeSpentSeconds)}</p>
          <p className="text-xs text-slate-400">Temps</p>
        </div>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 mb-8">
        <h2 className="text-lg font-semibold text-white mb-4">Resume de la session</h2>

        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-slate-400">Reponses correctes</span>
              <span className="text-white">
                {results.cardsCorrect} / {results.cardsSeen}
              </span>
            </div>
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-slate-400">Score</span>
              <span className="text-white">
                {results.score} / {results.maxScore}
              </span>
            </div>
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500"
                style={{ width: `${scorePercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-emerald-600/20 to-teal-600/20 border border-emerald-500/30 rounded-xl p-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-emerald-500/30 flex items-center justify-center">
            <Award size={28} className="text-emerald-400" />
          </div>
          <div>
            <p className="text-emerald-400 font-bold text-xl">+{results.xpEarned} XP</p>
            <p className="text-slate-400 text-sm">Gagnes pour cette session</p>
          </div>
        </div>
      </div>

      {percentage < 80 && (
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-8">
          <div className="flex items-start gap-3">
            <TrendingUp size={20} className="text-blue-400 mt-0.5" />
            <div>
              <p className="text-blue-300 font-medium">Conseil</p>
              <p className="text-slate-400 text-sm">
                Revisez les cartes manquees regulierement. La repetition espacee vous aidera a
                mieux retenir les concepts.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-4">
        <button
          onClick={onPlayAgain}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-slate-700 text-white rounded-xl hover:bg-slate-600 transition-colors"
        >
          <RotateCcw size={20} />
          Rejouer
        </button>
        <button
          onClick={onExit}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl transition-colors"
        >
          <Home size={20} />
          Retour aux jeux
        </button>
      </div>
    </div>
  );
}
