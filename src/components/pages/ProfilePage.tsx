import { useState } from 'react';
import {
  User,
  Mail,
  MapPin,
  Building2,
  Briefcase,
  Edit2,
  Save,
  X,
  Star,
  Award,
  BookOpen,
  Flame,
  Calendar,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function ProfilePage() {
  const { profile, user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    display_name: profile?.display_name || '',
    bio: profile?.bio || '',
    association_name: profile?.association_name || '',
    association_role: profile?.association_role || '',
    city: profile?.city || '',
  });

  const handleSave = async () => {
    setSaving(true);
    await updateProfile(formData);
    setSaving(false);
    setIsEditing(false);
  };

  const stats = [
    { icon: Star, label: 'Niveau', value: profile?.current_level || 1, color: 'emerald' },
    { icon: Award, label: 'XP Total', value: profile?.total_xp || 0, color: 'blue' },
    { icon: Flame, label: 'Serie', value: `${profile?.streak_days || 0} jours`, color: 'amber' },
    { icon: BookOpen, label: 'Lecons', value: 0, color: 'purple' },
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Mon Profil</h1>
        <p className="text-slate-400">Gerez vos informations personnelles</p>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden mb-6">
        <div className="h-32 bg-gradient-to-r from-emerald-600 to-teal-600" />
        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 border-4 border-slate-800 flex items-center justify-center text-white text-3xl font-bold">
              {profile?.display_name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white">{profile?.display_name}</h2>
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
              {isEditing ? (
                <>
                  <X size={18} />
                  Annuler
                </>
              ) : (
                <>
                  <Edit2 size={18} />
                  Modifier
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-slate-800 border border-slate-700 rounded-xl p-4">
              <div className={`w-10 h-10 rounded-lg bg-${stat.color}-500/20 flex items-center justify-center mb-3`}>
                <Icon size={20} className={`text-${stat.color}-400`} />
              </div>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-sm text-slate-400">{stat.label}</p>
            </div>
          );
        })}
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-6">Informations personnelles</h3>

        {isEditing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Nom affiche
              </label>
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
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Bio
              </label>
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
                  Association
                </label>
                <div className="relative">
                  <Building2 size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={formData.association_name}
                    onChange={(e) => setFormData({ ...formData, association_name: e.target.value })}
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                    placeholder="Nom de votre association"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Role
                </label>
                <div className="relative">
                  <Briefcase size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={formData.association_role}
                    onChange={(e) => setFormData({ ...formData, association_role: e.target.value })}
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                    placeholder="Votre fonction"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Ville
              </label>
              <div className="relative">
                <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                  placeholder="Votre ville"
                />
              </div>
            </div>

            <div className="pt-4">
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
                    Enregistrer les modifications
                  </>
                )}
              </button>
            </div>
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
                    <p className="text-sm text-slate-400">Association</p>
                    <p className="text-white">{profile.association_name}</p>
                  </div>
                </div>
              )}

              {profile?.association_role && (
                <div className="flex items-center gap-4 p-4 bg-slate-700/30 rounded-lg">
                  <Briefcase size={20} className="text-slate-400" />
                  <div>
                    <p className="text-sm text-slate-400">Role</p>
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
                    {profile?.created_at
                      ? new Date(profile.created_at).toLocaleDateString('fr-FR', {
                          month: 'long',
                          year: 'numeric',
                        })
                      : '-'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
