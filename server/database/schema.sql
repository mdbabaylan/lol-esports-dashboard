-- LoL Esports Dashboard Database Schema

-- Matches table (from Oracle Elixir or API)
CREATE TABLE IF NOT EXISTS matches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    match_id TEXT UNIQUE,
    date TEXT NOT NULL,
    team_a TEXT NOT NULL,
    team_b TEXT NOT NULL,
    score_a INTEGER,
    score_b INTEGER,
    tournament TEXT,
    patch TEXT,
    league TEXT,
    game_duration INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Team stats (time-series data)
CREATE TABLE IF NOT EXISTS team_stats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    team TEXT NOT NULL,
    date TEXT NOT NULL,
    league TEXT,
    wins INTEGER DEFAULT 0,
    losses INTEGER DEFAULT 0,
    kills REAL,
    deaths REAL,
    assists REAL,
    kda REAL,
    gold_per_min REAL,
    cs_per_min REAL,
    towers REAL,
    dragons REAL,
    barons REAL,
    first_blood_rate REAL,
    first_tower_rate REAL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Player stats
CREATE TABLE IF NOT EXISTS player_stats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    player TEXT NOT NULL,
    team TEXT NOT NULL,
    date TEXT NOT NULL,
    role TEXT,
    kills REAL,
    deaths REAL,
    assists REAL,
    kda REAL,
    cs_per_min REAL,
    gold_per_min REAL,
    damage_per_min REAL,
    vision_score REAL,
    champion TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bets table (from Polymarket CSV)
CREATE TABLE IF NOT EXISTS bets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    match_description TEXT,
    team_a TEXT,
    team_b TEXT,
    bet_on TEXT,
    category TEXT,
    market_odds REAL,
    my_prob REAL,
    edge REAL,
    reward_risk REAL,
    expectancy REAL,
    kelly_pct REAL,
    safe_size_pct REAL,
    stake REAL,
    outcome TEXT,
    pnl REAL,
    reflection TEXT,
    llm_reason TEXT,
    llm_post_mortem TEXT,
    league TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Harvest log (for tracking data updates)
CREATE TABLE IF NOT EXISTS harvest_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source TEXT NOT NULL,
    last_run TIMESTAMP,
    status TEXT,
    records_processed INTEGER,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Head-to-head cache
CREATE TABLE IF NOT EXISTS h2h_cache (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    team_a TEXT NOT NULL,
    team_b TEXT NOT NULL,
    date_from TEXT,
    date_to TEXT,
    matches_count INTEGER,
    team_a_wins INTEGER,
    team_b_wins INTEGER,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_matches_date ON matches(date);
CREATE INDEX IF NOT EXISTS idx_matches_teams ON matches(team_a, team_b);
CREATE INDEX IF NOT EXISTS idx_matches_league ON matches(league);
CREATE INDEX IF NOT EXISTS idx_team_stats_team_date ON team_stats(team, date);
CREATE INDEX IF NOT EXISTS idx_player_stats_player ON player_stats(player);
CREATE INDEX IF NOT EXISTS idx_bets_date ON bets(date);
CREATE INDEX IF NOT EXISTS idx_bets_outcome ON bets(outcome);
