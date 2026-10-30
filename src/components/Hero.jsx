import React from "react";

export default function Hero({
  search,
  setSearch,
  category,
  setCategory,
  maxDistance,
  setMaxDistance,
  itemsCount = 8,
  donorsCount = 8,
}) {
  const CATEGORIES = [
    { label: "All items", icon: "✨" },
    { label: "Tools", icon: "🔧" },
    { label: "Study", icon: "📚" },
    { label: "Home", icon: "🪴" },
    { label: "Travel", icon: "🎒" },
    { label: "Others", icon: "🚲" },
  ];

  return (
    <section className="hero-section" id="home">
      <div className="hero-content">
        <div className="hero-badge">
          <span className="sparkle">🌿</span>
          <span>Zero-Waste Neighborhood Sharing Network</span>
        </div>

        <h1 className="hero-title">
          Borrow what you need. <br />
          <span className="hero-highlight">Share what you have.</span>
        </h1>

        <p className="hero-subtitle">
          Connect with trusted neighbors in Mysuru to borrow tools, textbooks, gear, and daily essentials.
          Save money, reduce clutter, and build a tighter local community.
        </p>

        {/* Global Search & Distance Controls */}
        <div className="hero-search-box">
          <div className="search-input-wrap">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search drills, calculators, camping gear, books..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="hero-search-input"
            />
            {search && (
              <button
                className="clear-search-btn"
                onClick={() => setSearch("")}
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          <div className="distance-selector-wrap">
            <label htmlFor="distance-select" className="distance-label">
              📍 Max Radius:
            </label>
            <select
              id="distance-select"
              value={maxDistance}
              onChange={(e) => setMaxDistance(e.target.value)}
              className="distance-select"
            >
              <option value="3">Within 3 km</option>
              <option value="5">Within 5 km</option>
              <option value="10">Within 10 km</option>
              <option value="all">Any distance</option>
            </select>
          </div>
        </div>

        {/* Category Filter Chips */}
        <div className="hero-category-chips">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.label}
              className={`category-chip ${
                (cat.label === "All items" && category === "All categories") ||
                category.toLowerCase() === cat.label.toLowerCase()
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                setCategory(cat.label === "All items" ? "All categories" : cat.label)
              }
            >
              <span className="chip-icon">{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Quick Impact Stats */}
        <div className="hero-stats-row">
          <div className="hero-stat-card">
            <strong className="stat-number">{itemsCount}+</strong>
            <span className="stat-label">Items Available</span>
          </div>
          <div className="hero-stat-card">
            <strong className="stat-number">{donorsCount}+</strong>
            <span className="stat-label">Verified Blood Donors</span>
          </div>
          <div className="hero-stat-card">
            <strong className="stat-number">100%</strong>
            <span className="stat-label">Free Community Sharing</span>
          </div>
          <div className="hero-stat-card">
            <strong className="stat-number">~120 kg</strong>
            <span className="stat-label">Carbon Offset</span>
          </div>
        </div>
      </div>
    </section>
  );
}
