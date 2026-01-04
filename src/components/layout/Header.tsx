import { useEffect } from 'react';
import { Bell, Search, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  title: string;
  onMenuClick: () => void;
  onSearchClick: () => void;
}

export function Header({ title, onMenuClick, onSearchClick }: HeaderProps) {
  const { profile } = useAuth();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onSearchClick();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSearchClick]);

  return (
    <header
      className="h-16 bg-slate-800/50 backdrop-blur-sm border-b border-slate-700 flex items-center justify-between px-6 sticky top-0 z-40"
      role="banner"
    >
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-slate-700 text-slate-400"
          aria-label="Ouvrir le menu"
        >
          <Menu size={24} aria-hidden="true" />
        </button>
        <h1 className="text-xl font-bold text-white">{title}</h1>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={onSearchClick}
          className="hidden md:flex items-center gap-2 bg-slate-700/50 hover:bg-slate-700 rounded-lg px-4 py-2 transition-colors group"
          aria-label="Rechercher (Ctrl+K)"
        >
          <Search size={18} className="text-slate-400" aria-hidden="true" />
          <span className="text-slate-400 group-hover:text-slate-300">Rechercher...</span>
          <kbd className="ml-2 px-1.5 py-0.5 bg-slate-600 rounded text-xs text-slate-400">
            Ctrl+K
          </kbd>
        </button>
        <button
          onClick={onSearchClick}
          className="md:hidden p-2 rounded-lg hover:bg-slate-700 text-slate-400"
          aria-label="Rechercher"
        >
          <Search size={20} aria-hidden="true" />
        </button>

        <button
          className="relative p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          aria-label="Notifications"
        >
          <Bell size={20} aria-hidden="true" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full" aria-hidden="true" />
          <span className="sr-only">Nouvelles notifications</span>
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
