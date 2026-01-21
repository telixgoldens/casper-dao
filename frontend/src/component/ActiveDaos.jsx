import { useEffect, useState } from 'react';
import ProposalResults from './ProposalResults'; 
import Faucet from "./Faucet"

const API_URL = import.meta.env.VITE_APP_API_URL || "http://localhost:3001";

export default function ActiveDAOs() {
  const [daos, setDaos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [proposals, setProposals] = useState({});

 useEffect(() => {
    const fetchDAOs = async () => {
      try {
        const response = await fetch(`${API_URL}/daos`);
        const data = await response.json();
        const daoList = data.daos || [];
        setDaos(daoList);
        
        for (const dao of daoList) {
          const proposalResponse = await fetch(`${API_URL}/proposals/${dao.dao_id}`);
          const proposalData = await proposalResponse.json();
          
          setProposals(prev => ({
            ...prev,
            [dao.dao_id]: proposalData.proposals || []
          }));
        }
        
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
          <div className="bg-[#071022]/70 backdrop-blur-md p-8 rounded-3xl shadow-[0_30px_80px_rgba(6,182,212,0.04)] relative overflow-hidden mb-3 ps-4">
            <div className="absolute top-6 left-8 right-8 h-1 rounded-full bg-gradient-to-r from-cyan-400/40 via-blue-400/20 to-purple-500/25" />
            <h2 className="text-3xl md:text-4xl font-extrabold text-white pt-3">Active Proposals</h2>
            <p className="text-slate-300 text-sm mt-2">
              Claim DGOT tokens, then vote on active proposals
            </p>
          </div>

          {daos.map(dao => {
            const daoProposals = proposals[dao.dao_id] || [];
            
            return (
              <div 
                key={dao.dao_id} 
                className="bg-[#071022]/70 backdrop-blur-md p-10 rounded-3xl shadow-[0_30px_80px_rgba(6,182,212,0.04)] relative overflow-hidden border mt-3 p-4"
              >
                <div className="absolute top-6 left-8 right-8 h-1 rounded-full bg-gradient-to-r from-cyan-400/40 via-blue-400/20 to-purple-500/25" />
                <div className="mb-6 pt-3">
                  <h3 className="text-2xl font-bold text-white mb-2">{dao.name}</h3>
                  {dao.description && (
                    <p className="text-slate-300 text-sm mb-3">{dao.description}</p>
                  )}
                  
                  <div className="space-y-1">
                    <p className="text-xs text-slate-500 uppercase tracking-wider">DAO ID: {dao.dao_id}</p>
                  </div>
                  <div className="space-y-1 mt-3">
                    <p className="text-xs text-slate-500 uppercase tracking-wider">
                      Creator: {dao.creator?.substring(0, 10)}...{dao.creator?.substring(dao.creator.length - 8)}
                    </p>
                  </div>
                  
                  <a 
                    href={`https://testnet.cspr.live/deploy/${dao.deploy_hash}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block mt-3 text-cyan-400 hover:text-cyan-300 text-sm transition-colors"
                  >
                    View Creation on Blockchain →
                  </a>
                </div>
                <div className="mt-6 pt-6 border-t border-slate-700/50">
                  {daoProposals.length === 0 ? (
                    <div className="bg-yellow-500/10 rounded-xl p-4">
                      <p className="text-yellow-300 text-sm">
                        No proposals yet. Create one to start voting!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {daoProposals.map(proposal => (
                        <div key={proposal.proposal_id} className="bg-slate-900/50 rounded-xl p-6 border border-slate-700">
                          <div className="mb-4">
                            <h4 className="text-xl font-bold text-white mb-2">{proposal.title}</h4>
                            <p className="text-slate-300 text-sm mb-3">{proposal.description}</p>
                            <p className="text-xs text-slate-500">
                              Proposal ID: {proposal.proposal_id}
                            </p>
                          </div>
                          <ProposalResults 
                            daoId={dao.dao_id} 
                            proposalId={proposal.proposal_id}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}