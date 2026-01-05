import React, { useState } from "react";
import LandingPage from "./page/LandingPage";
import ProposalResults from "./component/ProposalResults";
import { useCasper } from "./context/CasperContext";
import { FaSignOutAlt, FaGhost } from "react-icons/fa";
import CreateDAO from "./page/CreateDAO";
import { deployVote } from "./utils/casperService";
import Footer from "./component/Footer";

const DAO_ID = "123";
const PROPOSAL_ID = "1";

function App() {
  const { activeKey, isConnected, connectWallet, disconnectWallet } = useCasper();
  const [activeTab, setActiveTab] = useState("create");
  const [isVoting, setIsVoting] = useState(false);
  
  // unused state removed for cleanliness

  const handleVote = async (choice) => {
    if (!activeKey) return alert("Connect Wallet first!");

    if (!confirm(`Vote ${choice ? "YES" : "NO"}? This will cost ~150 CSPR.`))
      return;

    setIsVoting(true);
    try {
      const hash = await deployVote(activeKey, DAO_ID, choice);
      alert(`Vote Submitted!\nHash: ${hash}`);
    } catch (err) {
      alert("Vote Failed: " + err.message);
    } finally {
      setIsVoting(false);
    }
  };

  // 1. If NOT connected, show Landing Page
  if (!isConnected) {
    return <LandingPage onConnect={connectWallet} />;
  }

  const mainBg =
    activeTab === "create" ? "bg-nebula bg-grid-texture" : "bg-slate-900";

  return (
    <div
      className={`min-h-screen ${mainBg} text-white font-sans selection:bg-teal-500 selection:text-black`}
    >
      {/* --- HEADER --- */}
      <nav className="border-b border-gray-800 backdrop-blur-md sticky top-0 z-50  py-4 flex justify-between items-center nav-header">
        {/* 👇 FIX: Changed onClick to disconnectWallet and added cursor-pointer */}
        <div 
            onClick={disconnectWallet} 
            className="text-xl font-bold flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
        >
          <FaGhost className="text-cyan-400 text-xl group-hover:text-white" />
          <span className="text-teal-400">Casper</span>DAO
        </div>

        {/* User Badge */}
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400 bg-slate-800 px-3 py-1 rounded-full border border-gray-700 font-mono">
            {activeKey?.slice(0, 10)}...{activeKey?.slice(-4)}
          </span>
          <div className="w-3 h-3 bg-green-500 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.5)] animate-pulse"></div>
          {/* DISCONNECT BUTTON */}
          <button
            onClick={disconnectWallet}
            className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-full transition-all"
            title="Disconnect Wallet"
          >
            <FaSignOutAlt size={18} />
          </button>
        </div>
      </nav>

      {/* --- MAIN CONTENT --- */}
      <main className="max-w-6xl mx-auto p-8  pt-3 container">
        {/* Welcome Section */}
        <div className="mb-10 ">
          <h1 className="text-3xl font-bold mb-2">Governance Dashboard</h1>
          <p className="text-gray-400">
            Manage your DAOs and participate in active votes.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-6 border-b border-gray-800 mb-8">
          <button
            onClick={() => setActiveTab("create")}
            className={`pb-2 px-2 nav-active ${
              activeTab === "create"
                ? "text-teal-400 border-b-2 border-teal-400"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            Create DAO
          </button>
          <button
            onClick={() => setActiveTab("vote")}
            className={`pb-2 px-2 nav-active ${
              activeTab === "vote"
                ? "text-teal-400 border-b-2 border-teal-400"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            Active Proposals
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Interactive Forms */}
          <div className="lg:col-span-2 space-y-6">
            {activeTab === "create" ? (
              <CreateDAO />
            ) : (
              <div className="bg-slate-800 p-8 rounded-xl border border-gray-700 relative">
                {/* 👇 Added a loading overlay that only appears when voting (Safe for layout) */}
                {isVoting && (
                  <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-xl">
                    <div className="text-teal-400 font-bold animate-pulse">
                      Processing Vote...
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-bold">
                    Proposal #{PROPOSAL_ID}: Enable Liquid Staking?
                  </h2>
                  <span className="bg-green-500/10 text-green-400 text-xs px-2 py-1 rounded border border-green-500/20">
                    Active
                  </span>
                </div>
                <p className="text-gray-400 mb-8 leading-relaxed">
                  Should we enable liquid staking for the treasury assets? This
                  would allow the DAO to earn yield on idle CSPR.
                </p>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => handleVote(true)} // 👈 Connected Handler
                    disabled={isVoting}
                    className="py-4 bg-green-500/10 border border-green-500/50 text-green-400 rounded-lg hover:bg-green-500/20 transition-all font-bold"
                  >
                    Vote YES
                  </button>
                  <button
                    onClick={() => handleVote(false)} // 👈 Connected Handler
                    disabled={isVoting}
                    className="py-4 bg-red-500/10 border border-red-500/50 text-red-400 rounded-lg hover:bg-red-500/20 transition-all font-bold"
                  >
                    Vote NO
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Live Data (Indexer) */}
          <div className="lg:col-span-1">
            <ProposalResults daoId={DAO_ID} proposalId={PROPOSAL_ID} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default App;