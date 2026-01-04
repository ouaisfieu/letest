import { useState, useCallback } from 'react';
import { supabase } from './lib/supabase';
import { JobProfile, JobProfileSkill, Challenge, UserSession, SkillScore, Badge } from './types';
import { WelcomeScreen } from './components/WelcomeScreen';
import { JobSelection } from './components/JobSelection';
import { ChallengeScreen } from './components/ChallengeScreen';
import { ResultsScreen } from './components/ResultsScreen';
import { GameHeader } from './components/GameHeader';
import { BadgeModal } from './components/BadgeModal';
import { AIInterview } from './components/AIInterview';

type GameScreen = 'welcome' | 'job-selection' | 'challenge' | 'ai-interview' | 'results';

const BADGES: Badge[] = [
  { id: 'first-blood', name: 'Premier Sang', description: 'Completez votre premiere epreuve', icon: '🎯' },
  { id: 'perfect', name: 'Parfait', description: 'Obtenez 100% sur une epreuve', icon: '💯' },
  { id: 'speed-demon', name: 'Vitesse Eclair', description: 'Terminez une epreuve chronometree avec plus de 50% du temps restant', icon: '⚡' },
  { id: 'scholar', name: 'Erudit', description: 'Completez 5 epreuves', icon: '📚' },
  { id: 'master', name: 'Maitre', description: 'Obtenez plus de 80% de moyenne', icon: '🏆' },
  { id: 'completionist', name: 'Completiste', description: 'Terminez toutes les epreuves', icon: '🌟' },
  { id: 'communicator', name: 'Communicant', description: 'Terminez la simulation d\'entretien IA', icon: '🗣️' },
  { id: 'star-interview', name: 'Star de l\'Entretien', description: 'Obtenez 8+/10 sur une question d\'entretien', icon: '✨' },
];

