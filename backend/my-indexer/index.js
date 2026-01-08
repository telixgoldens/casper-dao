const express = require('express');
const cors = require('cors');
const db = require('./db');
require('dotenv').config();

const CasperSDK = require('casper-js-sdk');

const {
  PrivateKey,
  KeyAlgorithm,
  ContractCallBuilder,
  Args,
  CLValue,
  PublicKey,
  serializeArgs,
} = CasperSDK;

const path = require('path');
const fs = require('fs');
const fetch = require('node-fetch');

const RPC_URL = process.env.RPC_URL || "http://65.109.83.79:7777/rpc";
const NETWORK_NAME = "casper-test";
const DAO_CONTRACT_HASH = "hash-5602ff70a5643b82d87302db480387a62d5993a5d2c267e8e88fd93a14e5c368";
const TOKEN_CONTRACT_HASH = "hash-876899abd9c79c58809b095dadb1a1735ec3dbad58337794cfedc198dd8fd517";

// --- Load key pair (Node backend) ---
const KEYS_PATH = path.join(__dirname, 'keys', 'secret_key.pem'); 

const privateKeyPem = fs.readFileSync(KEYS_PATH, 'utf-8');
const privateKey = PrivateKey.fromPem(privateKeyPem, KeyAlgorithm.ED25519);
const publicKey = privateKey.publicKey;

console.log('✅ Loaded public key:', publicKey.toHex());

// Helper function to poll for DAO creation
// Update pollForDaoCreation to handle errors better
async function pollForDaoCreation(deployHash, daoName, description, creator) {
  let attempts = 0;
  const maxAttempts = 40; // Increase to 40 (2.6 minutes)
  
  console.log(`🔄 Started polling for DAO creation: ${daoName}`);
  
  const interval = setInterval(async () => {
    attempts++;
    
    try {
      const response = await fetch(RPC_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'info_get_deploy',
          params: [deployHash]
        })
      });

      const result = await response.json();
      
      if (result.error) {
        if (attempts % 5 === 0) { // Log every 5th attempt
          console.log(`⏳ Attempt ${attempts}/${maxAttempts}: Deploy not found yet...`);
        }
        return;
      }
      
      const executionResult = result.result?.execution_info?.execution_result?.Version2;
      
      if (executionResult) {
        // Check for errors first
        if (executionResult.error_message) {
          console.error(`❌ DAO creation failed: ${executionResult.error_message}`);
          clearInterval(interval);
          return;
        }
        
        // Extract DAO ID from effects
        if (executionResult.effects) {
          for (const effect of executionResult.effects) {
            if (effect.kind?.AddKeys) {
              for (const addedKey of effect.kind.AddKeys) {
                if (addedKey.name?.startsWith('event_dao_created_')) {
                  const daoId = addedKey.name.replace('event_dao_created_', '');
                  
                  // Store in database
                  db.run(
                    "INSERT OR REPLACE INTO daos (dao_id, name, description, creator, deploy_hash) VALUES (?, ?, ?, ?, ?)",
                    [daoId, daoName, description, creator, deployHash],
                    (err) => {
                      if (!err) {
                        console.log(`✅ DAO registered! DAO ID: ${daoId}, Name: ${daoName}`);
                      } else {
                        console.error('Error saving DAO:', err);
                      }
                    }
                  );
                  
                  clearInterval(interval);
                  return;
                }
              }
            }
          }
        }
        
        console.log(`⚠️ Execution completed but no DAO ID found`);
        clearInterval(interval);
      } else {
        if (attempts % 5 === 0) {
          console.log(`⏳ Attempt ${attempts}/${maxAttempts}: Waiting for execution...`);
        }
      }
    } catch (err) {
      console.error('Polling error:', err.message);
    }
    
    if (attempts >= maxAttempts) {
      console.log(`⚠️ Stopped polling for DAO creation (timeout after ${maxAttempts} attempts)`);
      console.log(`Check deploy manually: https://testnet.cspr.live/deploy/${deployHash}`);
      clearInterval(interval);
    }
  }, 4000);
}

