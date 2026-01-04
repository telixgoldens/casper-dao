const express = require('express');
const cors = require('cors');
const db = require('./db');
const { startWatcher } = require('./watcher');
require('dotenv').config();

const CasperSDK = require('casper-js-sdk');

const {
  PrivateKey,
  KeyAlgorithm,
  Args,
  CLValueString,
  CLValueByteArray,
  CLValueUInt64,
  CLValueBool,
  CLValueUInt512,
  Deploy,
  DeployHeader,
  StoredContractByHash,
  ModuleBytes,
  HexBytes,
  Hash,
  Approval
} = CasperSDK;

const path = require('path');
const fs = require('fs');
const fetch = require('node-fetch');

const NODE_URL = process.env.NODE_URL || "http://65.109.83.79:7777/rpc";
const NETWORK_NAME = "casper-test";
const DAO_CONTRACT_HASH = "hash-5602ff70a5643b82d87302db480387a62d5993a5d2c267e8e88fd93a14e5c368";
const TOKEN_CONTRACT_HASH = "hash-c27539ac84749caebee898677d44fd3344b1772cbaf99f72897f47aad40cfea1";

// --- Load key pair (Node backend) ---
const KEYS_PATH = path.join(__dirname, 'keys', 'secret_key.pem'); 

const privateKeyPem = fs.readFileSync(KEYS_PATH, 'utf-8');
const privateKey = PrivateKey.fromPem(privateKeyPem, KeyAlgorithm.ED25519);
const publicKey = privateKey.publicKey;

console.log('✅ Loaded public key:', publicKey.toHex());
console.log('Private key methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(privateKey)));

// Helper function to send deploy via RPC
async function putDeployViaRPC(signedDeploy) {
  const deployJson = signedDeploy.toJson ? signedDeploy.toJson() : JSON.parse(JSON.stringify(signedDeploy));
  
  const response = await fetch(NODE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'account_put_deploy',
      params: { deploy: deployJson }
    })
  });

  const result = await response.json();
  
  if (result.error) {
    throw new Error(`RPC Error: ${result.error.message}`);
  }
  
  return result.result.deploy_hash;
}

const app = express();
app.use(cors());
app.use(express.json());

// --- ROUTES ---

// 1. Get list of votes
app.get('/votes/:proposalId', (req, res) => {
  const { proposalId } = req.params;
  
  db.all(
    "SELECT * FROM votes WHERE proposal_id = ? ORDER BY timestamp DESC LIMIT 50", 
    [proposalId], 
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ votes: rows });
    }
  );
});

// 2. Get aggregated stats
app.get('/stats/:daoId/:proposalId', (req, res) => {
  const { daoId, proposalId } = req.params;

  db.get(
    "SELECT COUNT(*) as count FROM votes WHERE dao_id = ? AND proposal_id = ? AND choice = 1",
    [daoId, proposalId],
    (err, yesRow) => {
      if (err) return res.status(500).json({ error: err.message });

      db.get(
        "SELECT COUNT(*) as count FROM votes WHERE dao_id = ? AND proposal_id = ? AND choice = 0",
        [daoId, proposalId],
        (err, noRow) => {
          if (err) return res.status(500).json({ error: err.message });

          res.json({
            yes: yesRow.count,
            no: noRow.count,
            total: yesRow.count + noRow.count
          });
        }
      );
    }
  );
});

