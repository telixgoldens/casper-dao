const express = require('express');
const cors = require('cors');
const db = require('./db');
const { startWatcher } = require('./watcher');
require('dotenv').config();

const CasperSDK = require('casper-js-sdk');


const {
  PrivateKey,
  KeyAlgorithm,
  ContractCallBuilder,
  Args,
  CLValue,
  serializeArgs,  
  deserializeArgs
} = CasperSDK;

const path = require('path');
const fs = require('fs');
const fetch = require('node-fetch');

const RPC_URL = process.env.RPC_URL || "http://65.109.83.79:7777/rpc";
const EVENT_STREAM_URL = process.env.NODE_URL || "http://159.65.203.12:9999/events/main";
const NETWORK_NAME = "casper-test";
const DAO_CONTRACT_HASH = "hash-5602ff70a5643b82d87302db480387a62d5993a5d2c267e8e88fd93a14e5c368";
const TOKEN_CONTRACT_HASH = "hash-c27539ac84749caebee898677d44fd3344b1772cbaf99f72897f47aad40cfea1";

// --- Load key pair (Node backend) ---
const KEYS_PATH = path.join(__dirname, 'keys', 'secret_key.pem'); 

const privateKeyPem = fs.readFileSync(KEYS_PATH, 'utf-8');
const privateKey = PrivateKey.fromPem(privateKeyPem, KeyAlgorithm.ED25519);
const publicKey = privateKey.publicKey;

console.log('Loaded public key:', publicKey.toHex());


async function putDeployViaRPC(transaction) {
  let deploy;
  
  if (transaction.getDeploy && typeof transaction.getDeploy === 'function') {
    deploy = transaction.getDeploy();
  } else {
    deploy = transaction;
  }
  
  console.log('Using serializeArgs from SDK...');
  
  // Extract the Args objects before they get stringified
  let sessionArgsJson = [];
  let paymentArgsJson = [];
  
  try {
    if (deploy.session?.storedContractByHash?.args) {
      const argsObj = deploy.session.storedContractByHash.args;
      sessionArgsJson = serializeArgs(argsObj);
      console.log('✅ Serialized session args');
    }
  } catch (e) {
    console.error('Error serializing session args:', e.message);
  }
  
  try {
    if (deploy.payment?.moduleBytes?.args) {
      const argsObj = deploy.payment.moduleBytes.args;
      paymentArgsJson = serializeArgs(argsObj);
      console.log('✅ Serialized payment args');
    }
  } catch (e) {
    console.error('Error serializing payment args:', e.message);
  }
  
  // Build the deploy JSON manually
  const deployJson = {
    hash: deploy.hash?.value || deploy.hash,
    header: {
      account: deploy.header.account.value || deploy.header.account,
      timestamp: deploy.header.timestamp.toJSON ? deploy.header.timestamp.toJSON() : deploy.header.timestamp,
      ttl: deploy.header.ttl.toJSON ? deploy.header.ttl.toJSON() : deploy.header.ttl,
      gas_price: deploy.header.gasPrice,
      body_hash: deploy.header.bodyHash?.value || deploy.header.bodyHash,
      dependencies: [],
      chain_name: deploy.header.chainName
    },
    payment: {
      ModuleBytes: {
        module_bytes: "",
        args: paymentArgsJson  // Use serialized args
      }
    },
    session: {
      StoredContractByHash: {
        hash: deploy.session.storedContractByHash.hash?.value || deploy.session.storedContractByHash.hash,
        entry_point: deploy.session.storedContractByHash.entryPoint,
        args: sessionArgsJson  // Use serialized args
      }
    },
    approvals: deploy.approvals.map(a => ({
      signer: a.signer.value || a.signer,
      signature: a.signature.value || a.signature
    }))
  };
  
  console.log('Deploy JSON with serialized args:');
  console.log('Session args type:', typeof sessionArgsJson, 'length:', Array.isArray(sessionArgsJson) ? sessionArgsJson.length : 'N/A');
  console.log('Payment args type:', typeof paymentArgsJson, 'length:', Array.isArray(paymentArgsJson) ? paymentArgsJson.length : 'N/A');
  
  const response = await fetch(RPC_URL, {
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
    console.error('RPC Error:', result.error);
    console.error('Deploy sample:', JSON.stringify(deployJson, null, 2).substring(0, 1500));
    throw new Error(`RPC Error: ${result.error.message}`);
  }
  
  console.log('🎉🎉🎉 DEPLOY SUCCESSFUL! 🎉🎉🎉');
  console.log('Deploy hash:', result.result.deploy_hash);
  
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

    const tokenHashHex = TOKEN_CONTRACT_HASH.slice(5);
    const tokenBytes = Uint8Array.from(Buffer.from(tokenHashHex, "hex"));

    const argsMap = {
      name: CLValue.newCLString(daoName),
      token_address: CLValue.newCLByteArray(tokenBytes),
      token_type: CLValue.newCLString("u256_address")
    };

    const args = Args.fromMap(argsMap);

    const builder = new ContractCallBuilder();
    
    builder
      .byHash(DAO_CONTRACT_HASH.slice(5))
      .entryPoint("create_dao")
      .from(publicKey)
      .chainName(NETWORK_NAME)
      .payment(300_000_000_000, 1)
      .ttl(1800000)
      .runtimeArgs(args);

    console.log('Building transaction...');
    const transaction = builder.buildFor1_5();
    
    console.log('Transaction built:', !!transaction);
    console.log('Signing transaction...');
    
    // sign() modifies in place, doesn't return
    transaction.sign(privateKey);

    console.log('✅ Transaction signed');
    console.log('Sending to network...');

    const deployHash = await putDeployViaRPC(transaction);

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

    const argsMap = {
      dao_id: CLValue.newCLUint64(BigInt(daoId)),
      proposal_id: CLValue.newCLUint64(BigInt(1)),
      choice: CLValue.newCLValueBool(choice)
    };

    const args = Args.fromMap(argsMap);
    console.log('Vote args toBytes() length:', args.toBytes().length);

    const builder = new ContractCallBuilder();
    
    builder
      .byHash(DAO_CONTRACT_HASH.slice(5))
      .entryPoint("vote")
      .from(publicKey)
      .chainName(NETWORK_NAME)
      .payment(150_000_000_000, 1)
      .ttl(1800000)
      .runtimeArgs(args);

    const transaction = builder.buildFor1_5();
    transaction.sign(privateKey);

    const deployHash = await putDeployViaRPC(transaction);

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
  console.log('📡 RPC URL:', RPC_URL);
  console.log('📡 Event Stream URL:', EVENT_STREAM_URL);
  console.log('🔑 Public Key:', publicKey.toHex());
  startWatcher();
});