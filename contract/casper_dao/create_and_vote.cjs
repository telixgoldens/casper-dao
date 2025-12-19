const { execSync } = require('child_process');
const { CasperClient, DeployUtil, RuntimeArgs, Keys, CLValue, KeyValue } = require('casper-js-sdk');
const fs = require('fs');

const NODE_URL = process.env.NODE_URL || "http://65.109.83.79:7777/rpc";
const NETWORK_NAME = process.env.NETWORK_NAME || "casper-test";
const KEY_PATH = process.env.KEY_PATH || "C:/Users/HP/Desktop/casperkeys/secret_key.pem";

const DAO_CONTRACT_HASH = process.argv[2] || process.env.DAO_CONTRACT_HASH || 'hash-ee3632e07418650bb1fa4ba56739c66deef5debad02536aeb10df4a533a0e667';

async function loadKeys() {
  try { return Keys.Ed25519.loadKeyPairFromPrivateFile(KEY_PATH); }
  catch (e) {
    try { return Keys.Secp256K1.loadKeyPairFromPrivateFile(KEY_PATH); }
    catch (ee) { throw new Error('Failed to load keypair: ' + (ee.message||ee)); }
  }
}

function toHashBytes(h) {
  const s = h.startsWith('hash-') ? h.slice(5) : h;
  return Uint8Array.from(Buffer.from(s, 'hex'));
}

async function waitAndRunCheck(deployHash) {
  
  try {
    execSync(`node check_deploy.js ${deployHash}`, { stdio: 'inherit', cwd: __dirname });
  } catch (e) {
    console.error('check_deploy failed:', e.message);
  }
}

async function main() {
  const client = new CasperClient(NODE_URL);
  const keys = await loadKeys();
  console.log('Key loaded');

  //  create_dao
  console.log('\n--- create_dao ---');
  const params = new DeployUtil.DeployParams(keys.publicKey, NETWORK_NAME);
  const name = 'Test DAO from script ' + Date.now();
  const rawHash = DAO_CONTRACT_HASH.startsWith('hash-') ? DAO_CONTRACT_HASH.slice(5) : DAO_CONTRACT_HASH.replace(/^0x/, '');
  const keyHash = '0x' + rawHash;
  const tokenKey = KeyValue.fromHash(keyHash);
  const args = RuntimeArgs.fromMap({ name: CLValue.string(name), token_address: CLValue.key(tokenKey) });

  const session = DeployUtil.ExecutableDeployItem.newStoredContractByHash(toHashBytes(DAO_CONTRACT_HASH), 'create_dao', args);
  const payment = DeployUtil.standardPayment(300000000000);
  let deploy = DeployUtil.makeDeploy(params, session, payment);
  deploy = DeployUtil.signDeploy(deploy, keys);

  try {
    const deployHash = await client.putDeploy(deploy);
    console.log('create_dao deploy hash:', deployHash);
    await waitAndRunCheck(deployHash);
    
    async function waitForExecution(deployHash, timeoutMs = 120000) {
      const start = Date.now();
      while (Date.now() - start < timeoutMs) {
        try {
          const info = await client.nodeClient.getDeployInfo(deployHash);
          if (info && info.execution_info) return info.execution_info;
        } catch (e) {
          
        }
        await new Promise(r => setTimeout(r, 2000));
      }
      throw new Error('Timed out waiting for deploy execution');
    }

    let executionInfo;
    try {
      executionInfo = await waitForExecution(deployHash, 120000);
    } catch (e) {
      console.error(' Timed out waiting for create_dao execution:', e.message || e);
      return;
    }

    let daoId = null;
    try {
      const effects = executionInfo.execution_result?.Version2?.effects || executionInfo.effects || [];
      for (const eff of effects) {
        if (eff.kind && eff.kind.AddKeys) {
          for (const k of eff.kind.AddKeys) {
            if (k.name && k.name.startsWith('event_dao_created_')) {
              daoId = k.name.split('event_dao_created_')[1];
              console.log('Detected dao_id =', daoId, 'from named key', k.name);
              break;
            }
          }
        }
        if (daoId) break;
      }
    } catch (e) {
      console.error('Failed to parse execution effects:', e.message || e);
      return;
    }

    if (!daoId) {
      console.error(' Could not find dao_id in execution effects');
      return;
    }

    // vote
    console.log('\n--- vote ---');
    const voteArgs = RuntimeArgs.fromMap({ dao_id: CLValue.u64(Number(daoId)), proposal_id: CLValue.u64(1), choice: CLValue.bool(true) });
    const session2 = DeployUtil.ExecutableDeployItem.newStoredContractByHash(toHashBytes(DAO_CONTRACT_HASH), 'vote', voteArgs);
    const params2 = new DeployUtil.DeployParams(keys.publicKey, NETWORK_NAME);
    const payment2 = DeployUtil.standardPayment(300000000000);
    let deploy2 = DeployUtil.makeDeploy(params2, session2, payment2);
    deploy2 = DeployUtil.signDeploy(deploy2, keys);

    const deployHash2 = await client.putDeploy(deploy2);
    console.log('vote deploy hash:', deployHash2);
    await waitAndRunCheck(deployHash2);

  } catch (err) {
    console.error('Deploy error:', err.message || err);
  }
}

main();
