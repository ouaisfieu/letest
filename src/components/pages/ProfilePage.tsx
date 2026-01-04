import { useState, useEffect } from 'react';
import {
  User, Mail, MapPin, Building2, Briefcase, Edit2, Save, X,
  Star, Award, BookOpen, Flame, Calendar, Lock, Link as LinkIcon,
  Plus, Trash2, Globe, Eye, EyeOff, Camera,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { ImageUploader } from '../ui/ImageUploader';
import { supabase } from '../../lib/supabase';
import { CompressionResult } from '../../utils/imageCompression';
import { PortfolioLink } from '../../types';

export function ProfilePage() {
  const { profile, user, updateProfile, refreshProfile } = useAuth();
  const { isFeatureUnlocked, getFeatureRequirement } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'portfolio'>('info');
  const [formData, setFormData] = useState({
    display_name: profile?.display_name || '',
    bio: profile?.bio || '',
    association_name: profile?.association_name || '',
    association_role: profile?.association_role || '',
    city: profile?.city || '',
    portfolio_bio: profile?.portfolio_bio || '',
    is_portfolio_public: profile?.is_portfolio_public || false,
  });
  const [portfolioLinks, setPortfolioLinks] = useState<PortfolioLink[]>(
    (profile?.portfolio_links as PortfolioLink[]) || []
  );
  const [newLink, setNewLink] = useState({ label: '', url: '' });

  const userLevel = profile?.current_level || 1;

  useEffect(() => {
    if (profile) {
      setFormData({
        display_name: profile.display_name || '',
        bio: profile.bio || '',
        association_name: profile.association_name || '',
        association_role: profile.association_role || '',
        city: profile.city || '',
        portfolio_bio: profile.portfolio_bio || '',
        is_portfolio_public: profile.is_portfolio_public || false,
      });
      setPortfolioLinks((profile.portfolio_links as PortfolioLink[]) || []);
    }
  }, [profile]);

  const handleSave = async () => {
    setSaving(true);
    await updateProfile({
      ...formData,
      portfolio_links: portfolioLinks,
    });
    setSaving(false);
    setIsEditing(false);
  };

  const handleImageUpload = async (type: 'avatar' | 'banner', blob: Blob, result: CompressionResult) => {
    if (!profile) return;

    const fileName = `${profile.id}/${type}-${Date.now()}.webp`;
    const { error: uploadError } = await supabase.storage
      .from('user-assets')
      .upload(fileName, blob, { upsert: true });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return;
    }

    const { data: urlData } = supabase.storage.from('user-assets').getPublicUrl(fileName);

    if (urlData) {
      const updateField = type === 'avatar' ? 'avatar_url' : 'banner_url';
      await updateProfile({ [updateField]: urlData.publicUrl });
      await refreshProfile();
    }
  };

  const addPortfolioLink = () => {
    if (newLink.label && newLink.url) {
      setPortfolioLinks([...portfolioLinks, { ...newLink }]);
      setNewLink({ label: '', url: '' });
    }
  };

  const removePortfolioLink = (index: number) => {
    setPortfolioLinks(portfolioLinks.filter((_, i) => i !== index));
  };

  const stats = [
    { icon: Star, label: 'Niveau', value: profile?.current_level || 1, color: 'emerald' },
    { icon: Award, label: 'XP Total', value: profile?.total_xp || 0, color: 'blue' },
    { icon: Flame, label: 'Serie', value: `${profile?.streak_days || 0}j`, color: 'amber' },
    { icon: BookOpen, label: 'Lecons', value: 0, color: 'teal' },
  ];

  const renderLockedFeature = (feature: 'banner' | 'portfolioLinks' | 'customColors' | 'publicPortfolio') => {
    const req = getFeatureRequirement(feature);
    return (
      <div className="flex items-center gap-2 px-4 py-3 bg-slate-700/30 rounded-lg text-slate-500 border border-slate-600/50">
        <Lock size={16} />
        <span className="text-sm">{req.description}</span>
      </div>
    );
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Mon Profil</h1>
        <p className="text-slate-400">Gerez vos informations et votre portfolio</p>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden mb-6">
        <div className="relative h-40">
          {profile?.banner_url ? (
            <img src={profile.banner_url} alt="Banniere" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-emerald-600 to-teal-600" />
          )}
          {isFeatureUnlocked('banner', userLevel) && isEditing && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="bg-slate-800 rounded-lg p-4">
                <ImageUploader
                  type="banner"
                  currentUrl={profile?.banner_url}
                  onUpload={(blob, result) => handleImageUpload('banner', blob, result)}
                />
              </div>
            </div>
          )}
        </div>

        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-16">
            <div className="relative">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt="Avatar"
                  className="w-28 h-28 rounded-2xl border-4 border-slate-800 object-cover bg-slate-700"
                />
              ) : (
                <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 border-4 border-slate-800 flex items-center justify-center text-white text-4xl font-bold">
                  {profile?.display_name?.charAt(0).toUpperCase()}
                </div>
              )}
              {isEditing && (
                <div className="absolute -bottom-2 -right-2">
                  <label className="flex items-center justify-center w-8 h-8 bg-emerald-500 rounded-full cursor-pointer hover:bg-emerald-400 transition-colors">
                    <Camera size={14} className="text-white" />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const { compressImage } = await import('../../utils/imageCompression');
                          const result = await compressImage(file, { maxWidth: 400, maxHeight: 400, quality: 0.85 });
                          handleImageUpload('avatar', result.blob, result);
                        }
                      }}
                    />
                  </label>
                </div>
              )}
            </div>

            <div className="flex-1 pt-4 sm:pt-0">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold text-white">{profile?.display_name}</h2>
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs rounded-full">
                  Niv. {userLevel}
                </span>
              </div>
              <p className="text-slate-400">@{profile?.username}</p>
            </div>

            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                isEditing
                  ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
              }`}
            >
              {isEditing ? <><X size={18} />Annuler</> : <><Edit2 size={18} />Modifier</>}
            </button>
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-4 gap-3 mb-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-slate-800 border border-slate-700 rounded-xl p-4">
              <div className={`w-9 h-9 rounded-lg bg-${stat.color}-500/20 flex items-center justify-center mb-2`}>
                <Icon size={18} className={`text-${stat.color}-400`} />
              </div>
              <p className="text-xl font-bold text-white">{stat.value}</p>
              <p className="text-xs text-slate-400">{stat.label}</p>
            </div>
          );
        })}
      </div>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('info')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'info' ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-400 hover:bg-slate-700/50'
          }`}
        >
          Informations
        </button>
        <button
          onClick={() => setActiveTab('portfolio')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'portfolio' ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-400 hover:bg-slate-700/50'
          }`}
        >
          Portfolio
        </button>
      </div>

      {activeTab === 'info' ? (
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-6">Informations personnelles</h3>

          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Nom affiche</label>
                <div className="relative">
                  <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={formData.display_name}
                    onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Bio</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={3}
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 resize-none"
                  placeholder="Parlez-nous de vous..."
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">
                    Organisation <span className="text-slate-500 font-normal">(optionnel)</span>
                  </label>
                  <div className="relative">
                    <Building2 size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={formData.association_name}
                      onChange={(e) => setFormData({ ...formData, association_name: e.target.value })}
                      placeholder="Entreprise, association, independant..."
                      className="w-full bg-slate-700/50 border border-slate-600 rounded-lg pl-10 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">
                    Fonction <span className="text-slate-500 font-normal">(optionnel)</span>
                  </label>
                  <div className="relative">
                    <Briefcase size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={formData.association_role}
                      onChange={(e) => setFormData({ ...formData, association_role: e.target.value })}
                      placeholder="Votre activite ou metier"
                      className="w-full bg-slate-700/50 border border-slate-600 rounded-lg pl-10 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Ville</label>
                <div className="relative">
                  <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {saving ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save size={18} />}
                {saving ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-slate-700/30 rounded-lg">
                <Mail size={20} className="text-slate-400" />
                <div>
                  <p className="text-sm text-slate-400">Email</p>
                  <p className="text-white">{user?.email}</p>
                </div>
              </div>

              {profile?.bio && (
                <div className="p-4 bg-slate-700/30 rounded-lg">
                  <p className="text-sm text-slate-400 mb-1">Bio</p>
                  <p className="text-white">{profile.bio}</p>
                </div>
              )}

              <div className="grid sm:grid-cols-2 gap-4">
                {profile?.association_name && (
                  <div className="flex items-center gap-4 p-4 bg-slate-700/30 rounded-lg">
                    <Building2 size={20} className="text-slate-400" />
                    <div>
                      <p className="text-sm text-slate-400">Organisation</p>
                      <p className="text-white">{profile.association_name}</p>
                    </div>
                  </div>
                )}
                {profile?.association_role && (
                  <div className="flex items-center gap-4 p-4 bg-slate-700/30 rounded-lg">
                    <Briefcase size={20} className="text-slate-400" />
                    <div>
                      <p className="text-sm text-slate-400">Fonction</p>
                      <p className="text-white">{profile.association_role}</p>
                    </div>
                  </div>
                )}
                {profile?.city && (
                  <div className="flex items-center gap-4 p-4 bg-slate-700/30 rounded-lg">
                    <MapPin size={20} className="text-slate-400" />
                    <div>
                      <p className="text-sm text-slate-400">Ville</p>
                      <p className="text-white">{profile.city}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-4 p-4 bg-slate-700/30 rounded-lg">
                  <Calendar size={20} className="text-slate-400" />
                  <div>
                    <p className="text-sm text-slate-400">Membre depuis</p>
                    <p className="text-white">
                      {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) : '-'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Portfolio</h3>
            {isFeatureUnlocked('publicPortfolio', userLevel) ? (
              <label className="flex items-center gap-2 cursor-pointer">
                <span className="text-sm text-slate-400">
                  {formData.is_portfolio_public ? 'Public' : 'Prive'}
                </span>
                <button
                  onClick={() => {
                    setFormData(prev => ({ ...prev, is_portfolio_public: !prev.is_portfolio_public }));
                    if (!isEditing) {
                      updateProfile({ is_portfolio_public: !formData.is_portfolio_public });
                    }
                  }}
                  className={`p-2 rounded-lg transition-colors ${
                    formData.is_portfolio_public ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-400'
                  }`}
                >
                  {formData.is_portfolio_public ? <Globe size={18} /> : <EyeOff size={18} />}
                </button>
              </label>
            ) : (
              <div className="flex items-center gap-2 text-slate-500 text-sm">
                <Lock size={14} />
                Niveau 10 requis
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Bio portfolio</label>
            {isEditing ? (
              <textarea
                value={formData.portfolio_bio}
                onChange={(e) => setFormData({ ...formData, portfolio_bio: e.target.value })}
                rows={4}
                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 resize-none"
                placeholder="Decrivez votre parcours, vos competences..."
              />
            ) : (
              <div className="p-4 bg-slate-700/30 rounded-lg min-h-[80px]">
                <p className="text-white whitespace-pre-wrap">
                  {profile?.portfolio_bio || <span className="text-slate-500">Aucune bio portfolio</span>}
                </p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-3">Liens</label>
            {isFeatureUnlocked('portfolioLinks', userLevel) ? (
              <>
                {portfolioLinks.length > 0 && (
                  <div className="space-y-2 mb-4">
                    {portfolioLinks.map((link, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg group">
                        <LinkIcon size={16} className="text-slate-400" />
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium truncate">{link.label}</p>
                          <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-emerald-400 text-xs hover:underline truncate block">
                            {link.url}
                          </a>
                        </div>
                        {isEditing && (
                          <button
                            onClick={() => removePortfolioLink(index)}
                            className="p-1 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {isEditing && (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newLink.label}
                      onChange={(e) => setNewLink({ ...newLink, label: e.target.value })}
                      placeholder="Label (ex: LinkedIn)"
                      className="flex-1 bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500"
                    />
                    <input
                      type="url"
                      value={newLink.url}
                      onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                      placeholder="URL"
                      className="flex-1 bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      onClick={addPortfolioLink}
                      disabled={!newLink.label || !newLink.url}
                      className="px-3 py-2 bg-emerald-500 hover:bg-emerald-400 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                )}

                {portfolioLinks.length === 0 && !isEditing && (
                  <p className="text-slate-500 text-sm">Aucun lien ajoute</p>
                )}
              </>
            ) : (
              renderLockedFeature('portfolioLinks')
            )}
          </div>

          {isEditing && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {saving ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save size={18} />}
              {saving ? 'Enregistrement...' : 'Enregistrer le portfolio'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
