export interface JobProfile {
  id: string;
  name: string;
  description: string;
  icon: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  created_at: string;
}

export interface Skill {
  id: string;
  name: string;
  category: 'technical' | 'analytical' | 'communication' | 'leadership' | 'creative';
  description: string;
}

export interface JobProfileSkill {
  id: string;
  job_profile_id: string;
  skill_id: string;
  required_level: number;
  skills?: Skill;
}

export interface Question {
  question: string;
  options: string[];
  correct: number;
}

export interface ChallengeContent {
  questions?: Question[];
  scenario?: string;
  problem?: string;
  testCases?: { input: string; expected: string }[];
  hints?: string[];
}

export interface Challenge {
  id: string;
  skill_id: string;
  title: string;
  description: string;
  type: 'qcm' | 'coding' | 'scenario' | 'logic';
  difficulty: number;
  time_limit: number | null;
  xp_reward: number;
  content: ChallengeContent;
  skills?: Skill;
}

export interface UserSession {
  id: string;
  job_profile_id: string;
  username: string;
  current_level: number;
  total_xp: number;
  started_at: string;
  completed_at: string | null;
}

export interface UserResult {
  id: string;
  session_id: string;
  challenge_id: string;
  skill_id: string;
  score: number;
  time_taken: number;
  completed_at: string;
}

export interface SkillScore {
  skill: Skill;
  score: number;
  requiredLevel: number;
  challengesCompleted: number;
}

export interface GameState {
  session: UserSession | null;
  jobProfile: JobProfile | null;
  currentLevel: number;
  currentChallengeIndex: number;
  challenges: Challenge[];
  completedChallenges: string[];
  skillScores: Record<string, SkillScore>;
  totalXP: number;
  badges: Badge[];
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt?: string;
}
