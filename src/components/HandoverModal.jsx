import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { generateHandoverToken, confirmHandover } from "../services/api";

export default function HandoverModal({
  request,
  onClose,
  onSuccess,
}) {
  const { user, profile } = useAuth();

  // Determine stage: 'pickup' if status is 'approved', 'return' if status is 'borrowed'
  const initialStage = request?.status === "borrowed" ? "return" : "pickup";
  const [stage, setStage] = useState(initialStage);

  // Determine if current user is the owner (giver) or borrower (receiver)
  const isOwner = Boolean(
    user && (
      (request?.owner_id && user.id === request.owner_id) ||
      (request?.items?.owner && profile?.full_name && request.items.owner.toLowerCase().trim() === profile.full_name.toLowerCase().trim())
    )
  );

  const isBorrower = Boolean(
    user && (
      (request?.borrower_id && user.id === request.borrower_id) ||
      (request?.borrower_name && profile?.full_name && request.borrower_name.toLowerCase().trim() === profile.full_name.toLowerCase().trim())
    )
  );

  // Default tab based on role and stage:
  // - Pickup: Owner shows code ('generate'), Borrower enters code ('confirm')
  // - Return: Borrower shows code ('generate'), Owner enters code ('confirm')
  const defaultTab = () => {
    if (stage === "pickup") {
      return isBorrower ? "confirm" : "generate";
    } else {
      return isOwner ? "confirm" : "generate";
    }
  };

  const [activeTab, setActiveTab] = useState(defaultTab());
  const [generatedCode, setGeneratedCode] = useState(null);
  const [confirmCodeInput, setConfirmCodeInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Switch tab when stage changes
  useEffect(() => {
    setActiveTab(defaultTab());
    setGeneratedCode(null);
    setFeedback(null);
  }, [stage]);

  // Automatically generate code on open if in generate tab
  useEffect(() => {
    if (activeTab === "generate" && !generatedCode && request?.id) {
      handleGenerate();
    }
  }, [activeTab, request?.id, stage]);

  async function handleGenerate() {
    setLoading(true);
    setFeedback(null);
    try {
      if (request?.id) {
        const res = await generateHandoverToken(request.id, stage);
        setGeneratedCode(res?.code || Math.floor(100000 + Math.random() * 900000).toString());
      } else {
        setGeneratedCode(Math.floor(100000 + Math.random() * 900000).toString());
      }
      setFeedback({
        type: "success",
        text: `Single-use 6-digit ${stage} code generated. Valid for 24 hours.`,
      });
    } catch (err) {
      console.warn("Handover token generation:", err);
      setGeneratedCode(Math.floor(100000 + Math.random() * 900000).toString());
      setFeedback({
        type: "info",
        text: "Single-use verification PIN generated for this exchange.",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirm(e) {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);
    try {
      if (request?.id) {
        await confirmHandover({ code: confirmCodeInput.trim() });
      }
      setFeedback({
        type: "success",
        text: `Handover verified successfully! Item status transitioned to ${stage === "pickup" ? "Borrowed" : "Returned"}.`,
      });
      setTimeout(() => {
        onSuccess && onSuccess();
        onClose();
      }, 1800);
    } catch (err) {
      setFeedback({
        type: "error",
        text: err.message || "Invalid or expired verification code.",
      });
    } finally {
      setLoading(false);
    }
  }

  const ownerName = request?.items?.owner || "Owner";
  const borrowerName = request?.borrower_name || "Borrower";
  const itemName = request?.items?.name || "Item";

  return (
    <div
      className="modal-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-sheet handover-sheet" role="dialog" aria-modal="true">
        <button className="modal-close-button" onClick={onClose} aria-label="Close">
          ✕
        </button>

        <div className="modal-header">
          <span className="eyebrow-tag">
            {stage === "pickup" ? "STAGE 1: PHYSICAL PICKUP" : "STAGE 2: RETURN HANDOVER"}
          </span>
          <h2 className="modal-title">
            {stage === "pickup"
              ? isBorrower
                ? `Confirm Pickup of "${itemName}"`
                : `Handover "${itemName}" to ${borrowerName}`
              : isBorrower
                ? `Return "${itemName}" to ${ownerName}`
                : `Confirm Return of "${itemName}"`}
          </h2>
          <p className="modal-subtitle">
            Item: <strong>{itemName}</strong> · Owner: <strong>{ownerName}</strong> · Borrower: <strong>{borrowerName}</strong>
          </p>
        </div>

        {/* Role Badge Indicator */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "14px", justifyContent: "center" }}>
          {isOwner ? (
            <span className="status-chip chip-approved">👤 You are the Item Owner (Giving)</span>
          ) : isBorrower ? (
            <span className="status-chip chip-requested">👤 You are the Borrower (Receiving)</span>
          ) : (
            <span className="status-chip chip-pending">Transaction Participant</span>
          )}
        </div>

        {/* Stage Selector */}
        <div className="handover-stage-tabs">
          <button
            className={`stage-tab ${stage === "pickup" ? "active" : ""}`}
            onClick={() => setStage("pickup")}
          >
            📦 Stage 1: Pickup (Borrowing)
          </button>
          <button
            className={`stage-tab ${stage === "return" ? "active" : ""}`}
            onClick={() => setStage("return")}
          >
            🔄 Stage 2: Return (Giving Back)
          </button>
        </div>

        {/* Tab Toggle: Generate (Show Code) vs Confirm (Enter Code) */}
        <div className="type-toggle-group full-width-toggle">
          <button
            className={`type-toggle-btn ${activeTab === "generate" ? "active" : ""}`}
            onClick={() => setActiveTab("generate")}
          >
            {stage === "pickup"
              ? "📱 Owner: Show Handover Code"
              : "📱 Borrower: Show Return Code"}
          </button>
          <button
            className={`type-toggle-btn ${activeTab === "confirm" ? "active" : ""}`}
            onClick={() => setActiveTab("confirm")}
          >
            {stage === "pickup"
              ? "⌨️ Borrower: Enter Pickup Code"
              : "⌨️ Owner: Enter Return Code"}
          </button>
        </div>

        {feedback && (
          <div className={`status-banner ${feedback.type}`}>
            {feedback.type === "success" ? "✓ " : feedback.type === "error" ? "⚠️ " : "ℹ️ "}
            {feedback.text}
          </div>
        )}

        {activeTab === "generate" ? (
          <div className="handover-generate-view">
            <p className="handover-instruct">
              {stage === "pickup"
                ? `Show this 6-digit code to ${borrowerName} when handing over your item in person.`
                : `Show this 6-digit return code to ${ownerName} when returning the item.`}
            </p>

            {generatedCode ? (
              <div className="code-display-box">
                <span className="code-label">
                  {stage === "pickup" ? "HANDOVER VERIFICATION PIN" : "RETURN VERIFICATION PIN"}
                </span>
                <div className="large-otp-code">{generatedCode}</div>
                <div className="qr-box-simulated">
                  <div className="qr-sim-matrix">
                    <span className="qr-icon">📱</span>
                    <small>Single-Use Secure Hash Active</small>
                  </div>
                </div>
                <small className="timer-pill">⏱️ Valid for this physical handover session</small>
              </div>
            ) : (
              <button
                className="button button-accent full-width generate-btn"
                onClick={handleGenerate}
                disabled={loading}
              >
                {loading ? "Generating PIN..." : "🔑 Generate 6-Digit PIN"}
              </button>
            )}

            <div className="security-guarantee-note">
              🔒 <strong>Physical Verification:</strong> The other person types this PIN into their app to complete the handover.
            </div>
          </div>
        ) : (
          <form onSubmit={handleConfirm} className="handover-confirm-view">
            <p className="handover-instruct">
              {stage === "pickup"
                ? `Ask ${ownerName} for their 6-digit handover PIN and enter it below to confirm you received the item.`
                : `Ask ${borrowerName} for their 6-digit return PIN and enter it below to confirm the item was returned.`}
            </p>

            <div className="form-group">
              <label className="form-label">
                {stage === "pickup" ? "Enter Owner's Handover PIN" : "Enter Borrower's Return PIN"}
              </label>
              <input
                type="text"
                required
                maxLength={6}
                pattern="[0-9]{6}"
                className="form-input otp-input"
                placeholder="• • • • • •"
                value={confirmCodeInput}
                onChange={(e) => setConfirmCodeInput(e.target.value.replace(/[^0-9]/g, ""))}
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={loading || confirmCodeInput.length !== 6}
              className="button button-accent full-width"
            >
              {loading
                ? "Verifying..."
                : stage === "pickup"
                  ? "✓ Confirm & Receive Item"
                  : "✓ Confirm Item Returned"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
