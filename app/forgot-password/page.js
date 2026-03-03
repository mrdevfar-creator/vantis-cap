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
      setMessage("পাসওয়ার্ড রিসেট লিংক আপনার ইমেইলে পাঠানো হয়েছে!");
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto", padding: "20px" }}>
      <h1 style={{ fontSize: "24px", marginBottom: "20px" }}>
        পাসওয়ার্ড ভুলে গেছেন?
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
        আপনার ইমেইল ঠিকানা দিন। আমরা পাসওয়ার্ড রিসেট করার লিংক পাঠাব।
      </p>

      <form onSubmit={handleResetPassword}>
        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>ইমেইল</label>
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
          {loading ? "পাঠানো হচ্ছে..." : "রিসেট লিংক পাঠান"}
        </button>
      </form>

      <div style={{ textAlign: "center" }}>
        <Link href="/login" style={{ color: "#0070f3" }}>
          লগইন পেজে ফিরে যান
        </Link>
      </div>
    </div>
  );
}
