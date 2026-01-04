import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Clock,
  Star,
  Bookmark,
  BookmarkCheck,
  Check,
  ExternalLink,
  Lightbulb,
  AlertTriangle,
  Code,
  List,
  FileText,
  Zap,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Goodie, UserGoodieProgress, GoodieSection } from '../../types';

interface GoodieDetailPageProps {
  goodieId: string;
  onBack: () => void;
}

const sectionIcons: Record<string, typeof FileText> = {
  text: FileText,
  list: List,
  code: Code,
  steps: Zap,
  warning: AlertTriangle,
};

export function GoodieDetailPage({ goodieId, onBack }: GoodieDetailPageProps) {
  const { profile } = useAuth();
  const [goodie, setGoodie] = useState<Goodie | null>(null);
  const [progress, setProgress] = useState<UserGoodieProgress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGoodie();
  }, [goodieId, profile]);

  async function loadGoodie() {
    const [goodieResult, progressResult] = await Promise.all([
      supabase.from('goodies').select('*').eq('id', goodieId).single(),
      profile
        ? supabase
            .from('user_goodies_progress')
            .select('*')
            .eq('user_id', profile.id)
            .eq('goodie_id', goodieId)
            .maybeSingle()
        : Promise.resolve({ data: null }),
    ]);

    if (goodieResult.data) setGoodie(goodieResult.data);
    if (progressResult.data) setProgress(progressResult.data);
    setLoading(false);
  }

  async function markAsCompleted() {
    if (!profile || !goodie) return;

    if (progress) {
      await supabase
        .from('user_goodies_progress')
        .update({ status: 'completed', completed_at: new Date().toISOString() })
        .eq('id', progress.id);
    } else {
      await supabase.from('user_goodies_progress').insert({
        user_id: profile.id,
        goodie_id: goodie.id,
        status: 'completed',
        completed_at: new Date().toISOString(),
      });
    }
    loadGoodie();
  }

  async function toggleBookmark() {
    if (!profile || !goodie) return;

    const newStatus = progress?.status === 'bookmarked' ? 'not_started' : 'bookmarked';

    if (progress) {
      await supabase
        .from('user_goodies_progress')
        .update({ status: newStatus })
        .eq('id', progress.id);
    } else {
      await supabase.from('user_goodies_progress').insert({
        user_id: profile.id,
        goodie_id: goodie.id,
        status: newStatus,
      });
    }
    loadGoodie();
  }

  function renderSection(section: GoodieSection, index: number) {
    const Icon = sectionIcons[section.type] || FileText;

    if (section.type === 'code') {
      return (
        <div key={index} className="bg-slate-900 rounded-xl p-4 overflow-x-auto">
          <div className="flex items-center gap-2 mb-3 text-slate-400">
            <Code size={16} />
            <span className="text-sm font-medium">{section.title}</span>
          </div>
          <pre className="text-sm text-teal-300 font-mono whitespace-pre-wrap">
            {section.content}
          </pre>
        </div>
      );
    }

    if (section.type === 'warning') {
      return (
        <div key={index} className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle size={20} className="text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-amber-300 mb-1">{section.title}</h4>
              <p className="text-slate-300 text-sm whitespace-pre-line">{section.content}</p>
            </div>
          </div>
        </div>
      );
    }

    if (section.type === 'list' || section.type === 'steps') {
      const items = section.content.split('\n').filter((l) => l.trim());
      return (
        <div key={index} className="bg-slate-800/50 rounded-xl p-4">
          <h4 className="font-medium text-white mb-3 flex items-center gap-2">
            <Icon size={16} className="text-teal-400" />
            {section.title}
          </h4>
          <ul className="space-y-2">
            {items.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-slate-300 text-sm">
                {section.type === 'steps' ? (
                  <span className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-400 text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                ) : (
                  <span className="text-teal-400 mt-1">-</span>
                )}
                <span>{item.replace(/^[-\d.]+\s*/, '')}</span>
              </li>
            ))}
          </ul>
        </div>
      );
    }

    return (
      <div key={index} className="bg-slate-800/50 rounded-xl p-4">
        <h4 className="font-medium text-white mb-2 flex items-center gap-2">
          <Icon size={16} className="text-teal-400" />
          {section.title}
        </h4>
        <p className="text-slate-300 text-sm whitespace-pre-line">{section.content}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!goodie) {
    return (
      <div className="p-6 text-center">
        <p className="text-slate-400">Goodie introuvable</p>
        <button onClick={onBack} className="text-teal-400 mt-2">Retour</button>
      </div>
    );
  }

  const isCompleted = progress?.status === 'completed';
  const isBookmarked = progress?.status === 'bookmarked';

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft size={18} />
        Retour aux goodies
      </button>

      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 rounded text-xs font-medium bg-teal-500/20 text-teal-400">
                {goodie.category}
              </span>
              <span className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className={i < goodie.difficulty ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}
                  />
                ))}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white">{goodie.title}</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleBookmark}
              className={`p-2 rounded-lg transition-colors ${
                isBookmarked
                  ? 'bg-amber-500/20 text-amber-400'
                  : 'bg-slate-700 text-slate-400 hover:text-white'
              }`}
            >
              {isBookmarked ? <BookmarkCheck size={20} /> : <Bookmark size={20} />}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm text-slate-400 mb-6">
          <span className="flex items-center gap-1">
            <Clock size={14} />
            {goodie.estimated_minutes} min
          </span>
          <span className="text-teal-400 font-medium">+{goodie.xp_reward} XP</span>
          {isCompleted && (
            <span className="flex items-center gap-1 text-emerald-400">
              <Check size={14} />
              Complete
            </span>
          )}
        </div>

        <div className="bg-gradient-to-r from-teal-500/10 to-cyan-500/10 border border-teal-500/30 rounded-xl p-4 mb-6">
          <p className="text-slate-200">{goodie.content.intro}</p>
        </div>

        <div className="space-y-4">
          {goodie.content.sections.map((section, i) => renderSection(section, i))}
        </div>

        {goodie.content.practice && (
          <div className="mt-6 bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Lightbulb size={20} className="text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-emerald-300 mb-1">Exercice pratique</h4>
                <p className="text-slate-300 text-sm">{goodie.content.practice}</p>
              </div>
            </div>
          </div>
        )}

        {goodie.content.resources && goodie.content.resources.length > 0 && (
          <div className="mt-6">
            <h4 className="font-medium text-white mb-3">Ressources</h4>
            <div className="flex flex-wrap gap-2">
              {goodie.content.resources.map((url, i) => (
                <a
                  key={i}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm text-slate-300 transition-colors"
                >
                  <ExternalLink size={12} />
                  {new URL(url).hostname}
                </a>
              ))}
            </div>
          </div>
        )}

        {goodie.tags.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2">
            {goodie.tags.map((tag) => (
              <span key={tag} className="px-2 py-1 bg-slate-700 rounded text-xs text-slate-400">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {!isCompleted && (
          <button
            onClick={markAsCompleted}
            className="mt-6 w-full py-3 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 rounded-xl text-white font-medium flex items-center justify-center gap-2 transition-all"
          >
            <Check size={18} />
            Marquer comme complete (+{goodie.xp_reward} XP)
          </button>
        )}
      </div>
    </div>
  );
}
