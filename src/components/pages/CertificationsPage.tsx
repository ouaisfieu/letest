import { useEffect, useState } from 'react';
import { Award, CheckCircle, Lock, Download, ExternalLink } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Certification, UserCertification, LearningPath } from '../../types';

export function CertificationsPage() {
  const { profile } = useAuth();
  const [certifications, setCertifications] = useState<(Certification & { learning_path: LearningPath })[]>([]);
  const [userCertifications, setUserCertifications] = useState<UserCertification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCertifications() {
      if (!profile) return;

      const [certsResult, userCertsResult] = await Promise.all([
        supabase.from('certifications').select('*, learning_path:learning_paths(*)'),
        supabase.from('user_certifications').select('*').eq('user_id', profile.id),
      ]);

      if (certsResult.data) setCertifications(certsResult.data as (Certification & { learning_path: LearningPath })[]);
      if (userCertsResult.data) setUserCertifications(userCertsResult.data as UserCertification[]);
      setLoading(false);
    }

    loadCertifications();
  }, [profile]);

  const earnedIds = new Set(userCertifications.map((uc) => uc.certification_id));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Certifications</h1>
        <p className="text-slate-400">
          Obtenez des certifications en completant les parcours d'apprentissage
        </p>
      </div>

      <div className="bg-gradient-to-r from-amber-600 to-orange-600 rounded-2xl p-6 mb-8">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center">
            <Award size={40} className="text-white" />
          </div>
          <div>
            <p className="text-amber-100 mb-1">Vos certifications</p>
            <p className="text-3xl font-bold text-white">
              {userCertifications.length} / {certifications.length}
            </p>
            <p className="text-sm text-amber-100 mt-1">
              {userCertifications.length === 0
                ? 'Completez un parcours pour obtenir votre premiere certification'
                : 'Continuez pour toutes les obtenir !'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {certifications.map((cert) => {
          const isEarned = earnedIds.has(cert.id);
          const userCert = userCertifications.find((uc) => uc.certification_id === cert.id);

          return (
            <div
              key={cert.id}
              className={`relative overflow-hidden rounded-2xl border transition-all ${
                isEarned
                  ? 'bg-amber-500/10 border-amber-500/30'
                  : 'bg-slate-800/50 border-slate-700 opacity-75'
              }`}
            >
              {!isEarned && (
                <div className="absolute top-4 right-4">
                  <Lock size={20} className="text-slate-500" />
                </div>
              )}

              <div className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${
                    isEarned ? 'bg-amber-500/20' : 'bg-slate-700'
                  }`}>
                    <Award size={32} className={isEarned ? 'text-amber-400' : 'text-slate-500'} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-1">{cert.name}</h3>
                    <p className="text-sm text-slate-400">{cert.description}</p>
                  </div>
                </div>

                <div className="p-4 bg-slate-800/50 rounded-lg mb-4">
                  <p className="text-sm text-slate-400 mb-2">Parcours associe</p>
                  <p className="font-medium text-white">{cert.learning_path?.title}</p>
                </div>

                <div className="space-y-2 mb-4">
                  <p className="text-sm text-slate-400">Conditions requises :</p>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle size={16} className={isEarned ? 'text-emerald-400' : 'text-slate-500'} />
                    <span className={isEarned ? 'text-emerald-400' : 'text-slate-400'}>
                      Terminer tous les modules du parcours
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle size={16} className={isEarned ? 'text-emerald-400' : 'text-slate-500'} />
                    <span className={isEarned ? 'text-emerald-400' : 'text-slate-400'}>
                      Obtenir au moins 80% aux quiz
                    </span>
                  </div>
                </div>

                {isEarned && userCert ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">Numero de certificat</span>
                      <span className="font-mono text-white">{userCert.certificate_number}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">Obtenu le</span>
                      <span className="text-white">
                        {new Date(userCert.issued_at).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button className="flex-1 flex items-center justify-center gap-2 bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 py-2 rounded-lg font-medium transition-colors">
                        <Download size={16} />
                        Telecharger
                      </button>
                      <button className="flex-1 flex items-center justify-center gap-2 bg-slate-700 text-slate-300 hover:bg-slate-600 py-2 rounded-lg font-medium transition-colors">
                        <ExternalLink size={16} />
                        Partager
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="pt-2">
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full" style={{ width: '0%' }} />
                    </div>
                    <p className="text-xs text-slate-500 mt-2 text-center">Progression : 0%</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
