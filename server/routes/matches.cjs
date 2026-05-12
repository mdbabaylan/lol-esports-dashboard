const express = require('express');
const router = express.Router();
const db = require('../database/db.cjs');

// GET /api/matches - Get all matches with optional filters
router.get('/', async (req, res) => {
    try {
        await db.connect();
        const matches = await db.getMatches({
            league: req.query.league,
            team: req.query.team,
            dateFrom: req.query.dateFrom,
            dateTo: req.query.dateTo
        });
        await db.close();
        res.json(matches);
    } catch (err) {
        console.error('Error fetching matches:', err);
        res.status(500).json({ error: err.message });
    }
});

// GET /api/matches/h2h/:teamA/:teamB - Get head-to-head history
router.get('/h2h/:teamA/:teamB', async (req, res) => {
    try {
        await db.connect();
        const matches = await db.getH2H(
            req.params.teamA,
            req.params.teamB,
            req.query.dateFrom,
            req.query.dateTo
        );
        
        // Calculate stats
        let teamAWins = 0;
        let teamBWins = 0;
        
        matches.forEach(m => {
            if (m.score_a > m.score_b) {
                if (m.team_a === req.params.teamA) teamAWins++;
                else teamBWins++;
            } else if (m.score_b > m.score_a) {
                if (m.team_b === req.params.teamA) teamAWins++;
                else teamBWins++;
            }
        });
        
        await db.close();
        
        res.json({
            matches,
            stats: {
                total: matches.length,
                [req.params.teamA]: teamAWins,
                [req.params.teamB]: teamBWins
            }
        });
    } catch (err) {
        console.error('Error fetching H2H:', err);
        res.status(500).json({ error: err.message });
    }
});

// POST /api/matches - Add a new match
router.post('/', async (req, res) => {
    try {
        await db.connect();
        const result = await db.insertMatch(req.body);
        await db.close();
        res.json({ success: true, id: result.id });
    } catch (err) {
        console.error('Error adding match:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
