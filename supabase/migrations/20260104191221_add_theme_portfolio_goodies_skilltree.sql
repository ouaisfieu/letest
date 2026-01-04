/*
  # Theme, Portfolio, Goodies & Skill Tree System

  1. New Tables
    - `theme_presets` - Available color themes
      - `id` (uuid, primary key)
      - `slug` (text, unique)
      - `name` (text)
      - `colors` (jsonb) - primary, secondary, accent, background colors
      - `is_default` (boolean)
    - `goodies` - Hacker tips and tricks
      - `id` (uuid, primary key)
      - `slug` (text, unique)
      - `title` (text)
      - `category` (text) - steganography, metadata, crypto, network, etc.
      - `difficulty` (int) - 1 to 5
      - `content` (jsonb) - sections, code snippets, warnings
      - `xp_reward` (int)
    - `user_goodies_progress` - Track which goodies user has viewed
    - `skill_tree_nodes` - Nodes in the skill tree
      - `id` (uuid, primary key)
      - `learning_path_id` (uuid, references learning_paths)
      - `parent_node_id` (uuid, self-reference)
      - `title` (text)
      - `description` (text)
      - `icon` (text)
      - `position_x` (int) - grid position
      - `position_y` (int)
      - `unlock_requirements` (jsonb)
      - `xp_cost` (int)
    - `user_skill_nodes` - Track unlocked nodes

  2. Profile Updates
    - Add avatar_url, banner_url, portfolio_bio columns to user_profiles

  3. Security
    - Enable RLS on all new tables
    - Add appropriate policies
*/

-- Theme presets table
CREATE TABLE IF NOT EXISTS theme_presets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  colors jsonb NOT NULL DEFAULT '{}',
  is_dark boolean DEFAULT true,
  is_default boolean DEFAULT false,
  is_premium boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE theme_presets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view theme presets"
  ON theme_presets FOR SELECT
  TO authenticated
  USING (true);

-- User theme preference (add to profiles)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'theme_preset_id'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN theme_preset_id uuid REFERENCES theme_presets(id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'custom_colors'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN custom_colors jsonb DEFAULT '{}';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'avatar_url'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN avatar_url text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'banner_url'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN banner_url text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'portfolio_bio'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN portfolio_bio text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'portfolio_links'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN portfolio_links jsonb DEFAULT '[]';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'is_portfolio_public'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN is_portfolio_public boolean DEFAULT false;
  END IF;
END $$;

-- Goodies (hacker tips) table
CREATE TABLE IF NOT EXISTS goodies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  category text NOT NULL,
  difficulty int NOT NULL CHECK (difficulty >= 1 AND difficulty <= 5),
  short_description text,
  content jsonb NOT NULL DEFAULT '{}',
  prerequisites text[] DEFAULT '{}',
  tags text[] DEFAULT '{}',
  xp_reward int DEFAULT 10,
  estimated_minutes int DEFAULT 5,
  order_index int DEFAULT 0,
  is_published boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE goodies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published goodies"
  ON goodies FOR SELECT
  TO authenticated
  USING (is_published = true);

-- User goodies progress
CREATE TABLE IF NOT EXISTS user_goodies_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  goodie_id uuid REFERENCES goodies(id) ON DELETE CASCADE NOT NULL,
  status text DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'bookmarked')),
  completed_at timestamptz,
  notes text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, goodie_id)
);

ALTER TABLE user_goodies_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own goodies progress"
  ON user_goodies_progress FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own goodies progress"
  ON user_goodies_progress FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goodies progress"
  ON user_goodies_progress FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Skill tree nodes
CREATE TABLE IF NOT EXISTS skill_tree_nodes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  learning_path_id uuid REFERENCES learning_paths(id) ON DELETE CASCADE,
  parent_node_id uuid REFERENCES skill_tree_nodes(id) ON DELETE SET NULL,
  module_id uuid REFERENCES modules(id) ON DELETE SET NULL,
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  description text,
  icon text DEFAULT 'circle',
  node_type text DEFAULT 'skill' CHECK (node_type IN ('root', 'skill', 'milestone', 'mastery')),
  position_x int DEFAULT 0,
  position_y int DEFAULT 0,
  unlock_requirements jsonb DEFAULT '{}',
  xp_cost int DEFAULT 0,
  rewards jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE skill_tree_nodes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view skill tree nodes"
  ON skill_tree_nodes FOR SELECT
  TO authenticated
  USING (is_active = true);

-- User unlocked skill nodes
CREATE TABLE IF NOT EXISTS user_skill_nodes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  node_id uuid REFERENCES skill_tree_nodes(id) ON DELETE CASCADE NOT NULL,
  unlocked_at timestamptz DEFAULT now(),
  xp_spent int DEFAULT 0,
  UNIQUE(user_id, node_id)
);

ALTER TABLE user_skill_nodes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own skill nodes"
  ON user_skill_nodes FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own skill nodes"
  ON user_skill_nodes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Insert default theme presets
INSERT INTO theme_presets (slug, name, description, colors, is_dark, is_default) VALUES
  ('emerald-dark', 'Emeraude Sombre', 'Theme par defaut vert emeraude', 
   '{"primary": "#10b981", "secondary": "#0d9488", "accent": "#14b8a6", "background": "#0f172a", "surface": "#1e293b", "text": "#f8fafc"}',
   true, true),
  ('ocean-blue', 'Ocean Bleu', 'Theme bleu profond', 
   '{"primary": "#3b82f6", "secondary": "#0ea5e9", "accent": "#06b6d4", "background": "#0c1929", "surface": "#1a2d47", "text": "#f0f9ff"}',
   true, false),
  ('amber-gold', 'Or Ambre', 'Theme chaud dore', 
   '{"primary": "#f59e0b", "secondary": "#d97706", "accent": "#fbbf24", "background": "#1a1409", "surface": "#2d2410", "text": "#fef3c7"}',
   true, false),
  ('rose-pink', 'Rose Corail', 'Theme rose elegant', 
   '{"primary": "#f43f5e", "secondary": "#e11d48", "accent": "#fb7185", "background": "#1a0a10", "surface": "#2d1520", "text": "#fff1f2"}',
   true, false),
  ('forest-green', 'Foret', 'Theme vert nature', 
   '{"primary": "#22c55e", "secondary": "#16a34a", "accent": "#4ade80", "background": "#0a1a0f", "surface": "#152d1a", "text": "#f0fdf4"}',
   true, false),
  ('light-minimal', 'Minimaliste Clair', 'Theme clair epure', 
   '{"primary": "#059669", "secondary": "#0d9488", "accent": "#10b981", "background": "#f8fafc", "surface": "#ffffff", "text": "#0f172a"}',
   false, false)
ON CONFLICT (slug) DO NOTHING;
