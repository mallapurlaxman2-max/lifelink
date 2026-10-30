import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { createBorrowRequest } from "../services/api";

export default function RequestBorrowModal({
  item,
  onClose,
  onSuccess,
}) {
  const { user, profile } = useAuth();

  const isOwner = Boolean(
    user &&
    (item.owner_id === user.id ||
      (item.owner && profile?.full_name && item.owner.toLowerCase().trim() === profile.full_name.toLowerCase().trim()))
  );

  const todayStr = new Date().toISOString().split("T")[0];
  const defaultReturnStr = new Date(Date.now() + 3 * 86400000).toISOString().split("T")[0];

  const [borrowerName, setBorrowerName] = useState(profile?.full_name || "");
  const [borrowerPhone, setBorrowerPhone] = useState(profile?.phone || "");
  const [startDate, setStartDate] = useState(todayStr);
  const [returnDate, setReturnDate] = useState(defaultReturnStr);
  const [borrowerNote, setBorrowerNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  if (!item) return null;

  async function handleInAppSubmit(e) {
    e.preventDefault();
    if (isOwner) {
      setStatusMessage({
        type: "error",
        text: "You cannot borrow your own listed item.",
      });
      return;
    }

    setSubmitting(true);
    setStatusMessage(null);

    try {
      await createBorrowRequest({
        itemId: item.id,
        borrowerName: borrowerName.trim() || profile?.full_name || "Neighbor",
        borrowerPhone: borrowerPhone.trim() || "+919876543210",
        borrowerEmail: user?.email || "neighbor@lifelink.local",
        startDate,
        endDate: returnDate,
        note: borrowerNote.trim() || `Hi ${item.owner}, I would like to borrow your ${item.name}.`,
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
      setStatusMessage({
        type: "error",
        text: err.message || "Could not submit request. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  function handleDirectWhatsApp() {
    const cleanPhone = (item.phone || "919876543210").replace(/[^0-9]/g, "");
    const nameStr = borrowerName.trim() || profile?.full_name || "A neighbor";
    const msg = `Hello ${item.owner}! 👋\n\nI saw your listing on LifeLink: "${item.name}" in ${item.area}.\n\nI would love to ${item.type?.toLowerCase() || "borrow"} it from ${startDate} to ${returnDate}.\nMy name: ${nameStr}\nNote: ${borrowerNote.trim() || "Let me know if it is available."}\n\nThank you!`;
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
            Owner: <strong>{item.owner}</strong> · 📍 {item.area || "Belagavi"}
          </p>
        </div>

        {isOwner && (
          <div className="status-banner info">
            ℹ️ You are listed as the owner of this item. In a live network, other neighbors will borrow from you.
          </div>
        )}

        {statusMessage && (
          <div className={`status-banner ${statusMessage.type}`}>
            {statusMessage.type === "success" ? "✓ " : "⚠️ "}
            {statusMessage.text}
          </div>
        )}

        <form onSubmit={handleInAppSubmit} className="request-form">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Your Full Name *</label>
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
              <label className="form-label">Your Phone Number *</label>
              <input
                type="tel"
                required
                className="form-input"
                placeholder="e.g. +91 98765 43210"
                value={borrowerPhone}
                onChange={(e) => setBorrowerPhone(e.target.value)}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Start / Pickup Date *</label>
              <input
                type="date"
                required
                min={todayStr}
                className="form-input"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Planned Return Date *</label>
              <input
                type="date"
                required
                min={startDate || todayStr}
                className="form-input"
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Message / Note to {item.owner}</label>
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
              disabled={submitting || isOwner}
              className="button button-accent full-width"
            >
              {submitting ? "Sending Request..." : isOwner ? "Cannot Borrow Own Item" : "🛡️ Send Secure In-App Request"}
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
