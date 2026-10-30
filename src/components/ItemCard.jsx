import React from "react";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=800&q=80";

export default function ItemCard({ item, onSelect, distanceLabel, index = 0 }) {
  const isBorrow = item.type === "Borrow" || item.type === "borrow";

  const contactBadgeText = () => {
    if (item.contact_preference === "whatsapp_only") {
      return "💬 Direct WhatsApp";
    }
    if (item.contact_preference === "call_and_whatsapp") {
      return "📞 Direct Contact";
    }
    return "🛡️ Secure In-App Request";
  };

  return (
    <article
      className="item-card"
      key={item.id}
      style={{ "--card-index": index }}
    >
      <button
        type="button"
        className="item-image"
        onClick={() => onSelect(item)}
        aria-label={`View details for ${item.name}`}
      >
        <img
          src={item.image || FALLBACK_IMAGE}
          alt={item.name}
          loading="lazy"
          onError={(event) => {
            event.currentTarget.src = FALLBACK_IMAGE;
          }}
        />
        <span className={`item-type ${isBorrow ? "borrow" : "donation"}`}>
          {isBorrow ? "Available to borrow" : "Free donation"}
        </span>

        {item.distance !== undefined && (
          <span className="item-distance-tag">
            📍 {distanceLabel ? distanceLabel(item.distance) : `${item.distance} km away`}
          </span>
        )}

        <span className="image-arrow">↗</span>
      </button>

      <div className="item-card-content">
        <div className="item-meta">
          <span className="item-badge">{item.category || "General"}</span>
          <span className="item-location-label" title={item.area}>
            📍 {item.area || "Belagavi"}
          </span>
        </div>

        <button
          type="button"
          className="item-title"
          onClick={() => onSelect(item)}
        >
          {item.name}
        </button>

        <p>{item.description}</p>

        <div className="item-card-footer">
          <span className="owner-avatar">
            {(item.owner || "N").charAt(0).toUpperCase()}
          </span>
          <div className="owner-info">
            <span className="owner-name">{item.owner || "Neighbor"}</span>
            <small className="owner-area">{contactBadgeText()}</small>
          </div>
          <button
            type="button"
            className="card-action"
            onClick={() => onSelect(item)}
            aria-label={`See details for ${item.name}`}
          >
            →
          </button>
        </div>
      </div>
    </article>
  );
}
