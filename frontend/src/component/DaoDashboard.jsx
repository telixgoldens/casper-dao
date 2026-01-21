import { useEffect, useState } from 'react';
import { FaUsers, FaVoteYea, FaChartLine, FaHistory } from 'react-icons/fa';

const API_URL = import.meta.env.VITE_APP_API_URL || "http://localhost:3001";

export default function DaoDashboard({ daoId }) {
  const [daoData, setDaoData] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (daoId) {
      fetchDashboardData();
    }
  }, [daoId]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const daoResponse = await fetch(`${API_URL}/dao/${daoId}`);
      const daoData = await daoResponse.json();
      setDaoData(daoData);

      const proposalsResponse = await fetch(`${API_URL}/proposals/${daoId}`);
      const proposalsData = await proposalsResponse.json();
      setProposals(proposalsData.proposals || []);

      const statsResponse = await fetch(`${API_URL}/dao-stats/${daoId}`);
      const statsData = await statsResponse.json();
      setStats(statsData);

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-[#071022]/70 backdrop-blur-md p-10 rounded-3xl shadow-[0_30px_80px_rgba(6,182,212,0.04)]">
        <p className="text-slate-300 text-center">Loading dashboard...</p>
      </div>
    );
  }

  if (!daoData) {
    return (
      <div className="bg-[#071022]/70 backdrop-blur-md p-10 rounded-3xl shadow-[0_30px_80px_rgba(6,182,212,0.04)]">
        <p className="text-rose-400 text-center">DAO not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-[#071022]/70 backdrop-blur-md p-8 rounded-3xl shadow-[0_30px_80px_rgba(6,182,212,0.04)] relative overflow-hidden border border-cyan-500/12">
        <div className="absolute top-6 left-8 right-8 h-1 rounded-full bg-gradient-to-r from-cyan-400/40 via-blue-400/20 to-purple-500/25" />
        
        <div className="pt-3">
          <h2 className="text-3xl font-extrabold text-white mb-2">{daoData.name}</h2>
          {daoData.description && (
            <p className="text-slate-300 text-sm mb-4">{daoData.description}</p>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">DAO ID</p>
              <p className="text-white font-bold text-lg">{daoData.dao_id}</p>
            </div>
            
            <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Creator</p>
              <p className="text-white font-mono text-sm">
                {daoData.creator?.substring(0, 10)}...{daoData.creator?.substring(daoData.creator.length - 8)}
              </p>
            </div>
            
            <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Token</p>
              <p className="text-cyan-400 font-mono text-xs break-all">
                {daoData.token_address?.substring(0, 20)}...
              </p>
            </div>
          </div>
        </div>
      </div>
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-[#071022]/70 backdrop-blur-md p-6 rounded-2xl border border-cyan-500/12">
            <div className="flex items-center gap-3 mb-2">
              <FaUsers className="text-cyan-400 text-2xl" />
              <p className="text-slate-400 text-sm">Total Members</p>
            </div>
            <p className="text-white font-bold text-3xl">{stats.memberCount || 0}</p>
          </div>

          <div className="bg-[#071022]/70 backdrop-blur-md p-6 rounded-2xl border border-blue-500/12">
            <div className="flex items-center gap-3 mb-2">
              <FaVoteYea className="text-blue-400 text-2xl" />
              <p className="text-slate-400 text-sm">Total Votes</p>
            </div>
            <p className="text-white font-bold text-3xl">{stats.totalVotes || 0}</p>
          </div>

          <div className="bg-[#071022]/70 backdrop-blur-md p-6 rounded-2xl border border-purple-500/12">
            <div className="flex items-center gap-3 mb-2">
              <FaChartLine className="text-purple-400 text-2xl" />
              <p className="text-slate-400 text-sm">Proposals</p>
            </div>
            <p className="text-white font-bold text-3xl">{stats.proposalCount || 0}</p>
          </div>

          <div className="bg-[#071022]/70 backdrop-blur-md p-6 rounded-2xl border border-green-500/12">
            <div className="flex items-center gap-3 mb-2">
              <FaHistory className="text-green-400 text-2xl" />
              <p className="text-slate-400 text-sm">Active Now</p>
            </div>
            <p className="text-white font-bold text-3xl">{stats.activeProposals || 0}</p>
          </div>
        </div>
      )}
      <div className="bg-[#071022]/70 backdrop-blur-md p-8 rounded-3xl shadow-[0_30px_80px_rgba(6,182,212,0.04)] relative overflow-hidden border border-cyan-500/12">
        <div className="absolute top-6 left-8 right-8 h-1 rounded-full bg-gradient-to-r from-cyan-400/40 via-blue-400/20 to-purple-500/25" />
        
        <h3 className="text-2xl font-bold text-white mb-6 pt-3">Proposal History</h3>
        
        {proposals.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-400">No proposals yet</p>
            <p className="text-slate-500 text-sm mt-2">Create the first proposal for this DAO!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {proposals.map((proposal) => (
              <div 
                key={proposal.proposal_id}
                className="bg-slate-900/50 border border-slate-700 rounded-xl p-6 hover:border-cyan-500/50 transition-all"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h4 className="text-white font-bold text-lg mb-2">{proposal.title}</h4>
                    <p className="text-slate-400 text-sm line-clamp-2">{proposal.description}</p>
                  </div>
                  
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ml-4 ${
                    proposal.status === 'active' 
                      ? 'bg-green-500/20 text-green-400'
                      : proposal.status === 'ended'
                      ? 'bg-slate-500/20 text-slate-400'
                      : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {proposal.status.toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-700">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Proposal ID</p>
                    <p className="text-white font-mono text-sm">{proposal.proposal_id}</p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Yes Votes</p>
                    <p className="text-green-400 font-bold">{proposal.yes_votes || 0}</p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-slate-500 mb-1">No Votes</p>
                    <p className="text-red-400 font-bold">{proposal.no_votes || 0}</p>
                  </div>
                </div>

                {proposal.ai_summary && (
                  <div className="mt-4 bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
                    <p className="text-xs text-purple-400 font-semibold mb-1">🤖 AI Summary</p>
                    <p className="text-slate-300 text-sm">{proposal.ai_summary}</p>
                  </div>
                )}

                {proposal.deploy_hash && (
                  <a 
                    href={`https://testnet.cspr.live/deploy/${proposal.deploy_hash}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block mt-3 text-cyan-400 hover:text-cyan-300 text-sm transition-colors"
                  >
                    View on Blockchain →
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-2xl p-6">
        <h4 className="text-white font-bold text-lg mb-3">Quadratic Voting</h4>
        <p className="text-slate-300 text-sm mb-3">
          This DAO uses quadratic voting to prevent whale dominance. Your voting power is the 
          <strong className="text-cyan-400"> square root </strong> of your token balance.
        </p>
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="bg-slate-900/50 rounded-lg p-3 text-center">
            <p className="text-slate-400 text-xs mb-1">100 Tokens</p>
            <p className="text-cyan-400 font-bold">10 Votes</p>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-3 text-center">
            <p className="text-slate-400 text-xs mb-1">400 Tokens</p>
            <p className="text-cyan-400 font-bold">20 Votes</p>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-3 text-center">
            <p className="text-slate-400 text-xs mb-1">10,000 Tokens</p>
            <p className="text-cyan-400 font-bold">100 Votes</p>
          </div>
        </div>
      </div>
    </div>
  );
}