import { useEffect, useState, useCallback } from 'react';
import {
  Lightbulb,
  Search,
  Star,
  Clock,
  ChevronRight,
  Filter,
  Bookmark,
  Check,
  Lock,
  Sparkles,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Goodie, UserGoodieProgress } from '../../types';
import { CardSkeleton } from '../ui/Skeleton';
import { ErrorState } from '../ui/ErrorState';

interface GoodiesPageProps {
  onSelectGoodie: (goodieId: string) => void;
}

const categoryLabels: Record<string, { label: string; color: string }> = {
  metadata: { label: 'Metadonnees', color: 'blue' },
  steganography: { label: 'Steganographie', color: 'rose' },
  optimization: { label: 'Optimisation', color: 'emerald' },
  terminal: { label: 'Terminal', color: 'amber' },
  osint: { label: 'OSINT', color: 'cyan' },
  security: { label: 'Securite', color: 'red' },
  network: { label: 'Reseau', color: 'orange' },
  crypto: { label: 'Cryptographie', color: 'teal' },
  programming: { label: 'Programmation', color: 'sky' },
  automation: { label: 'Automatisation', color: 'lime' },
};

const difficultyLabels = ['', 'Debutant', 'Facile', 'Intermediaire', 'Avance', 'Expert'];

export function GoodiesPage({ onSelectGoodie }: GoodiesPageProps) {
  const { profile } = useAuth();
  const [goodies, setGoodies] = useState<Goodie[]>([]);
  const [progress, setProgress] = useState<Record<string, UserGoodieProgress>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<number>(0);

  const loadGoodies = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [goodiesResult, progressResult] = await Promise.all([
        supabase
          .from('goodies')
          .select('*')
          .eq('is_published', true)
          .order('order_index'),
        profile
          ? supabase
              .from('user_goodies_progress')
              .select('*')
              .eq('user_id', profile.id)
          : Promise.resolve({ data: null, error: null }),
      ]);

      if (goodiesResult.error) throw goodiesResult.error;

      if (goodiesResult.data) {
        setGoodies(goodiesResult.data);
      }
      if (progressResult.data) {
        const progressMap: Record<string, UserGoodieProgress> = {};
        progressResult.data.forEach((p: UserGoodieProgress) => {
          progressMap[p.goodie_id] = p;
        });
        setProgress(progressMap);
      }
    } catch (err) {
      setError('Impossible de charger les goodies');
    } finally {
      setLoading(false);
    }
  }, [profile]);

  useEffect(() => {
    loadGoodies();
  }, [loadGoodies]);

  const categories = Array.from(new Set(goodies.map((g) => g.category)));

  const filteredGoodies = goodies.filter((g) => {
    if (search && !g.title.toLowerCase().includes(search.toLowerCase()) &&
        !g.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))) {
      return false;
    }
    if (categoryFilter !== 'all' && g.category !== categoryFilter) {
      return false;
    }
    if (difficultyFilter > 0 && g.difficulty !== difficultyFilter) {
      return false;
    }
    return true;
  });

  const completedCount = Object.values(progress).filter((p) => p.status === 'completed').length;
  const bookmarkedCount = Object.values(progress).filter((p) => p.status === 'bookmarked').length;

  if (loading) {
    return (
      <div className="p-6 space-y-6" role="status" aria-label="Chargement des goodies">
        <div className="h-40 bg-gradient-to-r from-slate-700 to-slate-600 rounded-2xl animate-pulse" />
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 h-10 bg-slate-800 rounded-xl animate-pulse" />
          <div className="h-10 w-40 bg-slate-800 rounded-xl animate-pulse" />
          <div className="h-10 w-32 bg-slate-800 rounded-xl animate-pulse" />
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(9)].map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadGoodies} />;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="bg-gradient-to-r from-teal-600 to-cyan-600 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Sparkles size={28} aria-hidden="true" />
          <h1 className="text-2xl font-bold">Les Goodies du Bidouilleur</h1>
        </div>
        <p className="text-teal-100 max-w-2xl">
          Trucs, astuces et tutoriels pour maitriser les outils numeriques.
          Du debutant a l'expert, developpez vos competences techniques.
        </p>
        <div className="flex gap-4 mt-4 text-sm">
          <div className="bg-white/20 rounded-lg px-3 py-1.5">
            <span className="font-bold">{goodies.length}</span> goodies
          </div>
          <div className="bg-white/20 rounded-lg px-3 py-1.5">
            <span className="font-bold">{completedCount}</span> completes
          </div>
          <div className="bg-white/20 rounded-lg px-3 py-1.5">
            <span className="font-bold">{bookmarkedCount}</span> sauvegardes
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher un goodie..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-teal-500"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-teal-500"
        >
          <option value="all">Toutes categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {categoryLabels[cat]?.label || cat}
            </option>
          ))}
        </select>
        <select
          value={difficultyFilter}
          onChange={(e) => setDifficultyFilter(Number(e.target.value))}
          className="px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-teal-500"
        >
          <option value={0}>Tous niveaux</option>
          {[1, 2, 3, 4, 5].map((d) => (
            <option key={d} value={d}>{difficultyLabels[d]}</option>
          ))}
        </select>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredGoodies.map((goodie) => {
          const cat = categoryLabels[goodie.category] || { label: goodie.category, color: 'slate' };
          const userProgress = progress[goodie.id];
          const isCompleted = userProgress?.status === 'completed';
          const isBookmarked = userProgress?.status === 'bookmarked';

          return (
            <button
              key={goodie.id}
              onClick={() => onSelectGoodie(goodie.id)}
              className="text-left bg-slate-800 border border-slate-700 rounded-xl p-4 hover:border-teal-500/50 transition-all group"
            >
              <div className="flex items-start justify-between mb-3">
                <span className={`px-2 py-0.5 rounded text-xs font-medium bg-${cat.color}-500/20 text-${cat.color}-400`}>
                  {cat.label}
                </span>
                <div className="flex items-center gap-1">
                  {isCompleted && <Check size={16} className="text-emerald-400" />}
                  {isBookmarked && <Bookmark size={16} className="text-amber-400" />}
                </div>
              </div>

              <h3 className="font-semibold text-white group-hover:text-teal-300 transition-colors mb-2">
                {goodie.title}
              </h3>

              <p className="text-sm text-slate-400 line-clamp-2 mb-3">
                {goodie.short_description}
              </p>

              <div className="flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={12}
                        className={i < goodie.difficulty ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}
                      />
                    ))}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {goodie.estimated_minutes} min
                  </span>
                </div>
                <span className="text-teal-400 font-medium">+{goodie.xp_reward} XP</span>
              </div>
            </button>
          );
        })}
      </div>

      {filteredGoodies.length === 0 && (
        <div className="text-center py-12">
          <Lightbulb size={48} className="text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">Aucun goodie trouve</p>
          <p className="text-sm text-slate-500 mt-1">Essayez de modifier vos filtres</p>
        </div>
      )}
    </div>
  );
}
