import { Award, X } from 'lucide-react';
import { Badge } from '../types';

interface BadgeModalProps {
  badge: Badge;
  onClose: () => void;
}

export function BadgeModal({ badge, onClose }: BadgeModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-slate-800 rounded-2xl border border-slate-700 p-8 max-w-sm w-full text-center animate-bounce-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full mb-6 shadow-lg shadow-amber-500/30">
          <span className="text-4xl">{badge.icon}</span>
        </div>

        <div className="flex items-center justify-center gap-2 text-amber-400 mb-2">
          <Award className="w-5 h-5" />
          <span className="text-sm font-medium uppercase tracking-wider">Nouveau Badge</span>
        </div>

        <h3 className="text-2xl font-bold text-white mb-2">{badge.name}</h3>
        <p className="text-slate-400">{badge.description}</p>

        <button
          onClick={onClose}
          className="mt-6 px-6 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-medium rounded-xl hover:from-amber-600 hover:to-orange-700 transition-all"
        >
          Super !
        </button>
      </div>
    </div>
  );
}
