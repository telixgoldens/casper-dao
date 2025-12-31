require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { Client } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet()); // Adds security headers
app.use(cors());   // Allows your React app to fetch data
app.use(express.json());

// Database Connection
const db = new Client({ connectionString: process.env.DATABASE_URL });
db.connect();

// --- ENDPOINTS ---

/**
 * 1. GET /daos
 * Returns a list of all DAOs created on your platform.
 * (Assumes you added a 'daos' table to your Indexer logic, 
 * or you can fetch unique DAO IDs from the votes table if you are lazy)
 */
app.get('/daos', async (req, res) => {
    try {
        // Ideally, you have a 'daos' table. For now, let's get unique DAO IDs from votes
        // just to show it working without extra schema changes.
        const result = await db.query(`
            SELECT DISTINCT dao_id FROM votes ORDER BY dao_id ASC
        `);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database error" });
    }
});

/**
 * 2. GET /votes/:proposal_id
 * The core "Explorer" feature. Returns the history of votes for a proposal.
 */
app.get('/votes/:proposal_id', async (req, res) => {
    const { proposal_id } = req.params;
    
    try {
        const result = await db.query(`
            SELECT 
                deploy_hash, 
                voter_address, 
                choice, 
                voting_power, 
                timestamp 
            FROM votes 
            WHERE proposal_id = $1 
            ORDER BY timestamp DESC
        `, [proposal_id]);

        res.json({
            count: result.rowCount,
            votes: result.rows
        });
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch votes" });
    }
});

/**
 * 3. GET /stats/:dao_id
 * Returns aggregated analytics (Total Yes vs No).
 * Your frontend uses this to draw the Pie Chart.
 */
app.get('/stats/:dao_id/:proposal_id', async (req, res) => {
    const { dao_id, proposal_id } = req.params;
    
    try {
        // SQL magic to sum up voting power based on choice
        const result = await db.query(`
            SELECT 
                choice,
                COUNT(*) as vote_count,
                SUM(voting_power) as total_power
            FROM votes
            WHERE dao_id = $1 AND proposal_id = $2
            GROUP BY choice
        `, [dao_id, proposal_id]);

        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch stats" });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 API Explorer running on port ${PORT}`);
});