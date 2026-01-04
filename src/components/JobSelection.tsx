import { useEffect, useState } from 'react';
import { Code, Users, BarChart2, Palette, Server, ChevronRight, Star, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { JobProfile, JobProfileSkill } from '../types';

const iconMap: Record<string, React.ElementType> = {
  code: Code,
  users: Users,
  'bar-chart-2': BarChart2,
  palette: Palette,
  server: Server,
};

const difficultyConfig = {
  beginner: { label: 'Debutant', color: 'text-emerald-400', bg: 'bg-emerald-500/20', stars: 1 },
  intermediate: { label: 'Intermediaire', color: 'text-amber-400', bg: 'bg-amber-500/20', stars: 2 },
  advanced: { label: 'Avance', color: 'text-rose-400', bg: 'bg-rose-500/20', stars: 3 },
};

interface JobSelectionProps {
  onSelect: (profile: JobProfile, skills: JobProfileSkill[]) => void;
}

export function JobSelection({ onSelect }: JobSelectionProps) {
  const [profiles, setProfiles] = useState<JobProfile[]>([]);
  const [skills, setSkills] = useState<Record<string, JobProfileSkill[]>>({});
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      const { data: profilesData } = await supabase.from('job_profiles').select('*');
      if (profilesData) {
        setProfiles(profilesData);
        const skillsMap: Record<string, JobProfileSkill[]> = {};
        for (const profile of profilesData) {
          const { data: skillsData } = await supabase
            .from('job_profile_skills')
            .select('*, skills(*)')
            .eq('job_profile_id', profile.id);
          if (skillsData) {
            skillsMap[profile.id] = skillsData;
          }
        }
        setSkills(skillsMap);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  const handleSelect = (profile: JobProfile) => {
    setSelectedId(profile.id);
    setTimeout(() => {
      onSelect(profile, skills[profile.id] || []);
    }, 300);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Choisissez votre orientation
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto">
            Selectionnez le poste qui vous interesse. Vous serez teste sur les competences requises pour ce metier.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {profiles.map((profile) => {
            const IconComponent = iconMap[profile.icon] || Code;
            const difficulty = difficultyConfig[profile.difficulty as keyof typeof difficultyConfig] || difficultyConfig.intermediate;
            const profileSkills = skills[profile.id] || [];
            const isSelected = selectedId === profile.id;

            return (
              <button
                key={profile.id}
                onClick={() => handleSelect(profile)}
                className={`group text-left bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border transition-all duration-300 ${
                  isSelected
                    ? 'border-emerald-500 ring-2 ring-emerald-500/50 scale-[1.02]'
                    : 'border-slate-700/50 hover:border-slate-600 hover:bg-slate-800/80'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-14 h-14 ${difficulty.bg} rounded-xl flex items-center justify-center`}>
                    <IconComponent className={`w-7 h-7 ${difficulty.color}`} />
                  </div>
                  <div className={`flex items-center gap-1 px-3 py-1 rounded-full ${difficulty.bg}`}>
                    {[...Array(difficulty.stars)].map((_, i) => (
                      <Star key={i} className={`w-3 h-3 ${difficulty.color} fill-current`} />
                    ))}
                  </div>
                </div>

                <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-emerald-400 transition-colors">
                  {profile.name}
                </h3>
                <p className="text-sm text-slate-400 mb-4 line-clamp-2">
                  {profile.description}
                </p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {profileSkills.slice(0, 3).map((ps) => (
                    <span
                      key={ps.id}
                      className="px-2 py-1 text-xs bg-slate-700/50 text-slate-300 rounded-md"
                    >
                      {ps.skills?.name}
                    </span>
                  ))}
                  {profileSkills.length > 3 && (
                    <span className="px-2 py-1 text-xs bg-slate-700/50 text-slate-400 rounded-md">
                      +{profileSkills.length - 3}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Clock className="w-4 h-4" />
                    <span>~15-20 min</span>
                  </div>
                  <ChevronRight className={`w-5 h-5 text-slate-500 group-hover:text-emerald-400 transition-all ${isSelected ? 'translate-x-1' : 'group-hover:translate-x-1'}`} />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
