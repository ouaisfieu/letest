import { useEffect, useState } from 'react';
import {
  Gamepad2,
  ChevronRight,
  Star,
  Zap,
  Trophy,
  Clock,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

interface GameCollection {
  id: string;
  title: string;
  description: string;
  card_count: number;
  xp_reward: number;
  difficulty_level: number;
  game_types: {
    name: string;
    icon: string;
  };
}

interface RecentSession {
  id: string;
  score: number;
  max_score: number;
  completed_at: string;
  game_collections: {
    title: string;
  };
}

interface GamesWidgetProps {
  onNavigateToGames: () => void;
  onPlayGame: (collectionId: string) => void;
}

export function GamesWidget({ onNavigateToGames, onPlayGame }: GamesWidgetProps) {
  const { profile } = useAuth();
  const [featuredGames, setFeaturedGames] = useState<GameCollection[]>([]);
  const [recentSession, setRecentSession] = useState<RecentSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadGamesData() {
      const [gamesResult, sessionsResult] = await Promise.all([
        supabase
          .from('game_collections')
          .select('*, game_types(name, icon)')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(3),
        profile
          ? supabase
              .from('game_sessions')
              .select('*, game_collections(title)')
              .eq('user_id', profile.id)
              .order('completed_at', { ascending: false })
              .limit(1)
              .maybeSingle()
          : Promise.resolve({ data: null }),
      ]);

      if (gamesResult.data) {
        setFeaturedGames(gamesResult.data as GameCollection[]);
      }
      if (sessionsResult.data) {
        setRecentSession(sessionsResult.data as RecentSession);
      }
      setLoading(false);
    }

    loadGamesData();
  }, [profile]);

  const getDifficultyLabel = (level: number) => {
    if (level === 1) return 'Facile';
    if (level === 2) return 'Moyen';
    if (level === 3) return 'Difficile';
    return 'Expert';
  };

  const getDifficultyColor = (level: number) => {
    if (level === 1) return 'text-emerald-400';
    if (level === 2) return 'text-amber-400';
    if (level === 3) return 'text-orange-400';
    return 'text-rose-400';
  };

  if (loading) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-700 rounded w-1/3" />
          <div className="h-20 bg-slate-700 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Gamepad2 size={20} className="text-emerald-400" />
          Jeux educatifs
        </h3>
        <button
          onClick={onNavigateToGames}
          className="text-emerald-400 hover:text-emerald-300 text-sm font-medium flex items-center gap-1"
        >
          Tous les jeux <ChevronRight size={16} />
        </button>
      </div>

      {recentSession && (
        <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 rounded-lg p-3 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy size={16} className="text-emerald-400" />
              <span className="text-sm text-slate-300">Derniere session</span>
            </div>
            <div className="flex items-center gap-2">
              <Star size={14} className="text-amber-400" />
              <span className="text-sm font-bold text-white">
                {Math.round((recentSession.score / recentSession.max_score) * 100)}%
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-1 truncate">
            {recentSession.game_collections.title}
          </p>
        </div>
      )}

      <div className="space-y-3">
        {featuredGames.map((game) => (
          <button
            key={game.id}
            onClick={() => onPlayGame(game.id)}
            className="w-full text-left bg-slate-700/50 hover:bg-slate-700 border border-slate-600 hover:border-emerald-500/50 rounded-lg p-3 transition-all group"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-white truncate group-hover:text-emerald-300 transition-colors">
                  {game.title}
                </h4>
                <div className="flex items-center gap-3 mt-1 text-xs">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Zap size={12} className="text-amber-400" />
                    {game.xp_reward} XP
                  </span>
                  <span className={getDifficultyColor(game.difficulty_level)}>
                    {getDifficultyLabel(game.difficulty_level)}
                  </span>
                  <span className="text-slate-500">
                    {game.card_count} cartes
                  </span>
                </div>
              </div>
              <ChevronRight
                size={18}
                className="text-slate-500 group-hover:text-emerald-400 transition-colors mt-1"
              />
            </div>
          </button>
        ))}
      </div>

      {featuredGames.length === 0 && (
        <div className="text-center py-6">
          <Gamepad2 size={32} className="text-slate-600 mx-auto mb-2" />
          <p className="text-slate-400 text-sm">Aucun jeu disponible</p>
        </div>
      )}
    </div>
  );
}
