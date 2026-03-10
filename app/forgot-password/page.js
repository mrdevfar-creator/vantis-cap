// app/forgot-password/page.js
"use client";

import { useState } from "react";
import Link from "next/link";
import { auth, sendPasswordResetEmail } from "../lib/firebase";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("A reset link has been sent to your email");
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto", padding: "20px" }}>
      <h1 style={{ fontSize: "24px", marginBottom: "20px" }}>
        Forgot your password?
      </h1>

      {message && (
        <div
          style={{
            backgroundColor: "#dfd",
            color: "#090",
            padding: "10px",
            borderRadius: "5px",
            marginBottom: "20px",
          }}
        >
          {message}
        </div>
      )}

      {error && (
        <div
          style={{
            backgroundColor: "#fee",
            color: "#c00",
            padding: "10px",
            borderRadius: "5px",
            marginBottom: "20px",
          }}
        >
          {error}
        </div>
      )}

      <p style={{ marginBottom: "20px", color: "#666" }}>
        Please write your email address. We will sent a reset link to your
        email.
      </p>

      <form onSubmit={handleResetPassword}>
        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>
            E-mail
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: "100%",
              padding: "8px",
              border: "1px solid #ddd",
              borderRadius: "5px",
            }}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "10px",
            backgroundColor: "#0070f3",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: loading ? "not-allowed" : "pointer",
            marginBottom: "15px",
          }}
        >
          {loading ? "Sending..." : "Send reset link"}
        </button>
      </form>

      <div style={{ textAlign: "center" }}>
        <Link href="/login" style={{ color: "#0070f3" }}>
          back to login page
        </Link>
      </div>
    </div>
  );
}
