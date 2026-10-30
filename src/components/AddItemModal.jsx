import React, { useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { createItem } from "../services/api";
import { supabase } from "../supabase";

const SAMPLE_IMAGES = [
  "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1532012164546-f432f2e3777a?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=800&q=80",
];

// Helper to compress an image file client-side using canvas
function compressImage(file, maxWidth = 1200, quality = 0.85) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxWidth) {
            width = Math.round((width * maxWidth) / height);
            height = maxWidth;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = () => resolve(event.target.result);
    };
    reader.onerror = () => resolve(null);
  });
}

export default function AddItemModal({ onClose, onSuccess, onNotifyToast }) {
  const { user, profile } = useAuth();
  const fileInputRef = useRef(null);

  const [name, setName] = useState("");
  const [category, setCategory] = useState("Tools");
  const [type, setType] = useState("Borrow");
  const [description, setDescription] = useState("");
  const [area, setArea] = useState(profile?.area || "Saraswathipuram, Mysuru");
  const [image, setImage] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [contactPref, setContactPref] = useState("in_app_only");
  const [submitting, setSubmitting] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);

  // Handle direct gallery / device storage image upload
  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      // 1. Compress image client-side to fast web-ready data URL
      const compressedDataUrl = await compressImage(file, 1200, 0.85);
      if (compressedDataUrl) {
        setImagePreview(compressedDataUrl);
        setImage(compressedDataUrl); // Default fallback to compressed data URL
      }

      // 2. Attempt upload to Supabase storage 'item-images' bucket
      const fileExt = file.name.split(".").pop() || "jpg";
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `items/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("item-images")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (!uploadError && uploadData) {
        const { data: publicUrlData } = supabase.storage
          .from("item-images")
          .getPublicUrl(filePath);

        if (publicUrlData?.publicUrl) {
          setImage(publicUrlData.publicUrl);
        }
      }
    } catch (err) {
      console.warn("Storage upload note (using local preview):", err);
    } finally {
      setUploadingImage(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const finalImage = image || imagePreview || SAMPLE_IMAGES[0];

      const newItem = {
        name: name.trim(),
        category,
        type,
        description: description.trim(),
        area: area.trim(),
        image: finalImage,
        owner: profile?.full_name || user?.user_metadata?.full_name || "Neighbor",
        user_id: user?.id || null,
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
          {/* Gallery / Camera Photo Upload Box */}
          <div className="form-group photo-upload-group">
            <label className="form-label">Item Photo *</label>

            {imagePreview || image ? (
              <div className="photo-preview-wrap">
                <img
                  src={imagePreview || image}
                  alt="Item preview"
                  className="photo-preview-img"
                />
                <div className="photo-preview-actions">
                  <button
                    type="button"
                    className="button button-light btn-small"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage}
                  >
                    {uploadingImage ? "Processing..." : "📸 Change Photo"}
                  </button>
                  <button
                    type="button"
                    className="button button-light btn-small text-danger"
                    onClick={() => {
                      setImagePreview("");
                      setImage("");
                    }}
                  >
                    ✕ Remove
                  </button>
                </div>
              </div>
            ) : (
              <div
                className="photo-upload-dropzone"
                onClick={() => fileInputRef.current?.click()}
              >
                <span className="upload-camera-icon">📸</span>
                <strong>Choose Photo from Gallery / Device Storage</strong>
                <small>Tap to choose from camera, gallery, or local files</small>
                <button
                  type="button"
                  className="button button-dark btn-small upload-btn-pill"
                >
                  {uploadingImage ? "Processing..." : "+ Choose from Gallery"}
                </button>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />

            <div className="photo-alt-toggle">
              <button
                type="button"
                className="text-action-link"
                onClick={() => setShowUrlInput(!showUrlInput)}
              >
                {showUrlInput ? "Hide URL & sample options" : "Or paste image URL / pick sample"}
              </button>
            </div>

            {showUrlInput && (
              <div className="sample-url-drawer">
                <input
                  type="url"
                  className="form-input"
                  value={image}
                  onChange={(e) => {
                    setImage(e.target.value);
                    setImagePreview(e.target.value);
                  }}
                  placeholder="Paste direct image link https://..."
                />
                <div className="sample-thumbnails">
                  {SAMPLE_IMAGES.map((imgUrl, i) => (
                    <button
                      type="button"
                      key={i}
                      className={`thumb-btn ${image === imgUrl ? "selected" : ""}`}
                      onClick={() => {
                        setImage(imgUrl);
                        setImagePreview(imgUrl);
                      }}
                    >
                      <img src={imgUrl} alt={`Sample ${i}`} />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

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
            disabled={submitting || uploadingImage}
            className="button button-accent full-width"
          >
            {submitting ? "Publishing Listing..." : "Publish Item to Community Shelf"}
          </button>
        </form>
      </div>
    </div>
  );
}
