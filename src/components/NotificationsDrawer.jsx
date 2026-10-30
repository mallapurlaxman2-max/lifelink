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
  const [incoming, setIncoming] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && user?.id) {
      loadData();
    }
  }, [isOpen, user]);

  async function loadData() {
    setLoading(true);
    try {
      const [inc, myReq, ntf] = await Promise.all([
        getOwnerIncomingRequests(user.id, profile?.full_name),
        getUserRequests(user.id),
        getNotifications(user.id),
      ]);
      setIncoming(inc || []);
      setMyRequests(myReq || []);
      setAlerts(ntf || []);
    } catch (err) {
      console.warn("Could not load drawer data:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(reqId) {
    try {
      await approveRequest(reqId);
      loadData();
    } catch (err) {
      alert(err.message || "Approval failed.");
    }
  }

  async function handleReject(reqId) {
    try {
      await rejectRequest(reqId);
      loadData();
    } catch (err) {
      alert(err.message || "Rejection failed.");
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
            Incoming ({incoming.length})
          </button>
          <button
            className={`drawer-tab ${activeTab === "my_requests" ? "active" : ""}`}
            onClick={() => setActiveTab("my_requests")}
          >
            My Requests ({myRequests.length})
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
                    <p className="request-dates">📅 Dates: {req.requested_dates}</p>
                    {req.borrower_note && <p className="request-note">"{req.borrower_note}"</p>}

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
                        <button
                          className="button button-accent btn-small"
                          onClick={() => {
                            onClose();
                            onOpenHandover && onOpenHandover(req);
                          }}
                        >
                          📱 Handover Code
                        </button>
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
                    <p className="request-dates">📅 Duration: {req.requested_dates}</p>

                    {req.status === "approved" && (
                      <div className="request-actions">
                        <button
                          className="button button-accent btn-small"
                          onClick={() => {
                            onClose();
                            onOpenHandover && onOpenHandover(req);
                          }}
                        >
                          📱 Confirm Pickup Code
                        </button>
                      </div>
                    )}
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
