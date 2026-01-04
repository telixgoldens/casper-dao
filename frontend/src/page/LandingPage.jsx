import React from 'react';
import { FaGhost } from 'react-icons/fa';
import Ghostimg from "../assets/ghostjpg.png"


export default function LandingPage({ onConnect }) {
  return (
    // Main Container with the CSS background classes we just added
    <div className="min-h-screen bg-nebula bg-grid-texture relative flex flex-col">
      
      {/* ================= NAVBAR ================= */}
      <nav className="d-flex justify-content-between container">
        {/* Logo */}
        <div className="flex items-center gap-3 text-2xl font-bold tracking-tight text-white ghost-name">
          <FaGhost className="text-cyan-400" />
          <span>Casper Dao</span>
        </div>

        {/* Desktop Links */}
        <div className=" d-flex gap-5 text-sm font-medium text-slate-300 ghost-map">
          {['Products', 'Patents', 'Resources', 'Contacts'].map((item) => (
            <a key={item} href="#" className="hover:text-cyan-400 text-white text-decoration-none">
              {item}
            </a>
          ))}
        </div>

        {/* Buttons */}
        <div className="flex items-centerbg-cyan-500/10 gap-6 nav-right">
          
          <button 
            onClick={onConnect}
            className=" rounded-full  hover:shadow-[0_0_40px_rgba(6,182,212,0.4)] nav-right-connect" >
            Connect Wallet
          </button>
        </div>
      </nav>

      {/* ================= HERO SECTION ================= */}
      <main className="container ">
          <div className="hero-inner">

        {/* --- LEFT COLUMN: TEXT --- */}
        <div className="hero-left ">
          <h1 className="text-5xl md:text-7xl font-extrabold leading-[1.1] tracking-tight text-white">
            UNLEASH THE FUTURE. <br />
            <span className=" bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 hero-left-text ">
              BUILD ON CASPER.
            </span>
          </h1>

          <p className="">
            Engineered for limitless scalability, uncompromised security, and seamless upgradeability. The definitive enterprise-grade foundation empowering the next generation of DAOs and dApps. Future-proof your vision on a network built to evolve with the speed of innovation.
          </p>

            <div className="flex justify-start pt-4">
            <button 
                onClick={onConnect}
                className="group relative px-3 py-4 overflow-hidden rounded-full border border-cyan-500 text-white font-bold tracking-widest uppercase flex items-center gap-3 transition-all hover:shadow-[0_0_40px_rgba(6,182,212,0.4)] hover:bg-cyan-500/10 ghost-create"
            >
                <FaGhost className="text-cyan-400 text-xl group-hover:text-white" />
                <span className='ghost-create-text'>Create dao </span>
            </button>
          </div>
        </div>

          {/* --- RIGHT COLUMN: IMAGE --- */}
          <div className="hero-right">
            <div className="relative w-full max-w-[620px] flex items-center justify-center">
              {/* The Image Asset */}
              <img 
                src={Ghostimg} 
                alt="Casper Ghost Crystal" 
                className="relative z-10 w-full h-auto max-h-[520px] object-contain no-glow"
              />
            </div>
          </div>

          </div>
          </main>

    </div>
  );
}