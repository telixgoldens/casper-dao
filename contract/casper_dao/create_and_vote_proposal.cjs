const { execSync } = require("child_process");
const {
  CasperClient,
  DeployUtil,
  RuntimeArgs,
  Keys,
  CLValue,
  KeyValue,
} = require("casper-js-sdk");

const NODE_URL = process.env.NODE_URL || "http://65.109.83.79:7777/rpc";
const NETWORK_NAME = process.env.NETWORK_NAME || "casper-test";
const KEY_PATH =
  process.env.KEY_PATH || "C:/Users/HP/Desktop/casperkeys/secret_key.pem";

const DAO_CONTRACT_HASH =
  process.argv[2] ||
  process.env.DAO_CONTRACT_HASH ||
  "hash-511efb42d9ae1f6fa233615a9ef730b88387aeb81524e8acc4865a1f08093f75";
const TOKEN_CONTRACT_HASH =
  process.argv[3] ||
  process.env.TOKEN_CONTRACT_HASH ||
  "hash-92a2dd97639d61dcb8460e512032a7de561f61b735cec478c474afc926123990";

async function loadKeys() {
  try {
    return Keys.Ed25519.loadKeyPairFromPrivateFile(KEY_PATH);
  } catch (e) {
    try {
      return Keys.Secp256K1.loadKeyPairFromPrivateFile(KEY_PATH);
    } catch (ee) {
      throw new Error("Failed to load keypair: " + (ee.message || ee));
    }
  }
}

function toHashBytes(h) {
  const s = h.startsWith("hash-") ? h.slice(5) : h;
  return Uint8Array.from(Buffer.from(s, "hex"));
}

async function waitAndRunCheck(deployHash) {
  try {
    execSync(`node check_deploy.js ${deployHash}`, {
      stdio: "inherit",
      cwd: __dirname,
    });
  } catch (e) {
    console.error("check_deploy failed:", e.message);
  }
}

async function waitForExecution(client, deployHash, timeoutMs = 120000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const info = await client.nodeClient.getDeployInfo(deployHash);
      if (info && info.execution_info) return info.execution_info;
    } catch (e) {}
    await new Promise((r) => setTimeout(r, 2000));
  }
  throw new Error("Timed out waiting for deploy execution");
}

