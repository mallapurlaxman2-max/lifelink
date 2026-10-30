import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { createBorrowRequest } from "../services/api";

export default function RequestBorrowModal({
  item,
  onClose,
  onSuccess,
}) {
  const { user, profile } = useAuth();

  const [borrowerName, setBorrowerName] = useState(profile?.full_name || "");
  const [requestedDates, setRequestedDates] = useState("");
  const [borrowerNote, setBorrowerNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  if (!item) return null;

  async function handleInAppSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setStatusMessage(null);

    try {
      await createBorrowRequest({
        itemId: item.id,
        requestedDates: requestedDates || "This week (flexible)",
        borrowerNote: borrowerNote || `Hi ${item.owner}, I would like to borrow your ${item.name}.`,
      });

      setStatusMessage({
        type: "success",
        text: `Your request was sent directly to ${item.owner}! They will be notified to approve it.`,
      });

      setTimeout(() => {
        onSuccess && onSuccess();
        onClose();
      }, 2000);
    } catch (err) {
      console.error("Borrow request error:", err);
      // If unauthorized or table needs migration
      if (err.message?.includes("logged in") || !user) {
        setStatusMessage({
          type: "error",
          text: "Please sign in or use WhatsApp direct alert to contact the owner.",
        });
      } else {
        setStatusMessage({
          type: "error",
          text: err.message || "Could not submit request. Please try again.",
        });
      }
    } finally {
      setSubmitting(false);
    }
  }

  function handleDirectWhatsApp() {
    const cleanPhone = (item.phone || "919876543210").replace(/[^0-9]/g, "");
    const nameStr = borrowerName.trim() || profile?.full_name || "A neighbor";
    const dateStr = requestedDates || "as soon as convenient";
    const msg = `Hello ${item.owner}! 👋\n\nI saw your listing on LifeLink: "${item.name}" in ${item.area}.\n\nI would love to ${item.type?.toLowerCase() || "borrow"} it for ${dateStr}.\nMy name: ${nameStr}\nNote: ${borrowerNote.trim() || "Let me know if it is available."}\n\nThank you!`;
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
    onClose();
  }

  return (
    <div
      className="modal-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-sheet request-sheet" role="dialog" aria-modal="true">
        <button className="modal-close-button" onClick={onClose} aria-label="Close">
          ✕
        </button>

        <div className="modal-header">
          <span className="eyebrow-tag">SECURE BORROW REQUEST</span>
          <h2 className="modal-title">Request "{item.name}"</h2>
          <p className="modal-subtitle">
            Owner: <strong>{item.owner}</strong> · 📍 {item.area || "Mysuru"}
          </p>
        </div>

        {statusMessage && (
          <div className={`status-banner ${statusMessage.type}`}>
            {statusMessage.type === "success" ? "✓ " : "⚠️ "}
            {statusMessage.text}
          </div>
        )}

        <form onSubmit={handleInAppSubmit} className="request-form">
          <div className="form-group">
            <label className="form-label">Your Name</label>
            <input
              type="text"
              required
              className="form-input"
              placeholder="e.g. Aditi Sharma"
              value={borrowerName}
              onChange={(e) => setBorrowerName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Needed Dates / Duration</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. This Saturday to Sunday (2 days)"
              value={requestedDates}
              onChange={(e) => setRequestedDates(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Message / Usage Purpose</label>
            <textarea
              className="form-textarea"
              rows="3"
              placeholder={`Introduce yourself and mention how you'll take care of ${item.owner}'s item...`}
              value={borrowerNote}
              onChange={(e) => setBorrowerNote(e.target.value)}
            />
          </div>

          <div className="request-submit-block">
            <button
              type="submit"
              disabled={submitting}
              className="button button-accent full-width"
            >
              {submitting ? "Sending Request..." : "🛡️ Send Secure In-App Request"}
            </button>

            {item.contact_preference !== "in_app_only" && (
              <div className="alternate-alert-options">
                <span className="or-divider">or notify directly</span>
                <button
                  type="button"
                  className="button button-whatsapp full-width"
                  onClick={handleDirectWhatsApp}
                >
                  💬 Open WhatsApp Alert
                </button>
              </div>
            )}

            <p className="security-guarantee-note">
              🔒 <strong>Safe Exchange:</strong> Your contact is never displayed publicly. When {item.owner} approves, you will receive an in-app confirmation and handover verification code.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
