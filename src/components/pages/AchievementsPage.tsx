import { useEffect, useState } from 'react';
import { Award, Lock, Star, Flame, Users, BookOpen, Trophy } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Achievement, UserAchievement } from '../../types';

const CATEGORY_INFO: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  learning: { label: 'Apprentissage', icon: BookOpen, color: 'emerald' },
  community: { label: 'Communaute', icon: Users, color: 'blue' },
  streak: { label: 'Regularite', icon: Flame, color: 'amber' },
  mastery: { label: 'Maitrise', icon: Trophy, color: 'purple' },
  special: { label: 'Special', icon: Star, color: 'rose' },
};

const RARITY_INFO: Record<string, { label: string; bg: string; border: string }> = {
  common: { label: 'Commun', bg: 'bg-slate-500/20', border: 'border-slate-500/30' },
  rare: { label: 'Rare', bg: 'bg-blue-500/20', border: 'border-blue-500/30' },
  epic: { label: 'Epique', bg: 'bg-purple-500/20', border: 'border-purple-500/30' },
  legendary: { label: 'Legendaire', bg: 'bg-amber-500/20', border: 'border-amber-500/30' },
};

export function AchievementsPage() {
  const { profile } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAchievements() {
      if (!profile) return;

      const [achievementsResult, userResult] = await Promise.all([
        supabase.from('achievements').select('*').order('rarity'),
        supabase.from('user_achievements').select('*').eq('user_id', profile.id),
      ]);

      if (achievementsResult.data) setAchievements(achievementsResult.data as Achievement[]);
      if (userResult.data) setUserAchievements(userResult.data as UserAchievement[]);
      setLoading(false);
    }

    loadAchievements();
  }, [profile]);

  const earnedIds = new Set(userAchievements.map((ua) => ua.achievement_id));
  const earnedCount = userAchievements.length;
  const totalCount = achievements.length;

  const filteredAchievements = selectedCategory
    ? achievements.filter((a) => a.category === selectedCategory)
    : achievements;

  const categories = Object.keys(CATEGORY_INFO);

  const getAchievementIcon = (iconName: string) => {
    const icons: Record<string, string> = {
      footprints: '👣',
      compass: '🧭',
      flame: '🔥',
      zap: '⚡',
      award: '🏆',
      search: '🔍',
      target: '🎯',
      users: '👥',
      'piggy-bank': '🐷',
      megaphone: '📢',
      'message-square': '💬',
      'check-circle': '✅',
      heart: '❤️',
      'user-plus': '👤',
      star: '⭐',
      crown: '👑',
      trophy: '🏆',
      rocket: '🚀',
      'book-open': '📖',
      clock: '⏰',
      'check-square': '☑️',
      'calendar-check': '📅',
      'share-2': '🔗',
    };
    return icons[iconName] || '🏅';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Badges et Accomplissements</h1>
        <p className="text-slate-400">
          Collectionnez des badges en progressant dans votre apprentissage
        </p>
      </div>

      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-purple-100 mb-1">Votre collection</p>
            <p className="text-3xl font-bold text-white">
              {earnedCount} / {totalCount} badges
            </p>
          </div>
          <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center">
            <Award size={40} className="text-white" />
          </div>
        </div>
        <div className="mt-4">
          <div className="h-3 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-500"
              style={{ width: `${(earnedCount / totalCount) * 100}%` }}
            />
          </div>
          <p className="text-sm text-purple-100 mt-2">
            {Math.round((earnedCount / totalCount) * 100)}% de la collection
          </p>
        </div>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
            selectedCategory === null
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : 'bg-slate-700/50 text-slate-400 hover:text-white'
          }`}
        >
          Tous ({achievements.length})
        </button>
        {categories.map((cat) => {
          const info = CATEGORY_INFO[cat];
          const count = achievements.filter((a) => a.category === cat).length;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors flex items-center gap-2 ${
                selectedCategory === cat
                  ? `bg-${info.color}-500/20 text-${info.color}-400 border border-${info.color}-500/30`
                  : 'bg-slate-700/50 text-slate-400 hover:text-white'
              }`}
            >
              <info.icon size={16} />
              {info.label} ({count})
            </button>
          );
        })}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAchievements.map((achievement) => {
          const isEarned = earnedIds.has(achievement.id);
          const rarity = RARITY_INFO[achievement.rarity];
          const userAchievement = userAchievements.find((ua) => ua.achievement_id === achievement.id);

          return (
            <div
              key={achievement.id}
              className={`relative overflow-hidden rounded-xl border transition-all ${
                isEarned
                  ? `${rarity.bg} ${rarity.border}`
                  : 'bg-slate-800/50 border-slate-700 opacity-60'
              }`}
            >
              {!isEarned && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-900/60 z-10">
                  <Lock size={24} className="text-slate-500" />
                </div>
              )}

              <div className="p-4">
                <div className="flex items-start gap-4">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl ${
                    isEarned ? rarity.bg : 'bg-slate-700'
                  }`}>
                    {getAchievementIcon(achievement.icon)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-white truncate">{achievement.name}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${rarity.bg} ${
                        achievement.rarity === 'legendary' ? 'text-amber-400' :
                        achievement.rarity === 'epic' ? 'text-purple-400' :
                        achievement.rarity === 'rare' ? 'text-blue-400' : 'text-slate-400'
                      }`}>
                        {rarity.label}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400 line-clamp-2">{achievement.description}</p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs text-emerald-400 font-medium">+{achievement.xp_reward} XP</span>
                      {isEarned && userAchievement && (
                        <span className="text-xs text-slate-500">
                          Obtenu le {new Date(userAchievement.earned_at).toLocaleDateString('fr-FR')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
