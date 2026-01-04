import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Clock,
  CheckCircle,
  ChevronRight,
  BookOpen,
  ExternalLink,
  Lightbulb,
  FileText,
  Video,
  Wrench,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Lesson, LessonResource, ContentSection, CaseStudy, Tool, Exercise } from '../../types';

interface LessonPageProps {
  lessonId: string;
  onBack: () => void;
  onComplete: () => void;
}

export function LessonPage({ lessonId, onBack, onComplete }: LessonPageProps) {
  const { profile, updateProfile } = useAuth();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [resources, setResources] = useState<LessonResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);

  useEffect(() => {
    async function loadLesson() {
      const [lessonResult, resourcesResult] = await Promise.all([
        supabase.from('lessons').select('*').eq('id', lessonId).single(),
        supabase.from('lesson_resources').select('*').eq('lesson_id', lessonId).order('order_index'),
      ]);

      if (lessonResult.data) setLesson(lessonResult.data as Lesson);
      if (resourcesResult.data) setResources(resourcesResult.data as LessonResource[]);
      setLoading(false);
    }

    loadLesson();
  }, [lessonId]);

  const handleComplete = async () => {
    if (!profile || !lesson) return;
    setCompleting(true);

    await supabase.from('user_lesson_progress').upsert({
      user_id: profile.id,
      lesson_id: lessonId,
      status: 'completed',
      progress_percentage: 100,
      completed_at: new Date().toISOString(),
    });

    const newXP = (profile.total_xp || 0) + lesson.xp_reward;
    await updateProfile({ total_xp: newXP });

    setCompleting(false);
    onComplete();
  };

  const renderMarkdown = (text: string) => {
    return text
      .split('\n')
      .map((line, i) => {
        if (line.startsWith('**') && line.endsWith('**')) {
          return <strong key={i} className="text-white font-semibold">{line.slice(2, -2)}</strong>;
        }
        if (line.startsWith('- ')) {
          return (
            <li key={i} className="flex items-start gap-2 ml-4">
              <span className="text-emerald-400 mt-1">-</span>
              <span>{line.slice(2)}</span>
            </li>
          );
        }
        if (/^\d+\./.test(line)) {
          return (
            <li key={i} className="flex items-start gap-2 ml-4">
              <span className="text-emerald-400">{line.match(/^\d+/)?.[0]}.</span>
              <span>{line.replace(/^\d+\.\s*/, '')}</span>
            </li>
          );
        }
        return line ? <p key={i} className="mb-2">{line}</p> : <br key={i} />;
      });
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'pdf': return <FileText size={18} className="text-red-400" />;
      case 'video': return <Video size={18} className="text-blue-400" />;
      case 'tool': return <Wrench size={18} className="text-amber-400" />;
      default: return <ExternalLink size={18} className="text-slate-400" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="p-6 text-center">
        <p className="text-slate-400">Lecon non trouvee</p>
        <button onClick={onBack} className="mt-4 text-emerald-400 hover:text-emerald-300">
          Retour
        </button>
      </div>
    );
  }

  const sections = lesson.content.sections || [];
  const caseStudy = lesson.content.case;
  const tools = lesson.content.tools || [];
  const exercise = lesson.content.exercise;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6"
      >
        <ArrowLeft size={20} />
        Retour au module
      </button>

      <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center gap-3 text-sm text-slate-400 mb-3">
            <span className="flex items-center gap-1.5">
              <Clock size={14} />
              {lesson.estimated_minutes} min
            </span>
            <span className="w-1 h-1 bg-slate-600 rounded-full" />
            <span className="flex items-center gap-1.5">
              <BookOpen size={14} />
              {lesson.content_type === 'article' ? 'Article' :
               lesson.content_type === 'video' ? 'Video' :
               lesson.content_type === 'interactive' ? 'Interactif' : 'Etude de cas'}
            </span>
            <span className="w-1 h-1 bg-slate-600 rounded-full" />
            <span className="text-emerald-400 font-medium">+{lesson.xp_reward} XP</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">{lesson.title}</h1>
          <p className="text-slate-400">{lesson.summary}</p>
        </div>

        {sections.length > 0 && (
          <div className="p-6 border-b border-slate-700">
            {sections.length > 1 && (
              <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {sections.map((section: ContentSection, i: number) => (
                  <button
                    key={i}
                    onClick={() => setCurrentSection(i)}
                    className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                      currentSection === i
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-slate-700/50 text-slate-400 hover:text-white'
                    }`}
                  >
                    {section.title}
                  </button>
                ))}
              </div>
            )}

            <div className="prose prose-invert max-w-none">
              <h2 className="text-xl font-semibold text-white mb-4">
                {sections[currentSection]?.title}
              </h2>
              <div className="text-slate-300 leading-relaxed">
                {renderMarkdown(sections[currentSection]?.content || '')}
              </div>
            </div>
          </div>
        )}

        {caseStudy && (
          <div className="p-6 border-b border-slate-700 bg-blue-500/5">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <BookOpen size={20} className="text-blue-400" />
              Etude de cas : {(caseStudy as CaseStudy).title}
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-slate-400 mb-1">Contexte</p>
                <p className="text-slate-300">{(caseStudy as CaseStudy).context}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-400 mb-1">Defi</p>
                <p className="text-slate-300">{(caseStudy as CaseStudy).challenge}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-400 mb-1">Solution</p>
                <p className="text-slate-300">{(caseStudy as CaseStudy).solution}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-400 mb-2">Resultats</p>
                <ul className="space-y-2">
                  {(caseStudy as CaseStudy).results.map((result: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-slate-300">
                      <CheckCircle size={16} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                      {result}
                    </li>
                  ))}
                </ul>
              </div>
              {(caseStudy as CaseStudy).reflection_questions && (
                <div className="mt-6 p-4 bg-slate-800 rounded-lg">
                  <p className="text-sm font-medium text-amber-400 mb-2 flex items-center gap-2">
                    <Lightbulb size={16} />
                    Questions de reflexion
                  </p>
                  <ul className="space-y-2">
                    {(caseStudy as CaseStudy).reflection_questions?.map((q: string, i: number) => (
                      <li key={i} className="text-slate-300 text-sm">- {q}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {tools.length > 0 && (
          <div className="p-6 border-b border-slate-700">
            <h2 className="text-xl font-semibold text-white mb-4">Outils recommandes</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {tools.map((tool: Tool, i: number) => (
                <a
                  key={i}
                  href={tool.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-white">{tool.name}</h3>
                    <ExternalLink size={16} className="text-slate-400" />
                  </div>
                  <p className="text-sm text-slate-400 mb-3">{tool.description}</p>
                  {tool.tips.length > 0 && (
                    <div className="space-y-1">
                      {tool.tips.map((tip: string, j: number) => (
                        <p key={j} className="text-xs text-emerald-400">- {tip}</p>
                      ))}
                    </div>
                  )}
                </a>
              ))}
            </div>
          </div>
        )}

        {exercise && (
          <div className="p-6 border-b border-slate-700 bg-emerald-500/5">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <CheckCircle size={20} className="text-emerald-400" />
              Exercice pratique : {(exercise as Exercise).title}
            </h2>
            <ol className="space-y-3">
              {(exercise as Exercise).steps.map((step: string, i: number) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-sm font-medium text-emerald-400 flex-shrink-0">
                    {i + 1}
                  </span>
                  <span className="text-slate-300">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {lesson.key_takeaways.length > 0 && (
          <div className="p-6 border-b border-slate-700 bg-amber-500/5">
            <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <Lightbulb size={18} className="text-amber-400" />
              A retenir
            </h2>
            <ul className="space-y-2">
              {lesson.key_takeaways.map((takeaway, i) => (
                <li key={i} className="flex items-start gap-2 text-slate-300">
                  <ChevronRight size={16} className="text-amber-400 mt-0.5 flex-shrink-0" />
                  {takeaway}
                </li>
              ))}
            </ul>
          </div>
        )}

        {resources.length > 0 && (
          <div className="p-6 border-b border-slate-700">
            <h2 className="text-lg font-semibold text-white mb-3">Ressources complementaires</h2>
            <div className="space-y-2">
              {resources.map((resource) => (
                <a
                  key={resource.id}
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors"
                >
                  {getResourceIcon(resource.resource_type)}
                  <div className="flex-1">
                    <p className="font-medium text-white">{resource.title}</p>
                    {resource.description && (
                      <p className="text-sm text-slate-400">{resource.description}</p>
                    )}
                  </div>
                  <ExternalLink size={16} className="text-slate-400" />
                </a>
              ))}
            </div>
          </div>
        )}

        <div className="p-6 bg-slate-800/50">
          <button
            onClick={handleComplete}
            disabled={completing}
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {completing ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Enregistrement...
              </>
            ) : (
              <>
                <CheckCircle size={20} />
                Marquer comme termine (+{lesson.xp_reward} XP)
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
