const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const SCHEDULE_PATH = path.join('D:', 'hetzner', 'Sync', 'lol-schedule.json');

// GET /api/schedule - Get upcoming matches from JSON file
router.get('/', async (req, res) => {
    try {
        // Check if file exists
        if (!fs.existsSync(SCHEDULE_PATH)) {
            return res.status(404).json({ 
                error: 'Schedule file not found',
                path: SCHEDULE_PATH
            });
        }

        // Read and parse JSON
        const fileContent = fs.readFileSync(SCHEDULE_PATH, 'utf8');
        const schedule = JSON.parse(fileContent);

        // Filter by league if provided
        let matches = schedule.matches || [];
        if (req.query.league) {
            matches = matches.filter(m => 
                m.league.toUpperCase() === req.query.league.toUpperCase()
            );
        }

        // Filter by date range if provided
        if (req.query.dateFrom) {
            matches = matches.filter(m => m.date >= req.query.dateFrom);
        }
        if (req.query.dateTo) {
            matches = matches.filter(m => m.date <= req.query.dateTo);
        }

        // Sort by date
        matches.sort((a, b) => new Date(a.date) - new Date(b.date));

        res.json({
            last_updated: schedule.last_updated,
            total_matches: matches.length,
            matches: matches
        });
    } catch (err) {
        console.error('Error reading schedule:', err);
        res.status(500).json({ 
            error: 'Failed to read schedule',
            message: err.message 
        });
    }
});

// GET /api/schedule/refresh - Force re-read the file
router.post('/refresh', async (req, res) => {
    try {
        if (!fs.existsSync(SCHEDULE_PATH)) {
            return res.status(404).json({ 
                error: 'Schedule file not found',
                path: SCHEDULE_PATH
            });
        }

        const fileContent = fs.readFileSync(SCHEDULE_PATH, 'utf8');
        const schedule = JSON.parse(fileContent);

        res.json({
            success: true,
            last_updated: schedule.last_updated,
            total_matches: schedule.matches?.length || 0,
            message: 'Schedule refreshed successfully'
        });
    } catch (err) {
        console.error('Error refreshing schedule:', err);
        res.status(500).json({ 
            error: 'Failed to refresh schedule',
            message: err.message 
        });
    }
});

module.exports = router;
