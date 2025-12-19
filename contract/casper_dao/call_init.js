const fs = require("fs");
const { CasperClient, DeployUtil, RuntimeArgs, Keys } = require("casper-js-sdk");

const NODES = [
  "https://node.testnet.casper.network/rpc",
  "http://157.90.182.214:7777/rpc",
  "http://95.217.109.99:7777/rpc",
  "http://65.21.120.61:7777/rpc",
  "http://65.108.236.83:7777/rpc"
];

const NETWORK_NAME = "casper-test";
const KEY_PATH = "C:/Users/HP/Desktop/casperkeys/secret_key.pem"; 

async function run() {
  // load keys
  let keys;
  try {
    keys = Keys.Ed25519.loadKeyPairFromPrivateFile(KEY_PATH);
    console.log('✅ Key loaded');
  } catch (err) {
    try {
      keys = Keys.Secp256K1.loadKeyPairFromPrivateFile(KEY_PATH);
      console.log('✅ Secp256k1 Key loaded');
    } catch (e) {
      console.error('❌ Key load failed');
      return;
    }
  }

  const args = RuntimeArgs.fromMap({});

  for (let node of NODES) {
    process.stdout.write(`Trying ${node} ... `);
    const client = new CasperClient(node);
    try {
      await client.nodeClient.getStatus();

      // get account info to find named key
      const accountInfo = await client.getAccountInfo(keys.publicKey);
      const namedKeys = accountInfo.account.namedKeys || accountInfo.namedKeys || [];
      const found = namedKeys.find(k => k.name === 'casper_dao_contract');
      if (!found) {
        console.error('\n❌ Named key `casper_dao_contract` not found on installer account');
        return;
      }

      const keyStr = found.key; // e.g. 'hash-<hex>'
      let hex = keyStr;
      if (hex.startsWith('hash-')) hex = hex.slice(5);
      if (hex.startsWith('contract-')) hex = hex.slice(9);

      const contractHashBytes = Uint8Array.from(Buffer.from(hex, 'hex'));

      const params = new DeployUtil.DeployParams(keys.publicKey, NETWORK_NAME);
      const session = DeployUtil.ExecutableDeployItem.newStoredContractByHash(contractHashBytes, 'init', args);
      const payment = DeployUtil.standardPayment(300000000000);

      let deploy = DeployUtil.makeDeploy(params, session, payment);
      deploy = DeployUtil.signDeploy(deploy, keys);

      const hash = await client.putDeploy(deploy);
      console.log('\n✅ Sent init deploy!');
      console.log('📜 Deploy Hash:', hash);
      console.log('🔗 Monitor: https://testnet.cspr.live/deploy/' + hash);

      // run check_deploy.js for convenience
      const { execSync } = require('child_process');
      console.log('\nRunning check_deploy.js to inspect execution result...');
      execSync(`node check_deploy.js ${hash}`, { stdio: 'inherit', cwd: __dirname });

      return;
    } catch (err) {
      console.log('❌ Failed:', err.message ? err.message : err);
      // try next node
    }
  }

  console.error('\n❌ ALL NODES FAILED.');
}

run();
