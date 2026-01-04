import { createContext, useContext, useReducer, ReactNode } from 'react';
import { GameState, UserSession, JobProfile, Challenge, SkillScore, Badge, Skill } from '../types';

type GameAction =
  | { type: 'SET_SESSION'; payload: UserSession }
  | { type: 'SET_JOB_PROFILE'; payload: JobProfile }
  | { type: 'SET_CHALLENGES'; payload: Challenge[] }
  | { type: 'COMPLETE_CHALLENGE'; payload: { challengeId: string; skillId: string; score: number; xp: number } }
  | { type: 'NEXT_CHALLENGE' }
  | { type: 'LEVEL_UP' }
  | { type: 'ADD_BADGE'; payload: Badge }
  | { type: 'SET_SKILL_SCORES'; payload: Record<string, SkillScore> }
  | { type: 'UPDATE_SKILL_SCORE'; payload: { skillId: string; score: number; skill: Skill; requiredLevel: number } }
  | { type: 'RESET_GAME' };

const initialState: GameState = {
  session: null,
  jobProfile: null,
  currentLevel: 1,
  currentChallengeIndex: 0,
  challenges: [],
  completedChallenges: [],
  skillScores: {},
  totalXP: 0,
  badges: [],
};

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SET_SESSION':
      return { ...state, session: action.payload };
    case 'SET_JOB_PROFILE':
      return { ...state, jobProfile: action.payload };
    case 'SET_CHALLENGES':
      return { ...state, challenges: action.payload, currentChallengeIndex: 0 };
    case 'COMPLETE_CHALLENGE': {
      const { challengeId, skillId, score, xp } = action.payload;
      const existingScore = state.skillScores[skillId];
      const newSkillScore: SkillScore = existingScore
        ? {
            ...existingScore,
            score: Math.round((existingScore.score * existingScore.challengesCompleted + score) / (existingScore.challengesCompleted + 1)),
            challengesCompleted: existingScore.challengesCompleted + 1,
          }
        : {
            skill: { id: skillId, name: '', category: 'technical', description: '' },
            score,
            requiredLevel: 0,
            challengesCompleted: 1,
          };
      return {
        ...state,
        completedChallenges: [...state.completedChallenges, challengeId],
        totalXP: state.totalXP + xp,
        skillScores: { ...state.skillScores, [skillId]: newSkillScore },
      };
    }
    case 'UPDATE_SKILL_SCORE': {
      const { skillId, score, skill, requiredLevel } = action.payload;
      const existingScore = state.skillScores[skillId];
      const newSkillScore: SkillScore = existingScore
        ? {
            ...existingScore,
            skill,
            requiredLevel,
            score: Math.round((existingScore.score * existingScore.challengesCompleted + score) / (existingScore.challengesCompleted + 1)),
            challengesCompleted: existingScore.challengesCompleted + 1,
          }
        : {
            skill,
            score,
            requiredLevel,
            challengesCompleted: 1,
          };
      return {
        ...state,
        skillScores: { ...state.skillScores, [skillId]: newSkillScore },
      };
    }
    case 'NEXT_CHALLENGE':
      return { ...state, currentChallengeIndex: state.currentChallengeIndex + 1 };
    case 'LEVEL_UP':
      return { ...state, currentLevel: state.currentLevel + 1 };
    case 'ADD_BADGE':
      return { ...state, badges: [...state.badges, action.payload] };
    case 'SET_SKILL_SCORES':
      return { ...state, skillScores: action.payload };
    case 'RESET_GAME':
      return initialState;
    default:
      return state;
  }
}

interface GameContextType {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  return <GameContext.Provider value={{ state, dispatch }}>{children}</GameContext.Provider>;
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
