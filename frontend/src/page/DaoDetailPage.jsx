import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCasper } from "../context/CasperContext";
import { FaSignOutAlt, FaGhost } from "react-icons/fa";
import {
  FaArrowLeft,
  FaUsers,
  FaVoteYea,
  FaChartLine,
  FaClock,
} from "react-icons/fa";
import ProposalCard from "../component/ProposalCard";

const API_URL = import.meta.env.VITE_APP_API_URL || "http://localhost:3001";

export default function DaoDetailPage() {
  const { daoId } = useParams();
  const { activeKey, disconnectWallet } = useCasper();
  const navigate = useNavigate();
  const [dao, setDao] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (daoId) {
      fetchDAODetails();
    }
  }, [daoId]);

  const fetchDAODetails = async () => {
    try {
      setLoading(true);

      const daoResponse = await fetch(`${API_URL}/dao/${daoId}`);
      const daoData = await daoResponse.json();
      setDao(daoData);

      const proposalsResponse = await fetch(`${API_URL}/proposals/${daoId}`);
      const proposalsData = await proposalsResponse.json();
      setProposals(proposalsData.proposals || []);

      const statsResponse = await fetch(`${API_URL}/dao-stats/${daoId}`);
      const statsData = await statsResponse.json();
      setStats(statsData);
    } catch (err) {
      console.error("Error fetching DAO details:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="min-h-screen bg-nebula bg-grid-texture flex items-center justify-center pt-28">
        <div className="text-white text-xl">Loading DAO details...</div>
      </section>
    );
  }

  if (!dao) {
    return (
      <section className="min-h-screen bg-nebula bg-grid-texture flex items-center justify-center pt-28">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">DAO Not Found</h2>
          <button
            onClick={() => navigate("/")}
            className="text-cyan-400 hover:text-cyan-300"
          >
            ← Back to DAOs
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-nebula bg-grid-texture pt-28 pb-24 ">
      <nav className="border-b border-gray-800 backdrop-blur-md sticky top-0 z-50 py-4 flex justify-between items-center nav-header">
        <div className="text-xl font-bold flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
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
      <div className="hero-container w-full container">
        <div className=" mx-auto space-y-6 ">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors mb-4"
          >
            <FaArrowLeft />
            <span>Back to All DAOs</span>
          </button>
          <div className="bg-[#071022]/70 backdrop-blur-md p-8 rounded-3xl shadow-[0_30px_80px_rgba(6,182,212,0.04)] relative overflow-hidden border border-cyan-500/12">
            <div className="absolute top-6 left-8 right-8 h-1 rounded-full bg-gradient-to-r from-cyan-400/40 via-blue-400/20 to-purple-500/25" />

            <div className="pt-3">
              <h1 className="text-4xl font-extrabold text-white mb-3 ps-2">
                {dao.name}
              </h1>

              {dao.description && (
                <p className="text-slate-300 text-lg mb-6 ps-2">{dao.description}</p>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3">
                <div className="bg-slate-900/50 rounded-xl p-3 border border-slate-700">
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                    DAO ID
                  </p>
                  <p className="text-white font-mono text-sm">{dao.dao_id}</p>
                </div>
                <div className="bg-slate-900/50 rounded-xl p-3 border border-slate-700">
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                    Creator
                  </p>
                  <p className="text-white font-mono text-xs">
                    {dao.creator?.substring(0, 12)}...
                    {dao.creator?.substring(dao.creator.length - 8)}
                  </p>
                </div>
                <div className="bg-slate-900/50 rounded-xl p-3 border border-slate-700">
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                    Created
                  </p>
                  <p className="text-white text-sm">
                    {new Date(parseInt(dao.dao_id)).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <a
                href={`https://testnet.cspr.live/deploy/${dao.deploy_hash}`}
                target="_blank"
                rel="noreferrer"
                className="inline-block mt-4 text-cyan-400 mb-1 hover:text-cyan-300 text-sm transition-colors"
              >
                View Creation on Blockchain →
              </a>
            </div>
          </div>
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 mt-3">
              <div className="bg-[#071022]/70 backdrop-blur-md rounded-2xl border border-cyan-500/12">
                <div className="flex items-center gap-2">
                  <FaUsers className="text-cyan-400 text-2xl ps-1" />
                  <p className="text-slate-400 text-sm pt-3">Members</p>
                </div>
                <p className="text-white font-bold text-3xl ps-1">
                  {stats.memberCount || 0}
                </p>
              </div>

              <div className="bg-[#071022]/70 backdrop-blur-md rounded-2xl border border-blue-500/12">
                <div className="flex items-center gap-2">
                  <FaVoteYea className="text-blue-400 text-2xl ps-1" />
                  <p className="text-slate-400 text-sm pt-3">Total Votes</p>
                </div>
                <p className="text-white font-bold text-3xl ps-1">
                  {stats.totalVotes || 0}
                </p>
              </div>
              <div className="bg-[#071022]/70 backdrop-blur-md  rounded-2xl border border-purple-500/12">
                <div className="flex items-center gap-2 ">
                  <FaChartLine className="text-purple-400 text-2xl ps-1" />
                  <p className="text-slate-400 text-sm pt-3">Proposals</p>
                </div>
                <p className="text-white font-bold text-3xl ps-1">
                  {proposals.length}
                </p>
              </div>

              <div className="bg-[#071022]/70 backdrop-blur-md p-6 rounded-2xl border border-green-500/12">
                <div className="flex items-center gap-2">
                  <FaClock className="text-green-400 text-2xl ps-1" />
                  <p className="text-slate-400 text-sm pt-3">Active</p>
                </div>
                <p className="text-white font-bold text-3xl ps-1">
                  {proposals.filter((p) => p.status === "active").length}
                </p>
              </div>
            </div>
          )}
          <div className="bg-[#071022]/70 backdrop-blur-md mt-3 rounded-3xl shadow-[0_30px_80px_rgba(6,182,212,0.04)] relative overflow-hidden border border-cyan-500/12">
            <div className="absolute top-6 left-8 right-8 h-1 rounded-full bg-gradient-to-r from-cyan-400/40 via-blue-400/20 to-purple-500/25" />

            <h2 className="text-3xl font-bold text-white mb-6 pt-3 ps-2">
              Proposals
            </h2>

            {proposals.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-400 mb-2">No proposals yet</p>
                <p className="text-slate-500 text-sm">
                  Create the first proposal for this DAO!
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {proposals.map((proposal) => (
                  <ProposalCard
                    key={proposal.proposal_id}
                    proposal={proposal}
                    daoId={daoId}
                  />
                ))}
              </div>
            )}
          </div>
          <div className="bg-gradient-to-r bg-[#071022]/70 from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-2xl p-6">
            <h3 className="text-white font-bold text-lg mb-3 ps-2">
              Quadratic Voting
            </h3>
            <p className="text-slate-300 text-sm mb-3 ps-2">
              This DAO uses quadratic voting. Your voting power is the square
              root of your token balance.
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
      </div>
    </section>
  );
}
