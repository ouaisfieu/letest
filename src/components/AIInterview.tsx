import { useState, useEffect } from 'react';
import { Bot, Send, ChevronRight, Loader2, MessageSquare, Star, TrendingUp, TrendingDown, Lightbulb } from 'lucide-react';

interface AIInterviewProps {
  jobTitle: string;
  onComplete: (scores: number[]) => void;
  onSkip: () => void;
}

interface Feedback {
  score: number;
  strengths: string[];
  improvements: string[];
  advice: string;
}

const FALLBACK_QUESTIONS: Record<string, string[]> = {
  'Developpeur Full Stack': [
    'Expliquez-moi comment vous aborderiez la conception d\'une nouvelle fonctionnalite.',
    'Comment assurez-vous la qualite de votre code ?',
    'Decrivez un projet technique dont vous etes particulierement fier.',
  ],
  'Chef de Projet Digital': [
    'Comment gerez-vous les conflits au sein d\'une equipe ?',
    'Decrivez votre approche pour prioriser les taches d\'un projet.',
    'Comment communiquez-vous avec des parties prenantes non techniques ?',
  ],
  'Data Analyst': [
    'Comment presentez-vous des donnees complexes a un public non technique ?',
    'Decrivez votre processus d\'analyse de donnees.',
    'Comment validez-vous la qualite de vos donnees ?',
  ],
  'UX/UI Designer': [
    'Comment integrez-vous les retours utilisateurs dans votre design ?',
    'Decrivez votre processus de design du debut a la fin.',
    'Comment equilibrez-vous esthetique et utilisabilite ?',
  ],
  'DevOps Engineer': [
    'Comment abordez-vous la securite dans vos pipelines CI/CD ?',
    'Decrivez une situation ou vous avez ameliore les performances d\'un systeme.',
    'Comment gerez-vous un incident en production ?',
  ],
  'default': [
    'Pourquoi souhaitez-vous ce poste ?',
    'Decrivez un projet dont vous etes particulierement fier.',
    'Comment gerez-vous le stress et les delais serres ?',
  ],
};

export function AIInterview({ jobTitle, onComplete, onSkip }: AIInterviewProps) {
  const [questions, setQuestions] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [scores, setScores] = useState<number[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);

  useEffect(() => {
    async function fetchQuestions() {
      try {
        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-assistant`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'interview', jobTitle }),
        });
        const data = await response.json();
        if (data.questions && data.questions.length > 0) {
          setQuestions(data.questions.slice(0, 3));
        } else {
          setQuestions(FALLBACK_QUESTIONS[jobTitle] || FALLBACK_QUESTIONS['default']);
        }
      } catch {
        setQuestions(FALLBACK_QUESTIONS[jobTitle] || FALLBACK_QUESTIONS['default']);
      }
      setLoadingQuestions(false);
    }
    fetchQuestions();
  }, [jobTitle]);

  const handleSubmit = async () => {
    if (!answer.trim() || loading) return;
    setLoading(true);
    setFeedback(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-assistant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'feedback',
          jobTitle,
          question: questions[currentIndex],
          answer: answer.trim(),
        }),
      });
      const data = await response.json();

      if (data.feedback) {
        setFeedback(data.feedback);
        setScores(prev => [...prev, data.feedback.score]);
      } else {
        const fallbackScore = Math.min(10, Math.max(5, Math.floor(answer.length / 50) + 5));
        setFeedback({
          score: fallbackScore,
          strengths: ['Reponse structuree', 'Effort de reflexion'],
          improvements: ['Ajoutez plus de details concrets', 'Donnez des exemples precis'],
          advice: 'Continuez a pratiquer vos reponses d\'entretien !',
        });
        setScores(prev => [...prev, fallbackScore]);
      }
      setShowFeedback(true);
    } catch {
      const fallbackScore = 6;
      setFeedback({
        score: fallbackScore,
        strengths: ['Bonne initiative'],
        improvements: ['Developpez davantage'],
        advice: 'La pratique mene a la perfection !',
      });
      setScores(prev => [...prev, fallbackScore]);
      setShowFeedback(true);
    }

    setLoading(false);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setAnswer('');
      setFeedback(null);
      setShowFeedback(false);
    } else {
      onComplete(scores);
    }
  };

  if (loadingQuestions) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl mb-4 animate-pulse">
            <Bot className="w-8 h-8 text-white" />
          </div>
          <p className="text-slate-400">Preparation de l'entretien IA...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl mb-4 shadow-lg shadow-blue-500/25">
            <Bot className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
            Simulation d'Entretien IA
          </h2>
          <p className="text-slate-400">
            Repondez aux questions comme lors d'un vrai entretien. L'IA analysera vos reponses.
          </p>
        </div>

        <div className="flex items-center gap-2 mb-6">
          {questions.map((_, i) => (
            <div
              key={i}
              className={`flex-1 h-2 rounded-full transition-all ${
                i < currentIndex
                  ? 'bg-emerald-500'
                  : i === currentIndex
                  ? 'bg-blue-500'
                  : 'bg-slate-700'
              }`}
            />
          ))}
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden">
          <div className="p-6 border-b border-slate-700/50">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <MessageSquare className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-blue-400 mb-1">Question {currentIndex + 1}/{questions.length}</p>
                <p className="text-lg text-white font-medium">{questions[currentIndex]}</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            {!showFeedback ? (
              <>
                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Tapez votre reponse ici... (minimum 50 caracteres recommandes)"
                  className="w-full h-40 px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  disabled={loading}
                />
                <div className="flex items-center justify-between mt-4">
                  <span className="text-xs text-slate-500">
                    {answer.length} caracteres
                  </span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={onSkip}
                      className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors"
                    >
                      Passer l'entretien
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={answer.length < 20 || loading}
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-medium rounded-xl hover:from-blue-600 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/25"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Analyse en cours...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Envoyer
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </>
            ) : feedback ? (
              <div className="space-y-6">
                <div className="flex items-center justify-center">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-slate-700/50 flex items-center justify-center">
                      <span className="text-4xl font-bold text-white">{feedback.score}</span>
                      <span className="text-lg text-slate-400">/10</span>
                    </div>
                    <div className="absolute -top-1 -right-1 w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center">
                      <Star className="w-4 h-4 text-white fill-white" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-emerald-400 mb-3">
                      <TrendingUp className="w-4 h-4" />
                      <span className="font-medium">Points forts</span>
                    </div>
                    <ul className="space-y-2">
                      {feedback.strengths.map((s, i) => (
                        <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                          <span className="text-emerald-400 mt-1">+</span>
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-amber-400 mb-3">
                      <TrendingDown className="w-4 h-4" />
                      <span className="font-medium">A ameliorer</span>
                    </div>
                    <ul className="space-y-2">
                      {feedback.improvements.map((s, i) => (
                        <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                          <span className="text-amber-400 mt-1">-</span>
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-blue-400 mb-2">
                    <Lightbulb className="w-4 h-4" />
                    <span className="font-medium">Conseil</span>
                  </div>
                  <p className="text-sm text-slate-300">{feedback.advice}</p>
                </div>

                <button
                  onClick={handleNext}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-medium rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all shadow-lg shadow-emerald-500/25"
                >
                  {currentIndex < questions.length - 1 ? (
                    <>
                      Question suivante
                      <ChevronRight className="w-4 h-4" />
                    </>
                  ) : (
                    'Voir mes resultats'
                  )}
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
