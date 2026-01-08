import React from "react";
import {
  FaCubes,
  FaChartLine,
  FaCode,
  FaShieldAlt,
  FaVoteYea,
  FaUsers,
  FaRocket,
  FaLock,
} from "react-icons/fa";
import Footer from "../component/Footer";

export default function Products() {
  return (
    <section className="min-h-screen bg-slate-900 text-white py-20 px-6">
      <div className="max-w-6xl container">
        <div className="text-center suite-intro">
          <h1 className="text-4xl md:text-5xl font-bold mb-3">
            <span className="text-teal-400">Casper</span>DAO Suite
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            A comprehensive ecosystem of decentralized governance tools built
            for the next generation of community-driven organizations on Casper
            Network.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 mb-4 mt-12">
          <div className="bg-slate-800 p-8 rounded-2xl transition-all group">
            <div className="w-15 h-15 bg-teal-500/10 rounded-xl flex items-start justify-start text-teal-400 transition-transform mb-2">
              <FaCubes size={32} />
            </div>
            <h3 className="text-2xl font-bold mb-3">DAO Launchpad</h3>
            <p className="text-slate-400 leading-relaxed mb-6">
              Launch your decentralized organization in minutes with our no-code
              interface. Deploy battle-tested governance contracts with custom
              quorum rules, voting periods, and token-gated access—all without
              writing a single line of Rust.
            </p>
            <ul className="space-y-2 text-sm text-slate-300">
              <li className="flex items-center gap-2">
                <FaShieldAlt className="text-teal-500" /> Audit-ready Smart
                Contracts
              </li>
              <li className="flex items-center gap-2">
                <FaVoteYea className="text-teal-500" /> Configurable Voting
                Mechanisms
              </li>
              <li className="flex items-center gap-2">
                <FaLock className="text-teal-500" /> Token-Gated Governance
                (CEP-18)
              </li>
              <li className="flex items-center gap-2">
                <FaUsers className="text-teal-500" /> Multi-Signature Support
              </li>
            </ul>
          </div>

          <div className="bg-slate-800 p-8 rounded-2xl transition-all group">
            <div className="w-14 h-14 bg-purple-500/10 rounded-xl flex items-start justify-start text-purple-400 mb-2 transition-transform">
              <FaChartLine size={32} />
            </div>
            <h3 className="text-2xl font-bold mb-3">Sauron Analytics</h3>
            <p className="text-slate-400 leading-relaxed mb-6">
              Real-time blockchain intelligence powered by our high-performance
              indexing layer. Monitor DAO activity, track voting patterns,
              analyze member participation, and visualize governance trends—all
              from a lightning-fast API.
            </p>
            <ul className="space-y-2 text-sm text-slate-300">
              <li className="flex items-center gap-2">
                <FaCode className="text-purple-500" /> Real-time Event Streaming
              </li>
              <li className="flex items-center gap-2">
                <FaChartLine className="text-purple-500" /> Historical Vote
                Analytics
              </li>
              <li className="flex items-center gap-2">
                <FaRocket className="text-purple-500" /> Sub-second Query
                Response
              </li>
              <li className="flex items-center gap-2">
                <FaCode className="text-purple-500" /> RESTful & GraphQL APIs
              </li>
            </ul>
          </div>
        </div>

        <div className="">
          <h2 className="text-3xl font-bold text-center mb-3 text-white">
            Built for <span className="text-teal-400">Every Use Case</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-800/50 p-6 rounded-xl stats-box">
              <div className="text-3xl mb-2">💼</div>
              <h4 className="text-xl font-bold mb-2">Investment DAOs</h4>
              <p className="text-slate-400 text-sm">
                Pool capital and vote on investment decisions with transparent,
                on-chain execution and automatic fund distribution.
              </p>
            </div>
            <div className="bg-slate-800/50 p-6 mt-2 rounded-xl stats-box">
              <div className="text-3xl mb-2">🎨</div>
              <h4 className="text-xl font-bold mb-2">Creator Communities</h4>
              <p className="text-slate-400 text-sm">
                Empower your fans to shape content direction, vote on
                collaborations, and share in the success of your creative work.
              </p>
            </div>
            <div className="bg-slate-800/50 p-6 mt-2 rounded-xl stats-box">
              <div className="text-3xl mb-2">🏛️</div>
              <h4 className="text-xl font-bold mb-2">Protocol Governance</h4>
              <p className="text-slate-400 text-sm">
                Let token holders guide protocol upgrades, parameter changes,
                and treasury allocation with secure, decentralized voting.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 bg-gradient-to-br from-teal-900/20 to-purple-900/20 rounded-3xl p-10 ">
          <h3 className="text-2xl font-bold mb-8 text-center">
            Why Choose CasperDAO?
          </h3>
          <div className="grid md:grid-cols-2 gap-6 mt-2 mb-5 text-slate-300 border border-teal-500/20 rounded">
            <div className="flex gap-4 mt-2">
              <div className="text-teal-400 text-xl">✓</div>
              <div>
                <strong className="text-white">Enterprise Security:</strong>{" "}
                Built on Casper's Highway consensus—the same protocol securing
                billions in institutional assets.
              </div>
            </div>
            <div className="flex gap-4 mt-1">
              <div className="text-teal-400 text-xl">✓</div>
              <div>
                <strong className="text-white">Gas Predictability:</strong>{" "}
                Fixed, low-cost transactions with no surprise fees during
                network congestion.
              </div>
            </div>
            <div className="flex gap-4 mt-1">
              <div className="text-teal-400 text-xl">✓</div>
              <div>
                <strong className="text-white">Upgradeability:</strong> Evolve
                your DAO without migration headaches using Casper's native
                upgrade mechanisms.
              </div>
            </div>
            <div className="flex gap-4 mt-1">
              <div className="text-teal-400 text-xl">✓</div>
              <div>
                <strong className="text-white">Developer Friendly:</strong>{" "}
                Comprehensive SDKs, detailed documentation, and a supportive
                community.
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </section>
    
  );
}
