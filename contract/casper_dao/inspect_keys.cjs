const { Keys } = require('casper-js-sdk');
const KEY_PATH = process.env.KEY_PATH || "C:/Users/HP/Desktop/casperkeys/secret_key.pem";

async function main(){
  try{
    const keys = await Keys.Ed25519.loadKeyPairFromPrivateFile(KEY_PATH);
    console.log('keys object keys:', Object.keys(keys));
    console.log('keys:', keys);
  } catch(e){
    try{
      const keys = await Keys.Secp256K1.loadKeyPairFromPrivateFile(KEY_PATH);
      console.log('keys object keys (secp):', Object.keys(keys));
      console.log('keys (secp):', keys);
    } catch(err){
      console.error('Failed to load keys:', err.message || err);
      process.exit(1);
    }
  }
}

main();
