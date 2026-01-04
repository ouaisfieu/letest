import { Eye } from 'lucide-react';

interface BlinkReminderProps {
  message: string;
  onDismiss: () => void;
}

export function BlinkReminder({ message, onDismiss }: BlinkReminderProps) {
  return (
    <div
      className="fixed bottom-4 right-4 z-40 animate-fade-in"
      onClick={onDismiss}
    >
      <div className="bg-slate-800/95 border border-emerald-500/30 rounded-xl p-4 shadow-lg backdrop-blur-sm cursor-pointer hover:bg-slate-700/95 transition-colors max-w-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
            <Eye size={20} className="text-emerald-400 animate-pulse" />
          </div>
          <div>
            <p className="text-white text-sm font-medium">{message}</p>
            <p className="text-slate-500 text-xs mt-0.5">Cliquez pour fermer</p>
          </div>
        </div>
      </div>
    </div>
  );
}
