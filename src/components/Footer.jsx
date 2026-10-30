import React from "react";

export default function Footer({ onSwitchTab }) {
  return (
    <footer className="site-footer">
      <div className="footer-container">
        <div className="footer-grid">
          <div className="footer-brand-col">
            <div className="footer-brand">
              <span className="brand-icon">🌱</span>
              <span className="brand-name">LifeLink</span>
            </div>
            <p className="footer-tagline">
              Good Things, Shared. Built for neighbors to borrow, lend, and save lives in Mysuru.
            </p>
            <div className="city-pill">
              <span>📍 Made with ❤️ in Mysuru, Karnataka</span>
            </div>
          </div>

          <div className="footer-links-col">
            <h4>Quick Navigation</h4>
            <ul>
              <li>
                <button className="footer-link-btn" onClick={() => onSwitchTab("marketplace")}>
                  Borrow & Lend Marketplace
                </button>
              </li>
              <li>
                <button className="footer-link-btn" onClick={() => onSwitchTab("urgent")}>
                  Need It Now (Urgent Board)
                </button>
              </li>
              <li>
                <button className="footer-link-btn" onClick={() => onSwitchTab("blood")}>
                  Fluid Network (Blood Donors)
                </button>
              </li>
              <li>
                <button className="footer-link-btn" onClick={() => onSwitchTab("lostfound")}>
                  Community Lost & Found
                </button>
              </li>
            </ul>
          </div>

          <div className="footer-links-col">
            <h4>Emergency Helplines</h4>
            <ul className="helplines-list">
              <li>
                <strong>Ambulance:</strong> 108 / 112
              </li>
              <li>
                <strong>JSS Hospital Blood Bank:</strong> 0821-2335555
              </li>
              <li>
                <strong>K.R. Hospital Blood Bank:</strong> 0821-2529702
              </li>
              <li>
                <strong>Red Cross Mysuru:</strong> 0821-2566677
              </li>
            </ul>
          </div>

          <div className="footer-security-col">
            <h4>Safety & Trust</h4>
            <p>
              🔒 <strong>v4.0.0 Architecture:</strong> Contact numbers are shielded by default. QR code
              tokens ensure that physical handovers and returns are authenticated without fraud.
            </p>
            <div className="carbon-badge">
              <span>🍃 100% Free · Circular Neighborhood Economy</span>
            </div>
          </div>
        </div>

        {/* Founder & Paid Development Section */}
        <div className="footer-founder-card">
          <div className="founder-card-left">
            <div className="founder-logo-wrap">
              <img
                src="/laxman-sm-logo.png"
                alt="Laxman S M Logo"
                className="founder-logo-img"
              />
            </div>
            <div className="founder-info">
              <div className="founder-tag">FOUNDER & LEAD DEVELOPER</div>
              <h3 className="founder-name">Laxman S M</h3>
              <p className="founder-role">
                Full-Stack Web & Mobile App Development Specialist
              </p>
              <p className="founder-desc">
                Looking for high-performance websites, modern web apps, or mobile applications like LifeLink? Available for <strong>paid web development and app development projects</strong>.
              </p>
            </div>
          </div>

          <div className="founder-card-right">
            <a
              href="mailto:mallapurlaxman2@gmail.com?subject=Paid%20Web%20%2F%20App%20Development%20Project%20Inquiry%20-%20Laxman%20S%20M"
              className="founder-contact-btn"
            >
              ✉️ mallapurlaxman2@gmail.com
            </a>
            <span className="founder-availability">
              🟢 Available for Paid Web & App Projects
            </span>
          </div>
        </div>

        <div className="footer-bottom-row">
          <p>© {new Date().getFullYear()} LifeLink Community Network. All rights reserved.</p>
          <p className="footer-subtext">Designed for high-speed 60–120 FPS mobile & desktop experience.</p>
        </div>
      </div>
    </footer>
  );
}
