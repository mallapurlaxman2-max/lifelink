import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { createUrgentNeed } from "../services/api";

export default function NeedItNow({ needs = [], onRefresh, onNotifyToast }) {
  const { user, profile } = useAuth();
  const [showPostModal, setShowPostModal] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Medical");
  const [urgency, setUrgency] = useState("urgent");
  const [description, setDescription] = useState("");
  const [area, setArea] = useState(profile?.area || "Tilakwadi, Belagavi");
  const [submitting, setSubmitting] = useState(false);

  const CATEGORIES = ["all", "Medical", "Tools", "Vehicle", "Home", "Others"];

  const filteredNeeds = needs.filter((item) => {
    if (activeCategory !== "all" && item.category?.toLowerCase() !== activeCategory.toLowerCase()) {
      return false;
    }
    return true;
  });

  async function handleCreateNeed(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createUrgentNeed({
        title,
        item_name: title,
        category,
        urgency,
        description,
        area,
        requester_name: profile?.full_name || user?.email?.split("@")[0] || "Neighbor",
        requester_id: user?.id || null,
        status: "open",
      });

      setShowPostModal(false);
      setTitle("");
      setDescription("");
      onNotifyToast && onNotifyToast("Your urgent request was posted to neighbors!");
      onRefresh && onRefresh();
    } catch (err) {
      console.error("Error posting urgent need:", err);
      alert(err.message || "Failed to post urgent need.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleOfferHelp(need) {
    onNotifyToast && onNotifyToast(`Offer of help sent to ${need.requester_name || "the neighbor"}!`);
  }

  return (
    <section className="urgent-needs-section" id="urgent">
      <div className="section-container">
        <div className="section-header-row">
          <div>
            <div className="urgent-live-badge">
              <span className="pulsing-red-dot" />
              <span>COMMUNITY RADAR</span>
            </div>
            <h2 className="section-heading">Need It Now</h2>
            <p className="section-subtext">
              Urgent neighborhood requests for tools, medical aids, and quick help.
            </p>
          </div>

          <button
            className="button button-urgent-accent"
            onClick={() => setShowPostModal(true)}
          >
            🚨 Post an Urgent Need
          </button>
        </div>

        {/* Filter Chips */}
        <div className="category-filter-bar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`filter-pill ${activeCategory === cat ? "active" : ""}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat === "all" ? "All Needs" : cat}
            </button>
          ))}
        </div>

        {/* Urgent Needs Grid */}
        <div className="urgent-cards-grid">
          {filteredNeeds.map((need) => (
            <article key={need.id} className="urgent-card">
              <div className="urgent-card-top">
                <span className={`urgency-tag ${need.urgency?.toLowerCase()}`}>
                  {need.urgency?.toUpperCase() || "URGENT"}
                </span>
                <span className="urgent-area">📍 {need.area}</span>
              </div>

              <h3 className="urgent-card-title">{need.title || need.item_name}</h3>
              <p className="urgent-card-desc">{need.description}</p>

              <div className="urgent-card-footer">
                <div className="requester-info">
                  <span className="requester-avatar">
                    {(need.requester_name || "N").charAt(0).toUpperCase()}
                  </span>
                  <div>
                    <span className="requester-name">{need.requester_name || "Neighbor"}</span>
                    <small className="requester-shield">🛡️ Protected Contact</small>
                  </div>
                </div>

                <button
                  className="button button-help"
                  onClick={() => handleOfferHelp(need)}
                >
                  🤝 I Can Help
                </button>
              </div>
            </article>
          ))}
        </div>

        {/* Post Urgent Need Modal */}
        {showPostModal && (
          <div
            className="modal-overlay"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) setShowPostModal(false);
            }}
          >
            <div className="modal-sheet" role="dialog" aria-modal="true">
              <button
                className="modal-close-button"
                onClick={() => setShowPostModal(false)}
                aria-label="Close"
              >
                ✕
              </button>

              <div className="modal-header">
                <span className="eyebrow-tag">COMMUNITY ASSISTANCE</span>
                <h2 className="modal-title">Broadcast an Urgent Need</h2>
                <p className="modal-subtitle">
                  Neighbors in your radius will be alerted immediately.
                </p>
              </div>

              <form onSubmit={handleCreateNeed} className="urgent-form">
                <div className="form-group">
                  <label className="form-label">What do you urgently need? *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="e.g. Adult crutches for 1 week, Car battery jumper"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select
                      className="form-select"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      <option value="Medical">Medical / Health</option>
                      <option value="Tools">Tools / Repairs</option>
                      <option value="Vehicle">Vehicle / Emergency</option>
                      <option value="Home">Home & Care</option>
                      <option value="Others">Others</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Urgency Level</label>
                    <select
                      className="form-select"
                      value={urgency}
                      onChange={(e) => setUrgency(e.target.value)}
                    >
                      <option value="urgent">Urgent (Within 24h)</option>
                      <option value="critical">Critical (Immediate)</option>
                      <option value="normal">Normal (Within 2-3 days)</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Neighborhood / Area *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="e.g. Tilakwadi, Belagavi"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Details / Timeframe</label>
                  <textarea
                    rows="3"
                    className="form-textarea"
                    placeholder="Describe the situation and where/when you can receive it..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="privacy-guarantee-note">
                  🔒 <strong>Privacy Guard:</strong> Your phone number is not posted publicly. Responding neighbors will send an in-app ping to connect safely.
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="button button-urgent-accent full-width"
                >
                  {submitting ? "Broadcasting..." : "Broadcast Urgent Request"}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
