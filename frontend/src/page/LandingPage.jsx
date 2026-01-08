import React, { useState } from "react";
import { FaGhost } from "react-icons/fa";
import Ghostimg from "../assets/ghostjpg.png";
import Footer from "../component/Footer";
import Products from "./Products";
import Resources from "./Resources";
import Contacts from "./Contacts";


export default function LandingPage({ onConnect }) {
  const [currentView, setCurrentView] = useState("home");

  const renderContent = () => {
    switch (currentView) {
      case "Products":
        return <Products />;
      case "Resources":
        return <Resources />;
      case "Contacts":
        return <Contacts />;
      default:
        return (
          <>
            <div className="hero-inner container">
              <div className="hero-left ">
                <h1 className="text-5xl md:text-7xl font-extrabold leading-[1.1] tracking-tight text-white">
                  UNLEASH THE FUTURE. <br />
                  <span className=" bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 hero-left-text ">
                    BUILD ON CASPER.
                  </span>
                </h1>

                <p className="">
                  Engineered for limitless scalability, uncompromised security,
                  and seamless upgradeability. The definitive enterprise-grade
                  foundation empowering the next generation of DAOs and dApps.
                  Future-proof your vision on a network built to evolve with the
                  speed of innovation.
                </p>

                <div className="flex justify-start pt-4">
                  <button
                    onClick={onConnect}
                    className="group relative px-3 py-4 overflow-hidden rounded-full border border-cyan-500 text-white font-bold tracking-widest uppercase flex items-center gap-3 transition-all hover:shadow-[0_0_40px_rgba(6,182,212,0.4)] hover:bg-cyan-500/10 hover:scale-105 ghost-create"
                  >
                    <FaGhost className="text-cyan-400 text-xl group-hover:text-white" />
                    <span className="ghost-create-text">Create dao </span>
                  </button>
                </div>
              </div>
              <div className="hero-right">
                <div className="relative w-full max-w-[620px] flex items-center justify-center">
                  <img
                    src={Ghostimg}
                    alt="Casper Ghost Crystal"
                    className="relative z-10 w-full h-auto max-h-[520px] object-contain no-glow"
                  />
                </div>
              </div>
            </div>

            <section className="py-16 px-4 mt-3 container">
              <div className="max-w-6xl mx-auto">
                <div className="grid md:grid-cols-3 gap-8">
                  <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-8 text-center hover:border-cyan-500/50 transition-all hover:shadow-[0_0_30px_rgba(6,182,212,0.2)] mt-3 stats-box">
                    <div className="text-5xl font-bold bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 mb-2">
                      Lightning Fast
                    </div>
                    <p className="text-slate-300 text-lg">
                      Sub-second block finality for instant DAO governance
                    </p>
                  </div>

                  <div className="bg-slate-900/50 backdrop-blur-sm p-8 text-center hover:border-cyan-500/50 transition-all hover:shadow-[0_0_30px_rgba(6,182,212,0.2)] mt-3 stats-box">
                    <div className="text-5xl font-bold bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 mb-2">
                      Enterprise Grade
                    </div>
                    <p className="text-slate-300 text-lg">
                      Bank-level security with Highway consensus protocol
                    </p>
                  </div>

                  <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-8 text-center hover:border-cyan-500/50 transition-all hover:shadow-[0_0_30px_rgba(6,182,212,0.2)] mt-3 stats-box">
                    <div className="text-5xl font-bold bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 mb-2">
                      Future Proof
                    </div>
                    <p className="text-slate-300 text-lg">
                      On-chain upgrades without disruptive hard forks
                    </p>
                  </div>
                </div>
              </div>
            </section>
            <section className="py-20 px-4 mt-4 container">
              <div className="max-w-4xl mx-auto text-center bg-gradient-to-br from-slate-900/80 to-slate-800/50 backdrop-blur-sm rounded-3xl p-12">
                <h2 className="text-4xl font-bold text-white mb-6">
                  Ready to Build the Future?
                </h2>
                <p className="text-slate-300 text-lg mb-8">
                  Launch your DAO in minutes. Empower your community with
                  transparent, on-chain governance powered by Casper Network's
                  cutting-edge infrastructure.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center ">
                  <button
                    onClick={onConnect}
                    className="px-8 py-4 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold tracking-wide uppercase hover:shadow-[0_0_40px_rgba(6,182,212,0.6)] hover:scale-105 transition-all btn-deploy"
                  >
                    Get Started
                  </button>
                  <button
                    onClick={() => setCurrentView("Resources")}
                    className="px-8 py-4 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold tracking-wide uppercase hover:shadow-[0_0_40px_rgba(6,182,212,0.6)] hover:scale-105 transition-all btn-deploy"
                  >
                    Learn More
                  </button>
                </div>
              </div>
            </section>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-nebula bg-grid-texture relative flex flex-col">
      <nav className="d-flex justify-content-between container">
        <div
          onClick={() => setCurrentView("home")}
          className="flex items-center gap-3 text-2xl font-bold tracking-tight text-white ghost-name"
          style={{ cursor: "pointer" }}
        >
          <FaGhost className="text-cyan-400" />
          <span>Casper Dao</span>
        </div>

        <div></div>

        <div className="d-flex gap-5 text-sm font-medium text-slate-300 ghost-map">
          {["Products", "Resources", "Contacts"].map((item) => (
            <a
              key={item}
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setCurrentView(item);
              }}
              className={`hover:text-cyan-400 text-decoration-none ${
                currentView === item ? "text-cyan-400" : "text-white"
              }`}
            >
              {item}
            </a>
          ))}
        </div>

        <div className="flex items-center bg-cyan-500/10 gap-6 nav-right">
          <button
            onClick={onConnect}
            className="rounded-full hover:shadow-[0_0_40px_rgba(6,182,212,0.4)] nav-right-connect"
          >
            Connect Wallet
          </button>
        </div>
      </nav>

      <main className="">{renderContent()}</main>

      {currentView === "home" && <Footer />}
    </div>
  );
}
