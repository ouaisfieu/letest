/*
  # Recruitment Simulator Schema

  1. New Tables
    - `job_profiles` - Available job positions to simulate
      - `id` (uuid, primary key)
      - `name` (text) - Job title
      - `description` (text) - Job description
      - `icon` (text) - Icon identifier
      - `difficulty` (text) - Overall difficulty level
      - `created_at` (timestamptz)
    
    - `skills` - Skills that can be tested
      - `id` (uuid, primary key)
      - `name` (text) - Skill name
      - `category` (text) - Skill category
      - `description` (text)
    
    - `job_profile_skills` - Links jobs to required skills
      - `id` (uuid, primary key)
      - `job_profile_id` (uuid, foreign key)
      - `skill_id` (uuid, foreign key)
      - `required_level` (integer) - 1-100 scale
    
    - `challenges` - Test challenges/exercises
      - `id` (uuid, primary key)
      - `skill_id` (uuid, foreign key)
      - `title` (text)
      - `description` (text)
      - `type` (text) - qcm, coding, scenario, logic, etc.
      - `difficulty` (integer) - 1-5
      - `time_limit` (integer) - seconds, null if no limit
      - `xp_reward` (integer)
      - `content` (jsonb) - Challenge data
    
    - `user_sessions` - User test sessions
      - `id` (uuid, primary key)
      - `job_profile_id` (uuid, foreign key)
      - `username` (text)
      - `current_level` (integer)
      - `total_xp` (integer)
      - `started_at` (timestamptz)
      - `completed_at` (timestamptz)
    
    - `user_results` - Individual challenge results
      - `id` (uuid, primary key)
      - `session_id` (uuid, foreign key)
      - `challenge_id` (uuid, foreign key)
      - `skill_id` (uuid, foreign key)
      - `score` (integer)
      - `time_taken` (integer)
      - `completed_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Public read access for job profiles, skills, and challenges
    - Write access for user sessions and results
*/

-- Job Profiles table
CREATE TABLE IF NOT EXISTS job_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL DEFAULT 'briefcase',
  difficulty text NOT NULL DEFAULT 'intermediate',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE job_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read job profiles"
  ON job_profiles FOR SELECT
  TO anon, authenticated
  USING (true);

-- Skills table
CREATE TABLE IF NOT EXISTS skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL,
  description text NOT NULL DEFAULT ''
);

ALTER TABLE skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read skills"
  ON skills FOR SELECT
  TO anon, authenticated
  USING (true);

-- Job Profile Skills junction table
CREATE TABLE IF NOT EXISTS job_profile_skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_profile_id uuid NOT NULL REFERENCES job_profiles(id) ON DELETE CASCADE,
  skill_id uuid NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  required_level integer NOT NULL DEFAULT 50,
  UNIQUE(job_profile_id, skill_id)
);

ALTER TABLE job_profile_skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read job profile skills"
  ON job_profile_skills FOR SELECT
  TO anon, authenticated
  USING (true);

-- Challenges table
CREATE TABLE IF NOT EXISTS challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  skill_id uuid NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  type text NOT NULL DEFAULT 'qcm',
  difficulty integer NOT NULL DEFAULT 1,
  time_limit integer,
  xp_reward integer NOT NULL DEFAULT 100,
  content jsonb NOT NULL DEFAULT '{}'::jsonb
);

ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read challenges"
  ON challenges FOR SELECT
  TO anon, authenticated
  USING (true);

-- User Sessions table
CREATE TABLE IF NOT EXISTS user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_profile_id uuid NOT NULL REFERENCES job_profiles(id) ON DELETE CASCADE,
  username text NOT NULL,
  current_level integer NOT NULL DEFAULT 1,
  total_xp integer NOT NULL DEFAULT 0,
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create sessions"
  ON user_sessions FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can read sessions"
  ON user_sessions FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can update sessions"
  ON user_sessions FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- User Results table
CREATE TABLE IF NOT EXISTS user_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES user_sessions(id) ON DELETE CASCADE,
  challenge_id uuid NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  skill_id uuid NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  score integer NOT NULL DEFAULT 0,
  time_taken integer NOT NULL DEFAULT 0,
  completed_at timestamptz DEFAULT now()
);

ALTER TABLE user_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create results"
  ON user_results FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can read results"
  ON user_results FOR SELECT
  TO anon, authenticated
  USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_job_profile_skills_job ON job_profile_skills(job_profile_id);
CREATE INDEX IF NOT EXISTS idx_job_profile_skills_skill ON job_profile_skills(skill_id);
CREATE INDEX IF NOT EXISTS idx_challenges_skill ON challenges(skill_id);
CREATE INDEX IF NOT EXISTS idx_user_results_session ON user_results(session_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_profile ON user_sessions(job_profile_id);