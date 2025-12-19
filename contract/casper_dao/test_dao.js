// FIX: We import the specific class directly from the module
import { 
  CasperClient, 
  DeployUtil, 
  RuntimeArgs, 
  CLValueBuilder, 
  Keys 
} from "casper-js-sdk";

import fs from 'fs';

// --- CONFIGURATION ---
const NODE_URL = "http://65.109.83.79:7777/rpc"; 
const NETWORK_NAME = "casper-test";
const KEY_PATH = "C:/Users/HP/Desktop/casperkeys/secret_key.pem"; 

// ⚠️ PASTE YOUR CONTRACT HASH HERE
// (Make sure you got this from the 'Named Keys' tab on cspr.live)
const CONTRACT_HASH = "hash-REPLACE_ME_WITH_REAL_HASH"; 

// Fake token hash for testing (using contract hash is fine for type checking)
const FAKE_TOKEN_HASH = CONTRACT_HASH; 

const client = new CasperClient(NODE_URL);

// Helper to send deploy
const sendDeploy = async (name, entryPoint, args, payment) => {
  console.log(`\n🚀 Sending ${name}...`);
  
  let keys;
  try {
    keys = Keys.Ed25519.loadKeyPairFromPrivateFile(KEY_PATH);
  } catch (e) {
    keys = Keys.Secp256K1.loadKeyPairFromPrivateFile(KEY_PATH);
  }

  const params = new DeployUtil.DeployParams(keys.publicKey, NETWORK_NAME);
  
  const session = DeployUtil.ExecutableDeployItem.newStoredContractByHash(
      CONTRACT_HASH,
      entryPoint,
      args
  );

  let deploy = DeployUtil.makeDeploy(params, session, payment);
  deploy = DeployUtil.signDeploy(deploy, keys);

  const hash = await client.putDeploy(deploy);
  console.log(`✅ ${name} Sent!`);
  console.log(`🔗 Monitor: https://testnet.cspr.live/deploy/${hash}`);
  return hash;
};

const main = async () => {
  console.log("🛠️ Preparing to send transaction...");

  // 1. Initialize Storage (Skipping if you already ran init_v2.js)
  // Uncomment the lines below if you need to run Init again
  /*
  await sendDeploy(
    "Init Storage", 
    "init", 
    RuntimeArgs.fromMap({}), 
    DeployUtil.standardPayment(10000000000) 
  );
  console.log("⏳ Waiting 15s...");
  await new Promise(r => setTimeout(r, 15000));
  */

  // 2. Create DAO
  // Ensure we strip "hash-" for the byte array conversion
  const tokenHashHex = FAKE_TOKEN_HASH.replace("hash-", "");
  
  // Create arguments safely
  const args = RuntimeArgs.fromMap({
    "name": CLValueBuilder.string("Freedom DAO"),
    "token_address": CLValueBuilder.key(
        CLValueBuilder.byteArray(Buffer.from(tokenHashHex, "hex"))
    )
  });

  await sendDeploy(
    "Create DAO",
    "create_dao",
    args,
    DeployUtil.standardPayment(10000000000) // 10 CSPR
  );
};

main();
