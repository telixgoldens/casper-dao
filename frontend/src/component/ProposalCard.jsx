import { useState } from 'react';
import ProposalResults from './ProposalResults';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

export default function ProposalCard({ proposal, daoId }) {
  const [expanded, setExpanded] = useState(false);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'ended':
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default:
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="bg-slate-900/50 rounded-xl border border-slate-700 overflow-hidden hover:border-cyan-500/50 transition-all">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-white mb-2 ps-2">{proposal.title}</h3>
            <p className="text-slate-400 text-sm mb-3 ps-2">{proposal.description}</p>
          </div>
          
          <span className={`px-4 py-2 rounded-full text-xs font-semibold ml-4 ${getStatusColor(proposal.status)}`}>
            {proposal.status.toUpperCase()}
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-slate-800/50 rounded-lg p-3">
            <p className="text-xs text-slate-500 mb-1">Proposal ID</p>
            <p className="text-white font-mono text-sm">{proposal.proposal_id}</p>
          </div>
          
          {proposal.start_time > 0 && (
            <div className="bg-slate-800/50 rounded-lg p-3">
              <p className="text-xs text-slate-500 mb-1">Voting Starts</p>
              <p className="text-white text-xs">{formatDate(proposal.start_time)}</p>
            </div>
          )}
          
          {proposal.end_time > 0 && (
            <div className="bg-slate-800/50 rounded-lg p-3">
              <p className="text-xs text-slate-500 mb-1">Voting Ends</p>
              <p className="text-white text-xs">{formatDate(proposal.end_time)}</p>
            </div>
          )}
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-center gap-2 py-3 text-cyan-400 hover:text-cyan-300 transition-colors border-t border-slate-700 mt-4"
        >
          <span>{expanded ? 'Hide' : 'Show'} Voting</span>
          {expanded ? <FaChevronUp /> : <FaChevronDown />}
        </button>
      </div>
      {expanded && (
        <div className="border-t border-slate-700 p-6 bg-slate-800/30">
          <ProposalResults 
            daoId={daoId} 
            proposalId={proposal.proposal_id}
          />
        </div>
      )}
    </div>
  );
}