async function main() {
  const client = new CasperClient(NODE_URL);
  const keys = await loadKeys();
  console.log("Key loaded");

  console.log("--- Creating DAO ---");
  const params = new DeployUtil.DeployParams(keys.publicKey, NETWORK_NAME);
  const name = "Test DAO from script " + Date.now();
  const rawHash = TOKEN_CONTRACT_HASH.startsWith("hash-")
    ? TOKEN_CONTRACT_HASH.slice(5)
    : TOKEN_CONTRACT_HASH.replace(/^0x/, "");
  const keyHash = "0x" + rawHash;
  const tokenKey = KeyValue.fromHash(keyHash);
  const tokenTypeArg =
    process.argv[4] || process.env.TOKEN_TYPE || "u256_address";
  
  const createDaoArgs = RuntimeArgs.fromMap({
    name: CLValue.string(name),
    token_address: CLValue.key(tokenKey),
    token_type: CLValue.string(tokenTypeArg),
  });

  const session = DeployUtil.ExecutableDeployItem.newStoredContractByHash(
    toHashBytes(DAO_CONTRACT_HASH),
    "create_dao",
    createDaoArgs
  );
  const payment = DeployUtil.standardPayment(300000000000);
  let deploy = DeployUtil.makeDeploy(params, session, payment);
  deploy = DeployUtil.signDeploy(deploy, keys);

  try {
    const deployHash = await client.putDeploy(deploy);
    console.log("create_dao deploy hash:", deployHash);
    await waitAndRunCheck(deployHash);

    let executionInfo;
    try {
      executionInfo = await waitForExecution(client, deployHash, 120000);
    } catch (e) {
      console.error("Timed out waiting for create_dao execution:", e.message || e);
      return;
    }

    let daoId = null;
    try {
      const effects =
        executionInfo.execution_result?.Version2?.effects ||
        executionInfo.effects ||
        [];
      for (const eff of effects) {
        if (eff.kind && eff.kind.AddKeys) {
          for (const k of eff.kind.AddKeys) {
            if (k.name && k.name.startsWith("event_dao_created_")) {
              daoId = k.name.split("event_dao_created_")[1];
              console.log("DAO created with ID:", daoId);
              break;
            }
          }
        }
        if (daoId) break;
      }
    } catch (e) {
      console.error("Failed to parse execution effects:", e.message || e);
      return;
    }

    if (!daoId) {
      console.error("Could not find dao_id in execution effects");
      return;
    }

    console.log("\n--- Creating Proposal ---");
    const createProposalArgs = RuntimeArgs.fromMap({
      dao_id: CLValue.u64(Number(daoId)),
      title: CLValue.string("Test Proposal"),
      description: CLValue.string("This is a test proposal for voting"),
      voting_duration: CLValue.u64(86400000), 
    });

    const proposalSession = DeployUtil.ExecutableDeployItem.newStoredContractByHash(
      toHashBytes(DAO_CONTRACT_HASH),
      "create_proposal",
      createProposalArgs
    );
    const proposalParams = new DeployUtil.DeployParams(keys.publicKey, NETWORK_NAME);
    const proposalPayment = DeployUtil.standardPayment(300000000000);
    let proposalDeploy = DeployUtil.makeDeploy(proposalParams, proposalSession, proposalPayment);
    proposalDeploy = DeployUtil.signDeploy(proposalDeploy, keys);

    const proposalDeployHash = await client.putDeploy(proposalDeploy);
    console.log("create_proposal deploy hash:", proposalDeployHash);
    await waitAndRunCheck(proposalDeployHash);

    let proposalExecutionInfo;
    try {
      proposalExecutionInfo = await waitForExecution(client, proposalDeployHash, 120000);
    } catch (e) {
      console.error("Timed out waiting for create_proposal execution:", e.message || e);
      return;
    }

    let proposalId = null;
    try {
      const effects =
        proposalExecutionInfo.execution_result?.Version2?.effects ||
        proposalExecutionInfo.effects ||
        [];
      for (const eff of effects) {
        if (eff.kind && eff.kind.AddKeys) {
          for (const k of eff.kind.AddKeys) {
            if (k.name && k.name.startsWith("event_proposal_created_")) {
              const parts = k.name.split("event_proposal_created_")[1].split("_");
              proposalId = parts[1]; 
              console.log("Proposal created with ID:", proposalId);
              break;
            }
          }
        }
        if (proposalId) break;
      }
    } catch (e) {
      console.error("Failed to parse proposal execution effects:", e.message || e);
      return;
    }

    if (!proposalId) {
      console.error("Could not find proposal_id in execution effects");
      return;
    }

    console.log("--- Voting on Proposal ---");
    const voteArgs = RuntimeArgs.fromMap({
      dao_id: CLValue.u64(Number(daoId)),
      proposal_id: CLValue.u64(Number(proposalId)),
      choice: CLValue.bool(true),
    });

    const voteSession = DeployUtil.ExecutableDeployItem.newStoredContractByHash(
      toHashBytes(DAO_CONTRACT_HASH),
      "vote",
      voteArgs
    );
    const voteParams = new DeployUtil.DeployParams(keys.publicKey, NETWORK_NAME);
    const votePayment = DeployUtil.standardPayment(300000000000);
    let voteDeploy = DeployUtil.makeDeploy(voteParams, voteSession, votePayment);
    voteDeploy = DeployUtil.signDeploy(voteDeploy, keys);

    const voteDeployHash = await client.putDeploy(voteDeploy);
    console.log("vote deploy hash:", voteDeployHash);
    await waitAndRunCheck(voteDeployHash);

    console.log("All operations completed successfully!");

  } catch (err) {
    console.error("Deploy error:", err.message || err);
  }
}

main();