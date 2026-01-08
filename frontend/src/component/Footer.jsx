import React from "react";

const Footer = () => (
  <footer id="contact" className="py-5 foot-bg text-white text-center mt-5">
    <div className="container">
      <p className="lead mb-4">CasperDAO is a complete Governance-as-a-Service (GaaS) platform. It serves as a DAO Factory, allowing anyone to deploy a fully functional, audit-ready governance contract in seconds, without writing a single line of code.</p>
      <div className="d-flex justify-content-center gap-4 mb-4 foot-links">
        <a href="mailto:Telix05@gmail.com" className="text-white text-decoration-none">
          <strong>Contact</strong> 
        </a>
        <a href="https://www.linkedin.com/in/telixgoldens" target="_blank" rel="noreferrer" className="text-white text-decoration-none">
          <strong>LinkedIn</strong>
        </a>
        <a href="https://github.com/telixgoldens/casper-dao" target="_blank" rel="noreferrer" className="text-white text-decoration-none">
          <strong>GitHub</strong>
        </a>
        <a href="https://docs.google.com/document/d/1VnRHfTVHaddIc2M8tzyd68QF5nrDQ4lE/edit?usp=drivesdk&ouid=112314369873187385590&rtpof=true&sd=true" target="_blank" rel="noreferrer" className="text-white text-decoration-none">
          <strong>About Dev</strong>
        </a>
      </div>
      <hr className="bg-secondary" />
      <p className="small mb-0">© 2025 Casper Dao. Built with JavaScript & CasperSDK.</p>
    </div>
    
  </footer>
);

export default Footer;