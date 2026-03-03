// app/dashboard/page.js
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { auth, db } from "../lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false); // আলাদা state
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState(""); // error দেখানোর জন্য
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    withdrawalAddress: "",
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        await loadUserData(user.uid);
      } else {
        router.push("/login");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  // আলাদা ফাংশন করে নিলাম
  const loadUserData = async (userId) => {
    try {
      const docRef = doc(db, "users", userId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        console.log("Loaded data:", data); // ডিবাগ করার জন্য
        setUserData(data);
        setFormData({
          name: data.name || "",
          phone: data.phone || "",
          withdrawalAddress: data.withdrawalAddress || "",
        });
      } else {
        console.log("No user data found!");
        // নতুন ইউজার হলে ডিফল্ট ডাটা সেট করুন
        const defaultData = {
          name: user?.displayName || "",
          phone: "",
          withdrawalAddress: "",
          balance: 0,
          totalDeposit: 0,
          totalWithdrawal: 0,
          status: "active",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          tradingAccount: {
            type: "standard",
            leverage: "1:100",
            balance: 0,
          },
        };
        setUserData(defaultData);
        setFormData({
          name: defaultData.name,
          phone: defaultData.phone,
          withdrawalAddress: defaultData.withdrawalAddress,
        });
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      setError("ডাটা লোড করতে সমস্যা হয়েছে");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setError("");

    try {
      const userRef = doc(db, "users", user.uid);

      // আপডেটের জন্য ডাটা প্রস্তুত করুন
      const updateData = {
        name: formData.name,
        phone: formData.phone,
        withdrawalAddress: formData.withdrawalAddress,
        updatedAt: new Date().toISOString(),
      };

      console.log("Updating with:", updateData); // ডিবাগ করার জন্য

      // Firestore এ আপডেট করুন
      await updateDoc(userRef, updateData);

      console.log("Update successful!");

      // আপডেটেড ডাটা আবার লোড করুন
      await loadUserData(user.uid);

      setEditing(false);
      alert("তথ্য সফলভাবে আপডেট হয়েছে!"); // সাফল্যের বার্তা
    } catch (error) {
      console.error("Update error:", error);
      setError("আপডেট করতে সমস্যা হয়েছে: " + error.message);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        <h2>লোড হচ্ছে...</h2>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "20px" }}>
      {/* Error Message */}
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

      {/* হেডার */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "30px",
          padding: "20px",
          backgroundColor: "white",
          borderRadius: "10px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
      >
        <h1 style={{ fontSize: "28px", color: "#333" }}>
          স্বাগতম, {userData?.name || user?.email}
        </h1>
        <div>
          <Link
            href="/admin"
            style={{
              marginRight: "15px",
              color: "#0070f3",
              textDecoration: "none",
            }}
          >
            অ্যাডমিন প্যানেল
          </Link>
          <button
            onClick={handleLogout}
            style={{
              padding: "8px 16px",
              backgroundColor: "#dc3545",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            লগআউট
          </button>
        </div>
      </div>

      {/* ব্যালেন্স ও স্ট্যাটাস কার্ড */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "20px",
          marginBottom: "30px",
        }}
      >
        <div
          style={{
            backgroundColor: "#28a745",
            color: "white",
            padding: "20px",
            borderRadius: "10px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          <h3
            style={{ marginBottom: "10px", fontSize: "16px", opacity: "0.9" }}
          >
            বর্তমান ব্যালেন্স
          </h3>
          <p style={{ fontSize: "28px", fontWeight: "bold" }}>
            ${userData?.balance?.toFixed(2) || "0.00"}
          </p>
        </div>

        <div
          style={{
            backgroundColor: "#0070f3",
            color: "white",
            padding: "20px",
            borderRadius: "10px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          <h3
            style={{ marginBottom: "10px", fontSize: "16px", opacity: "0.9" }}
          >
            মোট ডিপোজিট
          </h3>
          <p style={{ fontSize: "28px", fontWeight: "bold" }}>
            ${userData?.totalDeposit?.toFixed(2) || "0.00"}
          </p>
        </div>

        <div
          style={{
            backgroundColor: "#dc3545",
            color: "white",
            padding: "20px",
            borderRadius: "10px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          <h3
            style={{ marginBottom: "10px", fontSize: "16px", opacity: "0.9" }}
          >
            মোট উইথড্রয়াল
          </h3>
          <p style={{ fontSize: "28px", fontWeight: "bold" }}>
            ${userData?.totalWithdrawal?.toFixed(2) || "0.00"}
          </p>
        </div>

        <div
          style={{
            backgroundColor: "#ffc107",
            color: "#333",
            padding: "20px",
            borderRadius: "10px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          <h3
            style={{ marginBottom: "10px", fontSize: "16px", opacity: "0.9" }}
          >
            অ্যাকাউন্ট স্ট্যাটাস
          </h3>
          <p
            style={{
              fontSize: "20px",
              fontWeight: "bold",
              textTransform: "capitalize",
            }}
          >
            {userData?.status || "active"}
          </p>
        </div>
      </div>

      {/* ট্রেডিং অ্যাকাউন্ট তথ্য */}
      <div
        style={{
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "10px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          marginBottom: "30px",
        }}
      >
        <h2 style={{ fontSize: "20px", marginBottom: "20px", color: "#333" }}>
          ট্রেডিং অ্যাকাউন্ট
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "20px",
          }}
        >
          <div>
            <p style={{ color: "#666", marginBottom: "5px" }}>
              অ্যাকাউন্ট টাইপ
            </p>
            <p style={{ fontSize: "18px", fontWeight: "bold" }}>
              {userData?.tradingAccount?.type || "standard"}
            </p>
          </div>
          <div>
            <p style={{ color: "#666", marginBottom: "5px" }}>লিভারেজ</p>
            <p style={{ fontSize: "18px", fontWeight: "bold" }}>
              {userData?.tradingAccount?.leverage || "1:100"}
            </p>
          </div>
          <div>
            <p style={{ color: "#666", marginBottom: "5px" }}>
              ট্রেডিং ব্যালেন্স
            </p>
            <p style={{ fontSize: "18px", fontWeight: "bold" }}>
              ${userData?.tradingAccount?.balance?.toFixed(2) || "0.00"}
            </p>
          </div>
        </div>
      </div>

      {/* ইউজার প্রোফাইল তথ্য ও এডিট ফর্ম */}
      <div
        style={{
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "10px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <h2 style={{ fontSize: "20px", color: "#333" }}>আপনার তথ্য</h2>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              style={{
                padding: "8px 16px",
                backgroundColor: "#28a745",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              তথ্য আপডেট করুন
            </button>
          )}
        </div>

        {editing ? (
          <form onSubmit={handleUpdateProfile}>
            <div style={{ marginBottom: "15px" }}>
              <label
                style={{ display: "block", marginBottom: "5px", color: "#666" }}
              >
                নাম
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #ddd",
                  borderRadius: "5px",
                  fontSize: "16px",
                }}
                required
              />
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label
                style={{ display: "block", marginBottom: "5px", color: "#666" }}
              >
                মোবাইল নম্বর
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #ddd",
                  borderRadius: "5px",
                  fontSize: "16px",
                }}
                placeholder="+8801XXXXXXXXX"
              />
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label
                style={{ display: "block", marginBottom: "5px", color: "#666" }}
              >
                উইথড্রয়াল অ্যাড্রেস
              </label>
              <input
                type="text"
                name="withdrawalAddress"
                value={formData.withdrawalAddress}
                onChange={handleInputChange}
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #ddd",
                  borderRadius: "5px",
                  fontSize: "16px",
                }}
                placeholder="আপনার বিটকয়েন/ইউএসডিটি অ্যাড্রেস"
              />
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                type="submit"
                disabled={updating}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#0070f3",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: updating ? "not-allowed" : "pointer",
                }}
              >
                {updating ? "সেভ হচ্ছে..." : "সেভ করুন"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  setFormData({
                    name: userData?.name || "",
                    phone: userData?.phone || "",
                    withdrawalAddress: userData?.withdrawalAddress || "",
                  });
                }}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#6c757d",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                বাতিল
              </button>
            </div>
          </form>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "20px",
            }}
          >
            <div>
              <p style={{ color: "#666", marginBottom: "5px" }}>নাম</p>
              <p style={{ fontSize: "16px", fontWeight: "bold" }}>
                {userData?.name || "দেওয়া হয়নি"}
              </p>
            </div>
            <div>
              <p style={{ color: "#666", marginBottom: "5px" }}>ইমেইল</p>
              <p style={{ fontSize: "16px", fontWeight: "bold" }}>
                {user?.email}
              </p>
            </div>
            <div>
              <p style={{ color: "#666", marginBottom: "5px" }}>মোবাইল</p>
              <p style={{ fontSize: "16px", fontWeight: "bold" }}>
                {userData?.phone || "দেওয়া হয়নি"}
              </p>
            </div>
            <div>
              <p style={{ color: "#666", marginBottom: "5px" }}>
                অ্যাকাউন্ট খোলার তারিখ
              </p>
              <p style={{ fontSize: "14px", fontWeight: "bold" }}>
                {userData?.createdAt
                  ? new Date(userData.createdAt).toLocaleDateString("bn-BD")
                  : "জানা যায়নি"}
              </p>
            </div>
            <div style={{ gridColumn: "span 2" }}>
              <p style={{ color: "#666", marginBottom: "5px" }}>
                উইথড্রয়াল অ্যাড্রেস
              </p>
              <p
                style={{
                  fontSize: "14px",
                  fontWeight: "bold",
                  wordBreak: "break-all",
                  backgroundColor: "#f8f9fa",
                  padding: "10px",
                  borderRadius: "5px",
                }}
              >
                {userData?.withdrawalAddress || "দেওয়া হয়নি"}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
