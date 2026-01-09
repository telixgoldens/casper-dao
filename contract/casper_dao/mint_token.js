const fs = require('fs');
const { CasperClient, DeployUtil, RuntimeArgs, Keys, CLValue } = require('casper-js-sdk');

const NODES = [
  'http://65.109.83.79:7777/rpc',
  'https://node.testnet.casper.network/rpc',
  'http://157.90.182.214:7777/rpc',
  'http://95.217.109.99:7777/rpc'
];

const NETWORK = 'casper-test';
const KEY_PATH = 'C:/Users/HP/Desktop/casperkeys/secret_key.pem';
const TOKEN_CONTRACT_HASH = 'hash-a0204a44f72b02bc00c793fc696a306277f315d0ec860b66d11336b1b993a9fc';
const RECIPIENT = process.argv[2] || '013d310c09a7ad350a30b3960ede64399415ac8f75fbc3f6e7d336f0a3daccef01';
const AMOUNT = process.argv[3] || '10000000000000'; 

function toHashBytes(h) { 
  const s = h.startsWith('hash-') ? h.slice(5) : h.replace(/^0x/, ''); 
  return Uint8Array.from(Buffer.from(s, 'hex')); 
}

async function loadKeys(){
  try { return Keys.Ed25519.loadKeyPairFromPrivateFile(KEY_PATH); }
  catch(e){ 
    try { return Keys.Secp256K1.loadKeyPairFromPrivateFile(KEY_PATH); } 
    catch(ee){ throw ee; } 
  }
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
  console.log('Minting DAO Governance Tokens...');
  console.log('Recipient:', RECIPIENT);
  console.log('Amount:', AMOUNT);
  console.log('');

  const keys = await loadKeys();
  console.log('Key loaded');
  
  const args = RuntimeArgs.fromMap({
    owner: CLValue.byteArray(keys.publicKey.toAccountHash()),
    amount: CLValue.u256(AMOUNT)
  });

  console.log('Searching for active node...');
  
  let deployed = false;
  for(const node of NODES){
    if(deployed) break;
    
    process.stdout.write(`Trying ${node} ... `);
    const client = new CasperClient(node);
    
    try {
      await client.nodeClient.getStatus();
      
      const params = new DeployUtil.DeployParams(keys.publicKey, NETWORK);
      const session = DeployUtil.ExecutableDeployItem.newStoredContractByHash(
        toHashBytes(TOKEN_CONTRACT_HASH),
        'mint',
        args
      );
      const payment = DeployUtil.standardPayment(800000000000); 
      
      let deploy = DeployUtil.makeDeploy(params, session, payment);
      deploy = DeployUtil.signDeploy(deploy, keys);
      
      const dh = await client.putDeploy(deploy);
      
      console.log('CONNECTED!');
      console.log('');
      console.log('TOKENS MINTED!');
      console.log('Deploy Hash:', dh);
      console.log(`Monitor: https://testnet.cspr.live/deploy/${dh}`);
      console.log('');
      console.log('Waiting for execution...');
      
      try {
        const exec = await waitForExecution(client, dh);
        
        if(exec.execution_result?.Version2?.error_message){
          console.error('Execution failed:', exec.execution_result.Version2.error_message);
        } else {
          console.log('Execution successful!');
          console.log('Tokens minted to your account!');
          console.log('');
          console.log('Now update your backend TOKEN_CONTRACT_HASH and restart it.');
          console.log('Then you can create a DAO and vote!');
        }
      } catch(waitErr){
        console.log('Could not wait for execution (check cspr.live manually)');
      }
      
      deployed = true;
      return;
      
    } catch(err){
      console.log('Failed.');
      console.error(err.message);
    }
  }
  
  if(!deployed){
    console.error('ALL NODES FAILED.');
  }
})();