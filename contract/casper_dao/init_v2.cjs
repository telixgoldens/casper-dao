const fs = require('fs');
const { CasperClient, DeployUtil, RuntimeArgs, Keys } = require('casper-js-sdk');

// CONFIG (keep a single node here; script will try to use it)
const NODE_URL = process.env.NODE_URL || "http://65.109.83.79:7777/rpc";
const NETWORK_NAME = process.env.NETWORK_NAME || "casper-test";
const KEY_PATH = process.env.KEY_PATH || "C:/Users/HP/Desktop/casperkeys/secret_key.pem";

// CONTRACT_HASH can be provided in three ways (priority):
// 1) CLI arg: `node init_v2.cjs <contract-hash>`
// 2) env var: CONTRACT_HASH
// 3) hard-coded below (fallback) -- leave as placeholder to trigger auto-detect
let CONTRACT_HASH = process.argv[2] || process.env.CONTRACT_HASH || "hash-1674e205910451b4b211592cf0dcc785f5552a7187fbee18567cca62ce6d0994";

async function loadKeys() {
  try {
    return Keys.Ed25519.loadKeyPairFromPrivateFile(KEY_PATH);
  } catch (e) {
    try {
      return Keys.Secp256K1.loadKeyPairFromPrivateFile(KEY_PATH);
    } catch (ee) {
      throw new Error(`Failed to load keypair from ${KEY_PATH}: ${ee.message || ee}`);
    }
  }
}

function normalizeHashString(s) {
  if (!s) return null;
  if (s.startsWith('hash-')) return s;
  if (s.startsWith('contract-')) return 'hash-' + s.slice('contract-'.length);
  // if hex only, prefix
  if (/^[0-9a-fA-F]{64}$/.test(s)) return 'hash-' + s;
  return null;
}

const init = async () => {
  const client = new CasperClient(NODE_URL);

  let keys;
  try {
    keys = await loadKeys();
    console.log('✅ Key loaded');
  } catch (err) {
    console.error('❌ Key load error:', err.message);
    return;
  }

  // If CONTRACT_HASH is placeholder, try to auto-detect from deployer account named keys
  const normalized = normalizeHashString(CONTRACT_HASH);
  if (!normalized || normalized.includes('PASTE_YOUR_HASH_HERE')) {
    console.log('⚠️ CONTRACT_HASH not provided or placeholder — attempting to auto-detect from account named keys...');
    try {
      const accInfo = await client.getAccountInfo(keys.publicKey);
      const namedKeys = accInfo.account?.namedKeys || accInfo.namedKeys || [];
      const found = namedKeys.find(k => k.name === 'casper_dao_contract');
      if (found && found.key) {
        CONTRACT_HASH = normalizeHashString(found.key) || found.key;
        console.log('ℹ️ Detected contract named key:', found.key);
      } else {
        console.error('❌ Could not find named key `casper_dao_contract` on your account. Provide CONTRACT_HASH as an env var or CLI arg.');
        return;
      }
    } catch (err) {
      console.error('❌ Failed to query account info for auto-detect:', err.message || err);
      return;
    }
  }

  console.log(`🚀 Initializing Contract: ${CONTRACT_HASH} on ${NODE_URL}`);

  // Ensure normalized form for stored contract by hash API
  const contractHashString = CONTRACT_HASH.startsWith('hash-') ? CONTRACT_HASH.slice(5) : CONTRACT_HASH;
  const contractHashBytes = Uint8Array.from(Buffer.from(contractHashString, 'hex'));

  // Construct deploy
  try {
    const params = new DeployUtil.DeployParams(keys.publicKey, NETWORK_NAME);
    const session = DeployUtil.ExecutableDeployItem.newStoredContractByHash(contractHashBytes, 'init', RuntimeArgs.fromMap({}));
    const payment = DeployUtil.standardPayment(Number(process.env.PAYMENT) || 10000000000);

    let deploy = DeployUtil.makeDeploy(params, session, payment);
    deploy = DeployUtil.signDeploy(deploy, keys);

    const deployHash = await client.putDeploy(deploy);
    console.log('✅ Init Sent!');
    console.log('📜 Deploy Hash:', deployHash);
    console.log('🔗 Monitor: https://testnet.cspr.live/deploy/' + deployHash);
  } catch (err) {
    console.error('❌ Deploy failed:', err.message || err);
  }
};

init();
