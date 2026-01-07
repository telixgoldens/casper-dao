const { CasperClient } = require("casper-js-sdk");

// Nodes to try (same as deploy script)
const NODES = [
  "http://157.90.182.214:7777/rpc",
  "http://95.217.109.99:7777/rpc",
  "http://65.21.120.61:7777/rpc",
  "http://65.108.236.83:7777/rpc",
  "https://node.testnet.casper.network/rpc",
];

const hash = process.argv[2];
if (!hash) {
  console.error("Usage: node check_deploy.js <deploy-hash>");
  process.exit(1);
}

(async () => {
  console.log(`Checking deploy: ${hash}`);

  for (const node of NODES) {
    process.stdout.write(`Trying ${node} ... `);
    const client = new CasperClient(node);
    try {
      // Check node status
      const status = await client.nodeClient.getStatus();
      console.log("node OK");

      // Try a few different ways to fetch deploy info and show raw output
      try {
        const deploy = await client.getDeploy(hash);
        console.log("getDeploy result:", JSON.stringify(deploy, null, 2));
      } catch (e) {
        console.log("getDeploy error:", e && e.message ? e.message : e);
      }

      try {
        const info = await client.nodeClient.getDeployInfo(hash);
        console.log("getDeployInfo result:", JSON.stringify(info, null, 2));
      } catch (e) {
        console.log("getDeployInfo error:", e && e.message ? e.message : e);
      }

      try {
        const raw = await client.nodeClient.getDeploy(hash);
        console.log("nodeClient.getDeploy raw result:", JSON.stringify(raw, null, 2));
      } catch (e) {
        console.log("nodeClient.getDeploy error:", e && e.message ? e.message : e);
      }

      return;
    } catch (err) {
      console.log("node status failed:", err && err.message ? err.message : err);
    }
  }

  console.error("All nodes failed to return deploy info.");
})();
