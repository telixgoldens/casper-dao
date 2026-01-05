import React from "react";

const Footer = () => (
  <footer id="contact" className="py-5 foot-bg text-white text-center mt-5">
    <div className="container">
      <h2 className="mb-4">Get In Touch</h2>
      <p className="lead mb-4">I'm currently looking for new opportunities in Frontend Web Development and Blockchain Development.</p>
      <div className="d-flex justify-content-center gap-4 mb-4">
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
      <p className="small text-secondary mb-0">© 2025 Casper Dao. Built with JavaScript & CasperSDK.</p>
    </div>
    
  </footer>
);

export default Footer;