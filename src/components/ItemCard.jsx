import React from "react";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=800&q=80";

export default function ItemCard({ item, onSelect, distanceLabel }) {
  const isBorrow = item.type === "Borrow" || item.type === "borrow";
  const isAvailable = item.status === "available" || !item.status;

  const contactBadgeText = () => {
    if (item.contact_preference === "whatsapp_only") {
      return "💬 WhatsApp Available";
    }
    if (item.contact_preference === "call_and_whatsapp") {
      return "📞 Direct Call & WA";
    }
    return "🛡️ Secure In-App Request";
  };

  return (
    <article
      className={`item-card ${!isAvailable ? "item-unavailable" : ""}`}
      onClick={() => onSelect(item)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(item);
        }
      }}
    >
      <div className="card-media">
        <img
          src={item.image || FALLBACK_IMAGE}
          alt={item.name}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = FALLBACK_IMAGE;
          }}
        />
        <div className="card-badges">
          <span className={`pill-badge ${isBorrow ? "borrow-badge" : "donate-badge"}`}>
            {isBorrow ? "Available to borrow" : "Free donation"}
          </span>
          {item.distance !== undefined && (
            <span className="pill-badge distance-badge">
              📍 {distanceLabel ? distanceLabel(item.distance) : `${item.distance} km away`}
            </span>
          )}
        </div>
      </div>

      <div className="card-body">
        <div className="card-top-row">
          <span className="card-category">{(item.category || "General").toUpperCase()}</span>
          <span className="card-location">📍 {item.area || "Mysuru"}</span>
        </div>

        <h3 className="card-title">{item.name}</h3>
        <p className="card-description">{item.description}</p>

        <div className="card-footer">
          <div className="card-owner-block">
            <span className="owner-avatar">
              {(item.owner || "N").charAt(0).toUpperCase()}
            </span>
            <div className="owner-meta">
              <span className="owner-name">{item.owner || "Neighbor"}</span>
              <small className="owner-privacy-note">{contactBadgeText()}</small>
            </div>
          </div>

          <button
            className="card-action-btn"
            aria-label={`View details for ${item.name}`}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(item);
            }}
          >
            →
          </button>
        </div>
      </div>
    </article>
  );
}
