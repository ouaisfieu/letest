/*
  # Plateforme d'Intelligence Economique pour le Secteur Associatif (v2)
  
  Migration corrigee avec ordre de creation des tables respecte.
*/

-- =====================================================
-- 1. GESTION DES UTILISATEURS
-- =====================================================

CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  display_name text NOT NULL,
  bio text DEFAULT '',
  avatar_config jsonb DEFAULT '{"skin": "default", "hair": "short", "accessory": "none", "background": "blue"}',
  association_name text DEFAULT '',
  association_role text DEFAULT '',
  city text DEFAULT '',
  interests text[] DEFAULT '{}',
  current_level integer DEFAULT 1,
  total_xp integer DEFAULT 0,
  streak_days integer DEFAULT 0,
  last_activity_date date DEFAULT CURRENT_DATE,
  onboarding_completed boolean DEFAULT false,
  email_notifications boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- =====================================================
-- 2. PARCOURS D'APPRENTISSAGE
-- =====================================================

CREATE TABLE IF NOT EXISTS learning_paths (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  objectives text[] NOT NULL DEFAULT '{}',
  icon text NOT NULL DEFAULT 'book',
  color text NOT NULL DEFAULT 'emerald',
  difficulty_level integer NOT NULL DEFAULT 1 CHECK (difficulty_level BETWEEN 1 AND 5),
  estimated_hours integer NOT NULL DEFAULT 10,
  order_index integer NOT NULL DEFAULT 0,
  is_published boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE learning_paths ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published paths"
  ON learning_paths FOR SELECT
  TO authenticated
  USING (is_published = true);

-- =====================================================
-- 3. MODULES DE FORMATION
-- =====================================================

CREATE TABLE IF NOT EXISTS modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  learning_path_id uuid REFERENCES learning_paths(id) ON DELETE CASCADE,
  slug text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  learning_objectives text[] NOT NULL DEFAULT '{}',
  icon text NOT NULL DEFAULT 'folder',
  xp_reward integer NOT NULL DEFAULT 100,
  order_index integer NOT NULL DEFAULT 0,
  is_published boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE(learning_path_id, slug)
);

ALTER TABLE modules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published modules"
  ON modules FOR SELECT
  TO authenticated
  USING (is_published = true);

-- =====================================================
-- 4. LECONS
-- =====================================================

CREATE TABLE IF NOT EXISTS lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id uuid REFERENCES modules(id) ON DELETE CASCADE,
  slug text NOT NULL,
  title text NOT NULL,
  content_type text NOT NULL DEFAULT 'article' CHECK (content_type IN ('article', 'video', 'interactive', 'case_study')),
  content jsonb NOT NULL DEFAULT '{}',
  summary text NOT NULL DEFAULT '',
  key_takeaways text[] NOT NULL DEFAULT '{}',
  xp_reward integer NOT NULL DEFAULT 25,
  estimated_minutes integer NOT NULL DEFAULT 10,
  order_index integer NOT NULL DEFAULT 0,
  is_published boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE(module_id, slug)
);

ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published lessons"
  ON lessons FOR SELECT
  TO authenticated
  USING (is_published = true);

-- =====================================================
-- 5. RESSOURCES COMPLEMENTAIRES
-- =====================================================

CREATE TABLE IF NOT EXISTS lesson_resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id uuid REFERENCES lessons(id) ON DELETE CASCADE,
  title text NOT NULL,
  resource_type text NOT NULL CHECK (resource_type IN ('pdf', 'video', 'link', 'template', 'tool')),
  url text NOT NULL,
  description text DEFAULT '',
  is_premium boolean DEFAULT false,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE lesson_resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view resources"
  ON lesson_resources FOR SELECT
  TO authenticated
  USING (true);

-- =====================================================
-- 6. COMPETENCES
-- =====================================================

CREATE TABLE IF NOT EXISTS competencies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  category text NOT NULL CHECK (category IN ('veille', 'analyse', 'reseau', 'strategie', 'communication', 'financement')),
  description text NOT NULL,
  icon text NOT NULL DEFAULT 'star',
  max_level integer NOT NULL DEFAULT 10,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE competencies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view competencies"
  ON competencies FOR SELECT
  TO authenticated
  USING (true);

-- =====================================================
-- 7. PROGRESSION DES COMPETENCES UTILISATEUR
-- =====================================================

CREATE TABLE IF NOT EXISTS user_competencies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  competency_id uuid REFERENCES competencies(id) ON DELETE CASCADE,
  current_level integer NOT NULL DEFAULT 0,
  current_xp integer NOT NULL DEFAULT 0,
  xp_to_next_level integer NOT NULL DEFAULT 100,
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, competency_id)
);

ALTER TABLE user_competencies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own competencies"
  ON user_competencies FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own competencies"
  ON user_competencies FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert own competencies"
  ON user_competencies FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- 8. PROGRESSION DES LECONS
-- =====================================================

