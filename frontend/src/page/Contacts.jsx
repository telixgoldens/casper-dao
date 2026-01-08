import React from "react";
import {
  FaEnvelope,
  FaTwitter,
  FaDiscord,
  FaPaperPlane,
  FaGithub,
  FaTelegram,
} from "react-icons/fa";
import Footer from "../component/Footer";

export default function Contacts() {
  return (
    <section className="min-h-screen bg-slate-900 text-white py-20 px-6">
      <div className="w-full max-w-4xl bg-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row container">
        <div className="bg-gradient-to-br from-teal-600 to-emerald-700 p-10 md:w-2/5 flex flex-col justify-between">
          <div>
            <h2 className="text-3xl font-bold text-white mb-4">Get in Touch</h2>
            <p className="text-teal-100 mb-8 leading-relaxed">
              Questions about enterprise integration, custom DAO
              implementations, or technical support? Our team is here to help
              you build the future of decentralized governance.
            </p>

            <div className="space-y-4">
              <div className="flex items-center gap-3 text-teal-50">
                <FaEnvelope /> <span>support@casperdao.network</span>
              </div>
              <div className="flex items-center gap-3 text-teal-50">
                <FaDiscord /> <span>discord.gg/casperdao</span>
              </div>
              <div className="flex items-center gap-3 text-teal-50">
                <FaTwitter /> <span>@CasperDAO</span>
              </div>
              <div className="flex items-center gap-3 text-teal-50">
                <FaTelegram /> <span>t.me/casperdao</span>
              </div>
              <div className="flex items-center gap-3 text-teal-50">
                <FaGithub /> <span>github.com/telixgoldens/casper-dao</span>
              </div>
            </div>
          </div>

          <div className="mt-12">
            <p className="text-xs text-teal-100 mt-2">
              Built with Love for the Casper Community
            </p>
          </div>
        </div>

        <div className="p-10 md:w-3/5 bg-slate-900 mt-5">
          <h3 className="text-2xl font-bold mb-2">Send us a Message</h3>
          <p className="text-slate-400 text-sm mb-6">
            Whether you're planning to launch a DAO, need technical guidance, or
            want to discuss partnership opportunities—we'd love to hear from
            you.
          </p>

          <form className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Your Name
              </label>
              <input
                type="text"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-dark focus:border-teal-500 focus:outline-none transition-colors"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 mt-3">
                Email Address
              </label>
              <input
                type="email"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-dark focus:border-teal-500 focus:outline-none transition-colors"
                placeholder="john@example.com"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 mt-3">
                Message
              </label>
              <textarea
                rows="4"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-dark focus:border-teal-500 focus:outline-none transition-colors"
                placeholder="I'm interested in building a DAO for investment decisions, and I'd like to discuss custom features like multi-signature treasury management..."
              ></textarea>
            </div>

            <button
              type="button"
              className="w-full btn-deploy bg-teal-500 hover:bg-teal-400 text-black font-bold py-4 rounded-lg flex items-center justify-center gap-2 transition-all"
            >
              Send Message <FaPaperPlane />
            </button>
          </form>

          <p className="text-xs text-slate-500 mt-1 text-center">
            Typical response time: 24-48 hours
          </p>
        </div>
      </div>
      <Footer />
    </section>
  );
}
