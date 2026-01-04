import { Bell, Search, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  title: string;
  onMenuClick: () => void;
}

export function Header({ title, onMenuClick }: HeaderProps) {
  const { profile } = useAuth();

  return (
    <header className="h-16 bg-slate-800/50 backdrop-blur-sm border-b border-slate-700 flex items-center justify-between px-6 sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-slate-700 text-slate-400"
        >
          <Menu size={24} />
        </button>
        <h1 className="text-xl font-bold text-white">{title}</h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-2 bg-slate-700/50 rounded-lg px-4 py-2">
          <Search size={18} className="text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher..."
            className="bg-transparent border-none outline-none text-white placeholder-slate-400 w-48"
          />
        </div>

        <button className="relative p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full" />
        </button>

        <div className="hidden sm:flex items-center gap-3 pl-4 border-l border-slate-700">
          <div className="text-right">
            <p className="text-sm font-medium text-white">{profile?.display_name}</p>
            <p className="text-xs text-slate-400">Niveau {profile?.current_level}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold">
            {profile?.display_name?.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
}
