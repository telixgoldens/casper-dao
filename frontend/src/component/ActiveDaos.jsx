import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Faucet from "./Faucet"

const API_URL = import.meta.env.VITE_APP_API_URL || "http://localhost:3001";

export default function ActiveDAOs() {
  const [daos, setDaos] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

 useEffect(() => {
    const fetchDAOs = async () => {
      try {
        const response = await fetch(`${API_URL}/daos`);
        const data = await response.json();
        setDaos(data.daos || []);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching DAOs:', err);
        setLoading(false);
      }
    };

    fetchDAOs();
    const interval = setInterval(fetchDAOs, 10000);
    return () => clearInterval(interval);
  }, []);


  if (loading) {
    return (
      <section className="min-h-screen flex items-start pt-28 pb-24">
        <div className="hero-container w-full">
          <div className="max-w-3xl mx-auto">
            <div className="bg-[#071022]/70 backdrop-blur-md p-10 rounded-3xl shadow-[0_30px_80px_rgba(6,182,212,0.04)]">
              <p className="text-slate-300 text-center">Loading DAOs...</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (daos.length === 0) {
    return (
      <section className="min-h-screen bg-nebula bg-grid-texture flex items-start pt-28 pb-24">
        <div className="hero-container w-full">
          <div className="max-w-3xl mx-auto">
            <div className="bg-[#071022]/70 backdrop-blur-md p-10 rounded-3xl shadow-[0_30px_80px_rgba(6,182,212,0.04)] relative overflow-hidden">
              <div className="absolute top-6 left-8 right-8 h-1 rounded-full bg-gradient-to-r from-cyan-400/40 via-blue-400/20 to-purple-500/25" />
              
              <div className="mb-6 pt-3 bg-yellow-500/10 rounded-xl p-4">
                <h3 className="font-bold text-lg text-white">No Active DAOs Yet</h3>
                <p className="text-sm mt-2 text-slate-300">Create a DAO to get started! It will appear here after ~1 minute.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-nebula bg-grid-texture flex items-start pt-28 pb-24">
      <div className="hero-container w-full">
        <div className="max-w-5xl mx-auto space-y-6">
          <Faucet />
          
          <div className="bg-[#071022]/70 backdrop-blur-md p-8 mt-3 rounded-3xl shadow-[0_30px_80px_rgba(6,182,212,0.04)] relative overflow-hidden mb-3 ps-4">
            <div className="absolute top-6 left-8 right-8 h-1 rounded-full bg-gradient-to-r from-cyan-400/40 via-blue-400/20 to-purple-500/25" />
            <h2 className="text-3xl md:text-4xl font-extrabold text-white pt-3">Active DAOs</h2>
            <p className="text-slate-300 text-sm mt-2">
              Click on any DAO to see proposals and vote
            </p>
          </div>

          {daos.length === 0 ? (
            <div className="bg-[#071022]/70 backdrop-blur-md p-10 rounded-3xl">
              <p className="text-yellow-300">No DAOs yet. Create one to get started!</p>
            </div>
          ) : (
            daos.map(dao => (
              <div
                key={dao.dao_id}
                onClick={() => navigate(`/dao/${dao.dao_id}`)}
                className="bg-[#071022]/70 backdrop-blur-md ps-2 mb-3 rounded-3xl shadow-[0_30px_80px_rgba(6,182,212,0.04)] relative overflow-hidden border border-slate-700 hover:border-cyan-500/50 transition-all cursor-pointer group"
              >
                <div className="absolute top-6 left-8 right-8 h-1 rounded-full bg-gradient-to-r from-cyan-400/40 via-blue-400/20 to-purple-500/25" />
                
                <div className="pt-3">
                  <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">
                    {dao.name} →
                  </h3>
                  
                  {dao.description && (
                    <p className="text-slate-300 text-sm mb-3">{dao.description}</p>
                  )}
                  
                  <div className="flex gap-4 text-xs text-slate-500 mb-2">
                    <span>DAO ID: {dao.dao_id}</span>
                    <span>Creator: {dao.creator?.substring(0, 10)}...</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}