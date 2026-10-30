import React, { useState } from "react";

export default function FloatingFounderBadge() {
  const [closed, setClosed] = useState(false);

  if (closed) return null;

  return (
    <div className="floating-founder-badge" role="complementary" aria-label="Founder Credits">
      <a
        href="mailto:mallapurlaxman2@gmail.com?subject=Paid%20Web%20%2F%20App%20Development%20Project%20Inquiry%20-%20Laxman%20S%20M"
        className="floating-founder-link"
        title="Hire Laxman S M for Paid Web & Mobile App Development"
      >
        <div className="floating-founder-logo-wrap">
          <img
            src="/laxman-sm-logo.png"
            alt="Laxman S M"
            className="floating-founder-logo"
          />
          <span className="floating-status-dot" />
        </div>
        <div className="floating-founder-info">
          <div className="floating-founder-name">
            <strong>Laxman S M</strong>
            <span className="floating-badge-chip">Hire Dev</span>
          </div>
          <span className="floating-founder-sub">Available for Paid Web & App Projects ↗</span>
        </div>
      </a>
      <button
        className="floating-founder-close"
        onClick={() => setClosed(true)}
        aria-label="Dismiss badge"
        title="Dismiss"
      >
        ✕
      </button>
    </div>
  );
}
