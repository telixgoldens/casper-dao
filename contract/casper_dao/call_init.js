const { CasperClient, CasperServiceByJsonRPC, DeployUtil, RuntimeArgs, Keys } = require("casper-js-sdk");
const { execSync } = require('child_process');

const NODES = [
  "http://157.90.182.214:7777/rpc",
  "http://65.109.83.79:7777/rpc", 
  "https://node.testnet.casper.network/rpc",
];

const NETWORK_NAME = "casper-test";
const KEY_PATH = "C:/Users/HP/Desktop/casperkeys/secret_key.pem"; 

const HARDCODED_HASH = "hash-511efb42d9ae1f6fa233615a9ef730b88387aeb81524e8acc4865a1f08093f75";

async function run() {
  let keys;
  try {
    keys = Keys.Ed25519.loadKeyPairFromPrivateFile(KEY_PATH);
    console.log('Key loaded');
  } catch (err) {
    try {
      keys = Keys.Secp256K1.loadKeyPairFromPrivateFile(KEY_PATH);
      console.log(' Secp256k1 Key loaded');
    } catch (e) {
      console.error('Key load failed');
      return;
    }
  }

  const args = RuntimeArgs.fromMap({});

  for (let node of NODES) {
    process.stdout.write(`\nTrying ${node} ... `);
    
    const client = new CasperClient(node);
    const rpc = new CasperServiceByJsonRPC(node);

    try {
      await rpc.getStatus(); 

      let contractHashToUse = null;

      try {
          const publicKeyHex = keys.accountHex();
          const accountInfo = await rpc.stateGetAccountInfo(publicKeyHex);
          const namedKeys = accountInfo.Account?.namedKeys || accountInfo.namedKeys || [];
          const found = namedKeys.find(k => k.name === 'casper_dao_contract_v3');
          
          if (found) {
              console.log(`Found named key: ${found.key}`);
              contractHashToUse = found.key;
          }
      } catch (lookupErr) {
      }

      if (!contractHashToUse) {
          console.log(`Auto-detect failed. Using fallback hash: ${HARDCODED_HASH}`);
          contractHashToUse = HARDCODED_HASH;
      }

      let hex = contractHashToUse;
      if (hex.startsWith('hash-')) hex = hex.slice(5);
      if (hex.startsWith('contract-')) hex = hex.slice(9);
      const contractHashBytes = Uint8Array.from(Buffer.from(hex, 'hex'));

      const params = new DeployUtil.DeployParams(keys.publicKey, NETWORK_NAME);
      const session = DeployUtil.ExecutableDeployItem.newStoredContractByHash(contractHashBytes, 'init', args);
      const payment = DeployUtil.standardPayment(300000000000); 

      let deploy = DeployUtil.makeDeploy(params, session, payment);
      deploy = DeployUtil.signDeploy(deploy, keys);

      const hash = await client.putDeploy(deploy);
      console.log(' INIT DEPLOY SENT!');
      console.log('Deploy Hash:', hash);
      console.log(' Monitor: https://testnet.cspr.live/deploy/' + hash);

      

      return;
    } catch (err) {
      console.log('Failed on this node:', err.message);
    }
  }

  console.error(' ALL NODES FAILED.');
}

run();