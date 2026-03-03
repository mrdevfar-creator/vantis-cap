// app/login/phone/page.js
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  auth,
  signInWithPhoneNumber,
  RecaptchaVerifier,
} from "../../lib/firebase";

export default function PhoneLoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // রিক্যাপচা সেটআপ
  useEffect(() => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        {
          size: "normal",
          callback: () => {},
        },
      );
    }
  }, []);

  // ওটিপি পাঠান
  const sendOTP = async () => {
    setLoading(true);
    setError("");

    try {
      const confirmation = await signInWithPhoneNumber(
        auth,
        phone,
        window.recaptchaVerifier,
      );
      setConfirmationResult(confirmation);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // ওটিপি ভেরিফাই করুন
  const verifyOTP = async () => {
    setLoading(true);
    setError("");

    try {
      await confirmationResult.confirm(otp);
      router.push("/dashboard");
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto", padding: "20px" }}>
      <h1 style={{ fontSize: "24px", marginBottom: "20px" }}>
        ফোন নম্বর দিয়ে লগইন
      </h1>

      <div id="recaptcha-container"></div>

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

      {!confirmationResult ? (
        // ফোন নম্বর ইনপুট ফর্ম
        <div>
          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px" }}>
              ফোন নম্বর (+৮৮০১৭xxxxxxxx)
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+8801XXXXXXXXX"
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid #ddd",
                borderRadius: "5px",
              }}
            />
          </div>

          <button
            onClick={sendOTP}
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
            {loading ? "পাঠানো হচ্ছে..." : "ওটিপি পাঠান"}
          </button>
        </div>
      ) : (
        // ওটিপি ভেরিফিকেশন ফর্ম
        <div>
          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px" }}>
              ওটিপি কোড
            </label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="৬ ডিজিটের কোড"
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid #ddd",
                borderRadius: "5px",
              }}
            />
          </div>

          <button
            onClick={verifyOTP}
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
            {loading ? "যাচাই করা হচ্ছে..." : "ভেরিফাই করুন"}
          </button>
        </div>
      )}

      <div style={{ textAlign: "center" }}>
        <Link href="/login" style={{ color: "#0070f3" }}>
          ইমেইল দিয়ে লগইন করুন
        </Link>
      </div>
    </div>
  );
}
