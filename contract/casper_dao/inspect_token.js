const fetch = require('node-fetch');
const { CasperClient } = require('casper-js-sdk');

const NODE = process.env.NODE_URL || 'https://node.testnet.casper.network/rpc';
const tokenArg = process.argv[2] || process.env.TOKEN_HASH || 'hash-3af231b810cdff2158f181d85bf78cf16df93a28ba2d4056c3a6f67e9a0386ae';

function normalizeHash(h) {
  if (!h) return null;
  if (h.startsWith('hash-')) return h;
  if (h.startsWith('contract-')) return 'hash-' + h.slice('contract-'.length);
  if (/^[0-9a-fA-F]{64}$/.test(h)) return 'hash-' + h;
  return h;
}

(async function main(){
  const client = new CasperClient(NODE);
  const token = normalizeHash(tokenArg);
  console.log('Inspecting token:', token);

  try {
    if (client.nodeClient && client.nodeClient.getContract) {
      console.log('Trying client.nodeClient.getContract(...)');
      const res = await client.nodeClient.getContract(token);
      console.log('nodeClient.getContract result:\n', JSON.stringify(res, null, 2));
      return;
    }
  } catch (e) {
    console.warn('nodeClient.getContract failed:', e.message || e);
  }

  try {
    if (client.getContract) {
      console.log('Trying client.getContract(...)');
      const res = await client.getContract(token);
      console.log('client.getContract result:\n', JSON.stringify(res, null, 2));
      return;
    }
  } catch (e) {
    console.warn('client.getContract failed:', e.message || e);
  }

  try {
    console.log('Falling back to JSON-RPC state_get_item via state_root_hash');
    const root = await client.nodeClient.getStateRootHash();
    console.log('state_root_hash=', root);

    const body = {
      jsonrpc: '2.0',
      id: 1,
      method: 'state_get_item',
      params: {
        state_root_hash: root,
        key: token,
        path: []
      }
    };

    const r = await fetch(NODE, { method: 'POST', body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } });
    const j = await r.json();
    if (j.error) {
      console.error('RPC error:', JSON.stringify(j.error, null, 2));
      return;
    }
    console.log('state_get_item result:', JSON.stringify(j.result, null, 2));

    const stored_value = j.result.stored_value || j.result.value || null;
    if (!stored_value) return;
    console.log('\nStored value kind:', Object.keys(stored_value)[0]);
    console.log('Full stored_value:', JSON.stringify(stored_value, null, 2));

  } catch (e) {
    console.error('Fallback RPC failed:', e.message || e);
  }
})();
