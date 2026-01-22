import { useState } from "react";
import { FaFaucet, FaCopy, FaCheckCircle, FaClock } from "react-icons/fa";
import { useCasper } from "../context/CasperContext";

const API_URL = import.meta.env.VITE_APP_API_URL || "http://localhost:3001";

export default function Faucet() {
  const { activeKey } = useCasper();
  const [copied, setCopied] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [claimStatus, setClaimStatus] = useState(null); 
  const [statusMessage, setStatusMessage] = useState("");
  const [deployHash, setDeployHash] = useState(null);

  const copyAddress = () => {
    navigator.clipboard.writeText(activeKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClaim = async () => {
    if (!activeKey) {
      setClaimStatus('error');
      setStatusMessage('Please connect your wallet first');
      return;
    }

    setClaiming(true);
    setClaimStatus(null);
    setStatusMessage("");
    setDeployHash(null);

    try {
      const response = await fetch(`${API_URL}/claim-faucet`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipientPublicKey: activeKey })
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          setClaimStatus('cooldown');
          setStatusMessage(data.error || 'Please wait before claiming again');
        } else {
          setClaimStatus('error');
          setStatusMessage(data.error || 'Failed to claim tokens');
        }
      } else {
        setClaimStatus('success');
        setStatusMessage('Tokens sent! Check your wallet in ~1-2 minutes');
        setDeployHash(data.deployHash);
      }

    } catch (err) {
      console.error('Claim error:', err);
      setClaimStatus('error');
      setStatusMessage('Failed to claim tokens: ' + err.message);
    } finally {
      setClaiming(false);
    }
  };

  if (!activeKey) {
    return (
      <div className="bg-yellow-500/10 rounded-xl p-6 mb-6">
        <div className="flex items-center gap-3">
          <FaFaucet className="text-yellow-400 text-2xl" />
          <div>
            <h3 className="text-white font-bold">Governance Tokens Required</h3>
            <p className="text-slate-400 text-sm">
              Connect your wallet to claim tokens
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#071022]/70 backdrop-blur-md rounded-2xl p-6 mb-6 relative overflow-hidden">
      <div className="absolute top-4 left-6 right-6 h-1 rounded-full bg-gradient-to-r from-cyan-400/40 via-blue-400/20 to-purple-500/25" />

      <div className="pt-3">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-cyan-500/10 w-12 h-12 rounded-full flex items-center justify-center">
            <FaFaucet className="text-cyan-400 text-xl" />
          </div>
          <div>
            <h3 className="text-white font-bold text-lg">
              Claim Governance Tokens
            </h3>
            <p className="text-slate-400 text-sm">
              Get 100 DGOT tokens to start voting (24hr cooldown)
            </p>
          </div>
        </div>
        <div className="bg-slate-900/50 rounded-lg p-4 mb-4">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">
            Your Wallet Address
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-cyan-400 text-sm font-mono break-all">
              {activeKey}
            </code>
            <button
              onClick={copyAddress}
              className="bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 px-3 py-2 rounded-lg transition-colors flex items-center gap-1"
              title="Copy address"
            >
              <FaCopy />
            </button>
          </div>
          {copied && (
            <p className="text-green-400 text-xs mt-2">
              Copied to clipboard!
            </p>
          )}
        </div>
        <button
          onClick={handleClaim}
          disabled={claiming || claimStatus === 'success'}
          className={`w-full py-4 rounded-xl btn-deploy text-white font-bold text-lg tracking-wide transition-all duration-300 mb-4 ${
            claiming
              ? 'bg-slate-700 text-slate-400 cursor-wait'
              : claimStatus === 'success'
              ? 'bg-green-500/20 text-green-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:shadow-[0_0_30px_rgba(6,182,212,0.32)] text-dark hover:scale-[1.02]'
          }`}
        >
          {claiming ? (
            <span className="flex items-center justify-center gap-2">
              Claiming Tokens...
            </span>
          ) : claimStatus === 'success' ? (
            <span className="flex items-center justify-center gap-2">
              <FaCheckCircle />
              Tokens Claimed!
            </span>
          ) : (
            '🪙 Claim 100 DGOT Tokens'
          )}
        </button>
        {claimStatus === 'success' && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <FaCheckCircle className="text-green-400" />
              <h4 className="text-white font-semibold text-sm">Success!</h4>
            </div>
            <p className="text-green-300 text-sm mb-2">{statusMessage}</p>
            {deployHash && (
              <a
                href={`https://testnet.cspr.live/deploy/${deployHash}`}
                target="_blank"
                rel="noreferrer"
                className="text-cyan-400 hover:text-cyan-300 text-sm underline inline-block"
              >
                View Transaction →
              </a>
            )}
          </div>
        )}

        {claimStatus === 'error' && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="text-white font-semibold text-sm">Error</h4>
            </div>
            <p className="text-red-300 text-sm">{statusMessage}</p>
          </div>
        )}

        {claimStatus === 'cooldown' && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <FaClock className="text-yellow-400" />
              <h4 className="text-white font-semibold text-sm">Cooldown Active</h4>
            </div>
            <p className="text-yellow-300 text-sm">{statusMessage}</p>
            <p className="text-yellow-400 text-xs mt-2">
              You can claim once every 24 hours
            </p>
          </div>
        )}
        <div className="bg-blue-500/10 rounded-lg p-4 mb-4">
          <h4 className="text-white font-semibold mb-3 text-sm">
            How Token Claiming Works:
          </h4>
          <ol className="text-slate-300 text-sm space-y-2 list-decimal list-inside">
            <li>Click "Claim 100 DGOT Tokens" button</li>
            <li>Tokens are transferred from the faucet wallet</li>
            <li>Wait ~1-2 minutes for blockchain confirmation</li>
            <li>Check your balance in Casper Wallet</li>
            <li>Start voting on proposals!</li>
          </ol>
        </div>
        <div className="bg-purple-500/10 rounded-lg p-4">
          <h4 className="text-white font-semibold mb-2 text-sm">
            Token Details:
          </h4>
          <div className="space-y-1 text-sm">
            <p className="text-slate-300">
              <strong className="text-purple-300">Amount:</strong> 100 DGOT per claim
            </p>
            <p className="text-slate-300">
              <strong className="text-purple-300">Cooldown:</strong> 24 hours
            </p>
            <p className="text-slate-300">
              <strong className="text-purple-300">Network:</strong> Casper Testnet
            </p>
            <p className="text-slate-300">
              <strong className="text-purple-300">Use:</strong> Vote on DAO proposals
            </p>
          </div>
        </div>

        <div className="mt-4 bg-yellow-500/10 rounded-lg p-3">
          <p className="text-yellow-300 text-xs">
            <strong>Note:</strong> Each wallet can claim once every 24 hours. 
            Tokens arrive within 1-2 minutes. If you don't receive tokens, please 
            check the transaction link above.
          </p>
        </div>
      </div>
    </div>
  );
}