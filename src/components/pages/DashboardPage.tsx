import { useEffect, useState, useCallback } from 'react';
import {
  Flame,
  Target,
  BookOpen,
  Award,
  TrendingUp,
  Clock,
  ChevronRight,
  Zap,
  Star,
  CheckCircle,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { LearningPath, Achievement, UserAchievement, UserDailyProgress } from '../../types';
import { CompetencyRadar } from '../ui/CompetencyRadar';
import { GamesWidget } from '../dashboard/GamesWidget';
import { WellnessWidget } from '../wellness/WellnessWidget';
import { useSessionTracker } from '../../hooks/useSessionTracker';
import { DashboardSkeleton } from '../ui/Skeleton';
import { ErrorState } from '../ui/ErrorState';

interface DashboardPageProps {
  onNavigateToPath: (pathId: string) => void;
  onNavigateToAchievements: () => void;
  onNavigateToGames: () => void;
  onPlayGame: (collectionId: string) => void;
}

export function DashboardPage({ onNavigateToPath, onNavigateToAchievements, onNavigateToGames, onPlayGame }: DashboardPageProps) {
  const { profile } = useAuth();
  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [recentAchievements, setRecentAchievements] = useState<(UserAchievement & { achievement: Achievement })[]>([]);
  const [todayProgress, setTodayProgress] = useState<UserDailyProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const sessionTracker = useSessionTracker({
    idleThreshold: 120,
  });

  const loadDashboardData = useCallback(async () => {
    if (!profile) return;

    setLoading(true);
    setError(null);

    try {
      const [pathsResult, achievementsResult, progressResult] = await Promise.all([
        supabase.from('learning_paths').select('*').order('order_index'),
        supabase
          .from('user_achievements')
          .select('*, achievement:achievements(*)')
          .eq('user_id', profile.id)
          .order('earned_at', { ascending: false })
          .limit(3),
        supabase
          .from('user_daily_progress')
          .select('*')
          .eq('user_id', profile.id)
          .eq('activity_date', new Date().toISOString().split('T')[0])
          .maybeSingle(),
      ]);

      if (pathsResult.error) throw pathsResult.error;
      if (achievementsResult.error) throw achievementsResult.error;
      if (progressResult.error) throw progressResult.error;

      if (pathsResult.data) setPaths(pathsResult.data);
      if (achievementsResult.data) setRecentAchievements(achievementsResult.data as (UserAchievement & { achievement: Achievement })[]);
      if (progressResult.data) setTodayProgress(progressResult.data);
    } catch (err) {
      setError('Impossible de charger le tableau de bord');
    } finally {
      setLoading(false);
    }
  }, [profile]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const xpForNextLevel = Math.pow((profile?.current_level || 1), 2) * 100;
  const currentLevelXP = profile?.total_xp ? profile.total_xp % xpForNextLevel : 0;
  const xpProgress = (currentLevelXP / xpForNextLevel) * 100;

  const stats = [
    {
      icon: Flame,
      label: 'Serie en cours',
      value: `${profile?.streak_days || 0} jours`,
      color: 'amber',
    },
    {
      icon: Star,
      label: 'Niveau actuel',
      value: `Niveau ${profile?.current_level || 1}`,
      color: 'emerald',
    },
    {
      icon: Zap,
      label: 'XP total',
      value: `${profile?.total_xp || 0} XP`,
      color: 'blue',
    },
    {
      icon: CheckCircle,
      label: 'Lecons aujourd\'hui',
      value: todayProgress?.lessons_completed || 0,
      color: 'teal',
    },
  ];

  const pathColors: Record<string, string> = {
    emerald: 'from-emerald-500 to-teal-500',
    blue: 'from-blue-500 to-cyan-500',
    amber: 'from-amber-500 to-orange-500',
    rose: 'from-rose-500 to-pink-500',
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadDashboardData} />;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold mb-1">Bonjour, {profile?.display_name} !</h2>
            <p className="text-emerald-100">
              {profile?.streak_days && profile.streak_days > 0
                ? `Bravo ! ${profile.streak_days} jours consecutifs d'apprentissage.`
                : 'Pret a commencer votre apprentissage aujourd\'hui ?'}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-emerald-100">Prochain niveau</p>
              <p className="text-lg font-bold">{xpForNextLevel - currentLevelXP} XP restants</p>
            </div>
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
              <span className="text-2xl font-bold">{profile?.current_level}</span>
            </div>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex justify-between text-sm mb-1">
            <span>Progression vers le niveau {(profile?.current_level || 1) + 1}</span>
            <span>{Math.round(xpProgress)}%</span>
          </div>
          <div className="h-3 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-500"
              style={{ width: `${xpProgress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-slate-800 border border-slate-700 rounded-xl p-4"
            >
              <div className={`w-10 h-10 rounded-lg bg-${stat.color}-500/20 flex items-center justify-center mb-3`}>
                <Icon size={20} className={`text-${stat.color}-400`} />
              </div>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-sm text-slate-400">{stat.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <BookOpen size={20} className="text-emerald-400" />
                Parcours d'apprentissage
              </h3>
              <button className="text-emerald-400 hover:text-emerald-300 text-sm font-medium flex items-center gap-1">
                Voir tout <ChevronRight size={16} />
              </button>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {paths.map((path) => (
                <button
                  key={path.id}
                  onClick={() => onNavigateToPath(path.id)}
                  className="text-left group"
                >
                  <div className={`relative overflow-hidden rounded-xl p-4 border border-slate-600 hover:border-${path.color}-500/50 transition-all bg-gradient-to-br ${pathColors[path.color] || pathColors.emerald} bg-opacity-10`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-white group-hover:text-emerald-300 transition-colors">
                          {path.title}
                        </h4>
                        <p className="text-sm text-slate-400 mt-1 line-clamp-2">
                          {path.description}
                        </p>
                        <div className="flex items-center gap-3 mt-3 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Clock size={12} />
                            {path.estimated_hours}h
                          </span>
                          <span className="flex items-center gap-1">
                            <Target size={12} />
                            {path.difficulty_level === 1 ? 'Debutant' :
                             path.difficulty_level === 2 ? 'Intermediaire' :
                             path.difficulty_level === 3 ? 'Avance' : 'Expert'}
                          </span>
                        </div>
                      </div>
                      <ChevronRight size={20} className="text-slate-500 group-hover:text-emerald-400 transition-colors" />
                    </div>
                    <div className="mt-3 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div className={`h-full bg-gradient-to-r ${pathColors[path.color] || pathColors.emerald} rounded-full`} style={{ width: '0%' }} />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Zap size={20} className="text-amber-400" />
                Defi du jour
              </h3>
            </div>
            <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-white">Completez une lecon aujourd'hui</p>
                  <p className="text-sm text-slate-400 mt-1">
                    Gagnez 30 XP supplementaires en terminant n'importe quelle lecon
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-amber-400">+30 XP</p>
                  <p className="text-xs text-slate-500">Recompense</p>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-3">
                <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                    style={{ width: todayProgress?.lessons_completed ? '100%' : '0%' }}
                  />
                </div>
                <span className="text-sm text-slate-400">
                  {todayProgress?.lessons_completed ? 'Complete !' : '0/1'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <WellnessWidget
            sessionTime={sessionTracker.formatTime(sessionTracker.stats.totalSeconds)}
            activeTime={sessionTracker.formatTime(sessionTracker.stats.activeSeconds)}
            isIdle={sessionTracker.isIdle}
            breaksTaken={sessionTracker.stats.breaks.length}
          />

          <GamesWidget
            onNavigateToGames={onNavigateToGames}
            onPlayGame={onPlayGame}
          />

          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
              <TrendingUp size={20} className="text-blue-400" />
              Vos competences
            </h3>
            <CompetencyRadar />
            <p className="text-xs text-slate-500 text-center mt-4">
              Completez des lecons pour developper vos competences
            </p>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Award size={20} className="text-teal-400" />
                Derniers badges
              </h3>
              <button
                onClick={onNavigateToAchievements}
                className="text-teal-400 hover:text-teal-300 text-sm font-medium flex items-center gap-1"
              >
                Tous <ChevronRight size={16} />
              </button>
            </div>
            {recentAchievements.length > 0 ? (
              <div className="space-y-3">
                {recentAchievements.map((ua) => (
                  <div key={ua.id} className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${
                      ua.achievement.rarity === 'legendary' ? 'bg-amber-500/20' :
                      ua.achievement.rarity === 'epic' ? 'bg-purple-500/20' :
                      ua.achievement.rarity === 'rare' ? 'bg-blue-500/20' : 'bg-slate-600'
                    }`}>
                      {ua.achievement.icon === 'footprints' ? '👣' :
                       ua.achievement.icon === 'flame' ? '🔥' :
                       ua.achievement.icon === 'award' ? '🏆' : '⭐'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white truncate">{ua.achievement.name}</p>
                      <p className="text-xs text-slate-400 truncate">{ua.achievement.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Award size={40} className="text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">Aucun badge pour l'instant</p>
                <p className="text-xs text-slate-500 mt-1">Completez des lecons pour en gagner !</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
