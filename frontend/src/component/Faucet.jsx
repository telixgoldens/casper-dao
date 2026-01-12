import { useState } from "react";
import { FaFaucet, FaCopy, FaEnvelope, FaDiscord } from "react-icons/fa";
import { useCasper } from "../context/CasperContext";

export default function Faucet() {
  const { activeKey } = useCasper();
  const [copied, setCopied] = useState(false);

  const copyAddress = () => {
    navigator.clipboard.writeText(activeKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!activeKey) {
    return (
      <div className="bg-yellow-500/10 rounded-xl p-6 mb-6">
        <div className="flex items-center gap-3">
          <FaFaucet className="text-yellow-400 text-2xl" />
          <div>
            <h3 className="text-white font-bold">Governance Tokens Required</h3>
            <p className="text-slate-400 text-sm">
              Connect your wallet to request tokens
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
              Request Governance Tokens
            </h3>
            <p className="text-slate-400 text-sm">
              Copy your address and request voting tokens
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

        <div className="bg-blue-500/10 rounded-lg p-4 mb-4">
          <h4 className="text-white font-semibold mb-3 text-sm">
            How to Get Tokens:
          </h4>
          <ol className="text-slate-300 text-sm space-y-2 list-decimal list-inside">
            <li>Copy your wallet address above</li>
            <li>Send a request via email or Discord</li>
            <li>Include your wallet address in the message</li>
            <li>Wait ~1-2 minutes for tokens to arrive</li>
            <li>Start voting on proposals!</li>
          </ol>
        </div>

        <div className="space-y-3">
          <div className="bg-green-500/10 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <FaEnvelope className="text-green-400" />
              <h4 className="text-white font-semibold text-sm">
                Email Request
              </h4>
            </div>
            <a
              href={`mailto:haripzy05@gmail.com?subject=Casper DAO Token Request&body=Hello,%0D%0A%0D%0APlease send governance tokens to:%0D%0A${activeKey}%0D%0A%0D%0AThank you!`}
              className="text-green-400 hover:text-green-300 text-sm underline"
            >
              haripzy05@gmail.com
            </a>
          </div>

          <div className="bg-purple-500/10 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <FaDiscord className="text-purple-400" />
              <h4 className="text-white font-semibold text-sm">
                Discord Request
              </h4>
            </div>
            <p className="text-purple-300 text-sm">
              Join the Casper Discord and request tokens in the hackathon
              channel
            </p>
          </div>
        </div>

        <div className="mt-4 bg-yellow-500/10 rounded-lg p-3">
          <p className="text-yellow-300 text-xs">
            <strong>Judges & Testers:</strong> Each wallet receives 100 DAOT
            tokens. Tokens typically arrive within 2 minutes of request.
          </p>
        </div>
      </div>
    </div>
  );
}
