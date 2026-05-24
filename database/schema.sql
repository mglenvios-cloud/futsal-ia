-- Futsal IA - Supabase Schema
-- Teams table
CREATE TABLE IF NOT EXISTS teams (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT UNIQUE,
  league TEXT,
  venue TEXT,
  logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_teams_league ON teams(league);
CREATE INDEX idx_teams_slug ON teams(slug);

-- Matches table
CREATE TABLE IF NOT EXISTS matches (
  id BIGSERIAL PRIMARY KEY,
  source_id TEXT,
  source TEXT DEFAULT 'manual',
  league TEXT NOT NULL DEFAULT 'primera-a',
  home_team TEXT NOT NULL,
  away_team TEXT NOT NULL,
  home_score INTEGER,
  away_score INTEGER,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled','live','finished','postponed','cancelled')),
  minute INTEGER,
  date DATE,
  time TIME,
  venue TEXT,
  round TEXT,
  home_yellow INTEGER DEFAULT 0,
  away_yellow INTEGER DEFAULT 0,
  home_red INTEGER DEFAULT 0,
  away_red INTEGER DEFAULT 0,
  home_fouls INTEGER DEFAULT 0,
  away_fouls INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_match_source UNIQUE (source_id, source)
);

CREATE INDEX idx_matches_date ON matches(date);
CREATE INDEX idx_matches_league ON matches(league);
CREATE INDEX idx_matches_status ON matches(status);
CREATE INDEX idx_matches_home_team ON matches(home_team);
CREATE INDEX idx_matches_away_team ON matches(away_team);

-- Standings table
CREATE TABLE IF NOT EXISTS standings (
  id BIGSERIAL PRIMARY KEY,
  league TEXT NOT NULL,
  position INTEGER NOT NULL,
  team_name TEXT NOT NULL,
  played INTEGER DEFAULT 0,
  won INTEGER DEFAULT 0,
  drawn INTEGER DEFAULT 0,
  lost INTEGER DEFAULT 0,
  goals_for INTEGER DEFAULT 0,
  goals_against INTEGER DEFAULT 0,
  goal_difference INTEGER GENERATED ALWAYS AS (goals_for - goals_against) STORED,
  points INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_standings UNIQUE (league, team_name)
);

CREATE INDEX idx_standings_league ON standings(league);
CREATE INDEX idx_standings_points ON standings(league, points DESC);

-- Top scorers table
CREATE TABLE IF NOT EXISTS top_scorers (
  id BIGSERIAL PRIMARY KEY,
  league TEXT NOT NULL,
  player_name TEXT NOT NULL,
  team_name TEXT NOT NULL,
  goals INTEGER DEFAULT 0,
  matches_played INTEGER DEFAULT 0,
  assists INTEGER DEFAULT 0,
  yellow_cards INTEGER DEFAULT 0,
  red_cards INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_scorer UNIQUE (league, player_name, team_name)
);

CREATE INDEX idx_scorers_league ON top_scorers(league);
CREATE INDEX idx_scorers_goals ON top_scorers(league, goals DESC);

-- Videos table
CREATE TABLE IF NOT EXISTS videos (
  id BIGSERIAL PRIMARY KEY,
  title TEXT,
  url TEXT NOT NULL,
  source TEXT DEFAULT 'futsalplay',
  category TEXT DEFAULT 'highlights',
  thumbnail TEXT,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_videos_source ON videos(source);

-- Chat messages (AI history)
CREATE TABLE IF NOT EXISTS chat_messages (
  id BIGSERIAL PRIMARY KEY,
  session_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user','ai','system')),
  content TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_chat_session ON chat_messages(session_id);
CREATE INDEX idx_chat_created ON chat_messages(created_at DESC);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id BIGSERIAL PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('goal','red_card','yellow_card','match_start','match_end','upcoming','general')),
  title TEXT NOT NULL,
  body TEXT,
  match_id BIGINT REFERENCES matches(id) ON DELETE CASCADE,
  league TEXT,
  data JSONB,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);
CREATE INDEX idx_notifications_type ON notifications(type);

-- Search index (optional: for full-text search)
ALTER TABLE teams ADD COLUMN IF NOT EXISTS search_vector tsvector
  GENERATED ALWAYS AS (to_tsvector('spanish', coalesce(name, ''))) STORED;

ALTER TABLE matches ADD COLUMN IF NOT EXISTS search_vector tsvector
  GENERATED ALWAYS AS (to_tsvector('spanish', coalesce(home_team, '') || ' ' || coalesce(away_team, ''))) STORED;

CREATE INDEX IF NOT EXISTS idx_teams_search ON teams USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_matches_search ON matches USING GIN(search_vector);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at
DO $$
DECLARE
  t TEXT;
BEGIN
  FOR t IN SELECT table_name FROM information_schema.columns
    WHERE column_name = 'updated_at' AND table_schema = 'public'
  LOOP
    EXECUTE format('
      CREATE TRIGGER set_updated_at
      BEFORE UPDATE ON %I
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
    ', t);
  END LOOP;
END;
$$;

-- Row Level Security (optional: enable if needed)
-- ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE standings ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
