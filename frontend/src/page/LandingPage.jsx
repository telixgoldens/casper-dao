import React from 'react';
import { FaGhost } from 'react-icons/fa';
import GHOST_IMAGE_URL from "../assets/ghostjpg.png"


// This looks for the image in your public folder


export default function LandingPage({ onConnect }) {
  return (
    // Main Container with the CSS background classes we just added
    <div className="min-h-screen bg-nebula bg-grid-texture relative flex flex-col">
      
      {/* ================= NAVBAR ================= */}
      <nav className="w-full max-w-7xl mx-auto px-6 py-8 flex justify-between items-center z-50 relative">
        {/* Logo */}
        <div className="flex items-center gap-3 text-2xl font-bold tracking-tight text-white">
          <FaGhost className="text-cyan-400" />
          <span>Casper</span>
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex gap-8 text-sm font-medium text-slate-300">
          {['Products', 'Patents', 'Resources', 'Contacts'].map((item) => (
            <a key={item} href="#" className="hover:text-cyan-400 transition-colors">
              {item}
            </a>
          ))}
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-6 nav-right">
          <button className="hidden md:block text-slate-300 hover:text-white text-sm font-medium">
            Login
          </button>
          <button 
            onClick={onConnect}
            className="px-6 py-2.5 rounded-full border border-cyan-500/50 bg-cyan-500/10 text-cyan-400 text-sm font-bold hover:bg-cyan-500 hover:text-black transition-all shadow-[0_0_20px_rgba(6,182,212,0.2)]"
          >
            Sign Up
          </button>
        </div>
      </nav>

      {/* ================= HERO SECTION ================= */}
      <main className="flex-1 w-full z-10">
        <div className="hero-container">
          <div className="hero-inner">

        {/* --- LEFT COLUMN: TEXT --- */}
        <div className="hero-left w-full space-y-8 pt-6 lg:pt-0">
          <h1 className="text-5xl md:text-7xl font-extrabold leading-[1.1] tracking-tight text-white">
            UNLEASH THE FUTURE. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">
              BUILD ON CASPER.
            </span>
          </h1>

          <p className="text-slate-400 text-lg md:text-xl max-w-lg mx-auto lg:mx-0 leading-relaxed font-light">
            Scalable. Secure. Upgradeable. The enterprise-grade blockchain for the next generation of DAOs and dApps.
          </p>

            <div className="flex justify-start pt-4">
            <button 
                onClick={onConnect}
                className="group relative px-8 py-4 bg-transparent overflow-hidden rounded-full border border-cyan-500 text-white font-bold tracking-widest uppercase flex items-center gap-3 transition-all hover:shadow-[0_0_40px_rgba(6,182,212,0.4)] hover:bg-cyan-500/10"
            >
                <FaGhost className="text-cyan-400 text-xl group-hover:text-white transition-colors" />
                <span>Start Building</span>
            </button>
          </div>
        </div>

          {/* --- RIGHT COLUMN: IMAGE --- */}
          <div className="hero-right">
            <div className="relative w-full max-w-[620px] flex items-center justify-center">
              {/* The Image Asset */}
              <img 
                src={GHOST_IMAGE_URL} 
                alt="Casper Ghost Crystal" 
                className="relative z-10 w-full h-auto max-h-[520px] object-contain no-glow"
              />
            </div>
          </div>

          </div>
          </div>
          </main>

      {/* Footer / Scroll Indicator */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center opacity-40">
        <div className="flex flex-col items-center gap-2">
            <div className="w-[1px] h-16 bg-gradient-to-b from-cyan-500 to-transparent" />
            <span className="text-[10px] tracking-[0.4em] text-cyan-400 uppercase">Scroll</span>
        </div>
      </div>

    </div>
  );
}