CREATE TABLE IF NOT EXISTS user_lesson_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  lesson_id uuid REFERENCES lessons(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  progress_percentage integer NOT NULL DEFAULT 0 CHECK (progress_percentage BETWEEN 0 AND 100),
  time_spent_seconds integer NOT NULL DEFAULT 0,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);

ALTER TABLE user_lesson_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own progress"
  ON user_lesson_progress FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON user_lesson_progress FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
  ON user_lesson_progress FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- 9. BADGES ET ACCOMPLISSEMENTS
-- =====================================================

CREATE TABLE IF NOT EXISTS achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL,
  category text NOT NULL CHECK (category IN ('learning', 'community', 'streak', 'mastery', 'special')),
  rarity text NOT NULL DEFAULT 'common' CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  xp_reward integer NOT NULL DEFAULT 50,
  unlock_condition jsonb NOT NULL DEFAULT '{}',
  is_hidden boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 10. BADGES UTILISATEUR
-- =====================================================

CREATE TABLE IF NOT EXISTS user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  achievement_id uuid REFERENCES achievements(id) ON DELETE CASCADE,
  earned_at timestamptz DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own achievements"
  ON user_achievements FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements"
  ON user_achievements FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy pour achievements avec reference a user_achievements
CREATE POLICY "Anyone can view non-hidden achievements"
  ON achievements FOR SELECT
  TO authenticated
  USING (is_hidden = false OR EXISTS (
    SELECT 1 FROM user_achievements ua WHERE ua.achievement_id = achievements.id AND ua.user_id = auth.uid()
  ));

-- =====================================================
-- 11. QUIZ
-- =====================================================

CREATE TABLE IF NOT EXISTS quizzes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id uuid REFERENCES lessons(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text DEFAULT '',
  passing_score integer NOT NULL DEFAULT 70 CHECK (passing_score BETWEEN 0 AND 100),
  time_limit_seconds integer,
  max_attempts integer DEFAULT 3,
  xp_reward integer NOT NULL DEFAULT 50,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view quizzes"
  ON quizzes FOR SELECT
  TO authenticated
  USING (true);

-- =====================================================
-- 12. QUESTIONS DE QUIZ
-- =====================================================

CREATE TABLE IF NOT EXISTS quiz_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid REFERENCES quizzes(id) ON DELETE CASCADE,
  question_text text NOT NULL,
  question_type text NOT NULL DEFAULT 'single' CHECK (question_type IN ('single', 'multiple', 'true_false', 'open')),
  options jsonb NOT NULL DEFAULT '[]',
  correct_answers jsonb NOT NULL DEFAULT '[]',
  explanation text DEFAULT '',
  points integer NOT NULL DEFAULT 10,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view questions"
  ON quiz_questions FOR SELECT
  TO authenticated
  USING (true);

-- =====================================================
-- 13. TENTATIVES DE QUIZ
-- =====================================================

CREATE TABLE IF NOT EXISTS user_quiz_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  quiz_id uuid REFERENCES quizzes(id) ON DELETE CASCADE,
  score integer NOT NULL CHECK (score BETWEEN 0 AND 100),
  answers jsonb NOT NULL DEFAULT '{}',
  time_taken_seconds integer,
  passed boolean NOT NULL DEFAULT false,
  attempted_at timestamptz DEFAULT now()
);

ALTER TABLE user_quiz_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own attempts"
  ON user_quiz_attempts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own attempts"
  ON user_quiz_attempts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- 14. DEFIS QUOTIDIENS
-- =====================================================

CREATE TABLE IF NOT EXISTS daily_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_date date NOT NULL DEFAULT CURRENT_DATE,
  title text NOT NULL,
  description text NOT NULL,
  challenge_type text NOT NULL CHECK (challenge_type IN ('quiz', 'reading', 'reflection', 'action')),
  content jsonb NOT NULL DEFAULT '{}',
  xp_reward integer NOT NULL DEFAULT 30,
  created_at timestamptz DEFAULT now(),
  UNIQUE(challenge_date)
);

ALTER TABLE daily_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view daily challenges"
  ON daily_challenges FOR SELECT
  TO authenticated
  USING (challenge_date <= CURRENT_DATE);

-- =====================================================
-- 15. PROGRESSION QUOTIDIENNE
-- =====================================================

CREATE TABLE IF NOT EXISTS user_daily_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  activity_date date NOT NULL DEFAULT CURRENT_DATE,
  xp_earned integer NOT NULL DEFAULT 0,
  lessons_completed integer NOT NULL DEFAULT 0,
  quizzes_passed integer NOT NULL DEFAULT 0,
  time_spent_minutes integer NOT NULL DEFAULT 0,
  daily_challenge_completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, activity_date)
);

ALTER TABLE user_daily_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own daily progress"
  ON user_daily_progress FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own daily progress"
  ON user_daily_progress FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert own daily progress"
  ON user_daily_progress FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- 16. DISCUSSIONS COMMUNAUTAIRES
