import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { createLostFound } from "../services/api";

const FALLBACK_LOST = "https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=600&q=80";

export default function LostFound({ items = [], onRefresh, onNotifyToast }) {
  const { user, profile } = useAuth();
  const [filterType, setFilterType] = useState("all");
  const [showModal, setShowModal] = useState(false);

  const [title, setTitle] = useState("");
  const [type, setType] = useState("found");
  const [category, setCategory] = useState("Keys");
  const [location, setLocation] = useState("");
  const [area, setArea] = useState(profile?.area || "Tilakwadi, Belagavi");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const filtered = items.filter((item) => {
    if (filterType !== "all" && item.type !== filterType) return false;
    return true;
  });

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createLostFound({
        title,
        type,
        category,
        location,
        area,
        description,
        image: image || FALLBACK_LOST,
        user_id: user?.id || null,
        status: "open",
      });

      setShowModal(false);
      setTitle("");
      setDescription("");
      setLocation("");
      setImage("");
      onNotifyToast && onNotifyToast("Lost & Found report submitted to the community!");
      onRefresh && onRefresh();
    } catch (err) {
      console.error("Lost & found submit error:", err);
      alert(err.message || "Failed to submit report.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleClaim(item) {
    onNotifyToast && onNotifyToast(`Claim request submitted for "${item.title}". The finder will be notified!`);
  }

  return (
    <section className="lost-found-section" id="lostfound">
      <div className="section-container">
        <div className="section-header-row">
          <div>
            <span className="eyebrow-tag">COMMUNITY RECOVERY</span>
            <h2 className="section-heading">Lost & Found Hub</h2>
            <p className="section-subtext">
              Reconnecting lost possessions with their rightful owners in Belagavi.
            </p>
          </div>

          <div className="section-header-actions">
            <div className="type-toggle-group">
              <button
                className={`type-toggle-btn ${filterType === "all" ? "active" : ""}`}
                onClick={() => setFilterType("all")}
              >
                All
              </button>
              <button
                className={`type-toggle-btn ${filterType === "lost" ? "active" : ""}`}
                onClick={() => setFilterType("lost")}
              >
                Lost
              </button>
              <button
                className={`type-toggle-btn ${filterType === "found" ? "active" : ""}`}
                onClick={() => setFilterType("found")}
              >
                Found
              </button>
            </div>

            <button
              className="button button-accent"
              onClick={() => setShowModal(true)}
            >
              + Report Lost / Found
            </button>
          </div>
        </div>

        {/* Grid */}
        <div className="lostfound-grid">
          {filtered.map((item) => (
            <article key={item.id} className="lostfound-card">
              <div className="lostfound-media">
                <img
                  src={item.image || FALLBACK_LOST}
                  alt={item.title}
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.src = FALLBACK_LOST;
                  }}
                />
                <span className={`pill-badge ${item.type === "found" ? "found-badge" : "lost-badge"}`}>
                  {item.type === "found" ? "FOUND ITEM" : "LOST ITEM"}
                </span>
              </div>

              <div className="lostfound-content">
                <span className="lostfound-loc">📍 {item.location || item.area}</span>
                <h3 className="lostfound-title">{item.title}</h3>
                <p className="lostfound-desc">{item.description}</p>

                <div className="lostfound-footer">
                  <small className="lostfound-time">🛡️ Privacy Shielded Contact</small>
                  <button
                    className="button button-light btn-small"
                    onClick={() => handleClaim(item)}
                  >
                    {item.type === "found" ? "Claim Item" : "I Found This"}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Modal */}
        {showModal && (
          <div
            className="modal-overlay"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) setShowModal(false);
            }}
          >
            <div className="modal-sheet" role="dialog" aria-modal="true">
              <button
                className="modal-close-button"
                onClick={() => setShowModal(false)}
                aria-label="Close"
              >
                ✕
              </button>

              <div className="modal-header">
                <span className="eyebrow-tag">COMMUNITY NOTICE</span>
                <h2 className="modal-title">Report a Lost or Found Item</h2>
              </div>

              <form onSubmit={handleSubmit} className="lostfound-form">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Report Type</label>
                    <select
                      className="form-select"
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                    >
                      <option value="found">I Found Something</option>
                      <option value="lost">I Lost Something</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Item Category</label>
                    <select
                      className="form-select"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      <option value="Keys">Keys</option>
                      <option value="Accessories">Watch / Jewelry / Wallet</option>
                      <option value="Electronics">Electronics / Phone</option>
                      <option value="Documents">ID / Documents / Cards</option>
                      <option value="Pets">Pets / Animals</option>
                      <option value="Others">Others</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Item Title *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="e.g. Set of 3 keys with red tag"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Specific Spot / Landmark *</label>
                    <input
                      type="text"
                      required
                      className="form-input"
                      placeholder="e.g. Kukkarahalli Lake Jogging Track"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Area / Locality *</label>
                    <input
                      type="text"
                      required
                      className="form-input"
                      placeholder="e.g. Tilakwadi, Belagavi"
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Image URL (Optional)</label>
                  <input
                    type="url"
                    className="form-input"
                    placeholder="https://..."
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Detailed Description</label>
                  <textarea
                    rows="3"
                    className="form-textarea"
                    placeholder="Distinguishing marks, color, time seen..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="button button-accent full-width"
                >
                  {submitting ? "Publishing Notice..." : "Publish Lost & Found Notice"}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
