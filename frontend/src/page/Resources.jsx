import React from "react";
import {
  FaBook,
  FaGithub,
  FaDiscord,
  FaYoutube,
  FaRocket,
  FaUsers,
  FaShieldAlt,
} from "react-icons/fa";
import Footer from "../component/Footer";

export default function Resources() {
  const resources = [
    {
      title: "Developer Documentation",
      desc: "Deep dive into our Rust smart contract architecture, SDK integration guides, and API references.",
      icon: <FaBook />,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      link: "https://github.com/telixgoldens/casper-dao",
    },
    {
      title: "Open Source Code",
      desc: "Explore and contribute to our contracts, indexer, and frontend. All code is MIT licensed.",
      icon: <FaGithub />,
      color: "text-gray-200",
      bg: "bg-gray-700/50",
      link: "https://github.com/telixgoldens/casper-dao",
    },
    {
      title: "Video Tutorials",
      desc: "Step-by-step guides for launching your first DAO, creating proposals, and managing governance.",
      icon: <FaYoutube />,
      color: "text-red-400",
      bg: "bg-red-500/10",
      link: "#",
    },
  ];

  return (
    <section className="min-h-screen bg-slate-900 text-white py-20 px-6">
      <div className="max-w-5xl mx-auto container">
        <div className="mb-3 pb-8">
          <h2 className="text-3xl font-bold text-white text-center mb-3">
            Knowledge Base
          </h2>
          <p className="text-slate-400">
            Everything you need to build, deploy, and govern decentralized
            organizations on Casper Network.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {resources.map((item, index) => (
            <a
              key={index}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-slate-800 p-6 rounded-xl hover:-translate-y-2 transition-transform duration-300 block desc-box"
            >
              <h3 className="font-bold text-lg mb-2 d-flex align-items-center gap-2">
                {item.title}
                {item.icon}
              </h3>
              <p className="text-sm text-slate-400 mb-3 text-decoration-none">
                {item.desc}
              </p>
            </a>
          ))}
        </div>

        <div className="mt-16 bg-slate-800 rounded-2xl p-8 mb-4 ">
          <h3 className="text-2xl font-bold mb-6 text-teal-400">
            What is a DAO?
          </h3>
          <p className="text-slate-300 mb-4 leading-relaxed">
            A{" "}
            <strong className="text-white">
              Decentralized Autonomous Organization (DAO)
            </strong>{" "}
            is a community-governed entity with no central leadership. Instead
            of traditional hierarchical management, decisions are made
            collectively by token holders through transparent, on-chain voting.
          </p>
          <p className="text-slate-300 mb-4 leading-relaxed">
            DAOs represent a paradigm shift in organizational structure—from
            managing investment portfolios and coordinating global communities
            to funding public goods and governing blockchain protocols. Smart
            contracts enforce the rules, ensuring every voice is heard and every
            vote counts.
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-slate-900 p-4 rounded-lg border border-teal-500/30">
              <FaUsers className="text-teal-400 text-2xl mb-2" />
              <h4 className="font-bold text-sm mb-1">Democratic</h4>
              <p className="text-xs text-slate-400">
                One token, one vote—power distributed across the community
              </p>
            </div>
            <div className="bg-slate-900 p-4 rounded-lg border border-teal-500/30">
              <FaShieldAlt className="text-teal-400 text-2xl mb-2" />
              <h4 className="font-bold text-sm mb-1">Transparent</h4>
              <p className="text-xs text-slate-400">
                All actions recorded on-chain, publicly verifiable forever
              </p>
            </div>
            <div className="bg-slate-900 p-4 rounded-lg border border-teal-500/30">
              <FaRocket className="text-teal-400 text-2xl mb-2" />
              <h4 className="font-bold text-sm mb-1">Autonomous</h4>
              <p className="text-xs text-slate-400">
                Smart contracts execute decisions automatically, no middlemen
              </p>
            </div>
          </div>
        </div>

        <div className="mt-16">
          <h3 className="text-xl font-bold mb-6 text-teal-400">
            Frequently Asked Questions
          </h3>
          <div className="space-y-4">
            <details className="bg-slate-800 rounded-lg p-4 cursor-pointer group">
              <summary className="font-semibold list-none flex justify-between items-center">
                What is the cost to deploy a DAO on Casper?
                <span className="text-teal-500 group-open:rotate-180 transition-transform">
                  ▼
                </span>
              </summary>
              <p className="text-slate-400 mt-3 text-sm leading-relaxed">
                Deploying a DAO on Casper Testnet costs approximately 300 CSPR
                (~$15-20 on mainnet). This one-time fee covers smart contract
                storage and initial state setup. Individual votes cost around
                150 CSPR, making governance affordable and accessible.
              </p>
            </details>

            <details className="bg-slate-800 rounded-lg p-4 cursor-pointer group">
              <summary className="font-semibold list-none flex justify-between items-center">
                Can I upgrade my DAO rules later?
                <span className="text-teal-500 group-open:rotate-180 transition-transform">
                  ▼
                </span>
              </summary>
              <p className="text-slate-400 mt-3 text-sm leading-relaxed">
                Absolutely! Our contracts utilize Casper's native upgradeability
                standard. You can propose governance votes to modify quorum
                percentages, voting duration, proposal thresholds, or even
                upgrade the entire contract logic—all without migrating to a new
                address.
              </p>
            </details>

            <details className="bg-slate-800 rounded-lg p-4 cursor-pointer group">
              <summary className="font-semibold list-none flex justify-between items-center">
                Do voters need to hold tokens to participate?
                <span className="text-teal-500 group-open:rotate-180 transition-transform">
                  ▼
                </span>
              </summary>
              <p className="text-slate-400 mt-3 text-sm leading-relaxed">
                Yes. CasperDAO uses token-weighted voting with CEP-18 governance
                tokens. Only wallets holding your DAO's specific governance
                token can submit votes. This ensures that those with stake in
                the organization have decision-making power, while preventing
                spam and Sybil attacks.
              </p>
            </details>

            <details className="bg-slate-800 rounded-lg p-4 cursor-pointer group">
              <summary className="font-semibold list-none flex justify-between items-center">
                How secure are the smart contracts?
                <span className="text-teal-500 group-open:rotate-180 transition-transform">
                  ▼
                </span>
              </summary>
              <p className="text-slate-400 mt-3 text-sm leading-relaxed">
                Our contracts are built with security as the top priority.
                Written in Rust (memory-safe by design), deployed on Casper's
                Highway consensus (formally verified for correctness), and
                following best practices for access control and state
                management. The codebase is open source for community auditing.
              </p>
            </details>

            <details className="bg-slate-800 rounded-lg p-4 cursor-pointer group">
              <summary className="font-semibold list-none flex justify-between items-center">
                What happens if a proposal doesn't reach quorum?
                <span className="text-teal-500 group-open:rotate-180 transition-transform">
                  ▼
                </span>
              </summary>
              <p className="text-slate-400 mt-3 text-sm leading-relaxed">
                If a proposal fails to meet the minimum participation threshold
                (quorum) by the voting deadline, it is automatically rejected.
                No action is taken, and the DAO's state remains unchanged. This
                protects against low-turnout decisions that may not represent
                the community's true sentiment.
              </p>
            </details>
          </div>
        </div>
      </div>
      <Footer />
    </section>
  );
}