function App() {
  const [screen, setScreen] = useState<GameScreen>('welcome');
  const [username, setUsername] = useState('');
  const [jobProfile, setJobProfile] = useState<JobProfile | null>(null);
  const [profileSkills, setProfileSkills] = useState<JobProfileSkill[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0);
  const [session, setSession] = useState<UserSession | null>(null);
  const [skillScores, setSkillScores] = useState<Record<string, SkillScore>>({});
  const [totalXP, setTotalXP] = useState(0);
  const [level, setLevel] = useState(1);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [totalTime, setTotalTime] = useState(0);
  const [pendingBadge, setPendingBadge] = useState<Badge | null>(null);
  const [completedChallenges, setCompletedChallenges] = useState<string[]>([]);

  const awardBadge = useCallback((badgeId: string) => {
    const badge = BADGES.find(b => b.id === badgeId);
    if (badge && !badges.find(b => b.id === badgeId)) {
      const newBadge = { ...badge, earnedAt: new Date().toISOString() };
      setBadges(prev => [...prev, newBadge]);
      setPendingBadge(newBadge);
    }
  }, [badges]);

  const handleStart = async (name: string) => {
    setUsername(name);
    setScreen('job-selection');
  };

  const handleJobSelect = async (profile: JobProfile, skills: JobProfileSkill[]) => {
    setJobProfile(profile);
    setProfileSkills(skills);

    const skillIds = skills.map(s => s.skill_id);
    const { data: challengesData } = await supabase
      .from('challenges')
      .select('*, skills(*)')
      .in('skill_id', skillIds)
      .order('difficulty', { ascending: true });

    if (challengesData) {
      const sortedChallenges = challengesData.sort((a, b) => {
        if (a.difficulty !== b.difficulty) return a.difficulty - b.difficulty;
        return (a.time_limit || 0) - (b.time_limit || 0);
      });
      setChallenges(sortedChallenges);
    }

    const initialSkillScores: Record<string, SkillScore> = {};
    for (const ps of skills) {
      if (ps.skills) {
        initialSkillScores[ps.skill_id] = {
          skill: ps.skills,
          score: 0,
          requiredLevel: ps.required_level,
          challengesCompleted: 0,
        };
      }
    }
    setSkillScores(initialSkillScores);

    const { data: sessionData } = await supabase
      .from('user_sessions')
      .insert({
        job_profile_id: profile.id,
        username: username,
        current_level: 1,
        total_xp: 0,
      })
      .select()
      .single();

    if (sessionData) {
      setSession(sessionData);
    }

    setCurrentChallengeIndex(0);
    setScreen('challenge');
  };

  const handleChallengeComplete = async (score: number, timeTaken: number) => {
    const challenge = challenges[currentChallengeIndex];
    if (!challenge || !session) return;

    const xpEarned = Math.round(challenge.xp_reward * (score / 100));
    const newTotalXP = totalXP + xpEarned;
    setTotalXP(newTotalXP);
    setTotalTime(prev => prev + timeTaken);
    setCompletedChallenges(prev => [...prev, challenge.id]);

    const newLevel = Math.floor(newTotalXP / 500) + 1;
    if (newLevel > level) {
      setLevel(newLevel);
    }

    const existingScore = skillScores[challenge.skill_id];
    const newScore = existingScore
      ? Math.round((existingScore.score * existingScore.challengesCompleted + score) / (existingScore.challengesCompleted + 1))
      : score;

    setSkillScores(prev => ({
      ...prev,
      [challenge.skill_id]: {
        ...prev[challenge.skill_id],
        score: newScore,
        challengesCompleted: (prev[challenge.skill_id]?.challengesCompleted || 0) + 1,
      },
    }));

    await supabase.from('user_results').insert({
      session_id: session.id,
      challenge_id: challenge.id,
      skill_id: challenge.skill_id,
      score,
      time_taken: timeTaken,
    });

    await supabase
      .from('user_sessions')
      .update({ total_xp: newTotalXP, current_level: newLevel })
      .eq('id', session.id);

    if (completedChallenges.length === 0) {
      awardBadge('first-blood');
    }
    if (score === 100) {
      awardBadge('perfect');
    }
    if (challenge.time_limit && timeTaken < challenge.time_limit * 0.5) {
      awardBadge('speed-demon');
    }
    if (completedChallenges.length + 1 === 5) {
      awardBadge('scholar');
    }

    if (currentChallengeIndex < challenges.length - 1) {
      setCurrentChallengeIndex(prev => prev + 1);
    } else {
      const avgScore = Object.values(skillScores).reduce((sum, s) => sum + s.score, 0) / Object.keys(skillScores).length;
      if (avgScore >= 80) {
        awardBadge('master');
      }
      awardBadge('completionist');
      setScreen('ai-interview');
    }
  };

  const handleInterviewComplete = async (interviewScores: number[]) => {
    awardBadge('communicator');
    if (interviewScores.some(score => score >= 8)) {
      awardBadge('star-interview');
    }

    if (session) {
      await supabase
        .from('user_sessions')
        .update({ completed_at: new Date().toISOString() })
        .eq('id', session.id);
    }

    setScreen('results');
  };

  const handleSkipInterview = async () => {
    if (session) {
      await supabase
        .from('user_sessions')
        .update({ completed_at: new Date().toISOString() })
        .eq('id', session.id);
    }
    setScreen('results');
  };

  const handleRestart = () => {
    setScreen('welcome');
    setUsername('');
    setJobProfile(null);
    setProfileSkills([]);
    setChallenges([]);
    setCurrentChallengeIndex(0);
    setSession(null);
    setSkillScores({});
    setTotalXP(0);
    setLevel(1);
    setBadges([]);
    setTotalTime(0);
    setCompletedChallenges([]);
  };

  const skillScoresArray: SkillScore[] = Object.values(skillScores).filter(s => s.challengesCompleted > 0);

  return (
    <div className="min-h-screen bg-slate-900">
      {screen === 'welcome' && <WelcomeScreen onStart={handleStart} />}
      {screen === 'job-selection' && <JobSelection onSelect={handleJobSelect} />}
      {screen === 'challenge' && challenges[currentChallengeIndex] && (
        <>
          <GameHeader
            username={username}
            level={level}
            xp={totalXP}
            jobTitle={jobProfile?.name || ''}
          />
          <div className="pt-20">
            <ChallengeScreen
              challenge={challenges[currentChallengeIndex]}
              onComplete={handleChallengeComplete}
              level={level}
              totalChallenges={challenges.length}
              currentIndex={currentChallengeIndex}
            />
          </div>
        </>
      )}
      {screen === 'ai-interview' && jobProfile && (
        <AIInterview
          jobTitle={jobProfile.name}
          onComplete={handleInterviewComplete}
          onSkip={handleSkipInterview}
        />
      )}
      {screen === 'results' && jobProfile && (
        <ResultsScreen
          jobProfile={jobProfile}
          username={username}
          skillScores={skillScoresArray}
          totalXP={totalXP}
          badges={badges}
          totalTime={totalTime}
          onRestart={handleRestart}
        />
      )}
      {pendingBadge && (
        <BadgeModal badge={pendingBadge} onClose={() => setPendingBadge(null)} />
      )}
    </div>
  );
}

export default App;
