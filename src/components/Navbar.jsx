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
  const [profileDropdown, setProfileDropdown] = useState(false);

  return (
    <header className="topbar">
      <a
        href="#home"
        className="brand"
        aria-label="LifeLink home"
        onClick={(e) => {
          e.preventDefault();
          setActiveTab("marketplace");
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      >
        <span className="brand-symbol">L</span>
        <span>
          LifeLink
          <small>GOOD THINGS, SHARED</small>
        </span>
      </a>

      <nav className="main-nav" aria-label="Main navigation">
        <a
          href="#marketplace"
          className={activeTab === "marketplace" ? "active-nav" : ""}
          onClick={(e) => {
            e.preventDefault();
            setActiveTab("marketplace");
          }}
        >
          Marketplace
        </a>
        <a
          href="#rentals"
          className={activeTab === "rentals" ? "active-nav" : ""}
          onClick={(e) => {
            e.preventDefault();
            setActiveTab("rentals");
          }}
        >
          Paid Rentals
        </a>
        <a
          href="#urgent"
          className={activeTab === "urgent" ? "active-nav" : ""}
          onClick={(e) => {
            e.preventDefault();
            setActiveTab("urgent");
          }}
        >
          Need It Now
        </a>
        <a
          href="#blood"
          className={activeTab === "blood" ? "active-nav" : ""}
          onClick={(e) => {
            e.preventDefault();
            setActiveTab("blood");
          }}
        >
          Blood Network
        </a>
        <a
          href="#lostfound"
          className={activeTab === "lostfound" ? "active-nav" : ""}
          onClick={(e) => {
            e.preventDefault();
            setActiveTab("lostfound");
          }}
        >
          Lost & Found
        </a>
        <a
          href="#myborrows"
          className={activeTab === "myborrows" ? "active-nav" : ""}
          onClick={(e) => {
            e.preventDefault();
            setActiveTab("myborrows");
          }}
        >
          My Borrows
        </a>
      </nav>

      <div className="header-actions">
        <a
          href="mailto:mallapurlaxman2@gmail.com?subject=Paid%20Web%20%2F%20App%20Development%20Project%20Inquiry%20-%20Laxman%20S%20M"
          className="nav-founder-pill"
          title="Hire Laxman S M for Paid Web & Mobile App Development"
        >
          <img
            src="/laxman-sm-logo.png"
            alt="Laxman S M"
            className="nav-founder-img"
          />
          <span className="nav-founder-text">
            <strong>Laxman S M</strong>
            <small>Hire Dev</small>
          </span>
        </a>

        <button
          className="button button-dark nav-button"
          onClick={onOpenAddItem}
        >
          <span>＋</span> Share an item
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
                  <span className="reputation-badge">⭐ {profile?.reputation_score || "5.0"} Score</span>
                </div>
                <hr />
                <button
                  className="dropdown-item"
                  onClick={() => {
                    setProfileDropdown(false);
                    setActiveTab("myborrows");
                  }}
                >
                  📦 My Borrows & Lent Items
                </button>
                <a
                  href="mailto:mallapurlaxman2@gmail.com?subject=Paid%20Web%20%2F%20App%20Development%20Inquiry%20-%20Laxman%20S%20M"
                  className="dropdown-item"
                  style={{ display: "flex", alignItems: "center", gap: "8px", color: "#0d9488", textDecoration: "none" }}
                  onClick={() => setProfileDropdown(false)}
                >
                  <img src="/laxman-sm-logo.png" alt="Laxman S M" style={{ width: "22px", height: "22px", borderRadius: "4px" }} />
                  <div>
                    <strong style={{ fontSize: "0.85rem" }}>Hire Founder (Laxman S M)</strong>
                    <small style={{ display: "block", color: "#64748b", fontSize: "0.72rem" }}>Paid Web & App Dev</small>
                  </div>
                </a>
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
          <button
            className="button button-light nav-button"
            onClick={onOpenAuth}
          >
            Sign In
          </button>
        )}
      </div>
    </header>
  );
}
