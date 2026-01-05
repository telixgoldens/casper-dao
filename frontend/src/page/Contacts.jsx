import React from "react";
import { FaEnvelope, FaTwitter, FaDiscord, FaPaperPlane } from "react-icons/fa";

export default function Contacts() {
  return (
    <section className="min-h-screen bg-slate-900 text-white py-20 px-6 flex items-center justify-center">
      <div className="w-full max-w-4xl bg-slate-800 rounded-2xl shadow-2xl overflow-hidden border border-slate-700 flex flex-col md:flex-row">
        <div className="bg-gradient-to-br from-teal-600 to-emerald-700 p-10 md:w-2/5 flex flex-col justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-4">Get in Touch</h2>
            <p className="text-teal-100 mb-8 leading-relaxed">
              Have questions about enterprise integration or need support
              deploying your DAO? We are here to help.
            </p>

            <div className="space-y-4">
              <div className="flex items-center gap-3 text-teal-50">
                <FaEnvelope /> <span></span>
              </div>
              <div className="flex items-center gap-3 text-teal-50">
                <FaDiscord /> <span>discord.gg/telixgoldens</span>
              </div>
              <div className="flex items-center gap-3 text-teal-50">
                <FaTwitter /> <span>@telixgoldens</span>
              </div>
            </div>
          </div>

          <div className="mt-12">
            <p className="text-xs text-teal-200 uppercase tracking-widest font-semibold">
              Hackathon 2026
            </p>
          </div>
        </div>
        <div className="p-10 md:w-3/5 bg-slate-900">
          <form className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Your Name
              </label>
              <input
                type="text"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-teal-500 focus:outline-none transition-colors"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <input
                type="email"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-teal-500 focus:outline-none transition-colors"
                placeholder="john@example.com"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Message
              </label>
              <textarea
                rows="4"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-teal-500 focus:outline-none transition-colors"
                placeholder="I'm interested in building a DAO for..."
              ></textarea>
            </div>

            <button
              type="button"
              className="w-full bg-teal-500 hover:bg-teal-400 text-black font-bold py-4 rounded-lg flex items-center justify-center gap-2 transition-all"
            >
              Send Message <FaPaperPlane />
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
