import { Zap, Trophy, Star } from 'lucide-react';

interface GameHeaderProps {
  username: string;
  level: number;
  xp: number;
  jobTitle: string;
}

export function GameHeader({ username, level, xp, jobTitle }: GameHeaderProps) {
  const xpForNextLevel = level * 500;
  const xpProgress = (xp % 500) / 500 * 100;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-sm border-b border-slate-700/50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">{username}</p>
              <p className="text-xs text-slate-400">{jobTitle}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center">
              <Star className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Niveau</p>
              <p className="text-sm font-bold text-white">{level}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="w-32">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs text-slate-400">XP</p>
                <p className="text-xs text-emerald-400">{xp}/{xpForNextLevel}</p>
              </div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
                  style={{ width: `${xpProgress}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
