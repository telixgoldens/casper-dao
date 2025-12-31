import React, { useState } from 'react';
import LandingPage from './page/LandingPage';
import ProposalResults from './component/ProposalResults';
import { useCasper } from './context/CasperContext';

// --- CONFIG ---
const DAO_ID = "123"; 
const PROPOSAL_ID = "1"; 

function App() {
  // 1. The "Brain": Get wallet state directly from our Hook
  const { activeKey, isConnected, connectWallet } = useCasper();
  
  // 2. UI State: Just for switching tabs
  const [activeTab, setActiveTab] = useState('create'); 

  // 3. Logic: If not connected, show the Landing Page immediately
  if (!isConnected) {
    return <LandingPage onConnect={connectWallet} />;
  }

  // 4. Logic: If connected, Render the Dashboard
  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans selection:bg-teal-500 selection:text-black">
      
      {/* --- HEADER --- */}
      <nav className="border-b border-gray-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50 px-8 py-4 flex justify-between items-center">
        <div className="text-xl font-bold flex items-center gap-2">
            <span className="text-teal-400">Casper</span>DAO
        </div>
        
        {/* User Badge */}
        <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400 bg-slate-800 px-3 py-1 rounded-full border border-gray-700 font-mono">
                {activeKey?.slice(0, 10)}...{activeKey?.slice(-4)}
            </span>
            <div className="w-3 h-3 bg-green-500 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.5)] animate-pulse"></div>
        </div>
      </nav>

      {/* --- MAIN CONTENT --- */}
      <main className="max-w-6xl mx-auto p-8">
        
        {/* Welcome Section */}
        <div className="mb-10">
            <h1 className="text-3xl font-bold mb-2">Governance Dashboard</h1>
            <p className="text-gray-400">Manage your DAOs and participate in active votes.</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-6 border-b border-gray-800 mb-8">
            <button 
                onClick={() => setActiveTab('create')}
                className={`pb-3 px-2 transition-colors ${activeTab === 'create' ? 'text-teal-400 border-b-2 border-teal-400' : 'text-gray-500 hover:text-gray-300'}`}
            >
                Create DAO
            </button>
            <button 
                onClick={() => setActiveTab('vote')}
                className={`pb-3 px-2 transition-colors ${activeTab === 'vote' ? 'text-teal-400 border-b-2 border-teal-400' : 'text-gray-500 hover:text-gray-300'}`}
            >
                Active Proposals
            </button>
        </div>

        {/* Tab Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: Interactive Forms */}
            <div className="lg:col-span-2 space-y-6">
                {activeTab === 'create' ? (
                    <div className="bg-slate-800 p-10 rounded-xl border border-gray-700 min-h-[400px] flex items-center justify-center text-gray-500 border-dashed">
                        {/* Placeholder for the CreateDAO Form */}
                        <div className="text-center">
                            <p className="mb-2">✨ Create DAO Form</p>
                            <span className="text-xs text-gray-600">(We will build this component next)</span>
                        </div>
                    </div>
                ) : (
                    <div className="bg-slate-800 p-8 rounded-xl border border-gray-700">
                        <div className="flex justify-between items-start mb-4">
                            <h2 className="text-xl font-bold">Proposal #{PROPOSAL_ID}: Enable Liquid Staking?</h2>
                            <span className="bg-green-500/10 text-green-400 text-xs px-2 py-1 rounded border border-green-500/20">Active</span>
                        </div>
                        <p className="text-gray-400 mb-8 leading-relaxed">
                            Should we enable liquid staking for the treasury assets? This would allow the DAO to earn yield on idle CSPR.
                        </p>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <button 
                                onClick={() => alert("Vote YES logic pending")}
                                className="py-4 bg-green-500/10 border border-green-500/50 text-green-400 rounded-lg hover:bg-green-500/20 transition-all font-bold"
                            >
                                Vote YES
                            </button>
                            <button 
                                onClick={() => alert("Vote NO logic pending")}
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
    </div>
  );
}

export default App;