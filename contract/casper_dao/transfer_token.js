const { 
  CasperClient, 
  DeployUtil, 
  RuntimeArgs, 
  CLValue,
  Keys 
} = require("casper-js-sdk");

const NODE_URL = "http://65.109.83.79:7777/rpc";
const NETWORK_NAME = "casper-test";
const KEY_PATH = "C:/Users/HP/Desktop/casperkeys/secret_key.pem"; 
const CONTRACT_HASH = "hash-92a2dd97639d61dcb8460e512032a7de561f61b735cec478c474afc926123990"; 
const RECIPIENT_ACCOUNT_HASH = "account-hash-2304565151b2a3687c6d8af60a52cd8ae924083418880aff089c3b460b71165a";

const runTransfer = async () => {
  const client = new CasperClient(NODE_URL);
  const keys = Keys.Ed25519.loadKeyPairFromPrivateFile(KEY_PATH);
  const contractHashAsByteArray = Uint8Array.from(
    Buffer.from(CONTRACT_HASH.replace("hash-", ""), "hex")
  );

  console.log(`💸 Preparing Transfer...`);

  const recipientHashBytes = Uint8Array.from(
    Buffer.from(RECIPIENT_ACCOUNT_HASH.replace("account-hash-", ""), "hex")
  );

  const keyBytes = new Uint8Array(33); 
  keyBytes[0] = 0x00; 
  keyBytes.set(recipientHashBytes, 1); 

  const args = RuntimeArgs.fromMap({
    recipient: CLValue.byteArray(keyBytes), 
    amount: CLValue.u256("10000000000")
  });

  const deploy = DeployUtil.makeDeploy(
    new DeployUtil.DeployParams(keys.publicKey, NETWORK_NAME, 1, 1800000),
    DeployUtil.ExecutableDeployItem.newStoredContractByHash(
      contractHashAsByteArray,
      "transfer", 
      args
    ),
    DeployUtil.standardPayment(3000000000)
  );

  const signedDeploy = DeployUtil.signDeploy(deploy, keys);
  console.log("Sending transfer deploy...");

  try {
    const deployHash = await client.putDeploy(signedDeploy);
    console.log(`TRANSFER SENT!`);
    console.log(`Deploy Hash: ${deployHash}`);
    console.log(`Monitor: https://testnet.cspr.live/deploy/${deployHash}`);
  } catch(err) {
    console.error("Transfer Failed:", err.message);
    console.error(err);
  }
};

runTransfer();