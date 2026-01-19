const fs = require("fs");
const { 
  CasperClient, 
  DeployUtil, 
  RuntimeArgs, 
  CLValue, 
  Keys 
} = require("casper-js-sdk");

const NODES = [
  "http://65.109.83.79:7777/rpc",
  "https://node.testnet.casper.neatwork/rpc",
  "http://157.90.182.214:7777/rpc",
  "http://95.217.109.99:7777/rpc",
  "http://65.108.236.83:7777/rpc"
];

const NETWORK_NAME = "casper-test";
const KEY_PATH = "C:/Users/HP/Desktop/casperkeys/secret_key.pem"; 
const WASM_PATH = "C:/Users/HP/Desktop/casper-token-deployment/cep18/target/wasm32-unknown-unknown/release/cep18.wasm";

const deploy = async () => {
  let keys;
  try {
    keys = Keys.Ed25519.loadKeyPairFromPrivateFile(KEY_PATH);
    console.log(`Key loaded`);
  } catch (err) {
    try {
      keys = Keys.Secp256K1.loadKeyPairFromPrivateFile(KEY_PATH);
      console.log(`Secp256k1 Key loaded!`);
    } catch (e) {
      console.error("Key Error: Could not load .pem file.");
      return;
    }
  }

  let wasmBytes;
  try {
    const buffer = fs.readFileSync(WASM_PATH);
    wasmBytes = new Uint8Array(buffer);
    console.log(`WASM Size: ${wasmBytes.length} bytes`);
  } catch (err) {
    console.error(" Error: Could not find WASM file at " + WASM_PATH);
    console.error(err.message);
    return;
  }

  console.log("Constructing CEP-18 Token Deploy with Mint/Burn enabled...");
  
  const args = RuntimeArgs.fromMap({
    name: CLValue.string("DAO Governance Token2"),
    symbol: CLValue.string("DGOT"),
    decimals: CLValue.u8(9),
    total_supply: CLValue.u256("1000000000000000000"),
    enable_mint_burn: CLValue.u8(1),
    events_mode: CLValue.u8(1) 
  });

  const params = new DeployUtil.DeployParams(keys.publicKey, NETWORK_NAME);
  const session = DeployUtil.ExecutableDeployItem.newModuleBytes(wasmBytes, args);
  const payment = DeployUtil.standardPayment(500000000000); 

  let deploy = DeployUtil.makeDeploy(params, session, payment);
  deploy = DeployUtil.signDeploy(deploy, keys); 

  console.log(`Searching for active node...`);

  for (let node of NODES) {
      process.stdout.write(`Trying ${node} ... `);
      const client = new CasperClient(node);
      
      try {
          await client.nodeClient.getStatus(); 
          
          const hash = await client.putDeploy(deploy);
          
          console.log(`CONNECTED!`);
          console.log('');
          console.log('TOKEN CONTRACT DEPLOYED WITH MINT/BURN ENABLED!');
          console.log(`Deploy Hash: ${hash}`);
          console.log(`Monitor: https://testnet.cspr.live/deploy/${hash}`);
          console.log('');
          console.log(`NEXT STEPS:`);
          console.log(`1. Wait ~2 minutes for execution`);
          console.log(`2. Click the link above`);
          console.log(`3. Find 'Contract Hash' in Execution Results`);
          console.log(`4. Copy the contract hash (starts with 'hash-...')`);
          console.log(`5. Update TOKEN_CONTRACT_HASH in your backend`);
          console.log(`6. Mint tokens using mint_token.js`);
          console.log('');
          return; 
      } catch (err) {
          console.log(`Failed.`);
      }
  }
  
  console.error(" ALL NODES FAILED.");
};

deploy();