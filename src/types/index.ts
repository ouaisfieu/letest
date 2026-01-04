export interface UserProfile {
  id: string;
  username: string;
  display_name: string;
  bio: string;
  avatar_config: AvatarConfig;
  association_name: string;
  association_role: string;
  city: string;
  interests: string[];
  current_level: number;
  total_xp: number;
  streak_days: number;
  last_activity_date: string;
  onboarding_completed: boolean;
  email_notifications: boolean;
  created_at: string;
  updated_at: string;
}

export interface AvatarConfig {
  skin: string;
  hair: string;
  accessory: string;
  background: string;
}

export interface LearningPath {
  id: string;
  slug: string;
  title: string;
  description: string;
  objectives: string[];
  icon: string;
  color: string;
  difficulty_level: number;
  estimated_hours: number;
  order_index: number;
  is_published: boolean;
  created_at: string;
  modules?: Module[];
  progress?: PathProgress;
}

export interface PathProgress {
  completedModules: number;
  totalModules: number;
  completedLessons: number;
  totalLessons: number;
  percentage: number;
}

export interface Module {
  id: string;
  learning_path_id: string;
  slug: string;
  title: string;
  description: string;
  learning_objectives: string[];
  icon: string;
  xp_reward: number;
  order_index: number;
  is_published: boolean;
  created_at: string;
  lessons?: Lesson[];
  progress?: ModuleProgress;
}

export interface ModuleProgress {
  completedLessons: number;
  totalLessons: number;
  percentage: number;
}

export interface Lesson {
  id: string;
  module_id: string;
  slug: string;
  title: string;
  content_type: 'article' | 'video' | 'interactive' | 'case_study';
  content: LessonContent;
  summary: string;
  key_takeaways: string[];
  xp_reward: number;
  estimated_minutes: number;
  order_index: number;
  is_published: boolean;
  created_at: string;
  resources?: LessonResource[];
  progress?: LessonProgress;
  quiz?: Quiz;
}

export interface LessonContent {
  sections?: ContentSection[];
  case?: CaseStudy;
  tools?: Tool[];
  exercise?: Exercise;
}

export interface ContentSection {
  title: string;
  content: string;
}

export interface CaseStudy {
  title: string;
  context: string;
  challenge: string;
  solution: string;
  results: string[];
  reflection_questions?: string[];
}

export interface Tool {
  name: string;
  description: string;
  link: string;
  tips: string[];
}

export interface Exercise {
  title: string;
  steps: string[];
}

export interface LessonResource {
  id: string;
  lesson_id: string;
  title: string;
  resource_type: 'pdf' | 'video' | 'link' | 'template' | 'tool';
  url: string;
  description: string;
  is_premium: boolean;
  order_index: number;
}

export interface LessonProgress {
  status: 'not_started' | 'in_progress' | 'completed';
  progress_percentage: number;
  time_spent_seconds: number;
  completed_at?: string;
}

export interface Competency {
  id: string;
  slug: string;
  name: string;
  category: 'veille' | 'analyse' | 'reseau' | 'strategie' | 'communication' | 'financement';
  description: string;
  icon: string;
  max_level: number;
}

export interface UserCompetency {
  id: string;
  user_id: string;
  competency_id: string;
  current_level: number;
  current_xp: number;
  xp_to_next_level: number;
  competency?: Competency;
}

export interface Achievement {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  category: 'learning' | 'community' | 'streak' | 'mastery' | 'special';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  xp_reward: number;
  unlock_condition: Record<string, unknown>;
  is_hidden: boolean;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  earned_at: string;
  achievement?: Achievement;
}

export interface Quiz {
  id: string;
  lesson_id: string;
  title: string;
  description: string;
  passing_score: number;
  time_limit_seconds?: number;
  max_attempts: number;
  xp_reward: number;
  questions?: QuizQuestion[];
}

export interface QuizQuestion {
  id: string;
  quiz_id: string;
  question_text: string;
  question_type: 'single' | 'multiple' | 'true_false' | 'open';
  options: string[];
  correct_answers: number[];
  explanation: string;
  points: number;
  order_index: number;
}

export interface UserQuizAttempt {
  id: string;
  user_id: string;
  quiz_id: string;
  score: number;
  answers: Record<string, unknown>;
  time_taken_seconds?: number;
  passed: boolean;
  attempted_at: string;
}

export interface DailyChallenge {
  id: string;
  challenge_date: string;
  title: string;
  description: string;
  challenge_type: 'quiz' | 'reading' | 'reflection' | 'action';
  content: Record<string, unknown>;
  xp_reward: number;
}

export interface UserDailyProgress {
  id: string;
  user_id: string;
  activity_date: string;
  xp_earned: number;
  lessons_completed: number;
  quizzes_passed: number;
  time_spent_minutes: number;
  daily_challenge_completed: boolean;
}

export interface DiscussionTopic {
  id: string;
  author_id: string;
  module_id?: string;
  title: string;
  content: string;
  tags: string[];
  is_pinned: boolean;
  is_locked: boolean;
  view_count: number;
  reply_count: number;
  last_activity_at: string;
  created_at: string;
  author?: UserProfile;
  replies?: DiscussionReply[];
}

