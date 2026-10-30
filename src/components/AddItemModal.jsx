import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { createItem } from "../services/api";

const SAMPLE_IMAGES = [
  "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1532012164546-f432f2e3777a?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=800&q=80",
];

export default function AddItemModal({ onClose, onSuccess, onNotifyToast }) {
  const { user, profile } = useAuth();

  const [name, setName] = useState("");
  const [category, setCategory] = useState("Tools");
  const [type, setType] = useState("Borrow");
  const [description, setDescription] = useState("");
  const [area, setArea] = useState(profile?.area || "Saraswathipuram, Mysuru");
  const [image, setImage] = useState(SAMPLE_IMAGES[0]);
  const [contactPref, setContactPref] = useState("in_app_only");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const newItem = {
        name: name.trim(),
        category,
        type,
        description: description.trim(),
        area: area.trim(),
        image: image || SAMPLE_IMAGES[0],
        owner: profile?.full_name || user?.user_metadata?.full_name || "Neighbor",
        owner_id: user?.id || null,
        phone: profile?.phone || user?.user_metadata?.phone || "+919876543210",
        email: user?.email || "neighbor@lifelink.local",
        price: type === "Borrow" ? "Free to borrow" : "Free donation",
        condition: "Good",
        status: "available",
        contact_preference: contactPref,
      };

      await createItem(newItem);
      onNotifyToast && onNotifyToast(`"${newItem.name}" added to community shelf!`);
      onSuccess && onSuccess(newItem);
      onClose();
    } catch (err) {
      console.error("Add item error:", err);
      alert(err.message || "Failed to add item.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="modal-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-sheet add-item-sheet" role="dialog" aria-modal="true">
        <button className="modal-close-button" onClick={onClose} aria-label="Close">
          ✕
        </button>

        <div className="modal-header">
          <span className="eyebrow-tag">COMMUNITY LISTING</span>
          <h2 className="modal-title">Share an Item with Neighbors</h2>
          <p className="modal-subtitle">
            Give unused tools, books, or gear a second life in Mysuru.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="add-form">
          <div className="form-row">
            <div className="form-group flex-2">
              <label className="form-label">Item Title *</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="e.g. Bosch Cordless Drill, Camping Tent"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="form-group flex-1">
              <label className="form-label">Sharing Type</label>
              <select
                className="form-select"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option value="Borrow">Borrow (Will be returned)</option>
                <option value="Donation">Free Donation (Keep permanently)</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                className="form-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="Tools">Tools</option>
                <option value="Study">Study & Books</option>
                <option value="Home">Home & Kitchen</option>
                <option value="Travel">Travel & Outdoors</option>
                <option value="Others">Others</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Neighborhood / Area *</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="e.g. Saraswathipuram, Mysuru"
                value={area}
                onChange={(e) => setArea(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description & Condition</label>
            <textarea
              rows="3"
              className="form-textarea"
              placeholder="Include condition, accessories included, and pickup instructions..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Image URL</label>
            <input
              type="url"
              className="form-input"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="Paste image URL or choose below"
            />
            <div className="sample-thumbnails">
              {SAMPLE_IMAGES.map((imgUrl, i) => (
                <button
                  type="button"
                  key={i}
                  className={`thumb-btn ${image === imgUrl ? "selected" : ""}`}
                  onClick={() => setImage(imgUrl)}
                >
                  <img src={imgUrl} alt={`Sample ${i}`} />
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Privacy & Contact Sharing Preference *</label>
            <select
              className="form-select"
              value={contactPref}
              onChange={(e) => setContactPref(e.target.value)}
            >
              <option value="in_app_only">
                🛡️ In-App Request Only (Most Secure — phone hidden)
              </option>
              <option value="whatsapp_only">
                💬 WhatsApp Only (Permit direct WhatsApp message)
              </option>
              <option value="call_and_whatsapp">
                📞 Public Call and WhatsApp (Direct calls)
              </option>
            </select>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="button button-accent full-width"
          >
            {submitting ? "Publishing Listing..." : "Publish Item to Community Shelf"}
          </button>
        </form>
      </div>
    </div>
  );
}
