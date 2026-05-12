const express = require('express');
const router = express.Router();
const db = require('../database/db.cjs');

// GET /api/bets - Get all bets with optional filters
router.get('/', async (req, res) => {
    try {
        await db.connect();
        const bets = await db.getBets({
            league: req.query.league,
            outcome: req.query.outcome,
            dateFrom: req.query.dateFrom,
            dateTo: req.query.dateTo
        });
        await db.close();
        res.json(bets);
    } catch (err) {
        console.error('Error fetching bets:', err);
        res.status(500).json({ error: err.message });
    }
});

// GET /api/bets/stats - Get bet statistics
router.get('/stats', async (req, res) => {
    try {
        await db.connect();
        
        // Overall stats
        const overallStats = await db.getBetStats();
        
        // League breakdown
        const leagueStats = await db.all(`
            SELECT 
                league,
                COUNT(*) as total,
                SUM(CASE WHEN outcome = 'WIN' THEN 1 ELSE 0 END) as wins,
                SUM(CASE WHEN outcome = 'LOSS' THEN 1 ELSE 0 END) as losses,
                SUM(pnl) as pnl,
                AVG(edge) as avg_edge
            FROM bets
            WHERE league IS NOT NULL AND outcome IN ('WIN', 'LOSS')
            GROUP BY league
            ORDER BY pnl DESC
        `);
        
        // Monthly stats
        const monthlyStats = await db.all(`
            SELECT 
                substr(date, 1, 7) as month,
                COUNT(*) as total,
                SUM(CASE WHEN outcome = 'WIN' THEN 1 ELSE 0 END) as wins,
                SUM(CASE WHEN outcome = 'LOSS' THEN 1 ELSE 0 END) as losses,
                SUM(pnl) as pnl
            FROM bets
            WHERE outcome IN ('WIN', 'LOSS')
            GROUP BY month
            ORDER BY month DESC
        `);
        
        await db.close();
        
        res.json({
            overall: overallStats,
            byLeague: leagueStats,
            byMonth: monthlyStats
        });
    } catch (err) {
        console.error('Error fetching bet stats:', err);
        res.status(500).json({ error: err.message });
    }
});

// POST /api/bets - Add a new bet
router.post('/', async (req, res) => {
    try {
        await db.connect();
        const result = await db.insertBet(req.body);
        await db.close();
        res.json({ success: true, id: result.id });
    } catch (err) {
        console.error('Error adding bet:', err);
        res.status(500).json({ error: err.message });
    }
});

// POST /api/bets/import - Re-import from CSV
router.post('/import', async (req, res) => {
    try {
        const { importBets } = require('../database/import-bets.cjs');
        await importBets();
        res.json({ success: true, message: 'Bets imported successfully' });
    } catch (err) {
        console.error('Error importing bets:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
