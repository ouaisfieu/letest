/*
  # Game Engine Tables for Educational Games
  
  1. New Tables
    - `game_types` - Types of games available (flashcards, mcq, matching, scenarios)
    - `game_collections` - Collections/decks of game content
    - `game_cards` - Individual cards/questions within collections
    - `game_sessions` - User game sessions tracking
    - `card_responses` - Individual card responses within sessions
    - `card_mastery` - Spaced repetition mastery tracking per user/card
    - `wellness_settings` - User digital wellness preferences
    - `wellness_breaks` - Break tracking for digital wellness

  2. Security
    - Enable RLS on all tables
    - Users can only access their own session and mastery data
    - Game content is publicly readable for authenticated users

  3. Features
    - Support for multiple game types (flashcards, MCQ, matching, scenarios)
    - Spaced Repetition System (SRS) algorithm support
    - Digital wellness tracking integration
*/

-- Game types table
CREATE TABLE IF NOT EXISTS game_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  icon text,
  min_players integer DEFAULT 1,
  max_players integer DEFAULT 1,
  avg_duration_minutes integer DEFAULT 10,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE game_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view game types"
  ON game_types FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Game collections table
CREATE TABLE IF NOT EXISTS game_collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_type_id uuid REFERENCES game_types(id) ON DELETE CASCADE,
  module_id uuid REFERENCES modules(id) ON DELETE SET NULL,
  slug text NOT NULL,
  title text NOT NULL,
  description text,
  cover_image_url text,
  difficulty_level integer DEFAULT 1 CHECK (difficulty_level BETWEEN 1 AND 5),
  estimated_minutes integer DEFAULT 15,
  xp_reward integer DEFAULT 50,
  order_index integer DEFAULT 0,
  is_published boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(game_type_id, slug)
);

ALTER TABLE game_collections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view published collections"
  ON game_collections FOR SELECT
  TO authenticated
  USING (is_published = true);

-- Game cards table
CREATE TABLE IF NOT EXISTS game_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id uuid REFERENCES game_collections(id) ON DELETE CASCADE,
  card_type text NOT NULL DEFAULT 'flashcard',
  front_content jsonb NOT NULL,
  back_content jsonb NOT NULL,
  hints jsonb DEFAULT '[]',
  tags text[] DEFAULT '{}',
  difficulty integer DEFAULT 1 CHECK (difficulty BETWEEN 1 AND 5),
  points integer DEFAULT 10,
  order_index integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE game_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view active cards"
  ON game_cards FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Game sessions table
CREATE TABLE IF NOT EXISTS game_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  collection_id uuid REFERENCES game_collections(id) ON DELETE CASCADE,
  game_mode text NOT NULL DEFAULT 'practice',
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  score integer DEFAULT 0,
  max_score integer DEFAULT 0,
  cards_seen integer DEFAULT 0,
  cards_correct integer DEFAULT 0,
  time_spent_seconds integer DEFAULT 0,
  streak_count integer DEFAULT 0,
  session_data jsonb DEFAULT '{}'
);

ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own game sessions"
  ON game_sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own game sessions"
  ON game_sessions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own game sessions"
  ON game_sessions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Card responses table
CREATE TABLE IF NOT EXISTS card_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES game_sessions(id) ON DELETE CASCADE,
  card_id uuid REFERENCES game_cards(id) ON DELETE CASCADE,
  user_answer jsonb,
  is_correct boolean,
  response_time_ms integer,
  attempts integer DEFAULT 1,
  hint_used boolean DEFAULT false,
  answered_at timestamptz DEFAULT now()
);

ALTER TABLE card_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own card responses"
  ON card_responses FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM game_sessions gs
      WHERE gs.id = card_responses.session_id
      AND gs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own card responses"
  ON card_responses FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM game_sessions gs
      WHERE gs.id = card_responses.session_id
      AND gs.user_id = auth.uid()
    )
  );

-- Card mastery table (SRS algorithm)
CREATE TABLE IF NOT EXISTS card_mastery (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  card_id uuid REFERENCES game_cards(id) ON DELETE CASCADE,
  ease_factor numeric DEFAULT 2.5,
  interval_days integer DEFAULT 1,
  repetitions integer DEFAULT 0,
  next_review_date date DEFAULT CURRENT_DATE,
  last_reviewed_at timestamptz,
  mastery_level integer DEFAULT 0 CHECK (mastery_level BETWEEN 0 AND 5),
  total_reviews integer DEFAULT 0,
  correct_reviews integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, card_id)
);

ALTER TABLE card_mastery ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own card mastery"
  ON card_mastery FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own card mastery"
  ON card_mastery FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own card mastery"
  ON card_mastery FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Wellness settings table
CREATE TABLE IF NOT EXISTS wellness_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE UNIQUE,
  daily_goal_minutes integer DEFAULT 45 CHECK (daily_goal_minutes BETWEEN 15 AND 120),
  session_limit_minutes integer DEFAULT 30 CHECK (session_limit_minutes BETWEEN 10 AND 60),
  break_reminders_enabled boolean DEFAULT true,
  break_intensity text DEFAULT 'medium' CHECK (break_intensity IN ('gentle', 'medium', 'strict')),
  blink_reminders_enabled boolean DEFAULT true,
  night_mode_enabled boolean DEFAULT true,
  night_mode_start time DEFAULT '21:00',
  night_mode_end time DEFAULT '07:00',
  weekly_report_enabled boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE wellness_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own wellness settings"
  ON wellness_settings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own wellness settings"
  ON wellness_settings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own wellness settings"
  ON wellness_settings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Wellness breaks tracking
CREATE TABLE IF NOT EXISTS wellness_breaks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  break_type text NOT NULL CHECK (break_type IN ('micro', 'medium', 'long', 'blink')),
  duration_seconds integer NOT NULL,
  completed boolean DEFAULT false,
  xp_earned integer DEFAULT 0,
  taken_at timestamptz DEFAULT now()
);

ALTER TABLE wellness_breaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own wellness breaks"
  ON wellness_breaks FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own wellness breaks"
  ON wellness_breaks FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Insert default game types
INSERT INTO game_types (slug, name, description, icon, avg_duration_minutes) VALUES
  ('flashcards', 'Flashcards', 'Cartes question/reponse classiques pour memoriser', 'layers', 10),
  ('mcq', 'Quiz QCM', 'Questions a choix multiples avec feedback immediat', 'check-square', 15),
  ('matching', 'Association', 'Associer des paires de concepts', 'link', 10),
  ('scenario', 'Scenarios', 'Situations pratiques avec choix de decisions', 'git-branch', 20)
ON CONFLICT (slug) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_game_collections_type ON game_collections(game_type_id);
CREATE INDEX IF NOT EXISTS idx_game_cards_collection ON game_cards(collection_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_user ON game_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_collection ON game_sessions(collection_id);
CREATE INDEX IF NOT EXISTS idx_card_mastery_user ON card_mastery(user_id);
CREATE INDEX IF NOT EXISTS idx_card_mastery_next_review ON card_mastery(next_review_date);
CREATE INDEX IF NOT EXISTS idx_wellness_breaks_user ON wellness_breaks(user_id);
