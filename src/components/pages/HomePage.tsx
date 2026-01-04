import { ArrowRight, BookOpen, Users, Award, TrendingUp, Shield, Lightbulb, Target } from 'lucide-react';

interface HomePageProps {
  onGetStarted: () => void;
  onSignIn: () => void;
}

export function HomePage({ onGetStarted, onSignIn }: HomePageProps) {
  const features = [
    {
      icon: BookOpen,
      title: 'Parcours Structures',
      description: 'Des formations progressives adaptees au secteur associatif',
    },
    {
      icon: Target,
      title: 'Competences Pratiques',
      description: 'Developpez des savoir-faire directement applicables',
    },
    {
      icon: Award,
      title: 'Certifications',
      description: 'Obtenez des badges et certifications reconnues',
    },
    {
      icon: Users,
      title: 'Communaute',
      description: 'Echangez avec d\'autres acteurs du monde associatif',
    },
  ];

  const paths = [
    {
      title: 'Fondamentaux de l\'IE',
      description: 'Maitrisez les bases de l\'intelligence economique',
      color: 'emerald',
      hours: 12,
    },
    {
      title: 'Construire son Reseau',
      description: 'Developpez des partenariats strategiques',
      color: 'blue',
      hours: 15,
    },
    {
      title: 'Financement Associatif',
      description: 'Diversifiez vos sources de revenus',
      color: 'amber',
      hours: 20,
    },
    {
      title: 'Influence et Plaidoyer',
      description: 'Faites entendre votre voix',
      color: 'rose',
      hours: 18,
    },
  ];

  const stats = [
    { value: '4', label: 'Parcours complets' },
    { value: '60+', label: 'Lecons interactives' },
    { value: '25+', label: 'Badges a debloquer' },
    { value: '18', label: 'Competences' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">IE</span>
              </div>
              <div>
                <h1 className="font-bold text-white">Intelligence Economique</h1>
                <p className="text-xs text-slate-400">Pour le secteur associatif</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={onSignIn}
                className="text-slate-300 hover:text-white transition-colors font-medium"
              >
                Connexion
              </button>
              <button
                onClick={onGetStarted}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Commencer
              </button>
            </div>
          </div>
        </div>
      </nav>

      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-2 mb-6">
            <Lightbulb size={16} className="text-emerald-400" />
            <span className="text-emerald-400 text-sm font-medium">Plateforme d'education populaire</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Maitrisez l'Intelligence
            <br />
            <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              Economique Associative
            </span>
          </h1>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Developpez vos competences strategiques pour faire grandir votre association.
            Apprenez a veiller, analyser, resauter et financer vos projets.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onGetStarted}
              className="group bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all flex items-center gap-2"
            >
              Commencer gratuitement
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="text-slate-300 hover:text-white px-8 py-4 rounded-xl font-medium transition-colors border border-slate-600 hover:border-slate-500">
              Decouvrir les parcours
            </button>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-slate-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-slate-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Une approche gamifiee de l'apprentissage</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Progressez a votre rythme grace a un systeme de niveaux, badges et defis quotidiens
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-emerald-500/50 transition-colors group"
                >
                  <div className="w-12 h-12 rounded-lg bg-emerald-500/20 flex items-center justify-center mb-4 group-hover:bg-emerald-500/30 transition-colors">
                    <Icon size={24} className="text-emerald-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-slate-400 text-sm">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-slate-800/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">4 Parcours pour transformer votre association</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Chaque parcours vous guide pas a pas vers la maitrise d'un aspect essentiel de l'IE
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {paths.map((path, index) => (
              <div
                key={index}
                className={`relative overflow-hidden rounded-xl p-6 border transition-all hover:scale-[1.02] cursor-pointer ${
                  path.color === 'emerald'
                    ? 'bg-emerald-500/10 border-emerald-500/30 hover:border-emerald-500/50'
                    : path.color === 'blue'
                    ? 'bg-blue-500/10 border-blue-500/30 hover:border-blue-500/50'
                    : path.color === 'amber'
                    ? 'bg-amber-500/10 border-amber-500/30 hover:border-amber-500/50'
                    : 'bg-rose-500/10 border-rose-500/30 hover:border-rose-500/50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">{path.title}</h3>
                    <p className="text-slate-400 mb-4">{path.description}</p>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-slate-500">{path.hours}h de formation</span>
                      <span className={`text-sm font-medium ${
                        path.color === 'emerald' ? 'text-emerald-400' :
                        path.color === 'blue' ? 'text-blue-400' :
                        path.color === 'amber' ? 'text-amber-400' : 'text-rose-400'
                      }`}>
                        Certification incluse
                      </span>
                    </div>
                  </div>
                  <ArrowRight className={`${
                    path.color === 'emerald' ? 'text-emerald-400' :
                    path.color === 'blue' ? 'text-blue-400' :
                    path.color === 'amber' ? 'text-amber-400' : 'text-rose-400'
                  }`} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-8 md:p-12 text-center">
            <Shield size={48} className="text-white/80 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-white mb-4">Pret a developper votre potentiel ?</h2>
            <p className="text-emerald-100 mb-8 max-w-xl mx-auto">
              Rejoignez une communaute d'acteurs associatifs engages et transformez votre approche strategique.
            </p>
            <button
              onClick={onGetStarted}
              className="bg-white text-emerald-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-emerald-50 transition-colors"
            >
              Creer mon compte gratuit
            </button>
          </div>
        </div>
      </section>

      <footer className="py-12 px-4 border-t border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">IE</span>
              </div>
              <span className="text-slate-400">Intelligence Economique Associative</span>
            </div>
            <p className="text-slate-500 text-sm">
              Plateforme d'education populaire - Tous droits reserves
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
