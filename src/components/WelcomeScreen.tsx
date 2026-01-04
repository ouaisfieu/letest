import { useState } from 'react';
import { Sparkles, Award, Target, Zap } from 'lucide-react';

interface WelcomeScreenProps {
  onStart: (username: string) => void;
}

export function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim().length < 2) {
      setError('Le nom doit contenir au moins 2 caracteres');
      return;
    }
    onStart(username.trim());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl mb-6 shadow-lg shadow-emerald-500/25">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Simulateur de Recrutement
          </h1>
          <p className="text-lg text-slate-400 max-w-xl mx-auto">
            Testez vos competences, progressez par niveaux et decouvrez votre profil professionnel ideal
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-5 border border-slate-700/50">
            <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center mb-3">
              <Target className="w-5 h-5 text-amber-400" />
            </div>
            <h3 className="font-semibold text-white mb-1">5 Metiers</h3>
            <p className="text-sm text-slate-400">Choisissez votre orientation professionnelle</p>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-5 border border-slate-700/50">
            <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center mb-3">
              <Zap className="w-5 h-5 text-emerald-400" />
            </div>
            <h3 className="font-semibold text-white mb-1">20+ Epreuves</h3>
            <p className="text-sm text-slate-400">QCM, scenarios, logique et plus</p>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-5 border border-slate-700/50">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center mb-3">
              <Award className="w-5 h-5 text-blue-400" />
            </div>
            <h3 className="font-semibold text-white mb-1">Badges & XP</h3>
            <p className="text-sm text-slate-400">Gagnez des recompenses en progressant</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50">
          <label htmlFor="username" className="block text-sm font-medium text-slate-300 mb-2">
            Comment vous appelez-vous ?
          </label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              setError('');
            }}
            placeholder="Entrez votre nom ou pseudo"
            className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
          />
          {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
          <button
            type="submit"
            className="w-full mt-6 px-6 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40"
          >
            Commencer l'aventure
          </button>
        </form>
      </div>
    </div>
  );
}
