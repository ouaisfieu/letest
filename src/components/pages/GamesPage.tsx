import { useEffect, useState, useCallback } from 'react';
import {
  Layers,
  CheckSquare,
  Link,
  GitBranch,
  Clock,
  Star,
  Zap,
  Play,
  Trophy,
  Target,
  Gamepad2,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { GameCollection, GameType } from '../../types';
import { GameCardSkeleton, StatCardSkeleton } from '../ui/Skeleton';
import { ErrorState } from '../ui/ErrorState';
import { EmptyState } from '../ui/EmptyState';

interface GamesPageProps {
  onSelectCollection: (collectionId: string) => void;
}

const GAME_TYPE_ICONS: Record<string, React.ElementType> = {
  flashcards: Layers,
  mcq: CheckSquare,
  matching: Link,
  scenario: GitBranch,
};

const GAME_TYPE_COLORS: Record<string, { gradient: string; text: string; bg: string }> = {
  flashcards: {
    gradient: 'from-emerald-500 to-teal-500',
    text: 'text-emerald-400',
    bg: 'bg-emerald-500/20',
  },
  mcq: {
    gradient: 'from-blue-500 to-cyan-500',
    text: 'text-blue-400',
    bg: 'bg-blue-500/20',
  },
  matching: {
    gradient: 'from-purple-500 to-pink-500',
    text: 'text-purple-400',
    bg: 'bg-purple-500/20',
  },
  scenario: {
    gradient: 'from-amber-500 to-orange-500',
    text: 'text-amber-400',
    bg: 'bg-amber-500/20',
  },
};

export function GamesPage({ onSelectCollection }: GamesPageProps) {
  const { profile } = useAuth();
  const [gameTypes, setGameTypes] = useState<GameType[]>([]);
  const [collections, setCollections] = useState<GameCollection[]>([]);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [userStats, setUserStats] = useState({
    totalSessions: 0,
    totalScore: 0,
    bestStreak: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [typesResult, collectionsResult] = await Promise.all([
        supabase.from('game_types').select('*').eq('is_active', true),
        supabase.from('game_collections').select('*, game_types(*)').eq('is_published', true).order('order_index'),
      ]);

      if (typesResult.error) throw typesResult.error;
      if (collectionsResult.error) throw collectionsResult.error;

      if (typesResult.data) setGameTypes(typesResult.data as GameType[]);
      if (collectionsResult.data) {
        const withCounts = collectionsResult.data.map((c) => ({
          ...c,
          game_type: c.game_types,
        }));
        setCollections(withCounts as GameCollection[]);
      }

      if (profile) {
        const statsResult = await supabase
          .from('game_sessions')
          .select('score, streak_count')
          .eq('user_id', profile.id);

        if (statsResult.data) {
          setUserStats({
            totalSessions: statsResult.data.length,
            totalScore: statsResult.data.reduce((sum, s) => sum + s.score, 0),
            bestStreak: Math.max(...statsResult.data.map((s) => s.streak_count), 0),
          });
        }
      }
    } catch (err) {
      setError('Impossible de charger les jeux');
    } finally {
      setLoading(false);
    }
  }, [profile]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredCollections = selectedType
    ? collections.filter((c) => c.game_type?.slug === selectedType)
    : collections;

  const getDifficultyLabel = (level: number) => {
    switch (level) {
      case 1:
        return 'Debutant';
      case 2:
        return 'Intermediaire';
      case 3:
        return 'Avance';
      case 4:
        return 'Expert';
      case 5:
        return 'Maitre';
      default:
        return 'Debutant';
    }
  };

  if (loading) {
    return (
      <div className="p-6" role="status" aria-label="Chargement des jeux">
        <div className="mb-8">
          <div className="h-8 w-48 bg-slate-700 rounded animate-pulse mb-2" />
          <div className="h-4 w-80 bg-slate-700/50 rounded animate-pulse" />
        </div>
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          {[...Array(3)].map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <GameCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadData} />;
  }

  if (collections.length === 0) {
    return (
      <div className="p-6">
        <EmptyState
          icon={Gamepad2}
          title="Aucun jeu disponible"
          description="Les jeux educatifs seront bientot disponibles."
        />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Jeux Educatifs</h1>
        <p className="text-slate-400">
          Apprenez en vous amusant avec nos jeux interactifs
        </p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <Trophy size={20} className="text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{userStats.totalSessions}</p>
              <p className="text-xs text-slate-400">Sessions jouees</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <Star size={20} className="text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{userStats.totalScore}</p>
              <p className="text-xs text-slate-400">Points cumules</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
              <Zap size={20} className="text-orange-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{userStats.bestStreak}x</p>
              <p className="text-xs text-slate-400">Meilleure serie</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <button
          onClick={() => setSelectedType(null)}
          className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors flex items-center gap-2 ${
            selectedType === null
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : 'bg-slate-700/50 text-slate-400 hover:text-white'
          }`}
        >
          Tous ({collections.length})
        </button>
        {gameTypes.map((type) => {
          const Icon = GAME_TYPE_ICONS[type.slug] || Layers;
          const count = collections.filter((c) => c.game_type?.slug === type.slug).length;
          const colors = GAME_TYPE_COLORS[type.slug] || GAME_TYPE_COLORS.flashcards;

          return (
            <button
              key={type.id}
              onClick={() => setSelectedType(type.slug)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors flex items-center gap-2 ${
                selectedType === type.slug
                  ? `${colors.bg} ${colors.text} border border-current/30`
                  : 'bg-slate-700/50 text-slate-400 hover:text-white'
              }`}
            >
              <Icon size={16} />
              {type.name} ({count})
            </button>
          );
        })}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCollections.map((collection) => {
          const typeSlug = collection.game_type?.slug || 'flashcards';
          const Icon = GAME_TYPE_ICONS[typeSlug] || Layers;
          const colors = GAME_TYPE_COLORS[typeSlug] || GAME_TYPE_COLORS.flashcards;

          return (
            <div
              key={collection.id}
              className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden hover:border-slate-600 transition-colors group"
            >
              <div className={`h-2 bg-gradient-to-r ${colors.gradient}`} />
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-12 h-12 rounded-xl ${colors.bg} flex items-center justify-center`}>
                    <Icon size={24} className={colors.text} />
                  </div>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: collection.difficulty_level }).map((_, i) => (
                      <div key={i} className="w-2 h-2 rounded-full bg-amber-400" />
                    ))}
                    {Array.from({ length: 5 - collection.difficulty_level }).map((_, i) => (
                      <div key={i} className="w-2 h-2 rounded-full bg-slate-600" />
                    ))}
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-white mb-2">{collection.title}</h3>
                <p className="text-sm text-slate-400 mb-4 line-clamp-2">{collection.description}</p>

                <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {collection.estimated_minutes} min
                  </span>
                  <span className="flex items-center gap-1">
                    <Target size={12} />
                    {getDifficultyLabel(collection.difficulty_level)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Star size={12} />
                    {collection.xp_reward} XP
                  </span>
                </div>

                <button
                  onClick={() => onSelectCollection(collection.id)}
                  className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-gradient-to-r ${colors.gradient} text-white font-medium transition-transform group-hover:scale-[1.02]`}
                >
                  <Play size={18} />
                  Jouer
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredCollections.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-slate-700 flex items-center justify-center mx-auto mb-4">
            <Layers size={32} className="text-slate-500" />
          </div>
          <p className="text-slate-400">Aucune collection trouvee pour ce type de jeu</p>
        </div>
      )}
    </div>
  );
}
