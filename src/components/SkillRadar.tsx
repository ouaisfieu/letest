import { useMemo } from 'react';
import { SkillScore } from '../types';

interface SkillRadarProps {
  skills: SkillScore[];
  size?: number;
}

export function SkillRadar({ skills, size = 300 }: SkillRadarProps) {
  const center = size / 2;
  const radius = (size / 2) - 40;

  const points = useMemo(() => {
    const angleStep = (2 * Math.PI) / skills.length;
    return skills.map((skill, i) => {
      const angle = i * angleStep - Math.PI / 2;
      const scoreRadius = (skill.score / 100) * radius;
      const requiredRadius = (skill.requiredLevel / 100) * radius;
      return {
        x: center + scoreRadius * Math.cos(angle),
        y: center + scoreRadius * Math.sin(angle),
        reqX: center + requiredRadius * Math.cos(angle),
        reqY: center + requiredRadius * Math.sin(angle),
        labelX: center + (radius + 25) * Math.cos(angle),
        labelY: center + (radius + 25) * Math.sin(angle),
        skill,
        angle,
      };
    });
  }, [skills, center, radius]);

  const gridLines = [0.2, 0.4, 0.6, 0.8, 1];

  const scorePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';
  const requiredPath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.reqX} ${p.reqY}`).join(' ') + ' Z';

  return (
    <div className="relative">
      <svg width={size} height={size} className="mx-auto">
        <defs>
          <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#14b8a6" stopOpacity="0.8" />
          </linearGradient>
          <linearGradient id="requiredGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#d97706" stopOpacity="0.3" />
          </linearGradient>
        </defs>

        {gridLines.map((level, i) => {
          const r = level * radius;
          const gridPoints = skills.map((_, j) => {
            const angle = (j * 2 * Math.PI) / skills.length - Math.PI / 2;
            return `${j === 0 ? 'M' : 'L'} ${center + r * Math.cos(angle)} ${center + r * Math.sin(angle)}`;
          }).join(' ') + ' Z';
          return (
            <path
              key={i}
              d={gridPoints}
              fill="none"
              stroke="#334155"
              strokeWidth="1"
              opacity={0.5}
            />
          );
        })}

        {points.map((p, i) => (
          <line
            key={i}
            x1={center}
            y1={center}
            x2={center + radius * Math.cos(p.angle)}
            y2={center + radius * Math.sin(p.angle)}
            stroke="#334155"
            strokeWidth="1"
            opacity={0.5}
          />
        ))}

        <path
          d={requiredPath}
          fill="url(#requiredGradient)"
          stroke="#f59e0b"
          strokeWidth="2"
          strokeDasharray="4 4"
          opacity={0.6}
        />

        <path
          d={scorePath}
          fill="url(#scoreGradient)"
          stroke="#10b981"
          strokeWidth="2"
          opacity={0.9}
        />

        {points.map((p, i) => (
          <g key={i}>
            <circle
              cx={p.x}
              cy={p.y}
              r={4}
              fill="#10b981"
              stroke="#fff"
              strokeWidth="2"
            />
            <text
              x={p.labelX}
              y={p.labelY}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-xs fill-slate-400"
              fontSize="11"
            >
              {p.skill.skill.name.length > 12 ? p.skill.skill.name.slice(0, 10) + '...' : p.skill.skill.name}
            </text>
          </g>
        ))}

        <text x={center} y={center - 10} textAnchor="middle" className="text-sm font-medium fill-white">
          Score
        </text>
        <text x={center} y={center + 10} textAnchor="middle" className="text-xl font-bold fill-emerald-400">
          {Math.round(skills.reduce((sum, s) => sum + s.score, 0) / skills.length)}%
        </text>
      </svg>

      <div className="flex items-center justify-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
          <span className="text-xs text-slate-400">Votre score</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-amber-500/50 border border-amber-500 border-dashed"></div>
          <span className="text-xs text-slate-400">Niveau requis</span>
        </div>
      </div>
    </div>
  );
}
