import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function AuthModal({ onClose, onSuccess }) {
  const { signIn, signUp } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [area, setArea] = useState("Saraswathipuram, Mysuru");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      if (isSignUp) {
        if (!fullName.trim()) {
          setErrorMsg("Please enter your name.");
          setLoading(false);
          return;
        }
        await signUp(email, password, {
          fullName: fullName.trim(),
          phone: phone.trim(),
          area: area.trim(),
        });
        setSuccessMsg("Account created! Check your email to confirm or sign in.");
      } else {
        await signIn(email, password);
        setSuccessMsg("Welcome back!");
        setTimeout(() => {
          onSuccess && onSuccess();
          onClose();
        }, 1000);
      }
    } catch (err) {
      console.error("Auth error:", err);
      setErrorMsg(err.message || "Authentication failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="modal-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-sheet auth-sheet" role="dialog" aria-modal="true">
        <button className="modal-close-button" onClick={onClose} aria-label="Close">
          ✕
        </button>

        <div className="modal-header">
          <span className="eyebrow-tag">{isSignUp ? "JOIN THE COMMUNITY" : "WELCOME BACK"}</span>
          <h2 className="modal-title">{isSignUp ? "Create a LifeLink Account" : "Sign In to LifeLink"}</h2>
          <p className="modal-subtitle">
            {isSignUp
              ? "Share items, borrow from neighbors, and protect local resources."
              : "Access your borrow requests, items, and notifications."}
          </p>
        </div>

        {errorMsg && <div className="status-banner error">⚠️ {errorMsg}</div>}
        {successMsg && <div className="status-banner success">✓ {successMsg}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          {isSignUp && (
            <>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="e.g. Aditi Sharma"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Neighborhood / Area</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="e.g. Saraswathipuram"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                  />
                </div>
              </div>
            </>
          )}

          <div className="form-group">
            <label className="form-label">Email Address *</label>
            <input
              type="email"
              required
              className="form-input"
              placeholder="you@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password *</label>
            <input
              type="password"
              required
              minLength={6}
              className="form-input"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="button button-accent full-width"
          >
            {loading ? "Processing..." : isSignUp ? "Create My Account" : "Sign In"}
          </button>
        </form>

        <div className="auth-toggle-footer">
          {isSignUp ? (
            <p>
              Already have an account?{" "}
              <button
                type="button"
                className="text-action-link"
                onClick={() => {
                  setIsSignUp(false);
                  setErrorMsg("");
                }}
              >
                Sign In
              </button>
            </p>
          ) : (
            <p>
              New neighbor?{" "}
              <button
                type="button"
                className="text-action-link"
                onClick={() => {
                  setIsSignUp(true);
                  setErrorMsg("");
                }}
              >
                Create an account
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
