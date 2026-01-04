import { useState } from 'react';
import { Bell, Shield, Palette, Save, FolderOpen, Settings, Lock, Check, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { CorpusManager } from '../corpus/CorpusManager';

type SettingsTab = 'general' | 'theme' | 'corpus';

export function SettingsPage() {
  const { profile, updateProfile, user } = useAuth();
  const { themes, currentTheme, setTheme, isThemeUnlocked, getThemeRequirement, customColors, setCustomColors, isFeatureUnlocked, getFeatureRequirement } = useTheme();
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [emailNotifications, setEmailNotifications] = useState(profile?.email_notifications ?? true);
  const [saving, setSaving] = useState(false);
  const [customColorValues, setCustomColorValues] = useState(customColors || currentTheme?.colors || {
    primary: '#10b981',
    secondary: '#14b8a6',
    accent: '#f59e0b',
    background: '#0f172a',
    surface: '#1e293b',
    text: '#f8fafc'
  });

  const userLevel = profile?.current_level || 1;
  const completedModules = 0;

  const handleSave = async () => {
    setSaving(true);
    await updateProfile({ email_notifications: emailNotifications });
    setSaving(false);
  };

  const handleThemeSelect = async (themeId: string) => {
    if (user?.id) {
      await setTheme(themeId, user.id);
    }
  };

  const handleCustomColorChange = (key: string, value: string) => {
    setCustomColorValues(prev => ({ ...prev, [key]: value }));
  };

  const handleApplyCustomColors = async () => {
    if (user?.id && isFeatureUnlocked('customColors', userLevel)) {
      await setCustomColors(customColorValues, user.id);
    }
  };

  const colorLabels: Record<string, string> = {
    primary: 'Couleur primaire',
    secondary: 'Couleur secondaire',
    accent: 'Couleur accent',
    background: 'Arriere-plan',
    surface: 'Surface',
    text: 'Texte'
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Parametres</h1>
        <p className="text-slate-400">Gerez vos preferences, themes et corpus personnel</p>
      </div>

      <div className="flex gap-2 mb-6 border-b border-slate-700 pb-4 overflow-x-auto">
        <button
          onClick={() => setActiveTab('general')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'general'
              ? 'bg-emerald-500/20 text-emerald-400'
              : 'text-slate-400 hover:bg-slate-700/50'
          }`}
        >
          <Settings size={18} />
          General
        </button>
        <button
          onClick={() => setActiveTab('theme')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'theme'
              ? 'bg-teal-500/20 text-teal-400'
              : 'text-slate-400 hover:bg-slate-700/50'
          }`}
        >
          <Palette size={18} />
          Themes
        </button>
        <button
          onClick={() => setActiveTab('corpus')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'corpus'
              ? 'bg-amber-500/20 text-amber-400'
              : 'text-slate-400 hover:bg-slate-700/50'
          }`}
        >
          <FolderOpen size={18} />
          Mon Corpus
        </button>
      </div>

      {activeTab === 'general' && (
        <div className="space-y-6">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Bell size={20} className="text-emerald-400" />
              Notifications
            </h2>
            <div className="space-y-4">
              <label className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg cursor-pointer">
                <div>
                  <p className="font-medium text-white">Notifications par email</p>
                  <p className="text-sm text-slate-400">Recevez des rappels et mises a jour par email</p>
                </div>
                <button
                  onClick={() => setEmailNotifications(!emailNotifications)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${
                    emailNotifications ? 'bg-emerald-500' : 'bg-slate-600'
                  }`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      emailNotifications ? 'right-1' : 'left-1'
                    }`}
                  />
                </button>
              </label>
            </div>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Shield size={20} className="text-blue-400" />
              Confidentialite
            </h2>
            <div className="p-4 bg-slate-700/30 rounded-lg">
              <p className="font-medium text-white mb-1">Profil public</p>
              <p className="text-sm text-slate-400">Votre profil est visible par les autres membres</p>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Enregistrement...
              </>
            ) : (
              <>
                <Save size={18} />
                Enregistrer les parametres
              </>
            )}
          </button>
        </div>
      )}

      {activeTab === 'theme' && (
        <div className="space-y-6">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Palette size={20} className="text-teal-400" />
                Themes disponibles
              </h2>
              <span className="text-sm text-slate-400">Niveau {userLevel}</span>
            </div>
            <p className="text-slate-400 text-sm mb-6">Debloquez de nouveaux themes en progressant dans les parcours</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {themes.map(theme => {
                const isUnlocked = isThemeUnlocked(theme.slug, userLevel, completedModules);
                const requirement = getThemeRequirement(theme.slug);
                const isSelected = currentTheme?.id === theme.id;

                return (
                  <button
                    key={theme.id}
                    onClick={() => isUnlocked && handleThemeSelect(theme.id)}
                    disabled={!isUnlocked}
                    className={`relative p-4 rounded-xl border-2 transition-all text-left ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-500/10'
                        : isUnlocked
                        ? 'border-slate-600 hover:border-slate-500 bg-slate-700/30'
                        : 'border-slate-700 bg-slate-800/50 opacity-60 cursor-not-allowed'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                        <Check size={14} className="text-white" />
                      </div>
                    )}
                    {!isUnlocked && (
                      <div className="absolute top-2 right-2 w-6 h-6 bg-slate-600 rounded-full flex items-center justify-center">
                        <Lock size={12} className="text-slate-400" />
                      </div>
                    )}

                    <div className="flex gap-2 mb-3">
                      {Object.values(theme.colors).slice(0, 4).map((color, i) => (
                        <div
                          key={i}
                          className="w-6 h-6 rounded-full border border-slate-600"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>

                    <h3 className="font-semibold text-white mb-1">{theme.name}</h3>
                    <p className="text-sm text-slate-400 mb-2">{theme.description || (theme.is_dark ? 'Theme sombre' : 'Theme clair')}</p>

                    {!isUnlocked && requirement && (
                      <p className="text-xs text-amber-400 flex items-center gap-1">
                        <Lock size={10} />
                        {requirement.description}
                      </p>
                    )}
                    {theme.is_premium && (
                      <span className="inline-flex items-center gap-1 text-xs text-amber-400 mt-1">
                        <Sparkles size={10} />
                        Premium
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className={`bg-slate-800 border rounded-xl p-6 ${
            isFeatureUnlocked('customColors', userLevel)
              ? 'border-slate-700'
              : 'border-slate-700/50 opacity-60'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Sparkles size={20} className="text-amber-400" />
                Couleurs personnalisees
                {!isFeatureUnlocked('customColors', userLevel) && (
                  <Lock size={16} className="text-slate-400" />
                )}
              </h2>
            </div>

            {!isFeatureUnlocked('customColors', userLevel) ? (
              <div className="text-center py-6">
                <Lock size={32} className="mx-auto text-slate-500 mb-3" />
                <p className="text-slate-400">{getFeatureRequirement('customColors').description}</p>
                <p className="text-sm text-slate-500 mt-1">Niveau actuel: {userLevel}/8</p>
              </div>
            ) : (
              <>
                <p className="text-slate-400 text-sm mb-6">Creez votre propre palette de couleurs</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                  {Object.entries(customColorValues).map(([key, value]) => (
                    <div key={key}>
                      <label className="block text-sm text-slate-400 mb-2">{colorLabels[key] || key}</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={value}
                          onChange={(e) => handleCustomColorChange(key, e.target.value)}
                          className="w-10 h-10 rounded-lg cursor-pointer border border-slate-600"
                        />
                        <input
                          type="text"
                          value={value}
                          onChange={(e) => handleCustomColorChange(key, e.target.value)}
                          className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm"
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={handleApplyCustomColors}
                  className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles size={18} />
                  Appliquer les couleurs
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {activeTab === 'corpus' && <CorpusManager />}
    </div>
  );
}