-- =====================================================

CREATE TABLE IF NOT EXISTS discussion_topics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid REFERENCES user_profiles(id) ON DELETE SET NULL,
  module_id uuid REFERENCES modules(id) ON DELETE SET NULL,
  title text NOT NULL,
  content text NOT NULL,
  tags text[] DEFAULT '{}',
  is_pinned boolean DEFAULT false,
  is_locked boolean DEFAULT false,
  view_count integer DEFAULT 0,
  reply_count integer DEFAULT 0,
  last_activity_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE discussion_topics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view topics"
  ON discussion_topics FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create topics"
  ON discussion_topics FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update own topics"
  ON discussion_topics FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

-- =====================================================
-- 17. REPONSES AUX DISCUSSIONS
-- =====================================================

CREATE TABLE IF NOT EXISTS discussion_replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id uuid REFERENCES discussion_topics(id) ON DELETE CASCADE,
  author_id uuid REFERENCES user_profiles(id) ON DELETE SET NULL,
  parent_reply_id uuid REFERENCES discussion_replies(id) ON DELETE CASCADE,
  content text NOT NULL,
  is_solution boolean DEFAULT false,
  upvotes integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE discussion_replies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view replies"
  ON discussion_replies FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create replies"
  ON discussion_replies FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update own replies"
  ON discussion_replies FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

-- =====================================================
-- 18. CONNEXIONS ENTRE UTILISATEURS
-- =====================================================

CREATE TABLE IF NOT EXISTS user_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  following_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

ALTER TABLE user_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view connections"
  ON user_connections FOR SELECT
  TO authenticated
  USING (auth.uid() = follower_id OR auth.uid() = following_id);

CREATE POLICY "Users can create connections"
  ON user_connections FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can delete own connections"
  ON user_connections FOR DELETE
  TO authenticated
  USING (auth.uid() = follower_id);

-- =====================================================
-- 19. CERTIFICATIONS
-- =====================================================

CREATE TABLE IF NOT EXISTS certifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  learning_path_id uuid REFERENCES learning_paths(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text NOT NULL,
  requirements jsonb NOT NULL DEFAULT '{}',
  badge_image_url text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE certifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view certifications"
  ON certifications FOR SELECT
  TO authenticated
  USING (is_active = true);

-- =====================================================
-- 20. CERTIFICATIONS UTILISATEUR
-- =====================================================

CREATE TABLE IF NOT EXISTS user_certifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  certification_id uuid REFERENCES certifications(id) ON DELETE CASCADE,
  issued_at timestamptz DEFAULT now(),
  certificate_number text UNIQUE NOT NULL,
  UNIQUE(user_id, certification_id)
);

ALTER TABLE user_certifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view user certifications"
  ON user_certifications FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can receive certifications"
  ON user_certifications FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- 21. NOTIFICATIONS
-- =====================================================

CREATE TABLE IF NOT EXISTS user_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  notification_type text NOT NULL CHECK (notification_type IN ('achievement', 'level_up', 'reply', 'mention', 'system')),
  title text NOT NULL,
  message text NOT NULL,
  data jsonb DEFAULT '{}',
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE user_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON user_notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON user_notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- 22. INDEXES POUR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_modules_learning_path ON modules(learning_path_id);
CREATE INDEX IF NOT EXISTS idx_lessons_module ON lessons(module_id);
CREATE INDEX IF NOT EXISTS idx_user_lesson_progress_user ON user_lesson_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_lesson_progress_lesson ON user_lesson_progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_user_competencies_user ON user_competencies(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_quiz_attempts_user ON user_quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_discussion_topics_module ON discussion_topics(module_id);
CREATE INDEX IF NOT EXISTS idx_discussion_topics_author ON discussion_topics(author_id);
CREATE INDEX IF NOT EXISTS idx_discussion_replies_topic ON discussion_replies(topic_id);
CREATE INDEX IF NOT EXISTS idx_user_daily_progress_user_date ON user_daily_progress(user_id, activity_date);
CREATE INDEX IF NOT EXISTS idx_user_notifications_user ON user_notifications(user_id, is_read);

-- =====================================================
-- 23. FONCTION POUR CALCULER LE NIVEAU
-- =====================================================

CREATE OR REPLACE FUNCTION calculate_level(xp integer)
RETURNS integer AS $$
BEGIN
  RETURN FLOOR(SQRT(xp / 100.0)) + 1;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- =====================================================
-- 24. TRIGGER POUR METTRE A JOUR LE NIVEAU
-- =====================================================

CREATE OR REPLACE FUNCTION update_user_level()
RETURNS TRIGGER AS $$
BEGIN
  NEW.current_level := calculate_level(NEW.total_xp);
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_user_level ON user_profiles;
CREATE TRIGGER trigger_update_user_level
  BEFORE UPDATE OF total_xp ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_user_level();