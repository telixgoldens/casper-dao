import React, { useState, useEffect } from "react";
import { FaLightbulb, FaCheckCircle, FaWallet } from "react-icons/fa";
import { useCasper } from "../context/CasperContext";
import { useForm } from "react-hook-form";
import { deployCreateProposal } from "../utils/casperService";
import Alert from "react-bootstrap/Alert";

const API_URL = import.meta.env.VITE_APP_API_URL || "http://localhost:3001";

export default function CreateProposal({ daoId, onProposalCreated }) {
  const { activeKey } = useCasper();
  const [isDeploying, setIsDeploying] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertVariant, setAlertVariant] = useState("success");
  const [alertMessage, setAlertMessage] = useState("");
  const [daos, setDaos] = useState([]);
  const [selectedDao, setSelectedDao] = useState(daoId || "");
  const [aiSummary, setAiSummary] = useState("");
  const [generatingSummary, setGeneratingSummary] = useState(false);

  useEffect(() => {
    fetchDAOs();
  }, []);

  useEffect(() => {
    if (!showAlert) return;
    const handleClick = () => setShowAlert(false);
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [showAlert]);

  const fetchDAOs = async () => {
    try {
      const response = await fetch(`${API_URL}/daos`);
      const data = await response.json();
      setDaos(data.daos || []);
    } catch (err) {
      console.error('Error fetching DAOs:', err);
    }
  };

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      daoId: daoId || "",
      title: "",
      description: "",
      votingDuration: "86400000", 
    },
  });

  const description = watch("description");

  const generateAISummary = async () => {
    if (!description || description.length < 20) {
      setAlertVariant("warning");
      setAlertMessage("Please write a more detailed description first (at least 20 characters)");
      setShowAlert(true);
      return;
    }

    setGeneratingSummary(true);
    try {
      const response = await fetch(`${API_URL}/generate-summary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate summary');
      }

      setAiSummary(data.summary);
      setAlertVariant("success");
      setAlertMessage("AI Summary generated! Review it below.");
      setShowAlert(true);
    } catch (err) {
      console.error('AI Summary error:', err);
      setAlertVariant("danger");
      setAlertMessage("Failed to generate summary: " + err.message);
      setShowAlert(true);
    } finally {
      setGeneratingSummary(false);
    }
  };

  const onSubmit = async (data) => {
    if (!activeKey) {
      setAlertVariant("warning");
      setAlertMessage("Please connect your wallet first");
      setShowAlert(true);
      return;
    }

    if (!data.daoId) {
      setAlertVariant("warning");
      setAlertMessage("Please select a DAO");
      setShowAlert(true);
      return;
    }

    const sanitizedTitle = data.title
      .replace(/[–—]/g, '-')
      .replace(/[^\x00-\x7F]/g, '')
      .trim();

    const sanitizedDescription = data.description
      .replace(/[–—]/g, '-')
      .replace(/[^\x00-\x7F]/g, '')
      .trim();

    setIsDeploying(true);
    try {
      const deployHash = await deployCreateProposal(
        activeKey,
        data.daoId,
        sanitizedTitle,
        sanitizedDescription,
        parseInt(data.votingDuration)
      );

      setAlertVariant("success");
      setAlertMessage(
        `Proposal "${data.title}" submitted successfully!\n\nDeploy Hash: ${deployHash}\n\nYou can monitor deployment status on Casper Live.`
      );
      setShowAlert(true);

      reset();
      setAiSummary("");
      
      if (onProposalCreated) {
        onProposalCreated({ 
          ...data, 
          title: sanitizedTitle,
          description: sanitizedDescription,
          deployHash 
        });
      }
    } catch (err) {
      console.error(err);
      setAlertVariant("danger");
      setAlertMessage("Deploy Failed: " + err.message);
      setShowAlert(true);
    } finally {
      setIsDeploying(false);
    }
  };

  const getDurationLabel = (ms) => {
    const hours = ms / (1000 * 60 * 60);
    const days = hours / 24;
    
    if (days >= 1) return `${days} day${days > 1 ? "s" : ""}`;
    return `${hours} hour${hours > 1 ? "s" : ""}`;
  };

  return (
    <section className="min-h-screen bg-nebula bg-grid-texture flex items-start pt-28 pb-24">
      <div className="hero-container w-full ">
        <div className="max-w-6xl mx-auto bg-[#071022]/70">
          <div className="backdrop-blur-md border border-cyan-500/12 shadow-[0_30px_80px_rgba(6,182,212,0.04)] relative overflow-hidden">
            <div className="absolute top-6 left-8 right-8 h-1 rounded-full bg-gradient-to-r from-cyan-400/40 via-blue-400/20 to-purple-500/25" />
            
            {showAlert && (
              <Alert variant={alertVariant} onClick={() => setShowAlert(false)}>
                {alertMessage}
              </Alert>
            )}

            {activeKey && (
              <div className="mb-6 pt-3 bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                <div className="flex items-center gap-3 ">
                  <FaCheckCircle className="text-green-400 text-xl" />
                  <div>
                    <p className="text-white font-semibold text-sm">Wallet Connected</p>
                    <p className="text-slate-400 text-xs font-mono">
                      {activeKey.slice(0, 10)}...{activeKey.slice(-8)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {!activeKey && (
              <div className="mb-6 pt-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <FaWallet className="text-yellow-400 text-xl" />
                  <div>
                    <p className="text-white font-semibold text-sm">Wallet Not Connected</p>
                    <p className="text-slate-400 text-xs">
                      Please connect your Casper Wallet to create a proposal
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="mb-6 pt-3 ps-2">
              <h2 className="text-3xl md:text-4xl font-extrabold text-white flex items-center gap-3">
                <FaLightbulb className="text-cyan-300" />
                <span>Create Proposal</span>
              </h2>
              <p className="text-slate-300 text-sm mt-2">
                Submit a new proposal for DAO members to vote on
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-[#071022]/70">
              <div className="space-y-2 px-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Select DAO *
                </label>
                <select
                  {...register("daoId", {
                    required: "Please select a DAO",
                  })}
                  value={selectedDao}
                  onChange={(e) => setSelectedDao(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-dark focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all"
                >
                  <option value="">-- Select a DAO --</option>
                  {daos.map((dao) => (
                    <option key={dao.dao_id} value={dao.dao_id}>
                      {dao.name} (ID: {dao.dao_id})
                    </option>
                  ))}
                </select>
                {errors.daoId && (
                  <p className="text-xs text-rose-400 mt-1">{errors.daoId.message}</p>
                )}
              </div>
              <div className="space-y-2 px-2 mt-3">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Proposal Title *
                </label>
                <input
                  {...register("title", {
                    required: "Proposal title is required",
                    minLength: {
                      value: 5,
                      message: "Title must be at least 5 characters",
                    },
                    maxLength: {
                      value: 200,
                      message: "Title must be less than 200 characters",
                    },
                  })}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-dark focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all placeholder:text-slate-600"
                  placeholder="e.g. Allocate 10,000 tokens to marketing fund"
                />
                {errors.title && (
                  <p className="text-xs text-rose-400 mt-1">{errors.title.message}</p>
                )}
              </div>
              <div className="space-y-2 pt-3 px-2 mt-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Proposal Description *
                </label>
                <textarea
                  {...register("description", {
                    required: "Description is required",
                    minLength: {
                      value: 20,
                      message: "Description must be at least 20 characters",
                    },
                    maxLength: {
                      value: 2000,
                      message: "Description must be less than 2000 characters",
                    },
                  })}
                  rows="6"
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-dark focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all placeholder:text-slate-600 resize-none"
                  placeholder="Provide detailed information about your proposal, including rationale, expected outcomes, and implementation details..."
                />
                {errors.description && (
                  <p className="text-xs text-rose-400 mt-1">{errors.description.message}</p>
                )}
                <button
                  type="button"
                  onClick={generateAISummary}
                  disabled={generatingSummary || !description || description.length < 20}
                  className={`mt-3 px-4 py-2 rounded-lg btn-deploy text-white font-semibold text-sm transition-all ${
                    generatingSummary || !description || description.length < 20
                      ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] text-white'
                  }`}
                >
                  {generatingSummary ? (
                    <span className="flex items-center gap-2">
                      Generating AI Summary...
                    </span>
                  ) : (
                    ' Generate AI Summary'
                  )}
                </button>

                {aiSummary && (
                  <div className="mt-4 bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
                    <h4 className="text-white font-semibold text-sm mb-2 flex items-center gap-2">
                      AI-Generated Summary
                    </h4>
                    <p className="text-slate-300 text-sm leading-relaxed">{aiSummary}</p>
                  </div>
                )}
              </div>
              <div className="space-y-2 px-2 mt-3">
                <label className="text-xs font-bold text-white uppercase tracking-wider">
                  Voting Duration *
                </label>
                <select
                  {...register("votingDuration")}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-dark focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all"
                >
                  <option value="3600000">1 hour</option>
                  <option value="21600000">6 hours</option>
                  <option value="43200000">12 hours</option>
                  <option value="86400000">24 hours (1 day)</option>
                  <option value="259200000">3 days</option>
                  <option value="604800000">7 days (1 week)</option>
                  <option value="1209600000">14 days (2 weeks)</option>
                </select>
                <p className="text-[10px] text-slate-500">
                  How long members can vote on this proposal
                </p>
              </div>
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                <h4 className="text-white font-semibold text-sm mb-2">Proposal Guidelines:</h4>
                <ul className="text-slate-300 text-xs space-y-1 list-disc list-inside">
                  <li>Be clear and specific about what you're proposing</li>
                  <li>Only DAO creators can submit proposals</li>
                  <li>Voting starts immediately after deployment</li>
                  <li>Use AI summary to help voters understand quickly</li>
                  <li>Deploy cost: ~300 CSPR (gas fee)</li>
                </ul>
              </div>
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={!activeKey || isDeploying}
                  className={`w-full py-4 rounded-2xl font-bold text-white btn-deploy text-lg tracking-wide uppercase transition-all duration-300 ${
                    !activeKey
                      ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                      : isDeploying
                      ? "bg-slate-700 text-slate-400 cursor-wait"
                      : "bg-gradient-to-r from-blue-500 to-cyan-500 hover:shadow-[0_0_30px_rgba(6,182,212,0.32)] text-white hover:scale-[1.02]"
                  }`}
                >
                  {isDeploying ? (
                    <span className="flex items-center justify-center gap-2">
                      Deploying to Blockchain...
                    </span>
                  ) : !activeKey ? (
                    "Connect Wallet First"
                  ) : (
                    "Submit Proposal"
                  )}
                </button>
              </div>

              <p className="text-center text-xs text-slate-500">
                Estimated cost: ~300 CSPR | Network: Casper Testnet
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}