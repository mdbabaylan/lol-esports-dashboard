# LoL Esports Dashboard - Memory

## Project Purpose
Personal LoL Esports dashboard for tracking matches, team stats, and Polymarket bets. Focus on **recent form** over cumulative stats for better betting decisions.

## Key Insight
Cumulative stats hide recent performance. A team that's 4-4 but lost last 4 is very different from one that won last 4. Need date-range queries for accurate win rate.

## Architecture Decisions
- **Frontend:** React + MUI (dark theme, clean tables)
- **Backend:** Express + Python scraper
- **Database:** SQLite (file-based, simple) - `server/database/lol_esports.db`
- **Data Sources:**
  - **AI Agent JSON Feed** (match data) - Daily cronjob updates via URL (TBD - user will provide)
  - Oracle Elixir (match stats) - Backup/fallback
  - Polymarket CSV (personal bets) - **98 LoL bets imported**
  - Manual entry (fallback)

## API Endpoints
```
GET  /api/bets              # List bets with filters (league, outcome, date)
GET  /api/bets/stats        # Bet statistics (overall, by league, by month)
POST /api/bets              # Add new bet
POST /api/bets/import       # Re-import from CSV

GET  /api/matches           # List matches with filters
GET  /api/matches/h2h/:a/:b # Head-to-head history
POST /api/matches           # Add new match
```

## Bet Statistics (as of May 2026)
- **Total Bets:** 91 (WIN/LOSS only)
- **Wins:** 50 | **Losses:** 41
- **Win Rate:** 54.9%
- **Total PnL:** +$233.85
- **Avg Win:** +$12.07 | **Avg Loss:** -$10.17
- **Avg Edge:** 1.22%

## Completed Features ✅

### 1. My Bets (CSV Import)
- **Status:** Complete
- **Data:** 98 LoL bets imported from CSV
- **Display:** Full betting history with stats, edge analysis, P&L tracking
- **API:** `/api/bets`, `/api/bets/stats`

### 2. Upcoming Matches (JSON Feed)
- **Source:** `D:\hetzner\Sync\lol-schedule.json` (AI Agent JSON feed)
- **Status:** Complete
- **Display:** Matches grouped by date, league color coding, filter tabs
- **API:** `/api/schedule`

## Next Priority
**Query SQLite betting data for team insights:**
- When viewing a team in Matches/H2H, query their betting history
- Show: Win rate vs that team, average edge, historical performance
- Use existing `bets` table (already has 98 bets with team_a/team_b)

## API Endpoints (Updated)
```
GET  /api/bets              # List bets with filters
GET  /api/bets/stats        # Bet statistics
POST /api/bets              # Add new bet
POST /api/bets/import       # Re-import from CSV

GET  /api/matches           # List matches
GET  /api/matches/h2h/:a/:b # Head-to-head history
POST /api/matches           # Add new match

GET  /api/schedule          # Get upcoming matches from JSON
POST /api/schedule/refresh  # Force refresh schedule
```

## Wallet
- Address: `0xe49756E59B79705991B166eAD9107A63E55984aa`
- Profile: https://polymarket.com/@rktbay
- Polymarket API requires auth (use CSV export instead)

## File Structure
```
lol-esports-dashboard/
├── client/          # React frontend
├── server/          # Express + Python
│   ├── database/
│   ├── scraper/
│   └── routes/
├── TODO.md          # Next features
└── MEMORY.md        # This file
```

## Commands
```bash
# Dev (both frontend + server)
npm run dev:full

# Just frontend
npm run dev

# Just server
npm run server
```
