import { useState, useEffect } from 'react';
import { Bot, Loader2, Target, TrendingUp, BookOpen, Sparkles, RefreshCw } from 'lucide-react';
import { SkillScore } from '../types';

interface AICareerAdvisorProps {
  jobTitle: string;
  username: string;
  skills: SkillScore[];
}

interface CareerAdvice {
  summary: string;
  strengths: string[];
  priorities: { skill: string; action: string }[];
  resources: string[];
  motivation: string;
}

export function AICareerAdvisor({ jobTitle, username, skills }: AICareerAdvisorProps) {
  const [advice, setAdvice] = useState<CareerAdvice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchAdvice = async () => {
    setLoading(true);
    setError(false);

    try {
      const skillsData = skills.map(s => ({
        name: s.skill.name,
        score: s.score,
        required: s.requiredLevel,
      }));

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-assistant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'career-advice',
          jobTitle,
          username,
          skills: skillsData,
        }),
      });

      const data = await response.json();

      if (data.advice) {
        setAdvice(data.advice);
      } else {
        setAdvice(generateFallbackAdvice());
      }
    } catch {
      setAdvice(generateFallbackAdvice());
    }

    setLoading(false);
  };

  const generateFallbackAdvice = (): CareerAdvice => {
    const strengths = skills.filter(s => s.score >= s.requiredLevel);
    const toImprove = skills.filter(s => s.score < s.requiredLevel).sort((a, b) =>
      (a.requiredLevel - a.score) - (b.requiredLevel - b.score)
    );

    return {
      summary: `Votre profil pour le poste de ${jobTitle} montre des competences solides dans certains domaines. Avec un travail cible sur les points a ameliorer, vous serez un excellent candidat.`,
      strengths: strengths.slice(0, 3).map(s => `Excellente maitrise de ${s.skill.name} (${s.score}%)`),
      priorities: toImprove.slice(0, 3).map(s => ({
        skill: s.skill.name,
        action: `Objectif: passer de ${s.score}% a ${s.requiredLevel}%. Pratiquez regulierement et suivez des formations specialisees.`,
      })),
      resources: [
        'Plateformes en ligne: Udemy, Coursera, OpenClassrooms',
        'Pratique: Projets personnels et contributions open source',
        'Communaute: Meetups, forums, groupes LinkedIn',
      ],
      motivation: 'Chaque pas compte dans votre progression. Votre engagement a passer ce test montre deja votre motivation. Continuez sur cette lancee !',
    };
  };

  useEffect(() => {
    fetchAdvice();
  }, [jobTitle, username, skills]);

  if (loading) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-500/20 rounded-xl mb-3 animate-pulse">
              <Bot className="w-6 h-6 text-blue-400" />
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>L'IA analyse votre profil...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!advice) {
    return null;
  }

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden">
      <div className="p-6 border-b border-slate-700/50 bg-gradient-to-r from-blue-500/10 to-cyan-500/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Conseiller IA</h3>
              <p className="text-xs text-slate-400">Analyse personnalisee de votre profil</p>
            </div>
          </div>
          <button
            onClick={fetchAdvice}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
            title="Regenerer les conseils"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="bg-slate-700/30 rounded-xl p-4">
          <p className="text-slate-300 leading-relaxed">{advice.summary}</p>
        </div>

        {advice.strengths.length > 0 && (
          <div>
            <div className="flex items-center gap-2 text-emerald-400 mb-3">
              <TrendingUp className="w-4 h-4" />
              <span className="font-medium">Vos points forts a valoriser</span>
            </div>
            <div className="space-y-2">
              {advice.strengths.map((strength, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-slate-300">
                  <Sparkles className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span>{strength}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {advice.priorities.length > 0 && (
          <div>
            <div className="flex items-center gap-2 text-amber-400 mb-3">
              <Target className="w-4 h-4" />
              <span className="font-medium">Plan d'action prioritaire</span>
            </div>
            <div className="space-y-3">
              {advice.priorities.map((priority, i) => (
                <div key={i} className="bg-slate-700/30 rounded-lg p-3">
                  <p className="text-white font-medium mb-1">{priority.skill}</p>
                  <p className="text-sm text-slate-400">{priority.action}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {advice.resources.length > 0 && (
          <div>
            <div className="flex items-center gap-2 text-blue-400 mb-3">
              <BookOpen className="w-4 h-4" />
              <span className="font-medium">Ressources recommandees</span>
            </div>
            <ul className="space-y-2">
              {advice.resources.map((resource, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                  <span className="text-blue-400">-</span>
                  <span>{resource}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 rounded-xl p-4">
          <p className="text-emerald-300 text-sm italic">"{advice.motivation}"</p>
        </div>
      </div>
    </div>
  );
}
