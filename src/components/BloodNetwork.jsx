import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { createDonor } from "../services/api";

export default function BloodNetwork({ donors = [], onRefresh, onNotifyToast }) {
  const { user, profile } = useAuth();
  const [selectedGroup, setSelectedGroup] = useState("all");
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(null); // donor to request

  // Register form state
  const [name, setName] = useState(profile?.full_name || "");
  const [group, setGroup] = useState("O+");
  const [area, setArea] = useState(profile?.area || "Belagavi");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [contactPref, setContactPref] = useState("in_app_only");
  const [submitting, setSubmitting] = useState(false);

  // Request form state
  const [patientHospital, setPatientHospital] = useState("");
  const [unitsNeeded, setUnitsNeeded] = useState("1");
  const [urgency, setUrgency] = useState("urgent");

  const BLOOD_GROUPS = ["all", "O+", "A+", "B+", "AB+", "O-", "A-", "B-", "AB-"];

  const filteredDonors = donors.filter((d) => {
    if (selectedGroup !== "all" && d.group !== selectedGroup) return false;
    return true;
  });

  async function handleRegister(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createDonor({
        name,
        group,
        area,
        phone,
        contact_preference: contactPref,
        available: true,
        last_donated: "Ready to donate",
        verified: false,
        user_id: user?.id || null,
      });

      setShowRegisterModal(false);
      onNotifyToast && onNotifyToast("You are registered as a life-saving blood donor! Thank you.");
      onRefresh && onRefresh();
    } catch (err) {
      console.error("Donor registration error:", err);
      alert(err.message || "Failed to register as donor.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleSendBloodRequest(e) {
    e.preventDefault();
    onNotifyToast &&
      onNotifyToast(
        `Emergency blood request sent to ${showRequestModal?.name || "donor"} for ${patientHospital}!`
      );
    setShowRequestModal(null);
  }

  return (
    <section className="blood-network-section" id="blood">
      <div className="section-container">
        {/* Banner with Liquid Fluid Visuals */}
        <div className="liquid-glass-hero">
          <div className="liquid-badge">
            <span className="blood-drop">🩸</span>
            <span>LIFELINK FLUID NETWORK</span>
          </div>
          <h2 className="liquid-title">Emergency Blood Donor Registry</h2>
          <p className="liquid-desc">
            Direct peer-to-peer blood donation network in Belagavi. Every donor is verified,
            and your personal phone number remains private according to your preference.
          </p>

          <div className="liquid-actions">
            <button
              className="button button-blood-register"
              onClick={() => setShowRegisterModal(true)}
            >
              + Register as Blood Donor
            </button>
          </div>
        </div>

        {/* Blood Group Filter Chips */}
        <div className="blood-group-bar">
          <span className="filter-title">Filter by Group:</span>
          <div className="group-chips">
            {BLOOD_GROUPS.map((g) => (
              <button
                key={g}
                className={`blood-chip ${selectedGroup === g ? "active" : ""}`}
                onClick={() => setSelectedGroup(g)}
              >
                {g === "all" ? "All Groups" : g}
              </button>
            ))}
          </div>
        </div>

        {/* Donors Grid */}
        <div className="donors-grid">
          {filteredDonors.map((donor) => (
            <article key={donor.id} className="donor-card">
              <div className="donor-card-header">
                <div className="blood-group-circle">{donor.group}</div>
                <div className="donor-meta-block">
                  <h3 className="donor-name">
                    {donor.name}
                    {donor.verified && <span className="verified-check" title="Verified Donor">✓</span>}
                  </h3>
                  <span className="donor-location">📍 {donor.area}</span>
                </div>
              </div>

              <div className="donor-status-row">
                <span className="donor-availability">
                  <span className="avail-dot" />
                  {donor.last_donated || "Ready to donate"}
                </span>
                <span className="donor-pref-badge">
                  {donor.contact_preference === "call_and_whatsapp"
                    ? "📞 Direct Contact"
                    : donor.contact_preference === "whatsapp_only"
                    ? "💬 WhatsApp"
                    : "🛡️ In-App Request"}
                </span>
              </div>

              <button
                className="button button-blood-request"
                onClick={() => setShowRequestModal(donor)}
              >
                Request Donation
              </button>
            </article>
          ))}
        </div>

        {/* Register Modal */}
        {showRegisterModal && (
          <div
            className="modal-overlay"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) setShowRegisterModal(false);
            }}
          >
            <div className="modal-sheet" role="dialog" aria-modal="true">
              <button
                className="modal-close-button"
                onClick={() => setShowRegisterModal(false)}
                aria-label="Close"
              >
                ✕
              </button>

              <div className="modal-header">
                <span className="eyebrow-tag">SAVE A LIFE</span>
                <h2 className="modal-title">Join as a Blood Donor</h2>
                <p className="modal-subtitle">
                  Choose your privacy setting to control how neighbors can reach you.
                </p>
              </div>

              <form onSubmit={handleRegister} className="donor-form">
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Aarav Sharma"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Blood Group *</label>
                    <select
                      className="form-select"
                      value={group}
                      onChange={(e) => setGroup(e.target.value)}
                    >
                      {BLOOD_GROUPS.filter((g) => g !== "all").map((g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Neighborhood / Area *</label>
                    <input
                      type="text"
                      required
                      className="form-input"
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                      placeholder="e.g. Tilakwadi, Belagavi"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Phone Number (Protected) *</label>
                  <input
                    type="tel"
                    required
                    className="form-input"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
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
                      💬 WhatsApp Only (Permit WhatsApp notification)
                    </option>
                    <option value="call_and_whatsapp">
                      📞 Public Call and WhatsApp (Direct emergencies)
                    </option>
                  </select>
                  <small className="field-hint">
                    "In-App Request Only" guarantees your phone is never shown to public visitors.
                  </small>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="button button-blood-register full-width"
                >
                  {submitting ? "Registering..." : "Confirm Blood Donor Registration"}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Emergency Request Modal */}
        {showRequestModal && (
          <div
            className="modal-overlay"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) setShowRequestModal(null);
            }}
          >
            <div className="modal-sheet" role="dialog" aria-modal="true">
              <button
                className="modal-close-button"
                onClick={() => setShowRequestModal(null)}
                aria-label="Close"
              >
                ✕
              </button>

              <div className="modal-header">
                <span className="eyebrow-tag emergency-tag">EMERGENCY BLOOD REQUEST</span>
                <h2 className="modal-title">Request {showRequestModal.group} Blood</h2>
                <p className="modal-subtitle">
                  Sending request to: <strong>{showRequestModal.name}</strong> ({showRequestModal.area})
                </p>
              </div>

              <form onSubmit={handleSendBloodRequest} className="donor-form">
                <div className="form-group">
                  <label className="form-label">Hospital / Blood Bank Name *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="e.g. Apollo BGS Hospital, Kuvempunagar"
                    value={patientHospital}
                    onChange={(e) => setPatientHospital(e.target.value)}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Units Needed</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      className="form-input"
                      value={unitsNeeded}
                      onChange={(e) => setUnitsNeeded(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Urgency</label>
                    <select
                      className="form-select"
                      value={urgency}
                      onChange={(e) => setUrgency(e.target.value)}
                    >
                      <option value="immediate">Immediate Emergency</option>
                      <option value="within_6h">Within 6 Hours</option>
                      <option value="within_24h">Scheduled Surgery</option>
                    </select>
                  </div>
                </div>

                <div className="privacy-guarantee-note">
                  🔒 <strong>Verified Notification:</strong> This alert will be sent immediately to {showRequestModal.name}.
                </div>

                <button type="submit" className="button button-blood-request full-width">
                  Send Blood Donation Request
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
