const { 
  CasperClient, 
  DeployUtil, 
  RuntimeArgs, 
  CLValueBuilder,
  Keys 
} = require("casper-js-sdk");

const NODE_URL = "http://65.109.83.79:7777/rpc";
const NETWORK_NAME = "casper-test";
const KEY_PATH = "C:/Users/HP/Desktop/casperkeys/secret_key.pem"; 
const DAO_CONTRACT_HASH = "hash-511efb42d9ae1f6fa233615a9ef730b88387aeb81524e8acc4865a1f08093f75";
const DAO_ID = "1768941121832"; 

const runCreateProposal = async () => {
  const client = new CasperClient(NODE_URL);
  
  let keys;
  try {
    keys = Keys.Ed25519.loadKeyPairFromPrivateFile(KEY_PATH);
    console.log('Keys loaded');
  } catch (err) {
    try {
      keys = Keys.Secp256K1.loadKeyPairFromPrivateFile(KEY_PATH);
      console.log('Secp256k1 Keys loaded');
    } catch (e) {
      console.error("Could not load .pem file.");
      return;
    }
  }

  const contractHashAsByteArray = Uint8Array.from(
    Buffer.from(DAO_CONTRACT_HASH.replace("hash-", ""), "hex")
  );

  console.log(`Creating Proposal for DAO ${DAO_ID}...`);

  const title = "Allocate 10,000 tokens to marketing fund";
  const description = "This proposal seeks to allocate 10,000 governance tokens to establish a marketing fund. The fund will be used to: 1) Sponsor community events, 2) Create educational content, 3) Run social media campaigns. Expected timeline: 3 months. Success metrics: 50% increase in community engagement.";
  const votingDuration = 86400000; 
  const args = RuntimeArgs.fromMap({
    dao_id: CLValueBuilder.u64(parseInt(DAO_ID)),
    title: CLValueBuilder.string(title),
    description: CLValueBuilder.string(description),
    voting_duration: CLValueBuilder.u64(votingDuration),
  });

  const deploy = DeployUtil.makeDeploy(
    new DeployUtil.DeployParams(keys.publicKey, NETWORK_NAME, 1, 1800000),
    DeployUtil.ExecutableDeployItem.newStoredContractByHash(
      contractHashAsByteArray,
      "create_proposal",
      args
    ),
    DeployUtil.standardPayment(300000000000) 
  );

  const signedDeploy = DeployUtil.signDeploy(deploy, keys);
  console.log("Sending create_proposal deploy...");

  try {
    const deployHash = await client.putDeploy(signedDeploy);
    console.log(`PROPOSAL CREATION SENT!`);
    console.log(`Deploy Hash: ${deployHash}`);
    console.log(`Monitor: https://testnet.cspr.live/deploy/${deployHash}`);
    console.log(`Proposal Details:`);
    console.log(`   Title: ${title}`);
    console.log(`   Voting Duration: 24 hours`);
    console.log(`   DAO ID: ${DAO_ID}`);
  } catch(err) {
    console.error("Proposal Creation Failed:", err.message);
  }
};

runCreateProposal();