import { 
  CasperClient, 
  DeployUtil, 
  RuntimeArgs, 
  Keys 
} from "casper-js-sdk";
import fs from 'fs';

// CONFIG
const NODE_URL = "http://65.109.83.79:7777/rpc"; 
const NETWORK_NAME = "casper-test";
const KEY_PATH = "C:/Users/HP/Desktop/casperkeys/secret_key.pem"; 

// ⚠️ PASTE YOUR NEW CONTRACT HASH HERE (Looks like "hash-8d3c...")
const CONTRACT_HASH = "hash-1674e205910451b4b211592cf0dcc785f5552a7187fbee18567cca62ce6d0994"; 

const init = async () => {
  const client = new CasperClient(NODE_URL);
  
  // Load Keys
  let keys;
  try {
    keys = Keys.Ed25519.loadKeyPairFromPrivateFile(KEY_PATH);
  } catch (e) {
    keys = Keys.Secp256K1.loadKeyPairFromPrivateFile(KEY_PATH);
  }

  console.log(`🚀 Initializing Contract: ${CONTRACT_HASH}...`);

  // Construct Deploy
  const params = new DeployUtil.DeployParams(keys.publicKey, NETWORK_NAME);
  
  // Call the "init" entry point
  const session = DeployUtil.ExecutableDeployItem.newStoredContractByHash(
      CONTRACT_HASH,
      "init",
      RuntimeArgs.fromMap({})
  );

  const payment = DeployUtil.standardPayment(10000000000); // 10 CSPR
  
  let deploy = DeployUtil.makeDeploy(params, session, payment);
  deploy = DeployUtil.signDeploy(deploy, keys);

  const deployHash = await client.putDeploy(deploy);

  console.log(`✅ Init Sent!`);
  console.log(`🔗 Monitor: https://testnet.cspr.live/deploy/${deployHash}`);
};

init();