# LoL Esports Dashboard - TODO

## Current Stack
- Frontend: React 19 + Vite + MUI v5
- Backend: Express + SQLite
- Data: Oracle Elixir (53k rows) + Polymarket Data API (live positions) + AI Agent JSON Feed

## Completed ✅

### Core Infrastructure
- [x] React + Vite frontend with dark theme
- [x] Express backend with CORS
- [x] SQLite database: `data/lol_esports.db` - Oracle Elixir match data (53k rows, 165 cols)

### Data Sources
- [x] **Polymarket Data API** - Live LoL positions via public API
  - `https://data-api.polymarket.com/positions` - Current positions
  - `https://data-api.polymarket.com/closed-positions` - Settled positions
  - No authentication required!
- [x] **AI Agent JSON Feed** - `D:\hetzner\Sync\lol-schedule.json` for upcoming matches
- [x] **Oracle Elixir CSV** - `D:\hetzner\wiki\data\oracle_raw\oracle_lol_esports.csv`
  - Python import script: `data/import_csv_to_sqlite.py`
  - Auto-sync via Syncthing from Hetzner server

### Pages & Features
- [x] **Matches Page** - Upcoming matches from JSON feed, filter by status
- [x] **Team Stats Page** - Oracle data with win rates, KDA, gold diff @15
- [x] **Head-to-Head Page** - Team comparison (needs Oracle integration)
- [x] **Players Page** - Search + role filter (needs Oracle integration)
- [x] **My Bets Page** - Live Polymarket positions with real-time PnL
  - [x] Fetch current positions from Data API
  - [x] Fetch closed positions from Data API
  - [x] Filter for LoL-related markets
  - [x] Display P&L, prices, status
  - [x] Direct links to Polymarket markets
- [x] **Team Detail Page** - Individual team details with roster and recent matches
- [x] **Team Logo System** - `public/teams/{league}/{team}.{png,jpg,jpeg}`

### API Endpoints
- [x] `/api/schedule` - Upcoming matches from JSON
- [x] `/api/oracle/teams` - Team stats from Oracle data
- [x] `/api/oracle/teams/:teamName` - Detailed team info + roster
- [x] `/api/oracle/players` - Player stats with KDA, DPM, CSPM
- [x] `/api/oracle/h2h/:teamA/:teamB` - Head-to-head history
- [x] `/api/oracle/leagues` - Available leagues

## In Progress / Next Features

### Team Insights (Betting Context)
- [ ] Show Polymarket positions on Team Stats page (your bets vs this team)
- [ ] Show Oracle stats on Matches page (team form, recent performance)
- [ ] Combine betting + Oracle data for H2H analysis

### Enhanced Stats
- [ ] **Series Win Rate** (vs current Game Win Rate)
- [ ] **Recent Form** - Last 5/10 games trend
- [ ] **Date Range Filtering** - Form over specific periods
- [ ] **Player Stats Page** - Full Oracle player data integration

### MyBets Enhancements
- [ ] Auto-refresh positions every 30 seconds
- [ ] Price change alerts (when market moves significantly)
- [ ] Filter by league (LCK, LPL, etc.)
- [ ] Sort by P&L, date, or stake
- [ ] Export positions to CSV

### UI/UX
- [ ] Team logo uploads (user will add to `public/teams/`)
- [ ] Mobile responsiveness improvements
- [ ] Dark/light theme toggle

### Team Logos - Missing (Need to Fetch)

**LCK (5/10 teams have logos):**
✅ Have: BNK FEARX, Dplus Kia, HANJIN BRION, Kiwoom DRX, KT Rolster
❌ Missing: T1, Gen.G, DN SOOPers, Nongshim RedForce, Hanwha Life Esports

**LPL (3/14 teams have logos):**
✅ Have: EDward Gaming, JD Gaming, LNG Esports
❌ Missing: Weibo Gaming, Invictus Gaming, Top Esports, Anyone's Legend, Bilibili Gaming, Ninjas in Pyjamas, Team WE, Oh My God, LGD Gaming, ThunderTalk Gaming, Ultra Prime

**Note:** `TeamLogo.jsx` normalize function updated to convert team names to hyphenated format (e.g., "JD Gaming" → `jd-gaming.png`)

## Notes
- Oracle Elixir data: https://oracleselixir.com/download
- Data sync: Hetzner cronjob → Syncthing → `D:\hetzner\wiki\data\oracle_raw\`
- SQLite is file-based, no separate server needed
- Team logos: Add to `public/teams/{LPL,LCK,LEC,LCS,...}/{teamname}.{png,jpg}`
- Polymarket Data API docs: https://docs.polymarket.com/api-reference/introduction
