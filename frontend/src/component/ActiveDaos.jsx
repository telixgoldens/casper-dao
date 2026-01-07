import { useEffect, useState } from 'react';
import ProposalResults from './ProposalResults'; 

const API_URL = import.meta.env.VITE_APP_API_URL || "http://localhost:3001";

export default function ActiveDAOs() {
  const [daos, setDaos] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <div className="p-4">Loading DAOs...</div>;

  if (daos.length === 0) {
    return (
      <div className="p-4 border rounded bg-yellow-50 ">
        <h3 className="font-bold text-lg">No Active DAOs Yet</h3>
        <p className="text-sm mt-2">Create a DAO to get started! It will appear here after ~1 minute.</p>
      </div>
    );
  }

  return (
    <section className="space-y-6 container bg-grid-texture">
      <h2 className="text-2xl font-bold">Active DAOs</h2>
      {daos.map(dao => (
        <div key={dao.dao_id} className="border rounded-lg p-6 shadow-lg ">
          <div className="mb-4">
            <h3 className="text-xl font-bold text-blue-600">{dao.name}</h3>
            <p className="text-sm text-gray-500 mt-1">DAO ID: {dao.dao_id}</p>
            <p className="text-sm text-gray-500">
              Creator: {dao.creator?.substring(0, 10)}...{dao.creator?.substring(dao.creator.length - 8)}
            </p>
            <a 
              href={`https://testnet.cspr.live/deploy/${dao.deploy_hash}`}
              target="_blank"
              rel="noreferrer"
              className="text-blue-500 hover:underline text-sm"
            >
              View Creation on Blockchain →
            </a>
          </div>
          
          {/* Your existing ProposalResults component */}
          <ProposalResults daoId={dao.dao_id} proposalId="1" />
        </div>
      ))}
    </section>
  );
}