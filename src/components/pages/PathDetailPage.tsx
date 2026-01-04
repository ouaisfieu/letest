import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Clock,
  Target,
  ChevronRight,
  BookOpen,
  CheckCircle,
  Play,
  Lock,
  Star,
  Award,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { LearningPath, Module, Lesson } from '../../types';

interface PathDetailPageProps {
  pathId: string;
  onBack: () => void;
  onSelectLesson: (lessonId: string) => void;
}

export function PathDetailPage({ pathId, onBack, onSelectLesson }: PathDetailPageProps) {
  const [path, setPath] = useState<LearningPath | null>(null);
  const [modules, setModules] = useState<(Module & { lessons: Lesson[] })[]>([]);
  const [expandedModule, setExpandedModule] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPathDetails() {
      const [pathResult, modulesResult] = await Promise.all([
        supabase.from('learning_paths').select('*').eq('id', pathId).single(),
        supabase
          .from('modules')
          .select('*, lessons(*)')
          .eq('learning_path_id', pathId)
          .order('order_index'),
      ]);

      if (pathResult.data) setPath(pathResult.data);
      if (modulesResult.data) {
        const sortedModules = modulesResult.data.map((m) => ({
          ...m,
          lessons: m.lessons?.sort((a: Lesson, b: Lesson) => a.order_index - b.order_index) || [],
        }));
        setModules(sortedModules as (Module & { lessons: Lesson[] })[]);
        if (sortedModules.length > 0) {
          setExpandedModule(sortedModules[0].id);
        }
      }
      setLoading(false);
    }

    loadPathDetails();
  }, [pathId]);

  const pathColors: Record<string, { gradient: string; text: string }> = {
    emerald: { gradient: 'from-emerald-500 to-teal-500', text: 'text-emerald-400' },
    blue: { gradient: 'from-blue-500 to-cyan-500', text: 'text-blue-400' },
    amber: { gradient: 'from-amber-500 to-orange-500', text: 'text-amber-400' },
    rose: { gradient: 'from-rose-500 to-pink-500', text: 'text-rose-400' },
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return '🎬';
      case 'interactive': return '🎮';
      case 'case_study': return '📋';
      default: return '📖';
    }
  };

  const getContentTypeLabel = (type: string) => {
    switch (type) {
      case 'video': return 'Video';
      case 'interactive': return 'Interactif';
      case 'case_study': return 'Etude de cas';
      default: return 'Article';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!path) {
    return (
      <div className="p-6 text-center">
        <p className="text-slate-400">Parcours non trouve</p>
        <button onClick={onBack} className="mt-4 text-emerald-400 hover:text-emerald-300">
          Retour aux parcours
        </button>
      </div>
    );
  }

  const colors = pathColors[path.color] || pathColors.emerald;
  const totalLessons = modules.reduce((sum, m) => sum + (m.lessons?.length || 0), 0);
  const totalXP = modules.reduce((sum, m) => sum + m.xp_reward + (m.lessons?.reduce((s, l) => s + l.xp_reward, 0) || 0), 0);

  return (
    <div className="p-6">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6"
      >
        <ArrowLeft size={20} />
        Retour aux parcours
      </button>

      <div className={`bg-gradient-to-r ${colors.gradient} rounded-2xl p-6 mb-6`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">{path.title}</h1>
            <p className="text-white/80 mb-4">{path.description}</p>
            <div className="flex flex-wrap items-center gap-4 text-sm text-white/70">
              <span className="flex items-center gap-1.5">
                <Clock size={16} />
                {path.estimated_hours}h de formation
              </span>
              <span className="flex items-center gap-1.5">
                <BookOpen size={16} />
                {modules.length} modules
              </span>
              <span className="flex items-center gap-1.5">
                <Target size={16} />
                {totalLessons} lecons
              </span>
              <span className="flex items-center gap-1.5">
                <Star size={16} />
                {totalXP} XP a gagner
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center bg-white/20 rounded-xl px-6 py-3">
              <p className="text-3xl font-bold text-white">0%</p>
              <p className="text-xs text-white/70">Complete</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold text-white mb-4">Programme du parcours</h2>
          {modules.map((module, index) => {
            const isExpanded = expandedModule === module.id;
            const isLocked = index > 0;

            return (
              <div
                key={module.id}
                className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setExpandedModule(isExpanded ? null : module.id)}
                  className="w-full flex items-center gap-4 p-4 hover:bg-slate-700/50 transition-colors"
                >
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colors.gradient} flex items-center justify-center text-white font-bold`}>
                    {index + 1}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-white">{module.title}</h3>
                      {isLocked && <Lock size={14} className="text-slate-500" />}
                    </div>
                    <p className="text-sm text-slate-400">{module.lessons?.length || 0} lecons - {module.xp_reward} XP</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                      <p className="text-sm text-slate-400">0/{module.lessons?.length || 0}</p>
                      <p className="text-xs text-slate-500">complete</p>
                    </div>
                    <ChevronRight
                      size={20}
                      className={`text-slate-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                    />
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-slate-700 bg-slate-800/50">
                    <div className="p-4 border-b border-slate-700">
                      <p className="text-sm text-slate-400">{module.description}</p>
                      {module.learning_objectives?.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs text-slate-500 mb-2">Ce que vous apprendrez :</p>
                          <ul className="space-y-1">
                            {module.learning_objectives.map((obj, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                                <CheckCircle size={14} className={`mt-0.5 ${colors.text}`} />
                                {obj}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    <div className="divide-y divide-slate-700">
                      {module.lessons?.map((lesson, lessonIndex) => {
                        const lessonLocked = isLocked || lessonIndex > 0;
                        return (
                          <button
                            key={lesson.id}
                            onClick={() => !lessonLocked && onSelectLesson(lesson.id)}
                            disabled={lessonLocked}
                            className={`w-full flex items-center gap-4 p-4 transition-colors ${
                              lessonLocked
                                ? 'opacity-50 cursor-not-allowed'
                                : 'hover:bg-slate-700/50'
                            }`}
                          >
                            <div className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center">
                              {lessonLocked ? (
                                <Lock size={14} className="text-slate-500" />
                              ) : (
                                <Play size={14} className={colors.text} />
                              )}
                            </div>
                            <div className="flex-1 text-left">
                              <div className="flex items-center gap-2">
                                <span className="text-lg">{getContentTypeIcon(lesson.content_type)}</span>
                                <h4 className="font-medium text-white">{lesson.title}</h4>
                              </div>
                              <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                                <span>{getContentTypeLabel(lesson.content_type)}</span>
                                <span>{lesson.estimated_minutes} min</span>
                                <span>+{lesson.xp_reward} XP</span>
                              </div>
                            </div>
                            <ChevronRight size={18} className="text-slate-500" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="space-y-6">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <Target size={18} className={colors.text} />
              Objectifs du parcours
            </h3>
            <ul className="space-y-3">
              {path.objectives.map((obj, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle size={16} className={`mt-0.5 ${colors.text}`} />
                  <span className="text-sm text-slate-300">{obj}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <Award size={18} className="text-amber-400" />
              Certification
            </h3>
            <p className="text-sm text-slate-400 mb-4">
              Terminez tous les modules et obtenez un score d'au moins 80% aux quiz pour recevoir votre certification.
            </p>
            <div className="flex items-center gap-4 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
              <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
                <Award size={24} className="text-amber-400" />
              </div>
              <div>
                <p className="font-medium text-white">Certificat {path.title}</p>
                <p className="text-xs text-slate-400">Attestation de competences</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
