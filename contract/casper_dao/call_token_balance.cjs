const { CasperClient, DeployUtil, RuntimeArgs, Keys, CLValue, KeyValue } = require('casper-js-sdk');
const fs = require('fs');

const NODE_URL = process.env.NODE_URL || "http://65.109.83.79:7777/rpc";
const NETWORK_NAME = process.env.NETWORK_NAME || "casper-test";
const KEY_PATH = process.env.KEY_PATH || "C:/Users/HP/Desktop/casperkeys/secret_key.pem";
const TOKEN_HASH = process.argv[2] || process.env.TOKEN_HASH || 'hash-3af231b810cdff2158f181d85bf78cf16df93a28ba2d4056c3a6f67e9a0386ae';

async function loadKeys() {
  try { return Keys.Ed25519.loadKeyPairFromPrivateFile(KEY_PATH); }
  catch (e) {
    try { return Keys.Secp256K1.loadKeyPairFromPrivateFile(KEY_PATH); }
    catch (ee) { throw new Error('Failed to load keypair: ' + (ee.message||ee)); }
  }
}

function toHashBytes(h) {
  const s = h.startsWith('hash-') ? h.slice(5) : h.replace(/^0x/, '');
  return Uint8Array.from(Buffer.from(s, 'hex'));
}

async function main(){
  const client = new CasperClient(NODE_URL);
  const keys = await loadKeys();
  console.log('Key loaded');

  const params = new DeployUtil.DeployParams(keys.publicKey, NETWORK_NAME);

  // Build args: address = Key::Account(account_hash)
  // Use KeyValue.fromAccount with publicKey (casper-js-sdk supports this)
  const addrKey = KeyValue.fromAccount(keys.publicKey);
  const args = RuntimeArgs.fromMap({ address: CLValue.key(addrKey) });

  const session = DeployUtil.ExecutableDeployItem.newStoredContractByHash(toHashBytes(TOKEN_HASH), 'balance_of', args);
  const payment = DeployUtil.standardPayment(300000000000);
  let deploy = DeployUtil.makeDeploy(params, session, payment);
  deploy = DeployUtil.signDeploy(deploy, keys);

  try {
    const deployHash = await client.putDeploy(deploy);
    console.log('balance_of deploy hash:', deployHash);
    // use check_deploy to fetch results
    const { execSync } = require('child_process');
    try {
      execSync(`node check_deploy.js ${deployHash}`, { stdio: 'inherit', cwd: __dirname });
    } catch(e) {
      console.error('check_deploy failed:', e.message || e);
    }
  } catch (e) {
    console.error('putDeploy error:', e.message || e);
  }
}

main().catch(e=>{ console.error(e); process.exit(1); });
