// app/login/page.js
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { auth, db } from "../lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // ১. Firebase Authentication এ লগইন
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // ২. Firestore-এ ইউজারের ডকুমেন্ট আছে কিনা চেক করুন
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        // যদি ডকুমেন্ট না থাকে, তাহলে তৈরি করুন
        console.log("📝 No document found, creating one...");
        await setDoc(docRef, {
          name: user.displayName || email.split('@')[0], // ইমেইল থেকে নাম তৈরি
          email: user.email,
          phone: "",
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
      } else {
        console.log("✅ User document exists in Firestore!");
      }

      router.push("/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto", padding: "20px" }}>
      <h1 style={{ fontSize: "24px", marginBottom: "20px" }}>লগইন করুন</h1>
      
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

      <form onSubmit={handleLogin}>
        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>ইমেইল</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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

        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>পাসওয়ার্ড</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
          {loading ? "লগইন হচ্ছে..." : "লগইন করুন"}
        </button>
      </form>

      <div style={{ textAlign: "center", marginBottom: "10px" }}>
        <Link href="/signup" style={{ color: "#0070f3", textDecoration: "none", marginRight: "15px" }}>
          নতুন অ্যাকাউন্ট খুলুন
        </Link>
        <Link href="/forgot-password" style={{ color: "#0070f3", textDecoration: "none" }}>
          পাসওয়ার্ড ভুলে গেছেন?
        </Link>
      </div>
    </div>
  );
}