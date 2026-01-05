const fs = require('fs');
const { CasperClient, DeployUtil, RuntimeArgs, Keys } = require('casper-js-sdk');

const NODE = process.env.NODE_URL || 'https://node.testnet.casper.network/rpc';
const NETWORK = process.env.NETWORK_NAME || 'casper-test';
const KEY_PATH = process.env.KEY_PATH || 'C:/Users/HP/Desktop/casperkeys/secret_key.pem';
const WASM_PATH = process.argv[2] || './wrapper/target/wasm32-unknown-unknown/release/token_wrapper.wasm';

function toHashBytes(h) { const s = h.startsWith('hash-') ? h.slice(5) : h.replace(/^0x/, ''); return Uint8Array.from(Buffer.from(s, 'hex')); }

async function loadKeys(){
  try { return Keys.Ed25519.loadKeyPairFromPrivateFile(KEY_PATH); }
  catch(e){ try { return Keys.Secp256K1.loadKeyPairFromPrivateFile(KEY_PATH); } catch(ee){ throw ee; } }
}

async function waitForExecution(client, deployHash, timeoutMs=120000){
  const start = Date.now();
  while(Date.now()-start < timeoutMs){
    try{
      const info = await client.nodeClient.getDeployInfo(deployHash);
      if(info && info.execution_info) return info.execution_info;
    }catch(e){}
    await new Promise(r=>setTimeout(r,2000));
  }
  throw new Error('Timed out waiting for deploy execution');
}

(async ()=>{
  const client = new CasperClient(NODE);
  const keys = await loadKeys();
  console.log('Key loaded');
  const wasm = fs.readFileSync(WASM_PATH);
  console.log('WASM size', wasm.length);
  const params = new DeployUtil.DeployParams(keys.publicKey, NETWORK);
  const session = DeployUtil.ExecutableDeployItem.newModuleBytes(new Uint8Array(wasm), RuntimeArgs.fromMap({}));
  const payment = DeployUtil.standardPayment(300000000000);
  let deploy = DeployUtil.makeDeploy(params, session, payment);
  deploy = DeployUtil.signDeploy(deploy, keys);
  const dh = await client.putDeploy(deploy);
  console.log('deployHash', dh);
  const exec = await waitForExecution(client, dh);
  console.log('execution_info:', JSON.stringify(exec, null, 2));

  const effects = exec.execution_result?.Version2?.effects || exec.effects || [];
  let contractHash = null;
  for(const eff of effects){
    if(eff.kind && eff.kind.Write && eff.kind.Write.Contract){
      const c = eff.kind.Write.Contract;
      contractHash = c.contract_wasm_hash || c.contract_package_hash || null;
      console.log('Found Contract write:', JSON.stringify(c, null, 2));
    }
    if(eff.kind && eff.kind.AddKeys){
      for(const k of eff.kind.AddKeys){
        if(k.name && k.name === 'token_wrapper_contract'){
          console.log('Named key token_wrapper_contract found:', k.key);
          contractHash = k.key;
        }
      }
    }
  }
  console.log('Detected contract identifier:', contractHash);
})();