// Helper function to poll for vote execution
async function pollForVoteExecution(deployHash, daoId, proposalId, choice, voter) {
  let attempts = 0;
  const maxAttempts = 30;
  
  console.log(`🔄 Started polling for vote execution: DAO ${daoId}`);
  
  const interval = setInterval(async () => {
    attempts++;
    
    try {
      const response = await fetch(RPC_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'info_get_deploy',
          params: [deployHash]
        })
      });

      const result = await response.json();
      
      if (result.error) {
        console.log(`⏳ Vote attempt ${attempts}: Deploy not found yet...`);
        return;
      }
      
      const executionResult = result.result?.execution_info?.execution_result?.Version2;
      
      if (executionResult) {
        // Check if execution was successful
        if (executionResult.error_message) {
          console.error(`❌ Vote execution failed: ${executionResult.error_message}`);
          clearInterval(interval);
          return;
        }
        
        // Vote executed successfully - store it
        db.run(
          "INSERT OR IGNORE INTO votes (deploy_hash, dao_id, proposal_id, voter_address, choice) VALUES (?, ?, ?, ?, ?)",
          [deployHash, daoId, proposalId, voter, choice ? 1 : 0],
          (err) => {
            if (!err) {
              console.log(`✅ Vote stored! DAO: ${daoId}, Choice: ${choice ? 'YES' : 'NO'}, Voter: ${voter.substring(0, 10)}...`);
            } else {
              console.error('Error saving vote:', err);
            }
          }
        );
        
        clearInterval(interval);
        return;
      } else {
        console.log(`⏳ Vote attempt ${attempts}: Waiting for execution...`);
      }
    } catch (err) {
      console.error('Error polling for vote:', err.message);
    }
    
    if (attempts >= maxAttempts) {
      console.log(`⚠️ Stopped polling for vote execution (timeout)`);
      clearInterval(interval);
    }
  }, 4000);
}

async function putDeployViaRPC(transaction) {
  let deploy;
  
  if (transaction.getDeploy && typeof transaction.getDeploy === 'function') {
    deploy = transaction.getDeploy();
  } else {
    deploy = transaction;
  }
  
  let sessionArgsJson = [];
  let paymentArgsJson = [];
  
  try {
    if (deploy.session?.storedContractByHash?.args) {
      sessionArgsJson = serializeArgs(deploy.session.storedContractByHash.args);
    }
  } catch (e) {
    console.error('Error serializing session args:', e.message);
  }
  
  try {
    if (deploy.payment?.moduleBytes?.args) {
      paymentArgsJson = serializeArgs(deploy.payment.moduleBytes.args);
    }
  } catch (e) {
    console.error('Error serializing payment args:', e.message);
  }
  
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
        args: paymentArgsJson
      }
    },
    session: {
      StoredContractByHash: {
        hash: deploy.session.storedContractByHash.hash?.value || deploy.session.storedContractByHash.hash,
        entry_point: deploy.session.storedContractByHash.entryPoint,
        args: sessionArgsJson
      }
    },
    approvals: deploy.approvals.map(a => ({
      signer: a.signer.value || a.signer,
      signature: a.signature.value || a.signature
    }))
  };
  
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
    throw new Error(`RPC Error: ${result.error.message}`);
  }
  
  console.log('✅ Deploy submitted! Hash:', result.result.deploy_hash);
  
  return result.result.deploy_hash;
}

const app = express();
app.use(cors());
app.use(express.json());

// --- ROUTES ---
// Add these routes to your index.js

