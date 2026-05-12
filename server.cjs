// Express server with SQLite database for LoL Esports Dashboard
// Run: node server.cjs

const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const betsRoutes = require('./server/routes/bets.cjs');
const matchesRoutes = require('./server/routes/matches.cjs');
const scheduleRoutes = require('./server/routes/schedule.cjs');

const app = express();
const PORT = 3001;

// Enable CORS for all origins (development only)
app.use(cors());
app.use(express.json());

const POLYMARKET_GRAPHQL_URL = 'https://polymarket.com/api/graphql';

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        database: 'sqlite'
    });
});

// API Routes
app.use('/api/bets', betsRoutes);
app.use('/api/matches', matchesRoutes);
app.use('/api/schedule', scheduleRoutes);

// Proxy Polymarket GraphQL requests
app.post('/api/polymarket', async (req, res) => {
    console.log('📨 Received request:', req.body);
    
    try {
        const response = await fetch(POLYMARKET_GRAPHQL_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Origin': 'https://polymarket.com',
                'Referer': 'https://polymarket.com/',
            },
            body: JSON.stringify(req.body),
        });

        console.log('📡 Polymarket response status:', response.status);
        
        const text = await response.text();
        console.log('📄 Polymarket response:', text.substring(0, 500));
        
        try {
            const data = JSON.parse(text);
            res.json(data);
        } catch (parseError) {
            console.error('❌ Failed to parse JSON:', parseError);
            res.status(500).json({ error: 'Invalid JSON response from Polymarket', raw: text.substring(0, 200) });
        }
    } catch (error) {
        console.error('❌ Proxy error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get user positions endpoint (simplified)
app.get('/api/polymarket/positions/:walletAddress', async (req, res) => {
    const { walletAddress } = req.params;

    const query = `
        query GetUserPositions($walletAddress: String!) {
            user(walletAddress: $walletAddress) {
                positions {
                    market {
                        id
                        question
                        description
                        slug
                        category
                        tags
                        outcomes
                        outcomePrices
                        endDate
                        status
                    }
                    outcomeIndex
                    quantity
                    avgPrice
                    value
                    pnl
                    pnlPercent
                }
            }
        }
    `;

    try {
        const response = await fetch(POLYMARKET_GRAPHQL_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Origin': 'https://polymarket.com',
                'Referer': 'https://polymarket.com/',
            },
            body: JSON.stringify({
                query,
                variables: { walletAddress: walletAddress.toLowerCase() },
            }),
        });

        const text = await response.text();
        
        try {
            const data = JSON.parse(text);
            res.json(data);
        } catch (parseError) {
            res.status(500).json({ error: 'Invalid JSON response', raw: text.substring(0, 200) });
        }
    } catch (error) {
        console.error('Proxy error:', error);
        res.status(500).json({ error: error.message });
    }
});

// 404 handler
app.use((req, res) => {
    console.log('404 Not Found:', req.method, req.url);
    res.status(404).json({ error: 'Not found', path: req.url });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ error: err.message });
});

const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 API Endpoints:`);
    console.log(`   - Health: http://localhost:${PORT}/api/health`);
    console.log(`   - Bets: http://localhost:${PORT}/api/bets`);
    console.log(`   - Bet Stats: http://localhost:${PORT}/api/bets/stats`);
    console.log(`   - Matches: http://localhost:${PORT}/api/matches`);
    console.log(`   - H2H: http://localhost:${PORT}/api/matches/h2h/:teamA/:teamB`);
    console.log(`   - Polymarket Proxy: http://localhost:${PORT}/api/polymarket`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});
