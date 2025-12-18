import React from 'react';
import { motion } from 'framer-motion';
import { FaGhost, FaRocket, FaLock } from 'react-icons/fa';

// --- ANIMATION VARIANTS (The "Namada" Smoothness) ---
const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.8, ease: "easeOut" }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const floatingIcon = {
  animate: {
    y: [0, -20, 0],
    rotate: [0, 5, -5, 0],
    transition: {
      duration: 5,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-white overflow-hidden relative selection:bg-teal-500 selection:text-black">
      
      {/* 1. DYNAMIC BACKGROUND (Glowing Mesh) */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-teal-500/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] animate-pulse delay-1000" />
        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      </div>

      {/* 2. NAVBAR */}
      <nav className="relative z-50 flex justify-between items-center px-8 py-6 max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-2xl font-bold tracking-tighter flex items-center gap-2"
        >
          <FaGhost className="text-teal-400" /> 
          <span>Casper<span className="text-teal-400">DAO</span></span>
        </motion.div>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-6 py-2 border border-teal-500/50 rounded-full hover:bg-teal-500/10 transition-colors text-sm font-medium"
        >
          Connect Wallet
        </motion.button>
      </nav>

      {/* 3. HERO SECTION */}
      <main className="relative z-10 max-w-5xl mx-auto px-6 pt-20 pb-32 text-center">
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {/* Badge */}
          <motion.div variants={fadeInUp} className="inline-block mb-6">
            <span className="px-4 py-1.5 rounded-full border border-teal-500/30 bg-teal-500/10 text-teal-300 text-xs font-bold tracking-widest uppercase">
              Powered by Casper Network
            </span>
          </motion.div>

          {/* Main Title (Gradient Text) */}
          <motion.h1 variants={fadeInUp} className="text-6xl md:text-8xl font-black tracking-tight leading-tight mb-8">
            Governance for the <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500">
              Future of Web3
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p variants={fadeInUp} className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Deploy secure, scalable DAOs on Casper in seconds. 
            No coding required. Pure on-chain governance with factory-grade security.
          </motion.p>

          {/* Action Buttons */}
          <motion.div variants={fadeInUp} className="flex justify-center gap-4">
            <motion.button 
              whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(20, 184, 166, 0.4)" }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-teal-500 text-black font-bold rounded-lg text-lg"
            >
              Create Space
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.05)" }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 border border-slate-700 rounded-lg text-lg font-medium hover:border-teal-500/50 transition-colors"
            >
              View Explorer
            </motion.button>
          </motion.div>
        </motion.div>

        {/* 4. FLOATING CARDS (The "Jade-m22" 3D feel) */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-6 text-left relative">
            {/* Feature 1 */}
            <motion.div variants={floatingIcon} animate="animate" className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm">
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4 text-blue-400">
                    <FaRocket size={24} />
                </div>
                <h3 className="text-xl font-bold mb-2">Factory Pattern</h3>
                <p className="text-slate-400 text-sm">One contract, thousands of DAOs. Extremely low gas fees for deployment.</p>
            </motion.div>

            {/* Feature 2 (Offset Animation) */}
            <motion.div 
                variants={floatingIcon} 
                animate="animate" 
                transition={{ delay: 1 }} // Delays the float so they don't move in sync
                className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm mt-8 md:mt-0"
            >
                <div className="w-12 h-12 bg-teal-500/20 rounded-lg flex items-center justify-center mb-4 text-teal-400">
                    <FaGhost size={24} />
                </div>
                <h3 className="text-xl font-bold mb-2">Ghost Speed</h3>
                <p className="text-slate-400 text-sm">Real-time indexer updates. See votes confirm instantly without refreshing.</p>
            </motion.div>

            {/* Feature 3 */}
            <motion.div 
                variants={floatingIcon} 
                animate="animate" 
                transition={{ delay: 0.5 }}
                className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm"
            >
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4 text-purple-400">
                    <FaLock size={24} />
                </div>
                <h3 className="text-xl font-bold mb-2">Cross-Contract</h3>
                <p className="text-slate-400 text-sm">Direct balance verification from CEP-18 tokens. No staking needed.</p>
            </motion.div>
        </div>
      </main>
    </div>
  );
}