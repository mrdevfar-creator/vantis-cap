// app/signup/page.js
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { auth, db } from "../lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // ১. Firebase Authentication এ ইউজার তৈরি
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        formData.email, 
        formData.password
      );
      const user = userCredential.user;

      // ২. Firestore-এ ইউজারের ডকুমেন্ট তৈরি
      await setDoc(doc(db, "users", user.uid), {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        balance: 0,
        totalDeposit: 0,
        totalWithdrawal: 0,
        withdrawalAddress: "",
        status: "active",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tradingAccount: {
          type: "standard",
          leverage: "1:100",
          balance: 0
        }
      });

      console.log("✅ User document created in Firestore!");
      router.push("/dashboard");
    } catch (error) {
      console.error("Signup error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto", padding: "20px" }}>
      <h1 style={{ fontSize: "24px", marginBottom: "20px" }}>নতুন অ্যাকাউন্ট খুলুন</h1>
      
      {error && (
        <div style={{ 
          backgroundColor: "#fee", 
          color: "#c00", 
          padding: "10px", 
          borderRadius: "5px",
          marginBottom: "20px",
          border: "1px solid #f5c6cb"
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSignup}>
        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>আপনার নাম *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            style={{ 
              width: "100%", 
              padding: "10px", 
              border: "1px solid #ddd", 
              borderRadius: "5px",
              fontSize: "16px"
            }}
            required
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>ইমেইল *</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            style={{ 
              width: "100%", 
              padding: "10px", 
              border: "1px solid #ddd", 
              borderRadius: "5px",
              fontSize: "16px"
            }}
            required
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>মোবাইল নম্বর</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            style={{ 
              width: "100%", 
              padding: "10px", 
              border: "1px solid #ddd", 
              borderRadius: "5px",
              fontSize: "16px"
            }}
            placeholder="+8801XXXXXXXXX"
          />
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>পাসওয়ার্ড *</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            style={{ 
              width: "100%", 
              padding: "10px", 
              border: "1px solid #ddd", 
              borderRadius: "5px",
              fontSize: "16px"
            }}
            required
            minLength="6"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{ 
            width: "100%", 
            padding: "12px", 
            backgroundColor: "#0070f3", 
            color: "white", 
            border: "none", 
            borderRadius: "5px",
            fontSize: "16px",
            fontWeight: "bold",
            cursor: loading ? "not-allowed" : "pointer",
            marginBottom: "15px",
            opacity: loading ? 0.7 : 1
          }}
        >
          {loading ? "হচ্ছে..." : "সাইনআপ করুন"}
        </button>
      </form>

      <div style={{ textAlign: "center" }}>
        <Link href="/login" style={{ color: "#0070f3", textDecoration: "none" }}>
          ইতিমধ্যে অ্যাকাউন্ট আছে? লগইন করুন
        </Link>
      </div>
    </div>
  );
}