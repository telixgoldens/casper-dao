const fs = require("fs");
const { 
  CasperClient, 
  DeployUtil, 
  RuntimeArgs, 
  CLValue, 
  Keys 
} = require("casper-js-sdk");

// --- 1. CONFIGURATION ---
// We use the IPs you found, but we switch port 35000 -> 7777 for RPC
const NODES = [
  "https://node.testnet.casper.network/rpc",
  "http://157.90.182.214:7777/rpc",
  "http://95.217.109.99:7777/rpc",
  "http://65.21.120.61:7777/rpc",
    "http://65.108.236.83:7777/rpc"
];

const NETWORK_NAME = "casper-test";
const KEY_PATH = "C:/Users/HP/Desktop/casperkeys/secret_key.pem"; 
const WASM_PATH = "./target/wasm32-unknown-unknown/release/casper_dao_v2.wasm";

const deploy = async () => {
  // --- 2. LOAD KEYS ---
  let keys;
  try {
    keys = Keys.Ed25519.loadKeyPairFromPrivateFile(KEY_PATH);
    console.log(`✅ Key loaded`);
  } catch (err) {
    try {
      keys = Keys.Secp256K1.loadKeyPairFromPrivateFile(KEY_PATH);
      console.log(`✅ Secp256k1 Key loaded!`);
    } catch (e) {
      console.error("❌ Key Error: Could not load .pem file.");
      return;
    }
  }

  // --- 3. READ WASM ---
  let wasmBytes;
  try {
    const buffer = fs.readFileSync(WASM_PATH);
    wasmBytes = new Uint8Array(buffer);
    console.log(`✅ WASM Size: ${wasmBytes.length} bytes`);
  } catch (err) {
    console.error("❌ Error: Could not find WASM file at " + WASM_PATH);
    return;
  }

  // --- 4. CONSTRUCT DEPLOY ---
  console.log("🚀 Constructing Deploy...");
  
  const args = RuntimeArgs.fromMap({});

  const params = new DeployUtil.DeployParams(keys.publicKey, NETWORK_NAME);
  const session = DeployUtil.ExecutableDeployItem.newModuleBytes(wasmBytes, args);
  const payment = DeployUtil.standardPayment(300000000000); 

  let deploy = DeployUtil.makeDeploy(params, session, payment);
  deploy = DeployUtil.signDeploy(deploy, keys); 

  // --- 5. SEND (The Loop) ---
  console.log(`📡 Searching for active node...`);

  for (let node of NODES) {
      process.stdout.write(`Trying ${node} ... `);
      const client = new CasperClient(node);
      
      try {
          // Check status first
          await client.nodeClient.getStatus(); 
          
          // If alive, send deploy
          const hash = await client.putDeploy(deploy);
          
          console.log(`\n✅ CONNECTED!`);
          console.log(`📜 Deploy Hash: ${hash}`);
          console.log(`🔗 Monitor: https://testnet.cspr.live/deploy/${hash}`);
          console.log(`\n👉 NEXT STEP: Wait 1 min. Click link. Find 'Contract Hash' inside 'Execution Results'.`);
          return; 
      } catch (err) {
          console.log(`❌ Failed.`);
      }
  }
  
  console.error("\n❌ ALL NODES FAILED.");
};

deploy();