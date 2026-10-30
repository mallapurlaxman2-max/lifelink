import React, { useState } from "react";
import ItemCard from "./ItemCard";

export default function Marketplace({
  items,
  search,
  setSearch,
  category,
  setCategory,
  maxDistance,
  setMaxDistance,
  onSelectItem,
  onOpenAddItem,
  distanceLabel,
  userLocation,
}) {
  const [activeFilter, setActiveFilter] = useState("All"); // 'All', 'Borrow', 'Donate'
  const [sortByNearest, setSortByNearest] = useState(true);

  // Filter items
  const filteredItems = items
    .filter((item) => {
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
      if (category !== "All categories") {
        if (item.category?.toLowerCase() !== category.toLowerCase()) return false;
      }

      // Type filter (All, Free Borrow, Paid Rentals, Donate)
      const isPaidItem =
        item.type === "Rent" ||
        item.type === "rent" ||
        item.price?.includes("₹") ||
        item.price?.toLowerCase().includes("day") ||
        item.price?.toLowerCase().includes("rent");

      if (activeFilter === "Free Borrow" || activeFilter === "Borrow") {
        if (item.type?.toLowerCase() !== "borrow" || isPaidItem) return false;
      } else if (activeFilter === "Paid Rentals" || activeFilter === "Rent") {
        if (!isPaidItem) return false;
      } else if (activeFilter === "Donate" || activeFilter === "Donation") {
        if (item.type?.toLowerCase() !== "donation" && item.type?.toLowerCase() !== "donate") {
          return false;
        }
      }

      // Max Distance radius filter
      if (maxDistance !== "all" && item.distance !== undefined && item.distance !== null) {
        const maxKm = parseFloat(maxDistance);
        if (item.distance > maxKm) return false;
      }

      return true;
    })
    .sort((a, b) => {
      if (sortByNearest && a.distance !== undefined && b.distance !== undefined) {
        return a.distance - b.distance;
      }
      return 0;
    });

  return (
    <section className="marketplace section-wrap" id="marketplace">
      <div className="section-heading">
        <div>
          <div className="eyebrow">
            <span className="status-dot" />
            COMMUNITY SHELF
          </div>
          <h2>Browse shared items</h2>
          <p>
            {filteredItems.length} {filteredItems.length === 1 ? "item" : "items"} available nearby in Belagavi.
          </p>
        </div>

        <div className="location-pill-live">
          <span className="live-badge-dot" />
          <span>📍 {userLocation?.area || "Belagavi Central"}</span>
          <small>~3.5 km radius</small>
        </div>
      </div>

      {/* Search and Distance Radius Controls */}
      <div className="search-panel">
        <label className="search-box">
          <span className="search-icon">⌕</span>
          <input
            type="search"
            placeholder="Search by item name, category, or area (e.g. Gokulam)..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            aria-label="Search items"
          />
          {search && (
            <button
              type="button"
              className="clear-search"
              onClick={() => setSearch("")}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </label>

        <div className="radius-control">
          <label>
            <span>Max distance:</span>
            <select
              value={maxDistance}
              onChange={(e) => setMaxDistance(e.target.value)}
            >
              <option value="all">Any distance</option>
              <option value="2">Within 2 km (Walking)</option>
              <option value="5">Within 5 km (Short drive)</option>
              <option value="10">Within 10 km (City wide)</option>
              <option value="25">Within 25 km (Greater area)</option>
            </select>
          </label>
        </div>
      </div>

      {/* Category Tabs & Sorting */}
      <div className="market-controls">
        <div className="filter-tabs" role="group" aria-label="Filter items">
          {["All", "Free Borrow", "Paid Rentals", "Donate"].map((filter) => {
            const paidCount = items.filter(
              (it) =>
                it.type === "Rent" ||
                it.type === "rent" ||
                it.price?.includes("₹") ||
                it.price?.toLowerCase().includes("day")
            ).length;

            return (
              <button
                key={filter}
                className={activeFilter === filter ? "filter-active" : ""}
                onClick={() => setActiveFilter(filter)}
              >
                {filter === "Paid Rentals" ? "💰 Paid Rentals" : filter}
                {filter === "All" && <span>{items.length}</span>}
                {filter === "Paid Rentals" && paidCount > 0 && <span>{paidCount}</span>}
              </button>
            );
          })}
        </div>

        <div className="secondary-controls">
          <label className="category-select">
            <span>Category</span>
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              <option>All categories</option>
              <option>Study</option>
              <option>Tools</option>
              <option>Home</option>
              <option>Travel</option>
              <option>Others</option>
            </select>
          </label>

          <button
            type="button"
            className={`sort-button ${sortByNearest ? "sort-active" : ""}`}
            onClick={() => setSortByNearest(!sortByNearest)}
            title="Toggle nearest items first"
          >
            ⌖ {sortByNearest ? "Sorted: Closest First" : "Default Order"}
          </button>
        </div>
      </div>

      {/* Items Grid */}
      <div className="item-grid">
        {filteredItems.map((item, index) => (
          <ItemCard
            key={item.id}
            item={item}
            index={index}
            onSelect={onSelectItem}
            distanceLabel={distanceLabel}
          />
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="empty-state">
          <span>⌕</span>
          <h3>No items found in this distance radius</h3>
          <p>Try switching "Max distance" to <strong>Any distance</strong> or clear the search filters.</p>
          <button
            className="button button-light"
            onClick={() => {
              setSearch("");
              setMaxDistance("all");
              setCategory("All categories");
              setActiveFilter("All");
            }}
          >
            Show all community items
          </button>
        </div>
      )}
    </section>
  );
}
