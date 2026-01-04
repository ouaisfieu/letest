import { useEffect, useState } from 'react';
import {
  Clock,
  Target,
  ChevronRight,
  BookOpen,
  CheckCircle,
  Lock,
  Star,
  Compass,
  Users,
  PiggyBank,
  Megaphone,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { LearningPath, Module } from '../../types';

interface PathsPageProps {
  onSelectPath: (pathId: string) => void;
}

const PATH_ICONS: Record<string, React.ElementType> = {
  compass: Compass,
  users: Users,
  'piggy-bank': PiggyBank,
  megaphone: Megaphone,
};

export function PathsPage({ onSelectPath }: PathsPageProps) {
  const [paths, setPaths] = useState<(LearningPath & { modules: Module[] })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPaths() {
      const { data } = await supabase
        .from('learning_paths')
        .select('*, modules(*)')
        .order('order_index');

      if (data) {
        setPaths(data as (LearningPath & { modules: Module[] })[]);
      }
      setLoading(false);
    }

    loadPaths();
  }, []);

  const getDifficultyLabel = (level: number) => {
    switch (level) {
      case 1: return { label: 'Debutant', color: 'emerald' };
      case 2: return { label: 'Intermediaire', color: 'blue' };
      case 3: return { label: 'Avance', color: 'amber' };
      case 4: return { label: 'Expert', color: 'rose' };
      default: return { label: 'Debutant', color: 'emerald' };
    }
  };

  const pathColors: Record<string, { bg: string; border: string; gradient: string }> = {
    emerald: {
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/30 hover:border-emerald-500/60',
      gradient: 'from-emerald-500 to-teal-500',
    },
    blue: {
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/30 hover:border-blue-500/60',
      gradient: 'from-blue-500 to-cyan-500',
    },
    amber: {
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30 hover:border-amber-500/60',
      gradient: 'from-amber-500 to-orange-500',
    },
    rose: {
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/30 hover:border-rose-500/60',
      gradient: 'from-rose-500 to-pink-500',
    },
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
        <h1 className="text-2xl font-bold text-white mb-2">Parcours d'apprentissage</h1>
        <p className="text-slate-400">
          Choisissez un parcours pour developper vos competences en intelligence economique
        </p>
      </div>

      <div className="grid gap-6">
        {paths.map((path, index) => {
          const colors = pathColors[path.color] || pathColors.emerald;
          const difficulty = getDifficultyLabel(path.difficulty_level);
          const Icon = PATH_ICONS[path.icon] || BookOpen;
          const isLocked = index > 0;

          return (
            <button
              key={path.id}
              onClick={() => onSelectPath(path.id)}
              className={`text-left w-full ${colors.bg} border ${colors.border} rounded-2xl p-6 transition-all hover:scale-[1.01] group relative overflow-hidden`}
            >
              {isLocked && (
                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm z-10 flex items-center justify-center">
                  <div className="text-center">
                    <Lock size={32} className="text-slate-400 mx-auto mb-2" />
                    <p className="text-slate-300 font-medium">Terminez le parcours precedent</p>
                  </div>
                </div>
              )}

              <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${colors.gradient} flex items-center justify-center flex-shrink-0`}>
                  <Icon size={32} className="text-white" />
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-xl font-bold text-white group-hover:text-emerald-300 transition-colors">
                          {path.title}
                        </h2>
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full bg-${difficulty.color}-500/20 text-${difficulty.color}-400`}>
                          {difficulty.label}
                        </span>
                      </div>
                      <p className="text-slate-400 mb-4">{path.description}</p>
                    </div>
                    <ChevronRight size={24} className="text-slate-500 group-hover:text-emerald-400 transition-colors flex-shrink-0 mt-1" />
                  </div>

                  <div className="flex flex-wrap items-center gap-4 mb-4 text-sm text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <Clock size={16} />
                      {path.estimated_hours}h de formation
                    </span>
                    <span className="flex items-center gap-1.5">
                      <BookOpen size={16} />
                      {path.modules?.length || 0} modules
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Star size={16} />
                      Certification incluse
                    </span>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-slate-400 mb-2">Objectifs :</p>
                    <div className="flex flex-wrap gap-2">
                      {path.objectives.slice(0, 4).map((obj, i) => (
                        <span
                          key={i}
                          className="text-xs bg-slate-700/50 text-slate-300 px-3 py-1.5 rounded-full"
                        >
                          {obj}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-400">Progression</span>
                        <span className="text-emerald-400">0%</span>
                      </div>
                      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${colors.gradient} rounded-full`}
                          style={{ width: '0%' }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <CheckCircle size={14} />
                      <span>0/{path.modules?.length || 0} modules</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-700/50">
                <p className="text-sm text-slate-400 mb-3">Modules inclus :</p>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {path.modules?.slice(0, 4).map((module, i) => (
                    <div
                      key={module.id}
                      className="flex items-center gap-2 bg-slate-800/50 rounded-lg px-3 py-2"
                    >
                      <span className={`w-6 h-6 rounded-full bg-gradient-to-br ${colors.gradient} flex items-center justify-center text-xs font-bold text-white`}>
                        {i + 1}
                      </span>
                      <span className="text-sm text-slate-300 truncate">{module.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
