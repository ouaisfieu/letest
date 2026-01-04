import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Page, NavigationState } from './types';

import { HomePage } from './components/pages/HomePage';
import { AuthPage } from './components/pages/AuthPage';
import { DashboardPage } from './components/pages/DashboardPage';
import { PathsPage } from './components/pages/PathsPage';
import { PathDetailPage } from './components/pages/PathDetailPage';
import { LessonPage } from './components/pages/LessonPage';
import { AchievementsPage } from './components/pages/AchievementsPage';
import { ProfilePage } from './components/pages/ProfilePage';
import { CommunityPage } from './components/pages/CommunityPage';
import { CertificationsPage } from './components/pages/CertificationsPage';
import { SettingsPage } from './components/pages/SettingsPage';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';

const PAGE_TITLES: Record<Page, string> = {
  home: 'Accueil',
  auth: 'Connexion',
  onboarding: 'Bienvenue',
  dashboard: 'Tableau de bord',
  paths: 'Parcours',
  'path-detail': 'Parcours',
  'module-detail': 'Module',
  lesson: 'Lecon',
  quiz: 'Quiz',
  achievements: 'Badges',
  profile: 'Profil',
  community: 'Communaute',
  topic: 'Discussion',
  certifications: 'Certifications',
  settings: 'Parametres',
};

function AppContent() {
  const { user, profile, loading } = useAuth();
  const [nav, setNav] = useState<NavigationState>({ page: 'home' });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (user && profile) {
        if (nav.page === 'home' || nav.page === 'auth') {
          setNav({ page: 'dashboard' });
        }
      } else if (!user && nav.page !== 'home' && nav.page !== 'auth') {
        setNav({ page: 'home' });
      }
    }
  }, [user, profile, loading, nav.page]);

  const navigate = (page: Page, params?: Partial<NavigationState>) => {
    setNav({ page, ...params });
    setMobileMenuOpen(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Chargement...</p>
        </div>
      </div>
    );
  }

  const hasSupabaseConfig = !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);

  if (!hasSupabaseConfig) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-8">
        <div className="max-w-2xl bg-red-500/10 border-2 border-red-500 rounded-xl p-8 text-white">
          <h1 className="text-3xl font-bold mb-4 text-red-400">Configuration Manquante</h1>
          <p className="text-lg mb-4">Les variables d'environnement Supabase ne sont pas configurees.</p>
          <div className="bg-slate-800 rounded-lg p-4 mb-4 font-mono text-sm">
            <p className="mb-2">Dans Vercel - Settings - Environment Variables, ajoutez :</p>
            <ul className="list-disc list-inside space-y-1 text-amber-300">
              <li>VITE_SUPABASE_URL</li>
              <li>VITE_SUPABASE_ANON_KEY</li>
            </ul>
          </div>
          <p className="text-sm text-slate-300">Puis redeployez l'application.</p>
        </div>
      </div>
    );
  }

  if (!user) {
    if (nav.page === 'auth') {
      return (
        <AuthPage
          onBack={() => navigate('home')}
          onSuccess={() => navigate('dashboard')}
        />
      );
    }
    return (
      <HomePage
        onGetStarted={() => navigate('auth')}
        onSignIn={() => navigate('auth')}
      />
    );
  }

  const renderPage = () => {
    switch (nav.page) {
      case 'dashboard':
        return (
          <DashboardPage
            onNavigateToPath={(pathId) => navigate('path-detail', { pathId })}
            onNavigateToAchievements={() => navigate('achievements')}
          />
        );
      case 'paths':
        return (
          <PathsPage
            onSelectPath={(pathId) => navigate('path-detail', { pathId })}
          />
        );
      case 'path-detail':
        return nav.pathId ? (
          <PathDetailPage
            pathId={nav.pathId}
            onBack={() => navigate('paths')}
            onSelectLesson={(lessonId) => navigate('lesson', { lessonId })}
          />
        ) : null;
      case 'lesson':
        return nav.lessonId ? (
          <LessonPage
            lessonId={nav.lessonId}
            onBack={() => nav.pathId ? navigate('path-detail', { pathId: nav.pathId }) : navigate('paths')}
            onComplete={() => nav.pathId ? navigate('path-detail', { pathId: nav.pathId }) : navigate('paths')}
          />
        ) : null;
      case 'achievements':
        return <AchievementsPage />;
      case 'profile':
        return <ProfilePage />;
      case 'community':
        return (
          <CommunityPage
            onSelectTopic={(topicId) => navigate('topic', { topicId })}
          />
        );
      case 'certifications':
        return <CertificationsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return (
          <DashboardPage
            onNavigateToPath={(pathId) => navigate('path-detail', { pathId })}
            onNavigateToAchievements={() => navigate('achievements')}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <Sidebar
        currentPage={nav.page}
        onNavigate={navigate}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <div
        className={`transition-all duration-300 ${
          sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'
        }`}
      >
        <Header
          title={PAGE_TITLES[nav.page]}
          onMenuClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        />

        <main className="min-h-[calc(100vh-4rem)]">
          {renderPage()}
        </main>
      </div>

      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
