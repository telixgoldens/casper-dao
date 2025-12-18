import React, { useState, useEffect } from 'react';
import LandingPage from './LandingPage'; // Import the cool design
import { CasperClient, DeployUtil, CLValueBuilder, RuntimeArgs, CLPublicKey } from "casper-js-sdk";
import { FaGhost } from 'react-icons/fa';
import axios from 'axios';

// --- CONFIG ---
const NODE_URL = "http://159.65.203.12:7777/rpc";
const CONTRACT_HASH = "hash-YOUR_ACTUAL_CONTRACT_HASH_HERE"; 
const API_URL = "http://localhost:3001";

function App() {
  const [userKey, setUserKey] = useState(null);
  const [view, setView] = useState('landing'); // 'landing' or 'dashboard'
  const [votes, setVotes] = useState([]);

  // 1. Connect Wallet
  const connect = async () => {
    try {
      const isConnected = await window.casperlabsHelper.isConnected();
      if (isConnected) {
        const key = await window.casperlabsHelper.getActivePublicKey();
        setUserKey(key);
        setView('dashboard'); // Switch to the app view after connecting
      } else {
        await window.casperlabsHelper.requestConnection();
      }
    } catch (err) { alert("Please install Casper Wallet extension"); }
  };

  // 2. Fetch Data (Only when in dashboard view)
  useEffect(() => {
    if (view === 'dashboard') {
      const fetchVotes = async () => {
        try {
            const res = await axios.get(`${API_URL}/votes/123`); 
            setVotes(res.data);
        } catch(e) { console.log("Backend not ready yet"); }
      };
      fetchVotes();
      const interval = setInterval(fetchVotes, 2000);
      return () => clearInterval(interval);
    }
  }, [view]);

  // 3. Send Vote Logic
  const sendVote = async (choice) => {
    // ... (Use the same sendVote logic from the previous code) ...
    // Copy the sendVote function from the "Zero-to-Hero" App.jsx here
    alert("Voting logic goes here (copy from previous step)");
  };

  // --- RENDER ---

  // If on Landing Page, show the Namada design
  if (view === 'landing') {
    return (
      <div className="relative">
        {/* Pass the connect function to the button inside LandingPage */}
        <div className="absolute top-5 right-10 z-50">
           <button 
             onClick={connect}
             className="px-6 py-2 border border-teal-500/50 rounded-full text-white hover:bg-teal-500/10 transition-colors"
           >
             Launch App
           </button>
        </div>
        <LandingPage />
      </div>
    );
  }

  // If Connected, show the Functional Dashboard
  return (
    <div className="min-h-screen bg-slate-900 text-white p-10 flex flex-col items-center">
      {/* ... Paste the Dashboard JSX from the "Zero-to-Hero" App.jsx here ... */}
      <h1 className="text-3xl text-teal-400 font-bold mb-10">Welcome, {userKey.substring(0,10)}...</h1>
      <div className="bg-slate-800 p-6 rounded-xl border border-teal-500/30">
        <h2 className="text-xl mb-4">Active Proposals</h2>
        {/* Vote Buttons & Live Results go here */}
      </div>
    </div>
  );
}

export default App;