// --- 3. Deploy: Create DAO ---
app.post("/deploy-create-dao", async (req, res) => {
  try {
    const { daoName, userPublicKey } = req.body;
    if (!daoName) return res.status(400).json({ error: "DAO name is required" });

    console.log('Creating DAO:', daoName);
    console.log('Requested by user:', userPublicKey);

    const tokenBytes = Uint8Array.from(Buffer.from(TOKEN_CONTRACT_HASH.slice(5), "hex"));

    // Create CLValues
    const nameArg = new CLValueString(daoName);
    const tokenAddressArg = new CLValueByteArray(tokenBytes);
    const tokenTypeArg = new CLValueString("u256_address");

    // Create Args
    const args = Args.fromMap({
      name: nameArg,
      token_address: tokenAddressArg,
      token_type: tokenTypeArg,
    });

    // Create session
    const contractHashBytes = Uint8Array.from(Buffer.from(DAO_CONTRACT_HASH.slice(5), "hex"));
    const session = new StoredContractByHash(contractHashBytes, "create_dao", args);

    // Create payment
    const paymentAmount = new CLValueUInt512(BigInt("300000000000"));
    const paymentArgs = Args.fromMap({
      amount: paymentAmount
    });
    const payment = new ModuleBytes(new Uint8Array(0), paymentArgs);

    // Create deploy with proper initialization
    const deploy = new Deploy();
    deploy.header = new DeployHeader();
    deploy.header.account = publicKey;
    deploy.header.timestamp = Date.now();
    deploy.header.ttl = 1800000;
    deploy.header.gasPrice = 1;
    deploy.header.chainName = NETWORK_NAME;
    deploy.header.dependencies = [];
    
    // Initialize bodyHash and hash with empty Hash objects
    const emptyHashBytes = new Uint8Array(32).fill(0);
    deploy.header.bodyHash = new Hash(emptyHashBytes);
    deploy.hash = new Hash(emptyHashBytes);
    
    deploy.payment = payment;
    deploy.session = session;
    deploy.approvals = [];

    console.log('Deploy structure created, attempting to sign manually...');

    // Manual signing approach
    try {
      // Get deploy bytes for signing
      const deployBytes = deploy.toBytes();
      console.log('Deploy serialized to bytes, length:', deployBytes.length);
      
      // Sign with private key
      const signature = privateKey.sign(deployBytes);
      console.log('Signature created, length:', signature.length);
      
      // Create approval
      const approval = new Approval();
      approval.signer = publicKey;
      approval.signature = signature;
      
      deploy.approvals = [approval];
      
      // Compute deploy hash from the bytes
      const crypto = require('crypto');
      const hashBytes = crypto.createHash('blake2b256').update(deployBytes).digest();
      deploy.hash = new Hash(hashBytes);
      
      console.log('Deploy signed and hashed manually');
      
    } catch (signErr) {
      console.error('Manual signing error:', signErr);
      throw signErr;
    }

    // Send deploy via RPC
    const deployHash = await putDeployViaRPC(deploy);

    console.log('✅ DAO created successfully. Deploy hash:', deployHash);
    console.log('Creator:', userPublicKey);

    res.json({ 
      deployHash,
      creator: userPublicKey 
    });
  } catch (err) {
    console.error("❌ DAO deploy error:", err);
    console.error("Error stack:", err.stack);
    res.status(500).json({ error: err.message });
  }
});

// --- 4. Deploy: Vote ---
app.post("/deploy-vote", async (req, res) => {
  try {
    const { daoId, choice, userPublicKey } = req.body;
    if (daoId === undefined || choice === undefined) {
      return res.status(400).json({ error: "daoId and choice required" });
    }

    console.log('Voting:', { daoId, choice });
    console.log('Voter:', userPublicKey);

    const args = Args.fromMap({
      dao_id: new CLValueUInt64(BigInt(daoId)),
      proposal_id: new CLValueUInt64(BigInt(1)),
      choice: new CLValueBool(choice),
    });

    const contractHashBytes = Uint8Array.from(Buffer.from(DAO_CONTRACT_HASH.slice(5), "hex"));
    const session = new StoredContractByHash(contractHashBytes, "vote", args);

    const paymentAmount = new CLValueUInt512(BigInt("150000000000"));
    const paymentArgs = Args.fromMap({
      amount: paymentAmount
    });
    const payment = new ModuleBytes(new Uint8Array(0), paymentArgs);

    const deploy = new Deploy();
    deploy.header = new DeployHeader();
    deploy.header.account = publicKey;
    deploy.header.timestamp = Date.now();
    deploy.header.ttl = 1800000;
    deploy.header.gasPrice = 1;
    deploy.header.chainName = NETWORK_NAME;
    deploy.header.dependencies = [];
    
    const emptyHashBytes = new Uint8Array(32).fill(0);
    deploy.header.bodyHash = new Hash(emptyHashBytes);
    deploy.hash = new Hash(emptyHashBytes);
    
    deploy.payment = payment;
    deploy.session = session;
    deploy.approvals = [];

    // Manual signing
    const deployBytes = deploy.toBytes();
    const signature = privateKey.sign(deployBytes);
    
    const approval = new Approval();
    approval.signer = publicKey;
    approval.signature = signature;
    
    deploy.approvals = [approval];
    
    const crypto = require('crypto');
    const hashBytes = crypto.createHash('blake2b256').update(deployBytes).digest();
    deploy.hash = new Hash(hashBytes);

    const deployHash = await putDeployViaRPC(deploy);

    console.log('✅ Vote submitted successfully. Deploy hash:', deployHash);
    console.log('Voter:', userPublicKey);

    res.json({ 
      deployHash,
      voter: userPublicKey 
    });
  } catch (err) {
    console.error("❌ Vote deploy error:", err);
    res.status(500).json({ error: err.message });
  }
});

// --- Start server + watcher ---
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log('🚀 API running on port', PORT);
  console.log('📡 Node URL:', NODE_URL);
  console.log('🔑 Public Key:', publicKey.toHex());
  startWatcher();
});