import React from "react";
import { useAuth } from "../context/AuthContext";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=800&q=80";

export default function ItemDetailModal({
  item,
  onClose,
  onRequest,
  distanceLabel,
  onOpenHandover,
}) {
  const { user } = useAuth();
  if (!item) return null;

  const isOwner = user && (item.owner_id === user.id || item.owner === user.user_metadata?.full_name);
  const isBorrow = item.type === "Borrow" || item.type === "borrow";

  return (
    <div
      className="modal-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-sheet detail-sheet" role="dialog" aria-modal="true">
        <button className="modal-close-button" onClick={onClose} aria-label="Close">
          ✕
        </button>

        <div className="detail-grid">
          <div className="detail-media">
            <img
              src={item.image || FALLBACK_IMAGE}
              alt={item.name}
              onError={(e) => {
                e.currentTarget.src = FALLBACK_IMAGE;
              }}
            />
          </div>

          <div className="detail-info">
            <div className="detail-tags">
              <span className={`pill-badge ${isBorrow ? "borrow-badge" : "donate-badge"}`}>
                {isBorrow ? "Available to Borrow" : "Free Community Donation"}
              </span>
              <span className="pill-badge category-badge">
                {(item.category || "General").toUpperCase()}
              </span>
            </div>

            <h2 className="detail-title">{item.name}</h2>
            <p className="detail-desc">{item.description}</p>

            <div className="detail-specs-table">
              <div className="spec-row">
                <span className="spec-label">Pickup Area</span>
                <span className="spec-val">📍 {item.area || "Mysuru"}</span>
              </div>
              {item.distance !== undefined && (
                <div className="spec-row">
                  <span className="spec-label">Distance</span>
                  <span className="spec-val highlight-dist">
                    {distanceLabel ? distanceLabel(item.distance) : `${item.distance} km`}
                  </span>
                </div>
              )}
              <div className="spec-row">
                <span className="spec-label">Condition</span>
                <span className="spec-val">{item.condition || "Good condition"}</span>
              </div>
              <div className="spec-row">
                <span className="spec-label">Shared By</span>
                <span className="spec-val owner-name-val">
                  {item.owner || "Neighbor"} {isOwner ? "(You)" : ""}
                </span>
              </div>
              <div className="spec-row">
                <span className="spec-label">Cost</span>
                <span className="spec-val free-val">{item.price || "100% Free"}</span>
              </div>
            </div>

            {/* Privacy Protection Banner */}
            <div className="privacy-shield-banner">
              <span className="shield-icon">🛡️</span>
              <div className="shield-text">
                <strong>Privacy Protected</strong>
                <small>
                  Direct phone numbers and emails are never exposed. Borrow requests and confirmations
                  occur through verified in-app notifications.
                </small>
              </div>
            </div>

            {/* Actions */}
            <div className="detail-actions">
              {isOwner ? (
                <div className="owner-action-box">
                  <p className="owner-notice">You are the owner of this item.</p>
                  <button
                    className="button button-accent full-width"
                    onClick={() => onOpenHandover && onOpenHandover(item)}
                  >
                    📱 Handover QR / Verification
                  </button>
                </div>
              ) : (
                <button
                  className="button button-accent full-width submit-btn"
                  onClick={() => onRequest(item)}
                >
                  {isBorrow ? "Request to Borrow" : "Request Donation"} ↗
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
