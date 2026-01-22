import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import LandingPage from "./page/LandingPage";
import { useCasper } from "./context/CasperContext";
import { FaSignOutAlt, FaGhost } from "react-icons/fa";
import CreateDAO from "./page/CreateDAO";
import Footer from "./component/Footer";
import ActiveDAOs from "./component/ActiveDaos";
import CreateProposal from "./page/CreateProposal";
import DaoDashboard from "./component/DaoDashboard";
import DaoDetailPage from "./page/DaoDetailPage";

function MainDashboard() {
  const { activeKey, disconnectWallet } = useCasper();
  const [activeTab, setActiveTab] = useState("vote");
  const [selectedDaoId, setSelectedDaoId] = useState("");

  const mainBg =
    activeTab === "create" || activeTab === "create-proposal"
      ? "bg-nebula bg-grid-texture"
      : "bg-slate-900";

  return (
    <div
      className={`min-h-screen ${mainBg} text-white font-sans selection:bg-teal-500 selection:text-black`}
    >
      <nav className="border-b border-gray-800 backdrop-blur-md sticky top-0 z-50 py-4 flex justify-between items-center nav-header">
        <div
          className="text-xl font-bold flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
        >
          <FaGhost className="text-cyan-400 text-xl group-hover:text-white" />
          <span className="text-teal-400">Casper</span>DAO
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400 bg-slate-800 px-3 py-1 rounded-full border border-gray-700 font-mono">
            {activeKey?.slice(0, 10)}...{activeKey?.slice(-4)}
          </span>
          <div className="w-3 h-3 bg-green-500 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.5)] animate-pulse"></div>
          <button
            onClick={disconnectWallet}
            className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-full transition-all"
            title="Disconnect Wallet"
          >
            <FaSignOutAlt size={18} />
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-8 pt-3 bg-grid-texture">
        <div className="mb-10 container">
          <h1 className="text-3xl font-bold mb-2">Governance Dashboard</h1>
          <p className="text-gray-400">
            Manage your DAOs and participate in active votes.
          </p>
        </div>
        
        <div className="flex gap-6 border-b border-gray-800 mb-8 container">
          <button
            onClick={() => setActiveTab("vote")}
            className={`pb-2 px-2 nav-active ${
              activeTab === "vote"
                ? "text-teal-400 border-b-2 border-teal-400"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            Active DAOs
          </button>
          
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
            onClick={() => setActiveTab("create-proposal")}
            className={`pb-2 px-2 nav-active ${
              activeTab === "create-proposal"
                ? "text-teal-400 border-b-2 border-teal-400"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            Create Proposal
          </button>

          <button
            onClick={() => setActiveTab("dashboard")}
            className={`pb-2 px-2 nav-active ${
              activeTab === "dashboard"
                ? "text-teal-400 border-b-2 border-teal-400"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            DAO Dashboard
          </button>
        </div>
        
        <div className="container">
          <div className="">
            {activeTab === "vote" && <ActiveDAOs />}
            
            {activeTab === "create" && <CreateDAO />}

            {activeTab === "create-proposal" && <CreateProposal />}

            {activeTab === "dashboard" && (
              <div className="hero-container">
                <div className="bg-[#071022]/70 backdrop-blur-md  rounded-2xl border border-cyan-500/12">
                  <label className="text-sm font-bold text-slate-400 ps-2 mt-2 block">
                    Enter DAO ID to view dashboard:
                  </label>
                  <input
                    type="text"
                    value={selectedDaoId}
                    onChange={(e) => setSelectedDaoId(e.target.value)}
                    placeholder="e.g. 1234567890"
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-3 text-dark focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                </div>
                {selectedDaoId && <DaoDashboard daoId={selectedDaoId} />}

                {!selectedDaoId && (
                  <div className="bg-[#071022]/70 backdrop-blur-md pt-2 rounded-3xl text-center border border-cyan-500/12">
                    <p className="text-slate-400 ps-2">
                      Enter a DAO ID above to view its dashboard
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  const { isConnected, connectWallet } = useCasper();

  if (!isConnected) {
    return <LandingPage onConnect={connectWallet} />;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainDashboard />} />
        <Route path="/dao/:daoId" element={<DaoDetailPage />} />
      </Routes>
    </Router>
  );
}

export default App;