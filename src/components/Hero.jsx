import React from "react";

const FALLBACK_HERO = "https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?auto=format&fit=crop&w=900&q=80";

export default function Hero({ onOpenAddItem, itemsCount = 8, donorsCount = 8 }) {
  return (
    <>
      <section className="hero section-wrap" id="home">
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="status-dot" />
            LOCATION & VERIFIED DIRECT NOTIFICATIONS
          </div>

          <h1>
            Borrow & Give
            <br />
            from <span>nearby</span> neighbors.
          </h1>

          <p className="hero-description">
            Find calculators, books, tools, and bicycles near you in Belagavi. When you request an item,
            the owner gets <strong>instant notifications directly with privacy protection</strong> to arrange pickup.
          </p>

          <div className="hero-actions">
            <a href="#marketplace" className="button button-dark">
              Explore nearby items <span>↘</span>
            </a>
            <button
              className="button button-light"
              onClick={onOpenAddItem}
            >
              Share an item
            </button>
          </div>

          <div className="hero-trust">
            <div className="avatar-stack" aria-hidden="true">
              <span>R</span>
              <span>A</span>
              <span>M</span>
              <span>+</span>
            </div>
            <p>
              <strong>Zero buying. Direct connection.</strong>
              <span>Verified in-app notifications and fraud-resistant QR handovers.</span>
            </p>
          </div>
        </div>

        <div className="hero-visual" aria-label="Visual of community items">
          <div className="hero-orbit orbit-one" />
          <div className="hero-orbit orbit-two" />
          <div className="neon-glass-orb orb-cyan" />
          <div className="neon-glass-orb orb-purple" />
          <div className="neon-glass-orb orb-blue" />
          <div className="neon-glass-chip chip-plus">+</div>
          <div className="neon-glass-chip chip-cross">✕</div>

          <div className="hero-photo-card hero-photo-main">
            <img
              src="/hero-share.jpg"
              alt="LifeLink - Borrow and share nearby items in 3D glassmorphism"
              onError={(e) => {
                e.currentTarget.src = FALLBACK_HERO;
              }}
            />
            <div className="photo-caption">
              <span className="caption-icon">📱</span>
              <span>
                <strong>Instant Owner Alert</strong>
                <small>Direct In-App ping & verified handovers</small>
              </span>
            </div>
          </div>

          <div className="floating-note note-top">
            <span className="note-icon">💬</span>
            <span>
              <strong>Privacy protected</strong>
              <small>In-app requests by default</small>
            </span>
          </div>
          <div className="floating-note note-bottom">
            <span className="note-icon note-blue">⌖</span>
            <span>
              <strong>Sorted by proximity</strong>
              <small>Closest items first</small>
            </span>
          </div>
          <div className="hero-spark spark-one">✳</div>
          <div className="hero-spark spark-two">✳</div>
        </div>
      </section>

      {/* Impact strip */}
      <section className="impact-strip section-wrap" aria-label="LifeLink values">
        <div className="impact-item">
          <span className="impact-icon">⌖</span>
          <div>
            <strong>Hyperlocal Radius</strong>
            <small>Sorted from nearest neighbor to door</small>
          </div>
        </div>
        <div className="impact-item">
          <span className="impact-icon">🛡️</span>
          <div>
            <strong>Shielded Privacy</strong>
            <small>Contacts hidden from web crawlers</small>
          </div>
        </div>
        <div className="impact-item">
          <span className="impact-icon">🌱</span>
          <div>
            <strong>100% Free Sharing</strong>
            <small>Zero fees, circular neighborhood economy</small>
          </div>
        </div>
        <div className="impact-item">
          <span className="impact-icon">⚡</span>
          <div>
            <strong>Verified Handovers</strong>
            <small>Single-use PINs for fraud prevention</small>
          </div>
        </div>
      </section>
    </>
  );
}
