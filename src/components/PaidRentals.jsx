import React, { useState } from "react";
import ItemCard from "./ItemCard";

export default function PaidRentals({
  items = [],
  onSelectItem,
  onOpenAddItem,
  distanceLabel,
  userLocation,
}) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [maxRate, setMaxRate] = useState("all");
  const [maxDistance, setMaxDistance] = useState("all");
  const [sortBy, setSortBy] = useState("nearest"); // 'nearest', 'price_low', 'price_high'

  // Filter for items that are paid rentals (type === "Rent" or price has ₹ or rent/day)
  const rentalItems = items.filter((item) => {
    const isPaid =
      item.type === "Rent" ||
      item.type === "rent" ||
      item.price?.includes("₹") ||
      item.price?.toLowerCase().includes("day") ||
      item.price?.toLowerCase().includes("rent");
    if (!isPaid) return false;

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = item.name?.toLowerCase().includes(q);
      const matchDesc = item.description?.toLowerCase().includes(q);
      const matchArea = item.area?.toLowerCase().includes(q);
      const matchCat = item.category?.toLowerCase().includes(q);
      if (!matchName && !matchDesc && !matchArea && !matchCat) return false;
    }

    // Category filter
    if (category !== "All") {
      if (item.category?.toLowerCase() !== category.toLowerCase()) return false;
    }

    // Distance filter
    if (maxDistance !== "all" && item.distance !== undefined && item.distance !== null) {
      if (item.distance > parseFloat(maxDistance)) return false;
    }

    // Daily rate filter
    if (maxRate !== "all") {
      const numMatch = item.price?.match(/\d+/);
      const rate = numMatch ? parseInt(numMatch[0], 10) : 0;
      if (rate > parseInt(maxRate, 10)) return false;
    }

    return true;
  });

  // Sort items
  const sortedRentals = [...rentalItems].sort((a, b) => {
    if (sortBy === "nearest") {
      return (a.distance ?? 999) - (b.distance ?? 999);
    }
    const rateA = parseInt(a.price?.match(/\d+/)?.[0] || "0", 10);
    const rateB = parseInt(b.price?.match(/\d+/)?.[0] || "0", 10);
    if (sortBy === "price_low") return rateA - rateB;
    if (sortBy === "price_high") return rateB - rateA;
    return 0;
  });

  return (
    <div className="section-container" style={{ paddingTop: "24px", minHeight: "70vh" }}>
      {/* Header Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, #064e3b 0%, #065f46 60%, #047857 100%)",
          borderRadius: "20px",
          padding: "36px 32px",
          color: "#fff",
          marginBottom: "32px",
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 12px 30px -10px rgba(6, 78, 59, 0.4)",
        }}
      >
        <div style={{ maxWidth: "700px", position: "relative", zIndex: 2 }}>
          <span
            style={{
              background: "rgba(255,255,255,0.2)",
              color: "#ecfdf5",
              padding: "4px 12px",
              borderRadius: "20px",
              fontSize: "0.8rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              display: "inline-block",
              marginBottom: "12px",
            }}
          >
            💰 Peer-to-Peer Paid Lending & Rentals
          </span>
          <h1 style={{ fontSize: "2.2rem", fontWeight: 800, margin: "0 0 12px", lineHeight: 1.2 }}>
            Rent & Earn from Your Unused Gear in Belagavi
          </h1>
          <p style={{ color: "#d1fae5", fontSize: "1.05rem", lineHeight: 1.5, margin: "0 0 24px" }}>
            Lend your power tools, camera bodies, DSLR lenses, camping equipment, party speakers, or
            appliances to neighbors for a daily fee. Earn passive cash while helping neighbors save money.
          </p>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <button
              className="button"
              style={{
                background: "#10b981",
                color: "#fff",
                fontWeight: 700,
                padding: "12px 24px",
                borderRadius: "12px",
                border: "none",
                fontSize: "1rem",
                boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)",
              }}
              onClick={() => onOpenAddItem && onOpenAddItem("Rent")}
            >
              ＋ Lend an Item for Pay & Earn
            </button>
            <a
              href="#browse-rentals"
              className="button"
              style={{
                background: "rgba(255,255,255,0.15)",
                color: "#fff",
                padding: "12px 20px",
                borderRadius: "12px",
                textDecoration: "none",
                fontSize: "0.95rem",
              }}
            >
              Explore Rental Equipment ↓
            </a>
          </div>
        </div>

        {/* Feature Strip */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "16px",
            marginTop: "32px",
            paddingTop: "24px",
            borderTop: "1px solid rgba(255,255,255,0.15)",
          }}
        >
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <span style={{ fontSize: "1.6rem" }}>💵</span>
            <div>
              <strong style={{ display: "block", fontSize: "0.95rem" }}>Earn Daily Passive Income</strong>
              <small style={{ color: "#a7f3d0" }}>Set your daily or weekly rates</small>
            </div>
          </div>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <span style={{ fontSize: "1.6rem" }}>🛡️</span>
            <div>
              <strong style={{ display: "block", fontSize: "0.95rem" }}>Single-Use Handover PINs</strong>
              <small style={{ color: "#a7f3d0" }}>Physical exchange verified on pickup & return</small>
            </div>
          </div>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <span style={{ fontSize: "1.6rem" }}>📍</span>
            <div>
              <strong style={{ display: "block", fontSize: "0.95rem" }}>Hyperlocal in Belagavi</strong>
              <small style={{ color: "#a7f3d0" }}>Pickup within walking or short driving distance</small>
            </div>
          </div>
        </div>
      </div>

      <div id="browse-rentals">
        {/* Controls and Filters */}
        <div
          style={{
            background: "#fff",
            padding: "18px 20px",
            borderRadius: "14px",
            border: "1px solid #e2e8f0",
            marginBottom: "24px",
            display: "flex",
            flexWrap: "wrap",
            gap: "14px",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Search box */}
          <div style={{ flex: "1 1 240px", position: "relative" }}>
            <input
              type="search"
              className="form-input"
              placeholder="Search cameras, drills, tents in Belagavi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: "36px" }}
            />
            <span style={{ position: "absolute", left: "12px", top: "10px", color: "#94a3b8" }}>⌕</span>
          </div>

          {/* Category */}
          <select
            className="form-select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{ width: "auto" }}
          >
            <option value="All">All Categories</option>
            <option value="Tools">Tools & Heavy Gear</option>
            <option value="Travel">Travel & Camping</option>
            <option value="Study">Study & Tech</option>
            <option value="Home">Home & Kitchen</option>
            <option value="Others">Others</option>
          </select>

          {/* Daily Rate filter */}
          <select
            className="form-select"
            value={maxRate}
            onChange={(e) => setMaxRate(e.target.value)}
            style={{ width: "auto" }}
          >
            <option value="all">Any Daily Rate</option>
            <option value="150">Under ₹150 / day</option>
            <option value="300">Under ₹300 / day</option>
            <option value="600">Under ₹600 / day</option>
            <option value="1500">Under ₹1,500 / day</option>
          </select>

          {/* Distance filter */}
          <select
            className="form-select"
            value={maxDistance}
            onChange={(e) => setMaxDistance(e.target.value)}
            style={{ width: "auto" }}
          >
            <option value="all">Any Distance</option>
            <option value="5">Within 5 km</option>
            <option value="10">Within 10 km</option>
            <option value="25">Within 25 km</option>
          </select>

          {/* Sorting */}
          <select
            className="form-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{ width: "auto" }}
          >
            <option value="nearest">Sort: Nearest Distance</option>
            <option value="price_low">Sort: Lowest Daily Fee</option>
            <option value="price_high">Sort: Highest Daily Fee</option>
          </select>
        </div>

        {/* Results Info */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "18px",
          }}
        >
          <h2 style={{ fontSize: "1.25rem", margin: 0, color: "#0f172a", fontWeight: 700 }}>
            Available Paid Rentals ({sortedRentals.length})
          </h2>
          <button
            className="button button-accent btn-small"
            onClick={() => onOpenAddItem && onOpenAddItem("Rent")}
          >
            ＋ List Your Gear for Rent
          </button>
        </div>

        {/* Items Grid */}
        {sortedRentals.length === 0 ? (
          <div
            style={{
              background: "#fff",
              padding: "48px 24px",
              borderRadius: "16px",
              textAlign: "center",
              border: "1px dashed #cbd5e1",
            }}
          >
            <span style={{ fontSize: "3rem" }}>💰</span>
            <h3 style={{ marginTop: "12px", fontSize: "1.25rem", color: "#1e293b" }}>
              No Paid Rentals Found Matching Your Filter
            </h3>
            <p style={{ color: "#64748b", maxWidth: "480px", margin: "8px auto 20px" }}>
              Have an extra camera, tripod, pressure washer, sound system, or power tool sitting at home?
              List it in Belagavi to start earning daily rental income.
            </p>
            <button
              className="button button-accent"
              onClick={() => onOpenAddItem && onOpenAddItem("Rent")}
            >
              ＋ Be the First to List Gear for Rent
            </button>
          </div>
        ) : (
          <div className="item-grid">
            {sortedRentals.map((item, index) => (
              <ItemCard
                key={item.id}
                item={item}
                index={index}
                onSelect={onSelectItem}
                distanceLabel={distanceLabel}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
