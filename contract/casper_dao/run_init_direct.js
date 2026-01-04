const { CasperClient, DeployUtil, RuntimeArgs, Keys } = require('casper-js-sdk');

const NODE_URL = process.env.NODE_URL || "https://node.testnet.casper.network/rpc";
const NETWORK_NAME = process.env.NETWORK_NAME || "casper-test";
const KEY_PATH = process.env.KEY_PATH || "C:/Users/HP/Desktop/casperkeys/secret_key.pem";
const CONTRACT_HASH = process.argv[2] || process.env.DAO_CONTRACT_HASH || "contract-e4effb82c8c163e74a00d1d090482403b3e673021efca8c7654367d8819929a8";

async function loadKeys() {
  try { return Keys.Ed25519.loadKeyPairFromPrivateFile(KEY_PATH); }
  catch (e) {
    try { return Keys.Secp256K1.loadKeyPairFromPrivateFile(KEY_PATH); }
    catch (ee) { throw new Error('Failed to load keypair: ' + (ee.message||ee)); }
  }
}

function toHashBytes(s) {
  let hex = s;
  if (hex.startsWith('hash-')) hex = hex.slice(5);
  if (hex.startsWith('contract-')) hex = hex.slice(9);
  return Uint8Array.from(Buffer.from(hex, 'hex'));
}

(async ()=>{
  const client = new CasperClient(NODE_URL);
  const keys = await loadKeys();
  console.log('Key loaded');

  const contractHashBytes = toHashBytes(CONTRACT_HASH);

  const params = new DeployUtil.DeployParams(keys.publicKey, NETWORK_NAME);
  const session = DeployUtil.ExecutableDeployItem.newStoredContractByHash(contractHashBytes, 'init', RuntimeArgs.fromMap({}));
  const payment = DeployUtil.standardPayment(300000000000);
  let deploy = DeployUtil.makeDeploy(params, session, payment);
  deploy = DeployUtil.signDeploy(deploy, keys);

  try {
    const hash = await client.putDeploy(deploy);
    console.log('Init deploy sent:', hash);
    console.log('Monitor: https://testnet.cspr.live/deploy/' + hash);
  } catch (e) {
    console.error('Failed to send init deploy:', e.message||e);
  }
})();
