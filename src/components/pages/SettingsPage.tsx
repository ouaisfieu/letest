import { useState } from 'react';
import { Bell, Shield, Palette, Save } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function SettingsPage() {
  const { profile, updateProfile } = useAuth();
  const [emailNotifications, setEmailNotifications] = useState(profile?.email_notifications ?? true);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await updateProfile({ email_notifications: emailNotifications });
    setSaving(false);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Parametres</h1>
        <p className="text-slate-400">Gerez vos preferences</p>
      </div>

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
            <Palette size={20} className="text-purple-400" />
            Apparence
          </h2>
          <div className="p-4 bg-slate-700/30 rounded-lg">
            <p className="font-medium text-white mb-1">Theme</p>
            <p className="text-sm text-slate-400">Theme sombre (par defaut)</p>
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
    </div>
  );
}
