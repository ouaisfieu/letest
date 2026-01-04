import { Trophy, Download, RotateCcw, Star, Target, Clock, Zap, Award, CheckCircle } from 'lucide-react';
import { JobProfile, SkillScore, Badge } from '../types';
import { SkillRadar } from './SkillRadar';
import { AICareerAdvisor } from './AICareerAdvisor';

interface ResultsScreenProps {
  jobProfile: JobProfile;
  username: string;
  skillScores: SkillScore[];
  totalXP: number;
  badges: Badge[];
  totalTime: number;
  onRestart: () => void;
}

export function ResultsScreen({
  jobProfile,
  username,
  skillScores,
  totalXP,
  badges,
  totalTime,
  onRestart,
}: ResultsScreenProps) {
  const averageScore = skillScores.length > 0
    ? Math.round(skillScores.reduce((sum, s) => sum + s.score, 0) / skillScores.length)
    : 0;

  const matchPercentage = skillScores.length > 0
    ? Math.round(
        skillScores.reduce((sum, s) => {
          const match = Math.min(100, (s.score / s.requiredLevel) * 100);
          return sum + match;
        }, 0) / skillScores.length
      )
    : 0;

  const getGrade = (score: number) => {
    if (score >= 90) return { grade: 'A+', color: 'text-emerald-400', message: 'Exceptionnel !' };
    if (score >= 80) return { grade: 'A', color: 'text-emerald-400', message: 'Excellent !' };
    if (score >= 70) return { grade: 'B', color: 'text-blue-400', message: 'Tres bien !' };
    if (score >= 60) return { grade: 'C', color: 'text-amber-400', message: 'Bien !' };
    if (score >= 50) return { grade: 'D', color: 'text-orange-400', message: 'Peut mieux faire' };
    return { grade: 'E', color: 'text-rose-400', message: 'A ameliorer' };
  };

  const gradeInfo = getGrade(averageScore);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const exportToHTML = () => {
    const currentDate = new Date().toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const skillsHTML = skillScores
      .map(
        (s) => `
        <div class="skill-item">
          <div class="skill-header">
            <span class="skill-name">${s.skill.name}</span>
            <span class="skill-score">${s.score}%</span>
          </div>
          <div class="skill-bar-bg">
            <div class="skill-bar" style="width: ${s.score}%"></div>
            <div class="required-marker" style="left: ${s.requiredLevel}%"></div>
          </div>
          <div class="skill-meta">
            <span>Requis: ${s.requiredLevel}%</span>
            <span class="${s.score >= s.requiredLevel ? 'status-ok' : 'status-warn'}">${s.score >= s.requiredLevel ? 'Atteint' : 'A developper'}</span>
          </div>
        </div>
      `
      )
      .join('');

    const badgesHTML = badges
      .map(
        (b) => `
        <div class="badge">
          <span class="badge-icon">${b.icon}</span>
          <span class="badge-name">${b.name}</span>
        </div>
      `
      )
      .join('');

    const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Resultats - ${username} - ${jobProfile.name}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      min-height: 100vh;
      padding: 40px 20px;
      color: #e2e8f0;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
    }
    .header {
      text-align: center;
      margin-bottom: 40px;
    }
    .logo {
      width: 60px;
      height: 60px;
      background: linear-gradient(135deg, #10b981, #14b8a6);
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 20px;
      font-size: 24px;
    }
    h1 {
      font-size: 28px;
      margin-bottom: 8px;
    }
    .subtitle {
      color: #94a3b8;
      font-size: 16px;
    }
    .card {
      background: rgba(30, 41, 59, 0.5);
      border: 1px solid rgba(71, 85, 105, 0.5);
      border-radius: 16px;
      padding: 24px;
      margin-bottom: 20px;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      margin-bottom: 30px;
    }
    .stat-card {
      background: rgba(51, 65, 85, 0.3);
      border-radius: 12px;
      padding: 16px;
      text-align: center;
    }
    .stat-value {
      font-size: 28px;
      font-weight: bold;
      color: #10b981;
    }
    .stat-label {
      font-size: 12px;
      color: #94a3b8;
      margin-top: 4px;
    }
    .grade-section {
      text-align: center;
      padding: 30px;
      background: rgba(16, 185, 129, 0.1);
      border-radius: 16px;
      margin-bottom: 30px;
    }
    .grade {
      font-size: 64px;
      font-weight: bold;
      color: #10b981;
    }
    .grade-message {
      font-size: 18px;
      color: #94a3b8;
    }
    .section-title {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .skill-item {
      margin-bottom: 16px;
    }
    .skill-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
    }
    .skill-name {
      font-weight: 500;
    }
    .skill-score {
      color: #10b981;
      font-weight: 600;
    }
    .skill-bar-bg {
      height: 8px;
      background: #334155;
      border-radius: 4px;
      position: relative;
      overflow: visible;
    }
    .skill-bar {
      height: 100%;
      background: linear-gradient(90deg, #10b981, #14b8a6);
      border-radius: 4px;
      transition: width 0.5s;
    }
    .required-marker {
      position: absolute;
      top: -4px;
      width: 2px;
      height: 16px;
      background: #f59e0b;
      border-radius: 1px;
    }
    .skill-meta {
      display: flex;
      justify-content: space-between;
      font-size: 11px;
      color: #64748b;
      margin-top: 4px;
    }
    .status-ok { color: #10b981; }
    .status-warn { color: #f59e0b; }
    .badges-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
    }
    .badge {
      display: flex;
      align-items: center;
      gap: 8px;
      background: rgba(51, 65, 85, 0.5);
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 14px;
    }
    .badge-icon {
      font-size: 16px;
    }
    .footer {
      text-align: center;
      margin-top: 40px;
      color: #64748b;
      font-size: 12px;
    }
    .job-badge {
      display: inline-block;
      background: linear-gradient(135deg, #10b981, #14b8a6);
      color: white;
      padding: 8px 20px;
      border-radius: 20px;
      font-weight: 500;
      margin-top: 16px;
    }
    @media (max-width: 600px) {
      .stats-grid { grid-template-columns: repeat(2, 1fr); }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">&#127942;</div>
      <h1>Resultats du Test de Recrutement</h1>
      <p class="subtitle">${currentDate}</p>
      <div class="job-badge">${jobProfile.name}</div>
    </div>

    <div class="card">
      <div class="section-title">&#128100; Candidat: ${username}</div>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-value">${averageScore}%</div>
        <div class="stat-label">Score moyen</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${matchPercentage}%</div>
        <div class="stat-label">Adequation</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${totalXP}</div>
        <div class="stat-label">XP Total</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${formatTime(totalTime)}</div>
        <div class="stat-label">Temps total</div>
      </div>
    </div>

    <div class="grade-section">
      <div class="grade">${gradeInfo.grade}</div>
      <div class="grade-message">${gradeInfo.message}</div>
    </div>

    <div class="card">
      <div class="section-title">&#127919; Competences evaluees</div>
      ${skillsHTML}
    </div>

    ${badges.length > 0 ? `
    <div class="card">
      <div class="section-title">&#127941; Badges obtenus</div>
      <div class="badges-grid">${badgesHTML}</div>
    </div>
    ` : ''}

    <div class="footer">
      <p>Genere par le Simulateur de Recrutement</p>
      <p>Ce rapport est un outil d'evaluation et ne constitue pas une garantie d'emploi.</p>
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `resultats-${username.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl mb-6 shadow-lg shadow-amber-500/25">
            <Trophy className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Felicitations, {username} !
          </h1>
          <p className="text-slate-400">
            Vous avez termine le parcours {jobProfile.name}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50 text-center">
            <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Target className="w-5 h-5 text-emerald-400" />
            </div>
            <p className="text-2xl font-bold text-white">{averageScore}%</p>
            <p className="text-xs text-slate-400">Score moyen</p>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50 text-center">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
              <CheckCircle className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-2xl font-bold text-white">{matchPercentage}%</p>
            <p className="text-xs text-slate-400">Adequation</p>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50 text-center">
            <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Zap className="w-5 h-5 text-amber-400" />
            </div>
            <p className="text-2xl font-bold text-white">{totalXP}</p>
            <p className="text-xs text-slate-400">XP Total</p>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50 text-center">
            <div className="w-10 h-10 bg-rose-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Clock className="w-5 h-5 text-rose-400" />
            </div>
            <p className="text-2xl font-bold text-white">{formatTime(totalTime)}</p>
            <p className="text-xs text-slate-400">Temps total</p>
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6 mb-6 text-center">
          <p className="text-slate-400 mb-2">Votre note globale</p>
          <p className={`text-6xl font-bold ${gradeInfo.color} mb-2`}>{gradeInfo.grade}</p>
          <p className="text-lg text-white">{gradeInfo.message}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <Target className="w-5 h-5 text-emerald-400" />
              Radar des competences
            </h3>
            {skillScores.length > 0 && <SkillRadar skills={skillScores} size={280} />}
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-400" />
              Detail des competences
            </h3>
            <div className="space-y-4">
              {skillScores.map((s) => (
                <div key={s.skill.id}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-slate-300">{s.skill.name}</span>
                    <span className={`text-sm font-medium ${s.score >= s.requiredLevel ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {s.score}%
                    </span>
                  </div>
                  <div className="relative h-2 bg-slate-700 rounded-full">
                    <div
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
                      style={{ width: `${s.score}%` }}
                    />
                    <div
                      className="absolute top-[-2px] w-0.5 h-3 bg-amber-400 rounded-full"
                      style={{ left: `${s.requiredLevel}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-slate-500">Requis: {s.requiredLevel}%</span>
                    <span className={`text-xs ${s.score >= s.requiredLevel ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {s.score >= s.requiredLevel ? 'Atteint' : 'A developper'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {badges.length > 0 && (
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6 mb-8">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              Badges obtenus
            </h3>
            <div className="flex flex-wrap gap-3">
              {badges.map((badge) => (
                <div
                  key={badge.id}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 rounded-full border border-slate-600"
                >
                  <span className="text-lg">{badge.icon}</span>
                  <span className="text-sm text-white font-medium">{badge.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mb-8">
          <AICareerAdvisor
            jobTitle={jobProfile.name}
            username={username}
            skills={skillScores}
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={exportToHTML}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-medium rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all shadow-lg shadow-emerald-500/25"
          >
            <Download className="w-5 h-5" />
            Exporter en HTML
          </button>
          <button
            onClick={onRestart}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-700 text-white font-medium rounded-xl hover:bg-slate-600 transition-all"
          >
            <RotateCcw className="w-5 h-5" />
            Nouveau test
          </button>
        </div>
      </div>
    </div>
  );
}
