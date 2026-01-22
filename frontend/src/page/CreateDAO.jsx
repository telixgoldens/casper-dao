import React, { useState } from "react";
import { FaRocket, FaCheckCircle, FaWallet } from "react-icons/fa";
import { useCasper } from "../context/CasperContext";
import { useForm } from "react-hook-form";
import { deployCreateDao } from "../utils/casperService";
import Alert from "react-bootstrap/Alert";

export default function CreateDAO({ onDeploy }) {
  const { activeKey } = useCasper();
  const [isDeploying, setIsDeploying] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertVariant, setAlertVariant] = useState("success");
  const [alertMessage, setAlertMessage] = useState("");

  React.useEffect(() => {
    if (!showAlert) return;

    const handleClick = () => setShowAlert(false);
    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, [showAlert]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      description: "",
      tokenType: "u256_address",
      tokenAddress:
        "hash-92a2dd97639d61dcb8460e512032a7de561f61b735cec478c474afc926123990",
    },
  });

  const onSubmit = async (data) => {
    if (!activeKey) {
      setShowAlert(true);
      return;
    }
    const sanitizedName = data.name
    .replace(/[–—]/g, '-')  
    .replace(/[^\x00-\x7F]/g, '')  
    .trim();

    setIsDeploying(true);
    try {
      const deployHash = await deployCreateDao(activeKey, sanitizedName,
      data.description,
      data.tokenAddress,
      data.tokenType);

      setAlertVariant("success");
      setAlertMessage(`DAO "${data.name}" submitted successfully.  You can monitor deployment status on Casper Live. Deploy Hash:
                  ${deployHash}`);
      setShowAlert(true);

      reset();
      if (onDeploy) onDeploy({ ...data, name: sanitizedName,  deployHash });
    } catch (err) {
      console.error(err);
      setAlertVariant("danger");
      setAlertMessage("Deploy Failed: " + err.message);
      setShowAlert(true);
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <section className="min-h-screen bg-nebula bg-grid-texture flex items-start pt-28 pb-24">
      <div className="hero-container w-full">
        <div className="max-w-6xl mx-auto bg-[#071022]/70 ">
          <div className=" backdrop-blur-md border border-cyan-500/12 shadow-[0_30px_80px_rgba(6,182,212,0.04)] relative overflow-hidden">
            <div className="absolute top-6 left-8 right-8 h-1 rounded-full bg-gradient-to-r from-cyan-400/40 via-blue-400/20 to-purple-500/25" />
            {showAlert && (
              <Alert variant={alertVariant} onClick={() => setShowAlert(false)}>
                {alertMessage}
              </Alert>
            )}
            {activeKey && (
              <div className="mb-6 pt-3 bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <FaCheckCircle className="text-green-400 text-xl" />
                  <div>
                    <p className="text-white font-semibold text-sm">
                      Wallet Connected
                    </p>
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
                    <p className="text-white font-semibold text-sm">
                      Wallet Not Connected
                    </p>
                    <p className="text-slate-400 text-xs">
                      Please connect your Casper Wallet to create a DAO
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="mb-6 pt-3 ps-2">
              <h2 className="text-3xl md:text-4xl font-extrabold text-white flex items-center gap-3">
                <FaRocket className="text-cyan-300" />
                <span>Launch New DAO</span>
              </h2>
              <p className="text-slate-300 text-sm mt-2">
                Deploy a governance DAO on Casper Network with token-based
                voting.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2 px-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  DAO Name *
                </label>
                <input
                  {...register("name", {
                    required: "DAO name is required",
                    minLength: {
                      value: 3,
                      message: "Name must be at least 3 characters",
                    },
                    maxLength: {
                      value: 100,
                      message: "Name must be less than 100 characters",
                    },
                  })}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-dark focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all placeholder:text-slate-600"
                  placeholder="e.g. DeFi Treasury DAO"
                />
                {errors.name && (
                  <p className="text-xs text-rose-400 mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>
              <div className="space-y-2 pt-3 px-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  DAO Description
                </label>
                <textarea
                  {...register("description", {
                    maxLength: {
                      value: 1500,
                      message: "Description must be less than 1500 characters",
                    },
                  })}
                  rows="4"
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-dark focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all placeholder:text-slate-600 resize-none"
                  placeholder="Describe your DAO's purpose, goals, and governance model..."
                />
                {errors.description && (
                  <p className="text-xs text-rose-400 mt-1">
                    {errors.description.message}
                  </p>
                )}
                <p className="text-[10px] text-slate-500">
                  Optional: Explain what your DAO will govern and its mission
                </p>
              </div>
              <div className="space-y-2 px-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Governance Token Address *
                </label>
                <input
                  {...register("tokenAddress", {
                    required: "Token address is required",
                    pattern: {
                      value: /^hash-[a-f0-9]{64}$/,
                      message:
                        "Must be a valid Casper contract hash (hash-...)",
                    },
                  })}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-dark focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all placeholder:text-slate-600 font-mono text-sm"
                  placeholder="hash-..."
                />
                {errors.tokenAddress && (
                  <p className="text-xs text-rose-400 mt-1">
                    {errors.tokenAddress.message}
                  </p>
                )}
                <p className="text-[10px] text-slate-500">
                  The token contract that will be used for voting power
                </p>
              </div>
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                <h4 className="text-white font-semibold text-sm mb-2">
                  How it works:
                </h4>
                <ul className="text-slate-300 text-xs space-y-1 list-disc list-inside">
                  <li>Token holders can vote on proposals</li>
                  <li>Voting power is based on token balance</li>
                  <li>Each DAO starts with Proposal #1 active</li>
                  <li>Deploy cost: ~300 CSPR (gas fee)</li>
                </ul>
              </div>
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={!activeKey || isDeploying}
                  className={`w-full py-4 rounded-2xl font-bold text-lg tracking-wide uppercase transition-all duration-300 btn-deploy
                                        ${
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
                    "Deploy DAO Contract"
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
