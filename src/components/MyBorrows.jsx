import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  getUserRequests,
  getOwnerIncomingRequests,
  approveRequest,
  rejectRequest,
} from "../services/api";

export default function MyBorrows({
  onOpenHandover,
  onNotifyToast,
  onBrowseMarketplace,
  onOpenAuth,
}) {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState("borrowed"); // 'borrowed' or 'lent'
  const [myRequests, setMyRequests] = useState([]);
  const [incoming, setIncoming] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAllRequests();
  }, [user?.id, profile?.full_name]);

  async function loadAllRequests() {
    setLoading(true);
    try {
      const [mine, lent] = await Promise.all([
        getUserRequests(user?.id, profile?.full_name),
        getOwnerIncomingRequests(user?.id, profile?.full_name),
      ]);
      setMyRequests(mine || []);
      setIncoming(lent || []);
    } catch (err) {
      console.warn("Could not load borrow records:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(reqId) {
    try {
      setIncoming((prev) =>
        prev.map((r) => (r.id === reqId ? { ...r, status: "approved" } : r))
      );
      await approveRequest(reqId);
      onNotifyToast && onNotifyToast("Request approved! Handover PIN generated.");
      loadAllRequests();
    } catch (err) {
      onNotifyToast && onNotifyToast(`Approval failed: ${err.message}`);
      loadAllRequests();
    }
  }

  async function handleReject(reqId) {
    try {
      setIncoming((prev) =>
        prev.map((r) => (r.id === reqId ? { ...r, status: "rejected" } : r))
      );
      await rejectRequest(reqId);
      onNotifyToast && onNotifyToast("Request declined.");
      loadAllRequests();
    } catch (err) {
      onNotifyToast && onNotifyToast(`Decline failed: ${err.message}`);
      loadAllRequests();
    }
  }

  const activeBorrows = myRequests.filter((r) => r.status === "borrowed");
  const activeLent = incoming.filter((r) => r.status === "borrowed");

  function formatDaysRemaining(dateStr) {
    if (!dateStr) return null;
    const due = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return `⚠️ Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) === 1 ? "" : "s"}`;
    if (diffDays === 0) return "⚠️ Due Today";
    if (diffDays === 1) return "⏳ Due Tomorrow";
    return `⏱️ ${diffDays} days remaining`;
  }

  return (
    <div className="section-container" style={{ paddingTop: "24px", minHeight: "70vh" }}>
      <div className="section-header" style={{ marginBottom: "24px" }}>
        <span className="eyebrow-tag">PHYSICAL ASSET TRACKING & SECURE HANDOVER</span>
        <h1 style={{ fontSize: "2rem", fontWeight: 800, margin: "8px 0" }}>
          My Borrowed & Lent Items
        </h1>
        <p style={{ color: "#64748b", maxWidth: "680px" }}>
          Track active borrowed items, upcoming return dates, and verify physical exchanges using
          single-use pickup & return verification PINs.
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "12px", borderBottom: "1px solid #e2e8f0", paddingBottom: "12px", marginBottom: "24px" }}>
        <button
          className={`button ${activeTab === "borrowed" ? "button-accent" : "button-light"}`}
          onClick={() => setActiveTab("borrowed")}
          style={{ display: "flex", alignItems: "center", gap: "8px" }}
        >
          <span>📦 Borrowed by Me</span>
          <span style={{
            background: activeTab === "borrowed" ? "rgba(255,255,255,0.3)" : "#e2e8f0",
            padding: "2px 8px",
            borderRadius: "12px",
            fontSize: "0.8rem",
            fontWeight: 700
          }}>
            {myRequests.length}
          </span>
          {activeBorrows.length > 0 && (
            <span style={{ background: "#10b981", color: "#fff", padding: "2px 6px", borderRadius: "10px", fontSize: "0.75rem" }}>
              {activeBorrows.length} active
            </span>
          )}
        </button>

        <button
          className={`button ${activeTab === "lent" ? "button-accent" : "button-light"}`}
          onClick={() => setActiveTab("lent")}
          style={{ display: "flex", alignItems: "center", gap: "8px" }}
        >
          <span>🤝 Lent Out by Me</span>
          <span style={{
            background: activeTab === "lent" ? "rgba(255,255,255,0.3)" : "#e2e8f0",
            padding: "2px 8px",
            borderRadius: "12px",
            fontSize: "0.8rem",
            fontWeight: 700
          }}>
            {incoming.length}
          </span>
          {activeLent.length > 0 && (
            <span style={{ background: "#3b82f6", color: "#fff", padding: "2px 6px", borderRadius: "10px", fontSize: "0.75rem" }}>
              {activeLent.length} active
            </span>
          )}
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "48px 0", color: "#64748b" }}>
          <div className="loader-spinner" style={{ margin: "0 auto 16px" }} />
          Loading your borrow records & verified handovers...
        </div>
      ) : activeTab === "borrowed" ? (
        /* BORROWED BY ME VIEW */
        myRequests.length === 0 ? (
          <div className="empty-state-box" style={{ background: "#fff", padding: "48px 24px", borderRadius: "16px", textAlign: "center", border: "1px dashed #cbd5e1" }}>
            <span style={{ fontSize: "3rem" }}>📦</span>
            <h3 style={{ marginTop: "12px", fontSize: "1.25rem", color: "#1e293b" }}>No Borrowed Items Yet</h3>
            <p style={{ color: "#64748b", maxWidth: "440px", margin: "8px auto 20px" }}>
              Need a tool, laptop, camera, or study book? Browse neighbor listings in Belagavi and send a borrow request.
            </p>
            <button className="button button-accent" onClick={onBrowseMarketplace}>
              Browse Belagavi Marketplace
            </button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px" }}>
            {myRequests.map((req) => {
              const daysLeft = formatDaysRemaining(req.return_date);
              const isActive = req.status === "borrowed";
              return (
                <div
                  key={req.id}
                  style={{
                    background: "#fff",
                    borderRadius: "16px",
                    border: isActive ? "2px solid #10b981" : "1px solid #e2e8f0",
                    boxShadow: isActive ? "0 10px 25px -5px rgba(16, 185, 129, 0.15)" : "0 4px 6px -1px rgba(0,0,0,0.05)",
                    padding: "20px",
                    display: "flex",
                    flexDirection: "column",
                    position: "relative"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                    <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                      {req.items?.image ? (
                        <img
                          src={req.items.image}
                          alt={req.items.name || "Item"}
                          style={{ width: "54px", height: "54px", borderRadius: "10px", objectFit: "cover" }}
                        />
                      ) : (
                        <div style={{ width: "54px", height: "54px", borderRadius: "10px", background: "#f1f5f9", display: "grid", placeItems: "center", fontSize: "1.5rem" }}>
                          📦
                        </div>
                      )}
                      <div>
                        <h3 style={{ margin: 0, fontSize: "1.1rem", color: "#0f172a" }}>
                          {req.items?.name || "Shared Item"}
                        </h3>
                        <p style={{ margin: "2px 0 0", color: "#64748b", fontSize: "0.85rem" }}>
                          Owner: <strong>{req.items?.owner || "Neighbor"}</strong> · 📍 {req.items?.area || "Belagavi"}
                        </p>
                      </div>
                    </div>
                    <span className={`status-chip chip-${req.status}`}>
                      {req.status === "borrowed" ? "In Possession" : req.status}
                    </span>
                  </div>

                  {/* Return Deadline Box */}
                  <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "10px", marginBottom: "16px", fontSize: "0.9rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                      <span style={{ color: "#64748b" }}>📅 Returning Date:</span>
                      <strong style={{ color: "#0f172a" }}>
                        {req.return_date || req.requested_dates || "Flexible"}
                      </strong>
                    </div>
                    {daysLeft && (
                      <div style={{ fontSize: "0.8rem", fontWeight: 600, color: daysLeft.includes("Overdue") ? "#ef4444" : "#0d9488" }}>
                        {daysLeft}
                      </div>
                    )}
                    {(req.borrower_note || req.note) && (
                      <p style={{ margin: "8px 0 0", fontSize: "0.85rem", color: "#475569", fontStyle: "italic" }}>
                        "{req.borrower_note || req.note}"
                      </p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div style={{ marginTop: "auto" }}>
                    {req.status === "pending" && (
                      <div style={{ background: "#fef9c3", color: "#854d0e", padding: "10px 14px", borderRadius: "8px", fontSize: "0.85rem", textAlign: "center" }}>
                        ⏳ Awaiting approval from {req.items?.owner || "the owner"}.
                      </div>
                    )}

                    {req.status === "approved" && (
                      <button
                        className="button button-accent full-width"
                        onClick={() => onOpenHandover({ ...req, stage: "pickup" })}
                      >
                        📱 Confirm Pickup (Enter PIN)
                      </button>
                    )}

                    {req.status === "borrowed" && (
                      <div>
                        <button
                          className="button button-accent full-width"
                          style={{ background: "#10b981", borderColor: "#10b981" }}
                          onClick={() => onOpenHandover({ ...req, stage: "return" })}
                        >
                          🔄 Return Item (Show Return PIN)
                        </button>
                        <small style={{ display: "block", textAlign: "center", color: "#64748b", marginTop: "6px", fontSize: "0.75rem" }}>
                          Show PIN to {req.items?.owner || "owner"} when giving it back
                        </small>
                      </div>
                    )}

                    {req.status === "returned" && (
                      <div style={{ background: "#ecfdf5", color: "#065f46", padding: "10px 14px", borderRadius: "8px", fontSize: "0.85rem", textAlign: "center" }}>
                        ✓ Successfully returned to {req.items?.owner || "owner"}.
                      </div>
                    )}

                    {req.status === "rejected" && (
                      <div style={{ background: "#fef2f2", color: "#991b1b", padding: "10px 14px", borderRadius: "8px", fontSize: "0.85rem", textAlign: "center" }}>
                        ✕ Request was declined.
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        /* LENT OUT BY ME VIEW */
        incoming.length === 0 ? (
          <div className="empty-state-box" style={{ background: "#fff", padding: "48px 24px", borderRadius: "16px", textAlign: "center", border: "1px dashed #cbd5e1" }}>
            <span style={{ fontSize: "3rem" }}>🤝</span>
            <h3 style={{ marginTop: "12px", fontSize: "1.25rem", color: "#1e293b" }}>No Items Lent Out</h3>
            <p style={{ color: "#64748b", maxWidth: "440px", margin: "8px auto 20px" }}>
              Share extra tools, study materials, or electronics you own with trusted neighbors in Belagavi.
            </p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px" }}>
            {incoming.map((req) => {
              const daysLeft = formatDaysRemaining(req.return_date);
              const isActive = req.status === "borrowed";
              return (
                <div
                  key={req.id}
                  style={{
                    background: "#fff",
                    borderRadius: "16px",
                    border: isActive ? "2px solid #3b82f6" : "1px solid #e2e8f0",
                    boxShadow: isActive ? "0 10px 25px -5px rgba(59, 130, 246, 0.15)" : "0 4px 6px -1px rgba(0,0,0,0.05)",
                    padding: "20px",
                    display: "flex",
                    flexDirection: "column",
                    position: "relative"
                  }}
                >
                  <div style={{ display: "flex", justifySelf: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                    <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                      {req.items?.image ? (
                        <img
                          src={req.items.image}
                          alt={req.items.name || "Item"}
                          style={{ width: "54px", height: "54px", borderRadius: "10px", objectFit: "cover" }}
                        />
                      ) : (
                        <div style={{ width: "54px", height: "54px", borderRadius: "10px", background: "#f1f5f9", display: "grid", placeItems: "center", fontSize: "1.5rem" }}>
                          🤝
                        </div>
                      )}
                      <div>
                        <h3 style={{ margin: 0, fontSize: "1.1rem", color: "#0f172a" }}>
                          {req.items?.name || "Your Item"}
                        </h3>
                        <p style={{ margin: "2px 0 0", color: "#64748b", fontSize: "0.85rem" }}>
                          Borrower: <strong>{req.borrower_name || "Neighbor"}</strong>
                        </p>
                      </div>
                    </div>
                    <span className={`status-chip chip-${req.status}`}>
                      {req.status === "borrowed" ? "Lent Out" : req.status}
                    </span>
                  </div>

                  {/* Return Deadline Box */}
                  <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "10px", marginBottom: "16px", fontSize: "0.9rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                      <span style={{ color: "#64748b" }}>📅 Expected Return:</span>
                      <strong style={{ color: "#0f172a" }}>
                        {req.return_date || req.requested_dates || "Flexible"}
                      </strong>
                    </div>
                    {daysLeft && (
                      <div style={{ fontSize: "0.8rem", fontWeight: 600, color: daysLeft.includes("Overdue") ? "#ef4444" : "#2563eb" }}>
                        {daysLeft}
                      </div>
                    )}
                    {(req.borrower_note || req.note) && (
                      <p style={{ margin: "8px 0 0", fontSize: "0.85rem", color: "#475569", fontStyle: "italic" }}>
                        "{req.borrower_note || req.note}"
                      </p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div style={{ marginTop: "auto" }}>
                    {req.status === "pending" && (
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          className="button button-accent"
                          style={{ flex: 1 }}
                          onClick={() => handleApprove(req.id)}
                        >
                          ✓ Approve
                        </button>
                        <button
                          className="button button-light"
                          style={{ flex: 1 }}
                          onClick={() => handleReject(req.id)}
                        >
                          ✕ Decline
                        </button>
                      </div>
                    )}

                    {req.status === "approved" && (
                      <button
                        className="button button-accent full-width"
                        onClick={() => onOpenHandover({ ...req, stage: "pickup" })}
                      >
                        📱 Show Handover PIN (Owner)
                      </button>
                    )}

                    {req.status === "borrowed" && (
                      <div>
                        <button
                          className="button button-accent full-width"
                          style={{ background: "#2563eb", borderColor: "#2563eb" }}
                          onClick={() => onOpenHandover({ ...req, stage: "return" })}
                        >
                          📥 Take Back Item (Enter Return PIN)
                        </button>
                        <small style={{ display: "block", textAlign: "center", color: "#64748b", marginTop: "6px", fontSize: "0.75rem" }}>
                          Ask borrower for their 6-digit Return PIN to verify take back
                        </small>
                      </div>
                    )}

                    {req.status === "returned" && (
                      <div style={{ background: "#ecfdf5", color: "#065f46", padding: "10px 14px", borderRadius: "8px", fontSize: "0.85rem", textAlign: "center" }}>
                        ✓ Item back in your possession.
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}
    </div>
  );
}
