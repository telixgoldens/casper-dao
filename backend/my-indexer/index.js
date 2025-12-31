require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { EventStream, EventName } = require('casper-js-sdk');
const { Client } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

// --- DATABASE SETUP ---
const db = new Client({ connectionString: process.env.DATABASE_URL });
db.connect();

// Run this once to create table: 
// db.query("CREATE TABLE IF NOT EXISTS votes (dao_id INT, proposal_id INT, voter TEXT, choice BOOLEAN, timestamp TIMESTAMP DEFAULT NOW())");

// --- INDEXER (LISTENER) ---
const es = new EventStream(process.env.NODE_URL);

es.subscribe(EventName.DeployProcessed, async (event) => {
    const deploy = event.body.DeployProcessed;
    if (!deploy.execution_result.Success) return;

    // Check if it's our contract (simplified check)
    // In production, parse the specific "event_vote" keys we emitted in Rust
    // For this Hackathon version, we read the Deploy Arguments directly (Input Argument Strategy)
    
    const session = deploy.deploy_session;
    let args = null;
    if (session.StoredContractByHash) args = session.StoredContractByHash.args;
    
    if (args) {
        const daoIdArg = args.find(a => a[0] === 'dao_id');
        const choiceArg = args.find(a => a[0] === 'choice');
        
        if (daoIdArg && choiceArg) {
            console.log("🗳️ Vote Detected!");
            const daoId = parseInt(daoIdArg[1].parsed);
            const choice = choiceArg[1].parsed;
            const voter = deploy.account;

            await db.query(
                "INSERT INTO votes (dao_id, proposal_id, voter, choice) VALUES ($1, $2, $3, $4)",
                [daoId, 1, voter, choice] // Hardcoding proposal 1 for demo
            );
        }
    }
});
es.start();

// --- API ENDPOINTS ---
app.get('/votes/:dao_id', async (req, res) => {
    const result = await db.query("SELECT * FROM votes WHERE dao_id = $1", [req.params.dao_id]);
    res.json(result.rows);
});

app.listen(process.env.API_PORT, () => console.log(`Backend running on ${process.env.API_PORT}`));