// Prepare vote deploy for user to sign
app.post("/prepare-vote", async (req, res) => {
  try {
    const { daoId, choice, userPublicKey } = req.body;
    
    if (!daoId || choice === undefined || !userPublicKey) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    console.log('📝 Preparing vote deploy for user to sign');
    console.log('User:', userPublicKey);
    console.log('DAO:', daoId, 'Choice:', choice ? 'YES' : 'NO');

    // Create the deploy but DON'T sign it with backend key
    const argsMap = {
      dao_id: CLValue.newCLUint64(BigInt(daoId)),
      proposal_id: CLValue.newCLUint64(BigInt(1)),
      choice: CLValue.newCLValueBool(choice)
    };

    const args = Args.fromMap(argsMap);
    
    // Use USER's public key (not backend's)
    
    const userPubKey = PublicKey.fromHex(userPublicKey);
    
    const builder = new ContractCallBuilder();
    
    builder
      .byHash(DAO_CONTRACT_HASH.slice(5))
      .entryPoint("vote")
      .from(userPubKey) // USER signs, not backend
      .chainName(NETWORK_NAME)
      .payment(150_000_000_000)
      .ttl(1800000)
      .runtimeArgs(args);

    const transaction = builder.buildFor1_5();
    
    // Get the deploy WITHOUT signing
    const deploy = transaction.getDeploy ? transaction.getDeploy() : transaction;
    
    // Extract args
    let sessionArgsJson = [];
    let paymentArgsJson = [];
    
    if (deploy.session?.storedContractByHash?.args) {
      sessionArgsJson = serializeArgs(deploy.session.storedContractByHash.args);
    }
    
    if (deploy.payment?.moduleBytes?.args) {
      paymentArgsJson = serializeArgs(deploy.payment.moduleBytes.args);
    }
    
    // Build deploy JSON for user to sign
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
          args: paymentArgsJson
        }
      },
      session: {
        StoredContractByHash: {
          hash: deploy.session.storedContractByHash.hash?.value || deploy.session.storedContractByHash.hash,
          entry_point: deploy.session.storedContractByHash.entryPoint,
          args: sessionArgsJson
        }
      },
      approvals: [] // User will add their signature
    };

    res.json({ 
      deployJson,
      message: 'Deploy ready for user to sign with Casper Wallet'
    });
    
  } catch (err) {
    console.error("❌ Prepare vote error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Submit user-signed deploy
app.post("/submit-signed-deploy", async (req, res) => {
  try {
    const { signedDeploy, deployJson, daoId, choice } = req.body; // ← Add daoId and choice directly
    
    if (!signedDeploy || !deployJson) {
      return res.status(400).json({ error: "Missing signedDeploy or deployJson" });
    }

    console.log('📤 Submitting user-signed deploy...');
    console.log('DAO ID from request:', daoId);
    console.log('Choice from request:', choice);

    const walletResponse = typeof signedDeploy === 'string' ? JSON.parse(signedDeploy) : signedDeploy;
    const originalDeploy = typeof deployJson === 'string' ? JSON.parse(deployJson) : deployJson;
    
    // Detect algorithm from public key
    const accountHex = originalDeploy.header.account;
    let algorithmPrefix;
    
    if (accountHex.startsWith('01')) {
      algorithmPrefix = '01'; // Ed25519
      console.log('Detected Ed25519 key');
    } else if (accountHex.startsWith('02')) {
      algorithmPrefix = '02'; // Secp256K1
      console.log('Detected Secp256K1 key');
    } else {
      throw new Error('Unknown key algorithm');
    }
    
    let signatureHex = walletResponse.signatureHex;
    
    if (!signatureHex.startsWith('01') && !signatureHex.startsWith('02')) {
      signatureHex = algorithmPrefix + signatureHex;
    }
    
    const approval = {
      signer: originalDeploy.header.account,
      signature: signatureHex
    };
    
    const finalDeploy = {
      hash: originalDeploy.hash,
      header: originalDeploy.header,
      payment: originalDeploy.payment,
      session: originalDeploy.session,
      approvals: [approval]
    };
    
    console.log('Submitting to RPC...');
    
    const response = await fetch(RPC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'account_put_deploy',
        params: { deploy: finalDeploy }
      })
    });

    const result = await response.json();
    
    if (result.error) {
      console.error('RPC Error:', result.error);
      throw new Error(`RPC Error: ${result.error.message}`);
    }
    
    const deployHash = result.result.deploy_hash;
    console.log('✅ User-signed deploy submitted! Hash:', deployHash);
    
    // Use the DAO ID and choice from request params (more reliable)
    const voter = originalDeploy.header?.account;
    
    if (daoId && voter) {
      console.log(`Starting polling: DAO ${daoId}, Choice: ${choice ? 'YES' : 'NO'}, Voter: ${voter.substring(0, 10)}...`);
      pollForVoteExecution(deployHash, daoId, "1", choice, voter);
    } else {
      console.log('⚠️ Missing daoId or voter, skipping polling');
    }

    res.json({ 
      deployHash,
      message: 'Vote submitted successfully'
    });
    
  } catch (err) {
    console.error("❌ Submit signed deploy error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Get list of votes
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

// Get aggregated stats
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

// Deploy: Create DAO
app.post("/deploy-create-dao", async (req, res) => {
  try {
    const { daoName, description, userPublicKey } = req.body;
    if (!daoName) return res.status(400).json({ error: "DAO name is required" });

    console.log('📝 Creating DAO:', daoName);
    console.log('👤 Requested by:', userPublicKey);
    console.log('🪙 Token contract:', TOKEN_CONTRACT_HASH);

    // Match the script EXACTLY
    const rawHash = TOKEN_CONTRACT_HASH.startsWith("hash-")
      ? TOKEN_CONTRACT_HASH.slice(5)
      : TOKEN_CONTRACT_HASH.replace(/^0x/, "");

    // Build key bytes: [type_byte, ...hash_bytes]
    const typePrefix = Buffer.from([1]); // 1 = Hash
    const hashBuffer = Buffer.from(rawHash, 'hex');
    const keyBuffer = Buffer.concat([typePrefix, hashBuffer]);

    console.log('Key buffer length:', keyBuffer.length); // Should be 33
    console.log('Key buffer hex:', keyBuffer.toString('hex'));

    const argsMap = {
      name: CLValue.newCLString(daoName),
      token_address: CLValue.newCLByteArray(Uint8Array.from(keyBuffer)),
      token_type: CLValue.newCLString("u256_address")  // ← Changed to match script!
    };

    const args = Args.fromMap(argsMap);
    const builder = new ContractCallBuilder();
    
    builder
      .byHash(DAO_CONTRACT_HASH.slice(5))
      .entryPoint("create_dao")
      .from(publicKey)
      .chainName(NETWORK_NAME)
      .payment(300_000_000_000)
      .ttl(1800000)
      .runtimeArgs(args);

    console.log('Building transaction...');
    const transaction = builder.buildFor1_5();
    
    console.log('Signing...');
    transaction.sign(privateKey);

    console.log('Submitting...');
    const deployHash = await putDeployViaRPC(transaction);

    console.log('✅ DAO deploy submitted! Deploy hash:', deployHash);

    pollForDaoCreation(deployHash, daoName, description, userPublicKey);

    res.json({ 
      deployHash,
      creator: userPublicKey,
      message: 'DAO creation submitted. Polling for execution...'
    });
  } catch (err) {
    console.error("❌ DAO deploy error:", err);
    console.error('Stack:', err.stack);
    res.status(500).json({ error: err.message });
  }
});


app.get('/verify-dao/:daoId', async (req, res) => {
  try {
    const { daoId } = req.params;
    
    console.log('Verifying DAO on chain:', daoId);
    
    // Get latest block
    const blockResponse = await fetch(RPC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'chain_get_block',
        params: []
      })
    });

    const blockResult = await blockResponse.json();
    
    if (blockResult.error) {
      throw new Error(`Block Error: ${blockResult.error.message}`);
    }

    // Get state_root_hash from Version2 block structure
    const stateRootHash = blockResult.result?.block_with_signatures?.block?.Version2?.header?.state_root_hash;
    
    if (!stateRootHash) {
      throw new Error('Could not get state root hash from block');
    }

    console.log('✅ Got state root hash:', stateRootHash.substring(0, 20) + '...');

    // Get contract state
    const response = await fetch(RPC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'state_get_item',
        params: {
          state_root_hash: stateRootHash,
          key: DAO_CONTRACT_HASH,
          path: []
        }
      })
    });

    const result = await response.json();
    
    if (result.error) {
      console.error('State get item error:', result.error);
      throw new Error(`RPC Error: ${result.error.message}`);
    }

    const namedKeys = result.result?.stored_value?.Contract?.named_keys || [];
    
    console.log('✅ Total named keys in contract:', namedKeys.length);
    
    // Get all DAO keys
    const allDaoKeys = namedKeys
      .filter(k => k.name.startsWith('event_dao_created_'))
      .map(k => ({
        name: k.name,
        dao_id: k.name.replace('event_dao_created_', '')
      }));
    
    console.log('✅ Found DAO keys:', allDaoKeys.length);
    console.log('📋 DAO IDs:', allDaoKeys.map(k => k.dao_id).join(', '));
    
    // Look for this specific DAO
    const daoEventKey = `event_dao_created_${daoId}`;
    const daoKey = namedKeys.find(key => key.name === daoEventKey);
    
    if (daoKey) {
      res.json({ 
        exists: true,
        daoId,
        message: `✅ DAO ${daoId} exists on chain!`,
        allDaosOnChain: allDaoKeys
      });
    } else {
      res.json({ 
        exists: false,
        daoId,
        message: `❌ DAO ${daoId} NOT found on chain`,
        allDaosOnChain: allDaoKeys,
        hint: allDaoKeys.length > 0 
          ? `Try voting with one of these DAO IDs: ${allDaoKeys.map(k => k.dao_id).join(', ')}` 
          : 'No DAOs exist yet. Create one first!'
      });
    }
    
  } catch (err) {
    console.error('❌ Error verifying DAO:', err);
    res.status(500).json({ error: err.message });
  }
});


