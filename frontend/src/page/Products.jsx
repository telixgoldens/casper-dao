import React from "react";
import { FaCubes, FaChartLine, FaCode, FaShieldAlt } from "react-icons/fa";

export default function Products() {
  return (
    <section className="min-h-screen bg-slate-900 text-white py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-teal-400">Casper</span>DAO Suite
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            A comprehensive ecosystem of decentralized tools designed to empower
            communities on the Casper Network.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
          <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 hover:border-teal-500/50 transition-all group">
            <div className="w-14 h-14 bg-teal-500/10 rounded-xl flex items-center justify-center text-teal-400 mb-6 group-hover:scale-110 transition-transform">
              <FaCubes size={28} />
            </div>
            <h3 className="text-2xl font-bold mb-3">DAO Launchpad</h3>
            <p className="text-slate-400 leading-relaxed mb-6">
              A no-code interface for deploying robust governance contracts.
              Customize quorum, voting duration, and token gating rules in
              seconds without touching Rust.
            </p>
            <ul className="space-y-2 text-sm text-slate-300">
              <li className="flex items-center gap-2">
                <FaShieldAlt className="text-teal-500" /> Audit-ready Smart
                Contracts
              </li>
              <li className="flex items-center gap-2">
                <FaShieldAlt className="text-teal-500" /> Custom Token Support
                (CEP-18)
              </li>
            </ul>
          </div>
          <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 hover:border-purple-500/50 transition-all group">
            <div className="w-14 h-14 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-400 mb-6 group-hover:scale-110 transition-transform">
              <FaChartLine size={28} />
            </div>
            <h3 className="text-2xl font-bold mb-3">Sauron Analytics</h3>
            <p className="text-slate-400 leading-relaxed mb-6">
              A high-performance indexing layer that listens to the Casper event
              stream. Transform raw blockchain data into real-time insights and
              visualizations.
            </p>
            <ul className="space-y-2 text-sm text-slate-300">
              <li className="flex items-center gap-2">
                <FaCode className="text-purple-500" /> Real-time Event Listening
              </li>
              <li className="flex items-center gap-2">
                <FaCode className="text-purple-500" /> Historical Vote Querying
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
