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
}) {
  const [typeFilter, setTypeFilter] = useState("all"); // 'all', 'borrow', 'donation'

  // Filter items
  const filteredItems = items.filter((item) => {
    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = item.name?.toLowerCase().includes(q);
      const matchDesc = item.description?.toLowerCase().includes(q);
      const matchArea = item.area?.toLowerCase().includes(q);
      const matchCat = item.category?.toLowerCase().includes(q);
      if (!matchName && !matchDesc && !matchArea && !matchCat) return false;
    }

    // Category
    if (category !== "All categories" && category !== "All items") {
      if (item.category?.toLowerCase() !== category.toLowerCase()) return false;
    }

    // Type filter
    if (typeFilter === "borrow") {
      if (item.type?.toLowerCase() !== "borrow") return false;
    } else if (typeFilter === "donation") {
      if (item.type?.toLowerCase() !== "donation" && item.type?.toLowerCase() !== "donate") {
        return false;
      }
    }

    // Distance
    if (maxDistance !== "all" && item.distance !== undefined) {
      const maxKm = parseFloat(maxDistance);
      if (item.distance > maxKm) return false;
    }

    return true;
  });

  return (
    <section className="marketplace-section" id="marketplace">
      <div className="section-container">
        {/* Marketplace Header */}
        <div className="section-header-row">
          <div>
            <span className="eyebrow-tag">COMMUNITY SHELF</span>
            <h2 className="section-heading">Browse Shared Items</h2>
            <p className="section-subtext">
              {filteredItems.length} {filteredItems.length === 1 ? "item" : "items"} available nearby in Mysuru
            </p>
          </div>

          <div className="type-toggle-group">
            <button
              className={`type-toggle-btn ${typeFilter === "all" ? "active" : ""}`}
              onClick={() => setTypeFilter("all")}
            >
              All
            </button>
            <button
              className={`type-toggle-btn ${typeFilter === "borrow" ? "active" : ""}`}
              onClick={() => setTypeFilter("borrow")}
            >
              Borrow
            </button>
            <button
              className={`type-toggle-btn ${typeFilter === "donation" ? "active" : ""}`}
              onClick={() => setTypeFilter("donation")}
            >
              Donations
            </button>
          </div>
        </div>

        {/* Items Grid */}
        {filteredItems.length > 0 ? (
          <div className="items-grid">
            {filteredItems.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                onSelect={onSelectItem}
                distanceLabel={distanceLabel}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state-card">
            <span className="empty-icon">🔍</span>
            <h3>No items found</h3>
            <p>
              No listings match your search or distance filters. Try increasing the max distance or clearing your search.
            </p>
            <div className="empty-actions">
              <button
                className="button button-light"
                onClick={() => {
                  setSearch("");
                  setCategory("All categories");
                  setMaxDistance("all");
                  setTypeFilter("all");
                }}
              >
                Clear Filters
              </button>
              <button className="button button-accent" onClick={onOpenAddItem}>
                + Share First Item
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