export interface DiscussionReply {
  id: string;
  topic_id: string;
  author_id: string;
  parent_reply_id?: string;
  content: string;
  is_solution: boolean;
  upvotes: number;
  created_at: string;
  updated_at: string;
  author?: UserProfile;
}

export interface Certification {
  id: string;
  learning_path_id: string;
  name: string;
  description: string;
  requirements: Record<string, unknown>;
  badge_image_url?: string;
  is_active: boolean;
}

export interface UserCertification {
  id: string;
  user_id: string;
  certification_id: string;
  issued_at: string;
  certificate_number: string;
  certification?: Certification;
}

export interface UserNotification {
  id: string;
  user_id: string;
  notification_type: 'achievement' | 'level_up' | 'reply' | 'mention' | 'system';
  title: string;
  message: string;
  data: Record<string, unknown>;
  is_read: boolean;
  created_at: string;
}

export interface UserConnection {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
  follower?: UserProfile;
  following?: UserProfile;
}

export type Page =
  | 'home'
  | 'auth'
  | 'onboarding'
  | 'dashboard'
  | 'paths'
  | 'path-detail'
  | 'module-detail'
  | 'lesson'
  | 'quiz'
  | 'achievements'
  | 'profile'
  | 'community'
  | 'topic'
  | 'certifications'
  | 'settings'
  | 'games'
  | 'game-play'
  | 'admin';

export interface NavigationState {
  page: Page;
  pathId?: string;
  moduleId?: string;
  lessonId?: string;
  topicId?: string;
  collectionId?: string;
}

export interface GameType {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  min_players: number;
  max_players: number;
  avg_duration_minutes: number;
  is_active: boolean;
}

export interface GameCollection {
  id: string;
  game_type_id: string;
  module_id?: string;
  slug: string;
  title: string;
  description: string;
  cover_image_url?: string;
  difficulty_level: number;
  estimated_minutes: number;
  xp_reward: number;
  order_index: number;
  is_published: boolean;
  created_at: string;
  game_type?: GameType;
  cards_count?: number;
}

export interface FlashcardFrontContent {
  type: 'question';
  text: string;
  media?: string;
  formatting?: string;
}

export interface FlashcardBackContent {
  type: 'answer';
  text: string;
  explanation?: string;
  sources?: string[];
}

export interface MCQFrontContent {
  type: 'question';
  text: string;
  options: string[];
  correct_indices: number[];
  shuffle_options?: boolean;
}

export interface MCQBackContent {
  type: 'explanation';
  text: string;
  learn_more_url?: string;
}

export interface MatchingFrontContent {
  type: 'pairs';
  instruction: string;
  left_items: { id: string; text: string }[];
  right_items: { id: string; text: string }[];
  correct_pairs: Record<string, string>;
}

export interface GameCard {
  id: string;
  collection_id: string;
  card_type: 'flashcard' | 'mcq' | 'matching' | 'scenario';
  front_content: FlashcardFrontContent | MCQFrontContent | MatchingFrontContent;
  back_content: FlashcardBackContent | MCQBackContent | { type: string; text: string };
  hints: string[];
  tags: string[];
  difficulty: number;
  points: number;
  order_index: number;
  is_active: boolean;
}

export interface GameSession {
  id: string;
  user_id: string;
  collection_id: string;
  game_mode: 'practice' | 'timed' | 'challenge';
  started_at: string;
  completed_at?: string;
  score: number;
  max_score: number;
  cards_seen: number;
  cards_correct: number;
  time_spent_seconds: number;
  streak_count: number;
  session_data: Record<string, unknown>;
}

export interface CardResponse {
  id: string;
  session_id: string;
  card_id: string;
  user_answer: unknown;
  is_correct: boolean;
  response_time_ms: number;
  attempts: number;
  hint_used: boolean;
  answered_at: string;
}

export interface CardMastery {
  id: string;
  user_id: string;
  card_id: string;
  ease_factor: number;
  interval_days: number;
  repetitions: number;
  next_review_date: string;
  last_reviewed_at?: string;
  mastery_level: number;
  total_reviews: number;
  correct_reviews: number;
}

export interface WellnessSettings {
  id: string;
  user_id: string;
  daily_goal_minutes: number;
  session_limit_minutes: number;
  break_reminders_enabled: boolean;
  break_intensity: 'gentle' | 'medium' | 'strict';
  blink_reminders_enabled: boolean;
  night_mode_enabled: boolean;
  night_mode_start: string;
  night_mode_end: string;
  weekly_report_enabled: boolean;
}

export interface WellnessBreak {
  id: string;
  user_id: string;
  break_type: 'micro' | 'medium' | 'long' | 'blink';
  duration_seconds: number;
  completed: boolean;
  xp_earned: number;
  taken_at: string;
}

export interface GameSessionState {
  currentCardIndex: number;
  cards: GameCard[];
  answers: Map<string, { answer: unknown; correct: boolean; time: number }>;
  score: number;
  streak: number;
  startTime: number;
  isPaused: boolean;
}
