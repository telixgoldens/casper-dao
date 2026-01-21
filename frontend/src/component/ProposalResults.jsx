import { useEffect, useState } from "react";
import { useCasper } from "../context/CasperContext";
import { deployVote } from "../utils/casperService";
import Alert from "react-bootstrap/Alert";

const API_URL = import.meta.env.VITE_APP_API_URL || "http://localhost:3001";

export default function ProposalResults({ daoId, proposalId }) {
  console.log("ProposalResults props:", { daoId, proposalId });
  console.log("🔍 ProposalResults received:");
  console.log("  daoId:", daoId, "(type:", typeof daoId + ")");
  console.log("  proposalId:", proposalId, "(type:", typeof proposalId + ")");
  const { activeKey } = useCasper();
  const [votes, setVotes] = useState([]);
  const [stats, setStats] = useState(null);
  const [isVoting, setIsVoting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [checkingVote, setCheckingVote] = useState(true);
  const [showAlert, setShowAlert] = useState(false);
  const [alertVariant, setAlertVariant] = useState("success");
  const [alertMessage, setAlertMessage] = useState("");

  useEffect(() => {
    if (!showAlert) return;

    const handleClick = () => setShowAlert(false);
    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, [showAlert]);

  useEffect(() => {
    const checkIfVoted = async () => {
      if (!activeKey || !daoId) {
        setCheckingVote(false);
        return;
      }

      try {
        const response = await fetch(
          `${API_URL}/has-voted/${daoId}/${activeKey}`,
        );
        const data = await response.json();
        setHasVoted(data.hasVoted);
      } catch (err) {
        console.error("Error checking vote status:", err);
      } finally {
        setCheckingVote(false);
      }
    };

    checkIfVoted();
  }, [activeKey, daoId]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const voteRes = await fetch(`${API_URL}/votes/${proposalId}`);
        const voteData = await voteRes.json();
        setVotes(voteData.votes || []);

        const statRes = await fetch(`${API_URL}/stats/${daoId}/${proposalId}`);
        const statData = await statRes.json();
        setStats(statData);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 10000);

    return () => clearInterval(interval);
  }, [daoId, proposalId]);

  const handleVote = async (choice) => {
    console.log("=== VOTING DEBUG ===");
    console.log("DAO ID:", daoId);
    console.log("Proposal ID:", proposalId);
    console.log("Choice:", choice);
    console.log("===================");
    if (!activeKey) {
      setAlertVariant("warning");
      setAlertMessage("Please connect your wallet to vote.");
      setShowAlert(true);
      return;
    }

    if (hasVoted) {
      setAlertVariant("warning");
      setAlertMessage("You have already voted on this DAO.");
      setShowAlert(true);
      return;
    }

    setIsVoting(true);
    try {
      const deployHash = await deployVote(activeKey,  daoId, proposalId, choice);

      setAlertVariant("success");
      setAlertMessage(
        `Vote Submitted!\n\nChoice: ${choice ? "YES" : "NO"}\nDeploy Hash: ${deployHash}\n\nYour vote will appear in ~1 minute.`,
      );
      setShowAlert(true);
      setHasVoted(true);
      setTimeout(async () => {
        try {
          const statRes = await fetch(
            `${API_URL}/stats/${daoId}/${proposalId}`,
          );
          const statData = await statRes.json();
          setStats(statData);
        } catch (err) {
          console.error("Error refreshing stats:", err);
        }
      }, 2000);
    } catch (err) {
      console.error("Vote error:", err);
      setAlertVariant("danger");
      setAlertMessage("Vote failed: " + err.message);
      setShowAlert(true);
    } finally {
      setIsVoting(false);
    }
  };

  const yesPercentage = stats
    ? Math.round((stats.yes / (stats.total || 1)) * 100)
    : 0;
  const noPercentage = stats
    ? Math.round((stats.no / (stats.total || 1)) * 100)
    : 0;

  if (checkingVote) {
    return (
      <div className="bg-slate-900/50 rounded-xl p-6">
        <p className="text-slate-400 text-center">Checking vote status...</p>
      </div>
    );
  }

  return (
    <div className="">
      <h3 className="text-lg font-bold mb-4 pt-3">Live Results</h3>

      {showAlert && (
        <Alert variant={alertVariant} onClick={() => setShowAlert(false)}>
          {alertMessage}
        </Alert>
      )}

      {stats && (
        <div className="mb-6 space-y-3">
          <div className="flex justify-between text-sm">
            <span>Total Votes:</span>
            <span className="font-bold">{stats.total}</span>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-green-600 font-semibold">YES</span>
              <span className="text-green-600 font-bold">
                {stats.yes} ({yesPercentage}%)
              </span>
            </div>
            <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 transition-all duration-500"
                style={{ width: `${yesPercentage}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-red-600 font-semibold">NO</span>
              <span className="text-red-600 font-bold">
                {stats.no} ({noPercentage}%)
              </span>
            </div>
            <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-red-500 transition-all duration-500"
                style={{ width: `${noPercentage}%` }}
              />
            </div>
          </div>
        </div>
      )}

      <div className="mb-6">
        {!activeKey ? (
          <div className="bg-yellow-100 border border-yellow-400 rounded p-3 text-center text-sm text-yellow-700">
            Connect your wallet to vote
          </div>
        ) : hasVoted ? (
          <div className="bg-green-100 border border-green-400 rounded p-3 text-center text-sm text-green-700 vote-yes">
            You have already voted on this DAO
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleVote(true)}
              disabled={isVoting}
              className={`py-3 px-4 rounded-lg font-bold text-white transition-all vote-yes ${
                isVoting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700 hover:shadow-lg"
              }`}
            >
              {isVoting ? "Voting..." : "Vote YES"}
            </button>
            <button
              onClick={() => handleVote(false)}
              disabled={isVoting}
              className={`py-3 px-4 rounded-lg font-bold text-white transition-all vote-no ${
                isVoting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-red-600 hover:bg-red-700 hover:shadow-lg"
              }`}
            >
              {isVoting ? "Voting..." : "Vote NO"}
            </button>
          </div>
        )}
      </div>

      <div className="mt-3">
        <h4 className="font-semibold mb-3">
          Recent Votes (Blockchain Explorer)
        </h4>
        {votes.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-4">
            No votes yet. Be the first to vote!
          </p>
        ) : (
          <ul className="space-y-2">
            {votes.map((v) => (
              <li key={v.deploy_hash} className="text-sm border-b pb-1 pt-1">
                <div className="flex items-center justify-between">
                  <div>
                    <span
                      className={
                        v.choice
                          ? "text-green-500 font-bold"
                          : "text-red-500 font-bold"
                      }
                    >
                      {v.choice ? "YES" : "NO"}
                    </span>{" "}
                    by {v.voter_address.substring(0, 10)}...
                  </div>
                  <a
                    href={`https://testnet.cspr.live/deploy/${v.deploy_hash}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-500 hover:underline text-xs"
                  >
                    View TX →
                  </a>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(v.timestamp).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
