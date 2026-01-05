import React from "react";
import { FaBook, FaGithub, FaDiscord, FaYoutube } from "react-icons/fa";

export default function Resources() {
  const resources = [
    {
      title: "Developer Documentation",
      desc: "Deep dive into the architecture of our Rust contracts and the CasperDAO SDK.",
      icon: <FaBook />,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      link: "https://github.com/telixgoldens/casper-dao",
    },
    {
      title: "Open Source Code",
      desc: "Explore the codebase on GitHub. contribute to the contracts, indexer, or frontend.",
      icon: <FaGithub />,
      color: "text-gray-200",
      bg: "bg-gray-700/50",
      link: "https://github.com/telixgoldens/casper-dao",
    },
    {
      title: "Community Tutorials",
      desc: "Watch step-by-step video guides on how to launch your first DAO.",
      icon: <FaYoutube />,
      color: "text-red-400",
      bg: "bg-red-500/10",
      link: "#",
    },
  ];

  return (
    <section className="min-h-screen bg-slate-900 text-white py-20 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-12 border-b border-gray-800 pb-8">
          <h2 className="text-3xl font-bold mb-2">Knowledge Base</h2>
          <p className="text-slate-400">
            Everything you need to build and govern on Casper.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {resources.map((item, index) => (
            <a
              key={index}
              href={item.link}
              className="bg-slate-800 p-6 rounded-xl border border-slate-700 hover:-translate-y-2 transition-transform duration-300 block"
            >
              <div
                className={`w-12 h-12 ${item.bg} ${item.color} rounded-lg flex items-center justify-center text-xl mb-4`}
              >
                {item.icon}
              </div>
              <h3 className="font-bold text-lg mb-2">{item.title}</h3>
              <p className="text-sm text-slate-400">{item.desc}</p>
            </a>
          ))}
        </div>
        <div className="mt-16">
          <h3 className="text-xl font-bold mb-6 text-teal-400">
            Frequently Asked Questions
          </h3>
          <div className="space-y-4">
            <details className="bg-slate-800 rounded-lg p-4 cursor-pointer group">
              <summary className="font-semibold list-none flex justify-between items-center">
                What is the cost to deploy a DAO?
                <span className="text-teal-500 group-open:rotate-180 transition-transform">
                  ▼
                </span>
              </summary>
              <p className="text-slate-400 mt-3 text-sm leading-relaxed">
                Deploying a DAO on the Casper Testnet costs approximately 300
                CSPR. This covers the storage costs for the new smart contract
                and the initial state setup.
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
                Yes. Our contracts utilize the Casper Upgradeable standard. You
                can propose a vote to change quorum percentages or even upgrade
                the logic contract itself.
              </p>
            </details>
          </div>
        </div>
      </div>
    </section>
  );
}
