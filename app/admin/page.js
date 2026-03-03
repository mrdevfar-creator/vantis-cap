// app/admin/page.js
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { auth, db } from "../lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  query,
  orderBy,
} from "firebase/firestore";

// অ্যাডমিন ইমেইল লিস্ট - শুধু এই ৩ জন অ্যাডমিন হবে
const ADMIN_EMAILS = [
  "kerabera@gmail.com", // আপনার ১ম অ্যাডমিন ইমেইল
  "kopasamsu@gmail.com", // আপনার ২য় অ্যাডমিন ইমেইল
  "khaialamu@gmail.com", // আপনার ৩য় অ্যাডমিন ইমেইল
];

export default function AdminPage() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editForm, setEditForm] = useState({
    balance: "",
    totalDeposit: "",
    totalWithdrawal: "",
    status: "",
    tradingBalance: "",
  });
  const [adminEmail, setAdminEmail] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setAdminEmail(user.email);

        // চেক করা যে ইউজার অ্যাডমিন কিনা
        if (ADMIN_EMAILS.includes(user.email)) {
          setIsAdmin(true);
          loadUsers();
        } else {
          // অ্যাডমিন না হলে ড্যাশবোর্ডে পাঠান
          router.push("/dashboard");
        }
      } else {
        router.push("/login");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const usersRef = collection(db, "users");
      const q = query(usersRef, orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);

      const usersList = [];
      querySnapshot.forEach((doc) => {
        usersList.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      setUsers(usersList);
    } catch (error) {
      console.error("Error loading users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setEditForm({
      balance: user.balance || 0,
      totalDeposit: user.totalDeposit || 0,
      totalWithdrawal: user.totalWithdrawal || 0,
      status: user.status || "active",
      tradingBalance: user.tradingAccount?.balance || 0,
    });
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userRef = doc(db, "users", selectedUser.id);
      await updateDoc(userRef, {
        balance: parseFloat(editForm.balance) || 0,
        totalDeposit: parseFloat(editForm.totalDeposit) || 0,
        totalWithdrawal: parseFloat(editForm.totalWithdrawal) || 0,
        status: editForm.status,
        tradingAccount: {
          ...(selectedUser.tradingAccount || {}),
          type: selectedUser.tradingAccount?.type || "standard",
          leverage: selectedUser.tradingAccount?.leverage || "1:100",
          balance: parseFloat(editForm.tradingBalance) || 0,
        },
        updatedAt: new Date().toISOString(),
        updatedBy: auth.currentUser?.email,
      });

      await loadUsers();
      setSelectedUser(null);
      alert("✅ ইউজার তথ্য আপডেট হয়েছে!");
    } catch (error) {
      console.error("Update error:", error);
      alert("❌ আপডেট করতে সমস্যা হয়েছে: " + error.message);
    } finally {
      setLoading(false);
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

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("bn-BD", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "N/A";
    }
  };

  // লোডিং স্ক্রিন
  if (loading && users.length === 0) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          flexDirection: "column",
        }}
      >
        <h2>লোড হচ্ছে...</h2>
        <p>অনুগ্রহ করে অপেক্ষা করুন</p>
      </div>
    );
  }

  // যদি অ্যাডমিন না হয়, কিছু দেখাবেন না (redirect হবে)
  if (!isAdmin) {
    return null;
  }

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "20px" }}>
      {/* হেডার - শুধু অ্যাডমিনদের জন্য */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "30px",
          padding: "20px",
          backgroundColor: "#1a1a1a", // ডার্ক থিম
          borderRadius: "10px",
          boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
          color: "white",
        }}
      >
        <div>
          <h1 style={{ fontSize: "28px", marginBottom: "5px", color: "white" }}>
            👑 অ্যাডমিন প্যানেল
          </h1>
          <p style={{ color: "#aaa" }}>অ্যাডমিন: {adminEmail}</p>
        </div>
        <div>
          <Link
            href="/dashboard"
            style={{
              marginRight: "15px",
              padding: "8px 16px",
              backgroundColor: "#0070f3",
              color: "white",
              textDecoration: "none",
              borderRadius: "5px",
            }}
          >
            ড্যাশবোর্ড
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

      {/* স্ট্যাটিস্টিক্স */}
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
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "10px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          <h3 style={{ color: "#666", marginBottom: "10px", fontSize: "14px" }}>
            মোট ইউজার
          </h3>
          <p style={{ fontSize: "32px", fontWeight: "bold", color: "#0070f3" }}>
            {users.length}
          </p>
        </div>

        <div
          style={{
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "10px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          <h3 style={{ color: "#666", marginBottom: "10px", fontSize: "14px" }}>
            মোট ব্যালেন্স
          </h3>
          <p style={{ fontSize: "32px", fontWeight: "bold", color: "#28a745" }}>
            $
            {users
              .reduce((sum, user) => sum + (user.balance || 0), 0)
              .toFixed(2)}
          </p>
        </div>

        <div
          style={{
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "10px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          <h3 style={{ color: "#666", marginBottom: "10px", fontSize: "14px" }}>
            মোট ডিপোজিট
          </h3>
          <p style={{ fontSize: "32px", fontWeight: "bold", color: "#17a2b8" }}>
            $
            {users
              .reduce((sum, user) => sum + (user.totalDeposit || 0), 0)
              .toFixed(2)}
          </p>
        </div>

        <div
          style={{
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "10px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          <h3 style={{ color: "#666", marginBottom: "10px", fontSize: "14px" }}>
            মোট উইথড্রয়াল
          </h3>
          <p style={{ fontSize: "32px", fontWeight: "bold", color: "#dc3545" }}>
            $
            {users
              .reduce((sum, user) => sum + (user.totalWithdrawal || 0), 0)
              .toFixed(2)}
          </p>
        </div>
      </div>

      {/* ইউজার লিস্ট টেবিল */}
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
          <h2 style={{ fontSize: "20px", color: "#333" }}>📋 ইউজার লিস্ট</h2>
          <button
            onClick={loadUsers}
            style={{
              padding: "8px 16px",
              backgroundColor: "#17a2b8",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            ⟳ রিফ্রেশ
          </button>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#f8f9fa" }}>
                <th
                  style={{
                    padding: "12px",
                    textAlign: "left",
                    borderBottom: "2px solid #dee2e6",
                  }}
                >
                  নাম
                </th>
                <th
                  style={{
                    padding: "12px",
                    textAlign: "left",
                    borderBottom: "2px solid #dee2e6",
                  }}
                >
                  ইমেইল
                </th>
                <th
                  style={{
                    padding: "12px",
                    textAlign: "left",
                    borderBottom: "2px solid #dee2e6",
                  }}
                >
                  ফোন
                </th>
                <th
                  style={{
                    padding: "12px",
                    textAlign: "left",
                    borderBottom: "2px solid #dee2e6",
                  }}
                >
                  ব্যালেন্স
                </th>
                <th
                  style={{
                    padding: "12px",
                    textAlign: "left",
                    borderBottom: "2px solid #dee2e6",
                  }}
                >
                  ডিপোজিট
                </th>
                <th
                  style={{
                    padding: "12px",
                    textAlign: "left",
                    borderBottom: "2px solid #dee2e6",
                  }}
                >
                  উইথড্রয়াল
                </th>
                <th
                  style={{
                    padding: "12px",
                    textAlign: "left",
                    borderBottom: "2px solid #dee2e6",
                  }}
                >
                  স্ট্যাটাস
                </th>
                <th
                  style={{
                    padding: "12px",
                    textAlign: "left",
                    borderBottom: "2px solid #dee2e6",
                  }}
                >
                  অ্যাকশন
                </th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td
                    colSpan="8"
                    style={{
                      padding: "20px",
                      textAlign: "center",
                      color: "#666",
                    }}
                  >
                    কোন ইউজার পাওয়া যায়নি
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user.id}
                    style={{ borderBottom: "1px solid #dee2e6" }}
                  >
                    <td style={{ padding: "12px" }}>{user.name || "-"}</td>
                    <td style={{ padding: "12px" }}>{user.email}</td>
                    <td style={{ padding: "12px" }}>{user.phone || "-"}</td>
                    <td
                      style={{
                        padding: "12px",
                        fontWeight: "bold",
                        color: "#28a745",
                      }}
                    >
                      ${user.balance?.toFixed(2) || "0.00"}
                    </td>
                    <td style={{ padding: "12px", color: "#0070f3" }}>
                      ${user.totalDeposit?.toFixed(2) || "0.00"}
                    </td>
                    <td style={{ padding: "12px", color: "#dc3545" }}>
                      ${user.totalWithdrawal?.toFixed(2) || "0.00"}
                    </td>
                    <td style={{ padding: "12px" }}>
                      <span
                        style={{
                          padding: "4px 8px",
                          borderRadius: "4px",
                          fontSize: "12px",
                          fontWeight: "bold",
                          backgroundColor:
                            user.status === "active" ? "#d4edda" : "#f8d7da",
                          color:
                            user.status === "active" ? "#155724" : "#721c24",
                        }}
                      >
                        {user.status || "active"}
                      </span>
                    </td>
                    <td style={{ padding: "12px" }}>
                      <button
                        onClick={() => handleEditUser(user)}
                        style={{
                          padding: "6px 12px",
                          backgroundColor: "#0070f3",
                          color: "white",
                          border: "none",
                          borderRadius: "5px",
                          cursor: "pointer",
                          fontSize: "12px",
                        }}
                      >
                        ব্যালেন্স এডিট
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* এডিট মোডাল - শুধু ব্যালেন্স এডিটের জন্য */}
      {selectedUser && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "30px",
              borderRadius: "10px",
              maxWidth: "500px",
              width: "90%",
              maxHeight: "90vh",
              overflow: "auto",
            }}
          >
            <h2 style={{ fontSize: "24px", marginBottom: "20px" }}>
              ✏️ ইউজার ব্যালেন্স এডিট
            </h2>
            <p
              style={{
                marginBottom: "20px",
                padding: "10px",
                backgroundColor: "#f8f9fa",
                borderRadius: "5px",
              }}
            >
              <strong>{selectedUser.name || selectedUser.email}</strong>
            </p>

            <form onSubmit={handleUpdateUser}>
              <div style={{ marginBottom: "15px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "5px",
                    color: "#666",
                    fontWeight: "500",
                  }}
                >
                  ব্যালেন্স ($)
                </label>
                <input
                  type="number"
                  value={editForm.balance}
                  onChange={(e) =>
                    setEditForm({ ...editForm, balance: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "1px solid #ddd",
                    borderRadius: "5px",
                    fontSize: "16px",
                  }}
                  step="0.01"
                  min="0"
                  required
                />
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "5px",
                    color: "#666",
                    fontWeight: "500",
                  }}
                >
                  ট্রেডিং ব্যালেন্স ($)
                </label>
                <input
                  type="number"
                  value={editForm.tradingBalance}
                  onChange={(e) =>
                    setEditForm({ ...editForm, tradingBalance: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "1px solid #ddd",
                    borderRadius: "5px",
                    fontSize: "16px",
                  }}
                  step="0.01"
                  min="0"
                />
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "5px",
                    color: "#666",
                    fontWeight: "500",
                  }}
                >
                  স্ট্যাটাস
                </label>
                <select
                  value={editForm.status}
                  onChange={(e) =>
                    setEditForm({ ...editForm, status: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "1px solid #ddd",
                    borderRadius: "5px",
                    fontSize: "16px",
                  }}
                >
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                  <option value="blocked">Blocked</option>
                </select>
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    padding: "12px 20px",
                    backgroundColor: "#28a745",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    cursor: loading ? "not-allowed" : "pointer",
                    flex: 1,
                    fontSize: "16px",
                    fontWeight: "bold",
                  }}
                >
                  {loading ? "আপডেট হচ্ছে..." : "আপডেট করুন"}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  style={{
                    padding: "12px 20px",
                    backgroundColor: "#6c757d",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                    flex: 1,
                    fontSize: "16px",
                    fontWeight: "bold",
                  }}
                >
                  বাতিল
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
