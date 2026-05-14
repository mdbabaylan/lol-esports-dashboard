# LoL Esports Dashboard

A comprehensive dashboard for tracking League of Legends esports matches, team statistics, player data, and live Polymarket betting positions.

## Overview

This project provides a full-stack solution for LoL esports analytics, combining:

- **Match Schedule**: Upcoming matches from AI-curated JSON feeds
- **Team Statistics**: Historical performance data from Oracle Elixir (53k+ matches)
- **Head-to-Head Analysis**: Compare teams directly with historical matchup data
- **Player Stats**: Individual player performance metrics
- **Live Betting Tracker**: Real-time Polymarket positions with PnL tracking

## Tech Stack

### Frontend
- **React 19** - UI framework
- **Vite** - Build tool and dev server
- **Material-UI (MUI) v9** - Component library with custom dark theme
- **React Router** - Client-side routing

### Backend
- **Express.js** - REST API server
- **SQLite3** - File-based database
- **CORS** - Cross-origin request handling
- **node-fetch** - HTTP client for external APIs

### Data Sources
- **Oracle Elixir** - Comprehensive match data (53k+ rows, 165 columns)
- **Polymarket Data API** - Live betting positions (no authentication required)
  - API: `https://data-api.polymarket.com`
  - Endpoints: `/positions`, `/closed-positions`
- **AI Agent JSON Feed** - Upcoming match schedules

## Project Structure

```
├── src/                      # Frontend React application
│   ├── components/           # Reusable components (TeamLogo, etc.)
│   ├── pages/                # Route-level page components
│   │   ├── MatchesPage.jsx   # Upcoming matches
│   │   ├── TeamStatsPage.jsx # Team statistics overview
│   │   ├── TeamDetailPage.jsx# Individual team details
│   │   ├── HeadToHeadPage.jsx# Team comparison
│   │   ├── PlayersPage.jsx   # Player statistics
│   │   └── MyBetsPage.jsx    # Live Polymarket positions
│   ├── services/             # API client functions
│   │   └── polymarket.js     # Polymarket Data API integration
│   ├── data/                 # Mock data and constants
│   ├── App.jsx               # Main app component with routing
│   ├── main.jsx              # Entry point
│   └── theme.js              # MUI theme configuration
│
├── server/                   # Backend API routes
│   ├── routes/
│   │   ├── matches.cjs       # Match schedule endpoints
│   │   ├── schedule.cjs      # AI feed endpoints
│   │   └── oracle.cjs        # Oracle Elixir data endpoints
│   └── database/
│       └── lol_esports.db    # Oracle Elixir match database
│
├── data/                     # Oracle Elixir data
│   └── lol_esports.db        # Main match database
│
├── public/teams/             # Team logos by league
│   ├── LCK/                  # Korean league logos
│   ├── LPL/                  # Chinese league logos
│   ├── LEC/                  # EMEA league logos
│   └── LCS/                  # Americas league logos
│
├── server.cjs                # Main Express server entry
├── package.json              # Dependencies and scripts
└── vite.config.js            # Vite configuration
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

1. Clone the repository and install dependencies:

```bash
npm install
```

2. Ensure the database is in place:
   - `data/lol_esports.db` - Oracle Elixir match data (SQLite)

### Running the Application

#### Option 1: Run Backend and Frontend Separately

**Terminal 1 - Start the Backend:**
```bash
npm run server
```
The API server will start on http://localhost:3001

**Terminal 2 - Start the Frontend:**
```bash
npm run dev
```
The Vite dev server will start on http://localhost:5173 (or another available port)

#### Option 2: Run Both Concurrently

```bash
npm run dev:full
```
This starts both the backend (port 3001) and frontend using `concurrently`.

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Vite dev server (frontend only) |
| `npm run server` | Start Express API server (backend only) |
| `npm run dev:full` | Start both frontend and backend concurrently |
| `npm run build` | Build production frontend bundle |
| `npm run preview` | Preview production build locally |

## API Endpoints

### Health & General
- `GET /api/health` - Server health check

### Matches & Schedule
- `GET /api/schedule` - Upcoming matches from AI feed
- `GET /api/matches` - Match history from database
- `GET /api/matches/h2h/:teamA/:teamB` - Head-to-head match history

### Oracle Elixir Data
- `GET /api/oracle/teams` - Team statistics overview
- `GET /api/oracle/teams/:teamName` - Detailed team info
- `GET /api/oracle/players` - Player statistics with KDA, DPM, CSPM
- `GET /api/oracle/h2h/:teamA/:teamB` - Team comparison stats
- `GET /api/oracle/leagues` - Available leagues

### Polymarket Integration
The dashboard fetches live positions directly from Polymarket's public Data API:
- `GET https://data-api.polymarket.com/positions?user={wallet}` - Current positions
- `GET https://data-api.polymarket.com/closed-positions?user={wallet}` - Settled positions

No authentication or API keys required!

## MyBets Page - Live Polymarket Tracking

The MyBets page displays your live League of Legends positions from Polymarket:

### Features
- **Real-time P&L**: Current profit/loss on all open positions
- **Position Status**: Pending, Won, or Lost
- **Price Tracking**: Average entry price vs current market price
- **Direct Links**: Click to view markets on Polymarket
- **Auto-refresh**: Manual refresh button to update positions

### Configuration
Your wallet address is configured in `src/services/polymarket.js`:
```javascript
export const WALLET_ADDRESS = '0xe49756E59B79705991B166eAD9107A63E55984aa'
```

### LoL Market Detection
Positions are automatically filtered for LoL-related markets using keywords:
- Leagues: LCK, LPL, LEC, LCS, MSI, Worlds
- Teams: T1, Gen.G, BLG, JDG, G2, and more
- Generic: "League of Legends", "esports", "LoL"

## Data Sources

### Oracle Elixir
Professional LoL match data with 53,000+ matches and 165 columns including:
- Team and player statistics
- Gold differences at various timestamps
- Objective control (Dragons, Baron, Towers)
- Champion picks and bans
- Game length and outcomes

### Polymarket Data API
Public API for tracking prediction market positions:
- **No authentication required**
- Real-time position data
- PnL calculations
- Market prices and outcomes
- Docs: https://docs.polymarket.com/api-reference/introduction

## Team Logos

Team logos are stored in `public/teams/{league}/{teamname}.{ext}` and follow the naming convention:
- Lowercase with hyphens (e.g., `jd-gaming.png`, `t1.png`)
- Supported formats: PNG, JPG, JPEG
- Size recommendation: 128x128px or higher

## Development Notes

- The SQLite database is file-based and requires no separate server
- Frontend uses React Router for SPA navigation
- MUI theme is customized for a dark esports aesthetic
- CORS is enabled for all origins in development
- Polymarket Data API is called directly from the frontend (no proxy needed)

## License

© 2026 LoL Esports Dashboard. All rights reserved.
