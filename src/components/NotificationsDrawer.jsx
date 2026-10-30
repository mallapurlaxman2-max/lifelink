import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  getUserRequests,
  getOwnerIncomingRequests,
  approveRequest,
  rejectRequest,
  getNotifications,
  markNotificationRead,
} from "../services/api";

export default function NotificationsDrawer({
  isOpen,
  onClose,
  onOpenHandover,
}) {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState("incoming"); // 'incoming', 'my_requests', 'alerts'
  const [incoming, setIncoming] = useState(() => {
    try {
      const c = localStorage.getItem("lifelink_cached_incoming");
      if (c) return JSON.parse(c);
    } catch (e) {}
    return [];
  });
  const [myRequests, setMyRequests] = useState(() => {
    try {
      const c = localStorage.getItem("lifelink_cached_myrequests");
      if (c) return JSON.parse(c);
    } catch (e) {}
    return [];
  });
  const [alerts, setAlerts] = useState(() => {
    try {
      const c = localStorage.getItem("lifelink_cached_alerts");
      if (c) return JSON.parse(c);
    } catch (e) {}
    return [];
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && user?.id) {
      loadData();
    }
  }, [isOpen, user]);

  async function loadData() {
    if (incoming.length === 0 && myRequests.length === 0 && alerts.length === 0) {
      setLoading(true);
    }
    try {
      const [inc, myReq, ntf] = await Promise.all([
        getOwnerIncomingRequests(user.id, profile?.full_name),
        getUserRequests(user.id),
        getNotifications(user.id),
      ]);
      const incList = inc || [];
      const reqList = myReq || [];
      const ntfList = ntf || [];
      setIncoming(incList);
      setMyRequests(reqList);
      setAlerts(ntfList);
      try {
        localStorage.setItem("lifelink_cached_incoming", JSON.stringify(incList));
        localStorage.setItem("lifelink_cached_myrequests", JSON.stringify(reqList));
        localStorage.setItem("lifelink_cached_alerts", JSON.stringify(ntfList));
      } catch (e) {}
    } catch (err) {
      console.warn("Could not load drawer data:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(reqId) {
    try {
      // Optimistic instant UI update
      setIncoming((prev) =>
        prev.map((r) => (r.id === reqId ? { ...r, status: "approved" } : r))
      );
      await approveRequest(reqId);
      loadData();
    } catch (err) {
      console.error("Approval error:", err);
      alert(err.message || "Approval failed.");
      loadData();
    }
  }

  async function handleReject(reqId) {
    try {
      // Optimistic instant UI update
      setIncoming((prev) =>
        prev.map((r) => (r.id === reqId ? { ...r, status: "rejected" } : r))
      );
      await rejectRequest(reqId);
      loadData();
    } catch (err) {
      console.error("Rejection error:", err);
      alert(err.message || "Rejection failed.");
      loadData();
    }
  }

  if (!isOpen) return null;

  return (
    <div
      className="drawer-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <aside className="drawer-panel" role="dialog" aria-modal="true">
        <div className="drawer-header">
          <div>
            <h2 className="drawer-title">Community Activity</h2>
            <p className="drawer-subtitle">Manage borrow requests and handovers</p>
          </div>
          <button className="modal-close-button" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="drawer-tabs">
          <button
            className={`drawer-tab ${activeTab === "incoming" ? "active" : ""}`}
            onClick={() => setActiveTab("incoming")}
          >
            Lent by Me ({incoming.length})
          </button>
          <button
            className={`drawer-tab ${activeTab === "my_requests" ? "active" : ""}`}
            onClick={() => setActiveTab("my_requests")}
          >
            Borrowed by Me ({myRequests.length})
          </button>
          <button
            className={`drawer-tab ${activeTab === "alerts" ? "active" : ""}`}
            onClick={() => setActiveTab("alerts")}
          >
            Alerts ({alerts.length})
          </button>
        </div>

        <div className="drawer-body">
          {loading ? (
            <div className="drawer-loader">Loading activity...</div>
          ) : activeTab === "incoming" ? (
            incoming.length === 0 ? (
              <div className="drawer-empty">
                <span>📬</span>
                <p>No incoming borrow requests for your items yet.</p>
              </div>
            ) : (
              <div className="drawer-list">
                {incoming.map((req) => (
                  <div key={req.id} className="request-card">
                    <div className="request-card-header">
                      <strong>{req.items?.name || "Item"}</strong>
                      <span className={`status-chip chip-${req.status}`}>{req.status}</span>
                    </div>
                    {req.borrower_name && <p className="request-dates">👤 Requested by: <strong>{req.borrower_name}</strong></p>}
                    <p className="request-dates">📅 Dates: {req.requested_dates || (req.start_date && req.return_date ? `${req.start_date} to ${req.return_date}` : "Flexible")}</p>
                    {(req.borrower_note || req.note) && <p className="request-note">"{req.borrower_note || req.note}"</p>}

                    <div className="request-actions">
                      {req.status === "pending" && (
                        <>
                          <button
                            className="button button-accent btn-small"
                            onClick={() => handleApprove(req.id)}
                          >
                            ✓ Approve
                          </button>
                          <button
                            className="button button-light btn-small"
                            onClick={() => handleReject(req.id)}
                          >
                            ✕ Decline
                          </button>
                        </>
                      )}
                      {req.status === "approved" && (
                        <div className="active-borrow-notice">
                          <span className="borrow-badge-status lent">✓ Approved · Ready for Pickup</span>
                          <p className="return-deadline">Show your 6-digit handover PIN to {req.borrower_name || "the borrower"} when handing over the item.</p>
                          <button
                            className="button button-accent btn-small full-width"
                            onClick={() => {
                              onClose();
                              onOpenHandover && onOpenHandover({ ...req, stage: "pickup" });
                            }}
                          >
                            📱 Show Handover PIN (Owner)
                          </button>
                        </div>
                      )}
                      {req.status === "borrowed" && (
                        <div className="active-borrow-notice">
                          <span className="borrow-badge-status lent">🟢 Currently Lent Out</span>
                          <p className="return-deadline">
                            Borrower: <strong>{req.borrower_name || "Neighbor"}</strong> · Return by: <strong>{req.return_date || req.requested_dates || "On schedule"}</strong>
                          </p>
                          <button
                            className="button button-accent btn-small full-width"
                            onClick={() => {
                              onClose();
                              onOpenHandover && onOpenHandover({ ...req, stage: "return" });
                            }}
                          >
                            📥 Take Back Item (Enter Return PIN)
                          </button>
                        </div>
                      )}
                      {req.status === "returned" && (
                        <div className="active-borrow-notice">
                          <span className="borrow-badge-status chip-returned">✓ Successfully Returned & Back on Shelf</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : activeTab === "my_requests" ? (
            myRequests.length === 0 ? (
              <div className="drawer-empty">
                <span>📦</span>
                <p>You haven't requested to borrow any items yet.</p>
              </div>
            ) : (
              <div className="drawer-list">
                {myRequests.map((req) => (
                  <div key={req.id} className="request-card">
                    <div className="request-card-header">
                      <strong>{req.items?.name || "Item"}</strong>
                      <span className={`status-chip chip-${req.status}`}>{req.status}</span>
                    </div>
                    <p className="request-dates">Owner: {req.items?.owner || "Neighbor"}</p>
                    <p className="request-dates">📅 Duration: {req.requested_dates || (req.start_date && req.return_date ? `${req.start_date} to ${req.return_date}` : "Flexible")}</p>
                    {(req.borrower_note || req.note) && <p className="request-note">"{req.borrower_note || req.note}"</p>}

                    <div className="request-actions">
                      {req.status === "pending" && (
                        <div className="active-borrow-notice">
                          <span className="borrow-badge-status pending">⏳ Awaiting Owner Approval</span>
                          <p className="return-deadline">We'll alert you as soon as {req.items?.owner || "owner"} approves your request.</p>
                        </div>
                      )}
                      {req.status === "approved" && (
                        <div className="active-borrow-notice">
                          <span className="borrow-badge-status approved">🎉 Request Approved!</span>
                          <p className="return-deadline">Meet {req.items?.owner || "owner"} and enter their 6-digit PIN to confirm pickup.</p>
                          <button
                            className="button button-accent btn-small full-width"
                            onClick={() => {
                              onClose();
                              onOpenHandover && onOpenHandover({ ...req, stage: "pickup" });
                            }}
                          >
                            📱 Confirm Pickup (Enter PIN)
                          </button>
                        </div>
                      )}
                      {req.status === "borrowed" && (
                        <div className="active-borrow-notice">
                          <span className="borrow-badge-status borrowed">📦 In Your Possession (Active Borrow)</span>
                          <p className="return-deadline">
                            Owner: <strong>{req.items?.owner || "Neighbor"}</strong> · Return by: <strong>{req.return_date || req.requested_dates || "On schedule"}</strong>
                          </p>
                          <button
                            className="button button-accent btn-small full-width"
                            onClick={() => {
                              onClose();
                              onOpenHandover && onOpenHandover({ ...req, stage: "return" });
                            }}
                          >
                            🔄 Return Item (Show Return PIN)
                          </button>
                        </div>
                      )}
                      {req.status === "returned" && (
                        <div className="active-borrow-notice">
                          <span className="borrow-badge-status chip-returned">✓ Returned to {req.items?.owner || "Owner"} · Thank you!</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            alerts.length === 0 ? (
              <div className="drawer-empty">
                <span>🔔</span>
                <p>No new notification alerts.</p>
              </div>
            ) : (
              <div className="drawer-list">
                {alerts.map((alt) => (
                  <div
                    key={alt.id}
                    className={`alert-card ${alt.is_read ? "read" : "unread"}`}
                    onClick={() => markNotificationRead(alt.id)}
                  >
                    <strong>{alt.title}</strong>
                    <p>{alt.message}</p>
                    <small>{new Date(alt.created_at).toLocaleString()}</small>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </aside>
    </div>
  );
}
