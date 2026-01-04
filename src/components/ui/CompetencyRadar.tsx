import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Competency, UserCompetency } from '../../types';

const CATEGORY_LABELS: Record<string, string> = {
  veille: 'Veille',
  analyse: 'Analyse',
  reseau: 'Reseau',
  strategie: 'Strategie',
  communication: 'Communication',
  financement: 'Financement',
};

const CATEGORY_COLORS: Record<string, string> = {
  veille: '#10b981',
  analyse: '#3b82f6',
  reseau: '#8b5cf6',
  strategie: '#f59e0b',
  communication: '#ec4899',
  financement: '#14b8a6',
};

interface CompetencyRadarProps {
  size?: number;
}

export function CompetencyRadar({ size = 200 }: CompetencyRadarProps) {
  const { profile } = useAuth();
  const [competencies, setCompetencies] = useState<(UserCompetency & { competency: Competency })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCompetencies() {
      if (!profile) return;

      const { data } = await supabase
        .from('user_competencies')
        .select('*, competency:competencies(*)')
        .eq('user_id', profile.id);

      if (data) {
        setCompetencies(data as (UserCompetency & { competency: Competency })[]);
      }
      setLoading(false);
    }

    loadCompetencies();
  }, [profile]);

  const categories = Object.keys(CATEGORY_LABELS);
  const categoryScores = categories.map((cat) => {
    const catCompetencies = competencies.filter((c) => c.competency.category === cat);
    if (catCompetencies.length === 0) return 0;
    const avgLevel = catCompetencies.reduce((sum, c) => sum + c.current_level, 0) / catCompetencies.length;
    return (avgLevel / 10) * 100;
  });

  const center = size / 2;
  const radius = (size / 2) - 30;
  const angleStep = (2 * Math.PI) / categories.length;

  const getPoint = (index: number, value: number) => {
    const angle = index * angleStep - Math.PI / 2;
    const r = (value / 100) * radius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  const getLabelPoint = (index: number) => {
    const angle = index * angleStep - Math.PI / 2;
    const r = radius + 20;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  const polygonPoints = categoryScores
    .map((score, i) => {
      const point = getPoint(i, Math.max(score, 5));
      return `${point.x},${point.y}`;
    })
    .join(' ');

  const gridLevels = [20, 40, 60, 80, 100];

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ width: size, height: size }}>
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex justify-center">
      <svg width={size} height={size} className="overflow-visible">
        {gridLevels.map((level) => {
          const points = categories
            .map((_, i) => {
              const point = getPoint(i, level);
              return `${point.x},${point.y}`;
            })
            .join(' ');
          return (
            <polygon
              key={level}
              points={points}
              fill="none"
              stroke="#374151"
              strokeWidth="1"
              opacity={0.5}
            />
          );
        })}

        {categories.map((_, i) => {
          const point = getPoint(i, 100);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={point.x}
              y2={point.y}
              stroke="#374151"
              strokeWidth="1"
              opacity={0.5}
            />
          );
        })}

        <polygon
          points={polygonPoints}
          fill="url(#radarGradient)"
          stroke="#10b981"
          strokeWidth="2"
          opacity={0.8}
        />

        <defs>
          <linearGradient id="radarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#14b8a6" stopOpacity="0.3" />
          </linearGradient>
        </defs>

        {categoryScores.map((score, i) => {
          const point = getPoint(i, Math.max(score, 5));
          return (
            <circle
              key={i}
              cx={point.x}
              cy={point.y}
              r={4}
              fill={CATEGORY_COLORS[categories[i]]}
            />
          );
        })}

        {categories.map((cat, i) => {
          const point = getLabelPoint(i);
          return (
            <text
              key={cat}
              x={point.x}
              y={point.y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-xs fill-slate-400"
            >
              {CATEGORY_LABELS[cat]}
            </text>
          );
        })}
      </svg>
    </div>
  );
}
