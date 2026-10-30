import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Navbar({
  activeTab,
  setActiveTab,
  onOpenAuth,
  onOpenNotifications,
  unreadCount = 0,
  onOpenAddItem,
  userLocation,
}) {
  const { user, profile, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileDropdown, setProfileDropdown] = useState(false);

  return (
    <header className="site-header">
      <div className="header-inner">
        <a
          href="#home"
          className="brand"
          onClick={(e) => {
            e.preventDefault();
            setActiveTab("marketplace");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        >
          <div className="brand-icon">🌱</div>
          <div className="brand-text">
            <span className="brand-name">LifeLink</span>
            <span className="brand-sub">Good Things, Shared</span>
          </div>
        </a>

        <div className="location-pill" title="Your neighborhood radius">
          <span className="live-dot" />
          <span>{userLocation?.area || "Mysuru"}</span>
          <span className="distance-badge">~3.5 km</span>
        </div>

        <nav className={`header-nav ${menuOpen ? "open" : ""}`}>
          <button
            className={`nav-link ${activeTab === "marketplace" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("marketplace");
              setMenuOpen(false);
            }}
          >
            Marketplace
          </button>
          <button
            className={`nav-link ${activeTab === "urgent" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("urgent");
              setMenuOpen(false);
            }}
          >
            Need It Now
            <span className="pulse-dot" />
          </button>
          <button
            className={`nav-link ${activeTab === "blood" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("blood");
              setMenuOpen(false);
            }}
          >
            Blood Network
          </button>
          <button
            className={`nav-link ${activeTab === "lostfound" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("lostfound");
              setMenuOpen(false);
            }}
          >
            Lost & Found
          </button>
        </nav>

        <div className="header-actions">
          <button
            className="button button-accent add-item-btn"
            onClick={onOpenAddItem}
          >
            <span>+</span> Share Item
          </button>

          {user && (
            <button
              className="icon-button notification-bell"
              onClick={onOpenNotifications}
              aria-label="Notifications"
            >
              🔔
              {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
            </button>
          )}

          {user ? (
            <div className="user-profile-menu">
              <button
                className="user-pill"
                onClick={() => setProfileDropdown(!profileDropdown)}
              >
                <span className="user-avatar-small">
                  {(profile?.full_name || user.email || "U").charAt(0).toUpperCase()}
                </span>
                <span className="user-name-truncated">
                  {profile?.full_name || user.email?.split("@")[0]}
                </span>
                <span className="dropdown-arrow">▾</span>
              </button>

              {profileDropdown && (
                <div className="profile-dropdown-menu">
                  <div className="dropdown-user-header">
                    <strong>{profile?.full_name || "Neighbor"}</strong>
                    <small>{user.email}</small>
                    <span className="reputation-badge">⭐ {profile?.reputation_score || "5.0"} Community Score</span>
                  </div>
                  <hr />
                  <button
                    className="dropdown-item"
                    onClick={() => {
                      setProfileDropdown(false);
                      onOpenNotifications();
                    }}
                  >
                    📦 My Borrow Requests
                  </button>
                  <button
                    className="dropdown-item text-danger"
                    onClick={() => {
                      setProfileDropdown(false);
                      signOut();
                    }}
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button className="button button-light sign-in-btn" onClick={onOpenAuth}>
              Sign In
            </button>
          )}

          <button
            className="mobile-menu-toggle"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle navigation"
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>
    </header>
  );
}
