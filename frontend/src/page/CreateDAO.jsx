import React, { useState, useEffect } from 'react';
import { FaRocket, FaUsers, FaCheckCircle, FaWallet } from 'react-icons/fa';
import { useCasper } from '../context/CasperContext';
import { useForm, Controller } from 'react-hook-form';
import { deployCreateDao } from '../utils/casperService';

export default function CreateDAO({ onDeploy }) {
    const { activeKey } = useCasper(); 
    const [isDeploying, setIsDeploying] = useState(false);

    const {
        register,
        handleSubmit,
        control,
        watch,
        reset,
        formState: { errors }
    } = useForm({
        defaultValues: {
            name: '',
            symbol: '',
            quorum: 51,
            minApproval: 20
        }
    });

    const watchedQuorum = watch('quorum');
    const watchedMin = watch('minApproval');

    const onSubmit = async (data) => {
        if (!activeKey) {
            alert("Please connect your wallet first!");
            return;
        }

        setIsDeploying(true);
        try {
            const deployHash = await deployCreateDao(activeKey, data.name);

            alert(
                `Deploy Sent!\nDAO Name: ${data.name}\nSymbol: ${data.symbol}\nHash: ${deployHash}\n\nCheck Casper Live in 1–2 mins.`
            );

            reset();
            if (onDeploy) onDeploy({ ...data, deployHash });
        } catch (err) {
            console.error(err);
            alert("Deploy Failed: " + err.message);
        } finally {
            setIsDeploying(false);
        }
    };

    return (
        <section className="min-h-screen bg-nebula bg-grid-texture flex items-start pt-28 pb-24">
            <div className="hero-container w-full">
                <div className="max-w-3xl mx-auto">
                    <div className="bg-[#071022]/70 backdrop-blur-md p-10 rounded-3xl border border-cyan-500/12 shadow-[0_30px_80px_rgba(6,182,212,0.04)] relative overflow-hidden">

                        <div className="absolute top-6 left-8 right-8 h-1 rounded-full bg-gradient-to-r from-cyan-400/40 via-blue-400/20 to-purple-500/25" />

                        {activeKey && (
                            <div className="mb-6 pt-3 bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                                <div className="flex items-center gap-3">
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

                        <div className="mb-6 pt-3">
                            <h2 className="text-3xl md:text-4xl font-extrabold text-white flex items-center gap-3">
                                <FaRocket className="text-cyan-300" />
                                <span>Launch New DAO</span>
                            </h2>
                            <p className="text-slate-300 text-sm mt-2">Deploy governance contracts on Casper Network with customizable rules.</p>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">DAO Name</label>
                                    <input
                                        {...register('name', { required: 'DAO name is required' })}
                                        className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-dark focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all placeholder:text-slate-600"
                                        placeholder="e.g. Solar Punk Treasury"
                                    />
                                    {errors.name && <p className="text-xs text-rose-400 mt-1">{errors.name.message}</p>}
                                </div>
                                <div className="space-y-2 pt-3">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Token Symbol</label>
                                    <input
                                        {...register('symbol', { required: 'Symbol is required', maxLength: { value: 6, message: 'Max 6 characters' } })}
                                        className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-dark focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all placeholder:text-slate-600"
                                        placeholder="e.g. SPT"
                                    />
                                    {errors.symbol && <p className="text-xs text-rose-400 mt-1">{errors.symbol.message}</p>}
                                </div>
                            </div>
                            <div className="space-y-6 pt-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-300 flex items-center gap-2"><FaUsers className="text-cyan-400"/> Quorum</span>
                                        <span className="text-cyan-400 font-bold">{watchedQuorum}%</span>
                                    </div>
                                    <Controller
                                        control={control}
                                        name="quorum"
                                        render={({ field }) => (
                                            <input
                                                type="range"
                                                min="1" max="100"
                                                {...field}
                                                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                                            />
                                        )}
                                    />
                                    <p className="text-[10px] text-slate-500">Percentage of total supply needed to validate a vote.</p>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-300 flex items-center gap-2"><FaCheckCircle className="text-green-400"/> Min Approval</span>
                                        <span className="text-green-400 font-bold">{watchedMin}%</span>
                                    </div>
                                    <Controller
                                        control={control}
                                        name="minApproval"
                                        render={({ field }) => (
                                            <input
                                                type="range"
                                                min="1" max="100"
                                                {...field}
                                                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-green-500"
                                            />
                                        )}
                                    />
                                    <p className="text-[10px] text-slate-500">Minimum "Yes" votes required to pass a proposal.</p>
                                </div>
                            </div>
                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={!activeKey || isDeploying}
                                    className={`w-full py-4 rounded-2xl font-bold text-lg tracking-wide uppercase transition-all btn-deploy 
                                        ${isDeploying
                                            ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                                            : "bg-gradient-to-r from-blue-500 to-cyan-500 hover:shadow-[0_0_30px_rgba(6,182,212,0.32)] text-white"
                                        }`}
                                >
                                    {isDeploying ? "Deploying..." : "Deploy DAO Contract"}
                                </button>
                            </div>

                        </form>

                    </div>
                </div>
            </div>
        </section>
    );
}