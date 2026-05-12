# LoL Esports Dashboard - TODO

## Current Stack
- Frontend: React 19 + Vite + MUI v5
- Backend: Express (proxy server)
- Data: Mock data (needs real database)

## Completed
- [x] Matches page (vertical table by event)
- [x] Head-to-Head page (team comparison)
- [x] Players page (search + role filter)
- [x] My Bets page (stats + table layout)
- [x] Dark theme (zinc/slate palette)
- [x] Express proxy server (CORS handling)

## Next Features

### 1. SQLite Database ✅
- [x] Create `server/database/db.cjs` - SQLite wrapper
- [x] Create `server/database/schema.sql`:
  - `matches` - match_id, date, team_a, team_b, score_a, score_b, tournament, patch
  - `team_stats` - team, date, stat_type, value (wins, losses, kda, gold, etc.)
  - `player_stats` - player, team, date, kills, deaths, assists, cs, gold
  - `bets` - id, date, team_a, team_b, bet_on, odds, stake, result, profit
  - `harvest_log` - source, last_run, status

### 2. My Bets CSV Upload ✅
- [x] Backend: `/api/bets` endpoint with filters
- [x] Backend: `/api/bets/stats` endpoint with league/monthly breakdown
- [x] Parse Polymarket CSV format (`import-bets.cjs`)
- [x] Store in SQLite (98 LoL bets imported)
- [x] Frontend: Update My Bets page to use API instead of mock data

### 3. Match Data Integration ✅ COMPLETE
- [x] **AI Agent JSON Feed** - `D:\hetzner\Sync\lol-schedule.json`
- [x] Create `/api/schedule` endpoint to read the JSON file
- [x] Frontend: Display upcoming matches with date grouping
- [x] Filter by status: All, Live, Scheduled, Finished
- [x] Team names displayed in UPPERCASE

### 4. Query Betting Data for Team Insights ⏳ NEXT
- [ ] API: `/api/bets/team/:teamName` - Get all bets for a specific team
- [ ] API: `/api/bets/h2h/:teamA/:teamB` - Get betting history between two teams
- [ ] Frontend: Show betting insights on Matches page (win rate vs opponent, avg edge)
- [ ] Frontend: Show team betting stats on H2H page
- [ ] Calculate: Historical win rate, average edge, profit/loss per team

### 4. Oracle Elixir Harvester (Backup/Fallback)
- [ ] Python script: `server/scraper/oracle_elixir.py`
- [ ] Pull match data from Oracle's Elixir CSV
- [ ] Store per-match stats (not cumulative)
- [ ] Frontend: "Harvest Data" button
- [ ] Backend: `/api/harvest/oracle` endpoint

### 4. Dynamic Team Stats
- [ ] API: `/api/teams/:team/stats?from=DATE&to=DATE`
- [ ] Calculate: win rate, KDA, gold diff, form (W/L streak)
- [ ] Recent form vs cumulative stats
- [ ] Frontend: Date range picker on H2H page

### 5. H2H with Date Filter
- [ ] API: `/api/h2h/:teamA/:teamB?from=DATE&to=DATE`
- [ ] Weighted by recency
- [ ] Show form trends for both teams

## Notes
- Oracle Elixir data: https://oracleselixir.com/download
- Polymarket API requires auth (use CSV export instead)
- SQLite is file-based, no separate server needed
- Keep data lightweight (years of matches = ~50MB)
