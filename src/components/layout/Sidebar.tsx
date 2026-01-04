import {
  Home,
  BookOpen,
  Award,
  Users,
  User,
  Settings,
  LogOut,
  Trophy,
  Flame,
  ChevronLeft,
  ChevronRight,
  Gamepad2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Page } from '../../types';

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function Sidebar({ currentPage, onNavigate, isCollapsed, onToggleCollapse }: SidebarProps) {
  const { profile, signOut } = useAuth();

  const menuItems = [
    { page: 'dashboard' as Page, icon: Home, label: 'Tableau de bord' },
    { page: 'paths' as Page, icon: BookOpen, label: 'Parcours' },
    { page: 'games' as Page, icon: Gamepad2, label: 'Jeux' },
    { page: 'achievements' as Page, icon: Award, label: 'Badges' },
    { page: 'community' as Page, icon: Users, label: 'Communaute' },
    { page: 'certifications' as Page, icon: Trophy, label: 'Certifications' },
    { page: 'profile' as Page, icon: User, label: 'Profil' },
    { page: 'settings' as Page, icon: Settings, label: 'Parametres' },
  ];

  const xpForNextLevel = Math.pow(profile?.current_level || 1, 2) * 100;
  const xpProgress = ((profile?.total_xp || 0) % xpForNextLevel) / xpForNextLevel * 100;

  return (
    <aside
      className={`fixed left-0 top-0 h-full bg-slate-800 border-r border-slate-700 transition-all duration-300 z-50 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div className="flex flex-col h-full">
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">IE</span>
                </div>
                <div>
                  <h1 className="font-bold text-white text-sm">Intelligence</h1>
                  <p className="text-xs text-slate-400">Economique</p>
                </div>
              </div>
            )}
            <button
              onClick={onToggleCollapse}
              className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            </button>
          </div>
        </div>

        {profile && !isCollapsed && (
          <div className="p-4 border-b border-slate-700">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold">
                {profile.display_name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white truncate">{profile.display_name}</p>
                <p className="text-xs text-slate-400">Niveau {profile.current_level}</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">{profile.total_xp} XP</span>
                <span className="text-emerald-400">{xpForNextLevel - (profile.total_xp % xpForNextLevel)} XP restants</span>
              </div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
                  style={{ width: `${xpProgress}%` }}
                />
              </div>
              <div className="flex items-center gap-2 text-xs text-amber-400">
                <Flame size={14} />
                <span>{profile.streak_days} jours consecutifs</span>
              </div>
            </div>
          </div>
        )}

        {profile && isCollapsed && (
          <div className="p-4 border-b border-slate-700 flex justify-center">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-sm">
              {profile.display_name.charAt(0).toUpperCase()}
            </div>
          </div>
        )}

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.page;
            return (
              <button
                key={item.page}
                onClick={() => onNavigate(item.page)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                  isActive
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'text-slate-400 hover:bg-slate-700 hover:text-white'
                } ${isCollapsed ? 'justify-center' : ''}`}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon size={20} />
                {!isCollapsed && <span className="font-medium">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-700">
          <button
            onClick={signOut}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all ${
              isCollapsed ? 'justify-center' : ''
            }`}
            title={isCollapsed ? 'Deconnexion' : undefined}
          >
            <LogOut size={20} />
            {!isCollapsed && <span className="font-medium">Deconnexion</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}
