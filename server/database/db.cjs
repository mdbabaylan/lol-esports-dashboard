const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, 'lol_esports.db');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

class Database {
    constructor() {
        this.db = null;
    }

    connect() {
        return new Promise((resolve, reject) => {
            this.db = new sqlite3.Database(DB_PATH, (err) => {
                if (err) {
                    console.error('Error opening database:', err);
                    reject(err);
                } else {
                    console.log('Connected to SQLite database');
                    resolve();
                }
            });
        });
    }

    async initSchema() {
        const schema = fs.readFileSync(SCHEMA_PATH, 'utf8');
        const statements = schema.split(';').filter(s => s.trim());
        
        for (const statement of statements) {
            if (statement.trim()) {
                await this.run(statement);
            }
        }
        console.log('Database schema initialized');
    }

    run(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.run(sql, params, function(err) {
                if (err) {
                    console.error('SQL Error:', err);
                    reject(err);
                } else {
                    resolve({ id: this.lastID, changes: this.changes });
                }
            });
        });
    }

    get(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.get(sql, params, (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    all(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.all(sql, params, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    close() {
        return new Promise((resolve, reject) => {
            this.db.close((err) => {
                if (err) {
                    reject(err);
                } else {
                    console.log('Database connection closed');
                    resolve();
                }
            });
        });
    }

    // Bet-related methods
    async insertBet(bet) {
        const sql = `
            INSERT OR REPLACE INTO bets (
                date, match_description, team_a, team_b, bet_on, category,
                market_odds, my_prob, edge, reward_risk, expectancy,
                kelly_pct, safe_size_pct, stake, outcome, pnl,
                reflection, llm_reason, llm_post_mortem, league
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        const params = [
            bet.date,
            bet.match_description,
            bet.team_a,
            bet.team_b,
            bet.bet_on,
            bet.category,
            bet.market_odds,
            bet.my_prob,
            bet.edge,
            bet.reward_risk,
            bet.expectancy,
            bet.kelly_pct,
            bet.safe_size_pct,
            bet.stake,
            bet.outcome,
            bet.pnl,
            bet.reflection,
            bet.llm_reason,
            bet.llm_post_mortem,
            bet.league
        ];
        
        return await this.run(sql, params);
    }

    async getBets(filters = {}) {
        let sql = 'SELECT * FROM bets WHERE 1=1';
        const params = [];
        
        if (filters.league) {
            sql += ' AND league = ?';
            params.push(filters.league);
        }
        
        if (filters.outcome) {
            sql += ' AND outcome = ?';
            params.push(filters.outcome);
        }
        
        if (filters.dateFrom) {
            sql += ' AND date >= ?';
            params.push(filters.dateFrom);
        }
        
        if (filters.dateTo) {
            sql += ' AND date <= ?';
            params.push(filters.dateTo);
        }
        
        sql += ' ORDER BY date DESC';
        
        return await this.all(sql, params);
    }

    async getBetStats() {
        const sql = `
            SELECT 
                COUNT(*) as total_bets,
                SUM(CASE WHEN outcome = 'WIN' THEN 1 ELSE 0 END) as wins,
                SUM(CASE WHEN outcome = 'LOSS' THEN 1 ELSE 0 END) as losses,
                SUM(CASE WHEN outcome = 'PENDING' THEN 1 ELSE 0 END) as pending,
                SUM(pnl) as total_pnl,
                AVG(CASE WHEN outcome = 'WIN' THEN pnl END) as avg_win,
                AVG(CASE WHEN outcome = 'LOSS' THEN pnl END) as avg_loss,
                AVG(edge) as avg_edge
            FROM bets
            WHERE outcome IN ('WIN', 'LOSS')
        `;
        return await this.get(sql);
    }

    // Match-related methods
    async insertMatch(match) {
        const sql = `
            INSERT OR REPLACE INTO matches (
                match_id, date, team_a, team_b, score_a, score_b,
                tournament, patch, league, game_duration
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        const params = [
            match.match_id,
            match.date,
            match.team_a,
            match.team_b,
            match.score_a,
            match.score_b,
            match.tournament,
            match.patch,
            match.league,
            match.game_duration
        ];
        
        return await this.run(sql, params);
    }

    async getMatches(filters = {}) {
        let sql = 'SELECT * FROM matches WHERE 1=1';
        const params = [];
        
        if (filters.league) {
            sql += ' AND league = ?';
            params.push(filters.league);
        }
        
        if (filters.team) {
            sql += ' AND (team_a = ? OR team_b = ?)';
            params.push(filters.team, filters.team);
        }
        
        if (filters.dateFrom) {
            sql += ' AND date >= ?';
            params.push(filters.dateFrom);
        }
        
        if (filters.dateTo) {
            sql += ' AND date <= ?';
            params.push(filters.dateTo);
        }
        
        sql += ' ORDER BY date DESC';
        
        return await this.all(sql, params);
    }

    async getH2H(teamA, teamB, dateFrom = null, dateTo = null) {
        let sql = `
            SELECT * FROM matches 
            WHERE (team_a = ? AND team_b = ?) OR (team_a = ? AND team_b = ?)
        `;
        const params = [teamA, teamB, teamB, teamA];
        
        if (dateFrom) {
            sql += ' AND date >= ?';
            params.push(dateFrom);
        }
        
        if (dateTo) {
            sql += ' AND date <= ?';
            params.push(dateTo);
        }
        
        sql += ' ORDER BY date DESC';
        
        return await this.all(sql, params);
    }

    // Team stats methods
    async insertTeamStats(stats) {
        const sql = `
            INSERT OR REPLACE INTO team_stats (
                team, date, league, wins, losses, kills, deaths, assists,
                kda, gold_per_min, cs_per_min, towers, dragons, barons,
                first_blood_rate, first_tower_rate
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        const params = [
            stats.team, stats.date, stats.league, stats.wins, stats.losses,
            stats.kills, stats.deaths, stats.assists, stats.kda,
            stats.gold_per_min, stats.cs_per_min, stats.towers,
            stats.dragons, stats.barons, stats.first_blood_rate, stats.first_tower_rate
        ];
        
        return await this.run(sql, params);
    }

    async getTeamStats(team, dateFrom = null, dateTo = null) {
        let sql = 'SELECT * FROM team_stats WHERE team = ?';
        const params = [team];
        
        if (dateFrom) {
            sql += ' AND date >= ?';
            params.push(dateFrom);
        }
        
        if (dateTo) {
            sql += ' AND date <= ?';
            params.push(dateTo);
        }
        
        sql += ' ORDER BY date DESC';
        
        return await this.all(sql, params);
    }
}

module.exports = new Database();
