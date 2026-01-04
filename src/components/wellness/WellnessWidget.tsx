import { useState } from 'react';
import {
  Eye,
  Clock,
  Activity,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Heart,
  Lightbulb,
} from 'lucide-react';

interface WellnessWidgetProps {
  sessionTime: string;
  activeTime: string;
  isIdle: boolean;
  breaksTaken: number;
}

const wellnessTips = [
  {
    icon: Eye,
    title: 'Regle 20-20-20',
    tip: 'Toutes les 20 minutes, regardez quelque chose a 20 metres pendant 20 secondes.',
  },
  {
    icon: Activity,
    title: 'Posture',
    tip: 'Gardez le dos droit, les epaules detendues et les pieds a plat.',
  },
  {
    icon: Heart,
    title: 'Respiration',
    tip: 'Prenez 3 respirations profondes pour oxygener votre cerveau.',
  },
  {
    icon: Lightbulb,
    title: 'Economie de l\'attention',
    tip: 'Votre attention est une ressource limitee. Utilisez-la consciemment.',
  },
];

export function WellnessWidget({
  sessionTime,
  activeTime,
  isIdle,
  breaksTaken,
}: WellnessWidgetProps) {
  const [expanded, setExpanded] = useState(false);
  const [tipIndex, setTipIndex] = useState(0);

  const currentTip = wellnessTips[tipIndex];
  const TipIcon = currentTip.icon;

  const nextTip = () => {
    setTipIndex((prev) => (prev + 1) % wellnessTips.length);
  };

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-slate-700/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-teal-500/20 flex items-center justify-center">
            <Heart size={20} className="text-teal-400" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-white">Bien-etre numerique</h3>
            <p className="text-sm text-slate-400">Session: {sessionTime}</p>
          </div>
        </div>
        {expanded ? (
          <ChevronUp size={20} className="text-slate-400" />
        ) : (
          <ChevronDown size={20} className="text-slate-400" />
        )}
      </button>

      {expanded && (
        <div className="p-4 pt-0 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-700/50 rounded-lg p-3 text-center">
              <Clock size={16} className="text-blue-400 mx-auto mb-1" />
              <p className="text-lg font-bold text-white">{activeTime}</p>
              <p className="text-xs text-slate-400">Temps actif</p>
            </div>
            <div className="bg-slate-700/50 rounded-lg p-3 text-center">
              <Activity size={16} className="text-emerald-400 mx-auto mb-1" />
              <p className="text-lg font-bold text-white">{breaksTaken}</p>
              <p className="text-xs text-slate-400">Pauses</p>
            </div>
            <div className="bg-slate-700/50 rounded-lg p-3 text-center">
              <Eye size={16} className={isIdle ? 'text-amber-400' : 'text-teal-400'} />
              <p className="text-lg font-bold text-white">{isIdle ? 'Pause' : 'Actif'}</p>
              <p className="text-xs text-slate-400">Statut</p>
            </div>
          </div>

          <button
            onClick={nextTip}
            className="w-full bg-gradient-to-r from-teal-500/10 to-cyan-500/10 border border-teal-500/30 rounded-lg p-4 text-left hover:border-teal-500/50 transition-colors"
          >
            <div className="flex items-start gap-3">
              <TipIcon size={20} className="text-teal-400 mt-0.5" />
              <div>
                <p className="font-medium text-teal-300 text-sm">{currentTip.title}</p>
                <p className="text-slate-400 text-sm mt-1">{currentTip.tip}</p>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-2 text-center">
              Cliquez pour un autre conseil ({tipIndex + 1}/{wellnessTips.length})
            </p>
          </button>

          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertCircle size={16} className="text-amber-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-amber-300 text-sm font-medium">Economie de l'attention</p>
                <p className="text-slate-400 text-xs mt-1">
                  Cette application utilise des mecaniques de jeu. Restez conscient de votre usage
                  et n'hesitez pas a faire des pauses regulieres.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