// Add endpoint to check if voter has tokens
app.get('/check-voter-balance/:voterPublicKey', async (req, res) => {
  try {
    const { voterPublicKey } = req.params;
    
    console.log('Checking token balance for:', voterPublicKey);
    
    // This would need to query the token contract
    // For now, just return info
    res.json({
      message: 'To vote, users need governance tokens',
      voterPublicKey,
      tokenContract: TOKEN_CONTRACT_HASH,
      note: 'Make sure the voter has tokens from this contract to participate in voting'
    });
    
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

let lastDaoCreation = 0;
const COOLDOWN_MS = 10000; 
// Deploy: Vote
app.post("/deploy-vote", async (req, res) => {
  try {
     const now = Date.now();
    if (now - lastDaoCreation < COOLDOWN_MS) {
      const wait = Math.ceil((COOLDOWN_MS - (now - lastDaoCreation)) / 1000);
      return res.status(429).json({ 
        error: `Please wait ${wait} seconds before creating another DAO` 
      });
    }
    const { daoId, choice, userPublicKey } = req.body;
    if (daoId === undefined || choice === undefined) {
      return res.status(400).json({ error: "daoId and choice required" });
    }
    console.log('🗳️ Voting on DAO:', daoId, '(type:', typeof daoId, ')');
    console.log('BigInt value:', BigInt(daoId).toString());

    console.log('🗳️ Voting on DAO:', daoId, '- Choice:', choice ? 'YES' : 'NO');
    console.log('👤 Voter:', userPublicKey);

    const argsMap = {
      dao_id: CLValue.newCLUint64(BigInt(daoId)),
      proposal_id: CLValue.newCLUint64(BigInt(1)),
      choice: CLValue.newCLValueBool(choice)
    };

    const args = Args.fromMap(argsMap);
    const builder = new ContractCallBuilder();
    
    builder
      .byHash(DAO_CONTRACT_HASH.slice(5))
      .entryPoint("vote")
      .from(publicKey)
      .chainName(NETWORK_NAME)
      .payment(150_000_000_000)
      .ttl(1800000)
      .runtimeArgs(args);

    const transaction = builder.buildFor1_5();
    transaction.sign(privateKey);

    const deployHash = await putDeployViaRPC(transaction);

    // Start polling for vote execution
    pollForVoteExecution(deployHash, daoId, "1", choice, userPublicKey);

    res.json({ 
      deployHash,
      voter: userPublicKey,
      message: 'Vote submitted. Polling for execution...'
    });
    lastDaoCreation = now;
  } catch (err) {
    console.error("❌ Vote deploy error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Manually check and save a vote from deploy hash
app.post('/manual-check-vote', async (req, res) => {
  try {
    const { deployHash } = req.body;
    
    const response = await fetch(RPC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'info_get_deploy',
        params: [deployHash]
      })
    });

    const result = await response.json();
    const executionResult = result.result?.execution_info?.execution_result?.Version2;
    
    if (executionResult && !executionResult.error_message) {
      // Vote succeeded - save it
      // You'll need to extract DAO ID, choice, voter from the deploy
      // For now, just return success
      res.json({ success: true, message: 'Vote executed successfully' });
    } else {
      res.json({ success: false, error: executionResult?.error_message });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all DAOs
app.get('/daos', (req, res) => {
  db.all("SELECT * FROM daos ORDER BY created_at DESC", (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ daos: rows });
  });
});

// Get all votes (debugging)
app.get('/all-votes', (req, res) => {
  db.all("SELECT * FROM votes ORDER BY timestamp DESC", (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ votes: rows });
  });
});

// Clear simulated votes
app.get('/clear-simulated-votes', (req, res) => {
  db.run("DELETE FROM votes WHERE deploy_hash LIKE '0x%' AND length(deploy_hash) < 20", (err) => {
    if (err) return res.status(500).json({ error: err.message });
    
    db.get("SELECT COUNT(*) as count FROM votes", (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Simulated votes cleared', remainingVotes: row.count });
    });
  });
});

// Extract DAO ID from deploy
app.get('/extract-dao-id/:deployHash', async (req, res) => {
  try {
    const { deployHash } = req.params;
    
    const response = await fetch(RPC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'info_get_deploy',
        params: [deployHash]
      })
    });

    const result = await response.json();
    
    if (result.error) {
      throw new Error(`RPC Error: ${result.error.message}`);
    }

    const executionResult = result.result?.execution_info?.execution_result?.Version2;
    
    if (!executionResult) {
      return res.status(404).json({ error: 'Deploy not executed yet. Wait and try again.' });
    }

    let daoId = null;
    
    if (executionResult.effects) {
      for (const effect of executionResult.effects) {
        if (effect.kind?.AddKeys) {
          for (const addedKey of effect.kind.AddKeys) {
            if (addedKey.name?.startsWith('event_dao_created_')) {
              daoId = addedKey.name.replace('event_dao_created_', '');
              break;
            }
          }
        }
        if (daoId) break;
      }
    }

    if (!daoId) {
      return res.status(404).json({ error: 'DAO ID not found in execution effects' });
    }

    res.json({ daoId, deployHash });
    
  } catch (err) {
    console.error('Error extracting dao_id:', err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log('🚀 API running on port', PORT);
  console.log('📡 RPC URL:', RPC_URL);
  console.log('🔑 Public Key:', publicKey.toHex());
  console.log('✅ Using NowNodes polling (no event stream)');
});