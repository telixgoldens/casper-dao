import { useEffect, useState } from 'react';

const API_URL = import.meta.env.VITE_APP_API_URL || "http://localhost:3001";

export default function ProposalResults({ daoId, proposalId }) {
  const [votes, setVotes] = useState([]);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const voteRes = await fetch(`${API_URL}/votes/${proposalId}`);
      const voteData = await voteRes.json();
      setVotes(voteData.votes);

      const statRes = await fetch(`${API_URL}/stats/${daoId}/${proposalId}`);
      const statData = await statRes.json();
      setStats(statData);
    };

    fetchData(); 
    const interval = setInterval(fetchData, 3000); 

    return () => clearInterval(interval);
  }, [daoId, proposalId]);

  return (
    <div className="p-4 border rounded shadow">
      <h3>Live Results </h3>
      <div className="mt-4">
        <h4>Recent Votes (Blockchain Explorer)</h4>
        <ul>
          {votes.map((v) => (
            <li key={v.deploy_hash} className="text-sm border-b py-2">
              <span className={v.choice ? "text-green-500" : "text-red-500"}>
                {v.choice ? "YES" : "NO"}
              </span>
              {" "} by {v.voter_address.substring(0, 10)}... 
              <a 
                href={`https://testnet.cspr.live/deploy/${v.deploy_hash}`}
                target="_blank"
                rel="noreferrer"
                className="text-blue-500 ml-2"
              >
                (View on CSPR.live)
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}