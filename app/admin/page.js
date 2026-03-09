"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  getDoc,
  orderBy,
  query,
  onSnapshot,
  where,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

const ADMIN_EMAIL = "khaialamu@gmail.com";

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("deposits");

  // Deposits
  const [deposits, setDeposits] = useState([]);
  const [updating, setUpdating] = useState(null);
  const [filter, setFilter] = useState("PENDING");

  // Users
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [balanceInputs, setBalanceInputs] = useState({});
  const [withdrawalInputs, setWithdrawalInputs] = useState({});
  const [balanceUpdating, setBalanceUpdating] = useState(null);
  const [withdrawalUpdating, setWithdrawalUpdating] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [referralModal, setReferralModal] = useState(null);
  const [commissionInputs, setCommissionInputs] = useState({});
  const [commissionUpdating, setCommissionUpdating] = useState(null);

  // Last updated info (shown as card above table)
  const [lastUpdated, setLastUpdated] = useState(null);
  // { userEmail, field, oldValue, newValue, time }

  // Withdrawals
  const [withdrawals, setWithdrawals] = useState([]);
  const [withdrawalsLoading, setWithdrawalsLoading] = useState(false);
  const [wFilter, setWFilter] = useState("PENDING");
  const [wUpdating, setWUpdating] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/login");
        return;
      }
      if (user.email !== ADMIN_EMAIL) {
        router.push("/dashboard");
        return;
      }
      setLoading(false);
      fetchDeposits();
      fetchWithdrawals();
    });
    return () => unsubscribe();
  }, [router]);

  // ── Deposits ────────────────────────────────────────────────────────────────
  const fetchDeposits = () => {
    const q = query(collection(db, "deposits"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        setDeposits(data);
      },
      (err) => {
        // orderBy needs index — fallback to no ordering
        console.warn(
          "Deposits snapshot error, trying without orderBy:",
          err.message,
        );
        const q2 = query(collection(db, "deposits"));
        onSnapshot(q2, (snap) => {
          const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
          data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          setDeposits(data);
        });
      },
    );
    window.__depositsUnsub = unsubscribe;
    return unsubscribe;
  };

  // Helper: write a notification to user's subcollection
  const addNotification = async (userId, type, title, message, meta = {}) => {
    try {
      await addDoc(collection(db, "users", userId, "notifications"), {
        type, // "deposit_approved" | "deposit_rejected" | "withdrawal_completed" | "withdrawal_rejected" | "commission" | "balance_updated"
        title,
        message,
        meta,
        read: false,
        createdAt: new Date().toISOString(),
      });
    } catch (e) {
      console.error("Notification error:", e);
    }
  };

  // Get commission amount based on referrer's referral count (level)
  const getCommissionAmount = (referralCount) => {
    if (referralCount >= 11) return 3; // Gold
    if (referralCount >= 6) return 2; // Silver
    if (referralCount >= 1) return 1; // Bronze
    return 0;
  };

  const getReferralLevel = (count) => {
    if (count >= 11) return "Gold";
    if (count >= 6) return "Silver";
    if (count >= 1) return "Bronze";
    return "—";
  };

  const handleApprove = async (deposit) => {
    setUpdating(deposit.id);
    try {
      const userRef = doc(db, "users", deposit.userId);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        alert("User not found");
        return;
      }
      const userData = userSnap.data();

      // 1. Approve deposit + update user balance
      await updateDoc(userRef, {
        balance: (userData.balance || 0) + deposit.amount,
        totalDeposit: (userData.totalDeposit || 0) + deposit.amount,
        updatedAt: new Date().toLocaleString("en-BD", {
          timeZone: "Asia/Dhaka",
        }),
      });
      await updateDoc(doc(db, "deposits", deposit.id), {
        status: "APPROVED",
        approvedAt: new Date().toLocaleString("en-BD", {
          timeZone: "Asia/Dhaka",
        }),
      });

      // Notify user: deposit approved
      await addNotification(
        deposit.userId,
        "deposit_approved",
        "Deposit Approved ✅",
        `Your deposit of $${deposit.amount} has been approved and added to your balance.`,
        { amount: deposit.amount },
      );

      // 2. Auto referral commission — only on first deposit
      const isFirstDeposit = (userData.totalDeposit || 0) === 0;
      if (isFirstDeposit && userData.referredByUid) {
        try {
          const referrerRef = doc(db, "users", userData.referredByUid);
          const referrerSnap = await getDoc(referrerRef);
          if (referrerSnap.exists()) {
            const referrerData = referrerSnap.data();
            const referralCount = referrerData.referrals?.length || 0;
            const commission = getCommissionAmount(referralCount);

            if (commission > 0) {
              // Update referrer balance + totalReferralCommission
              const now = new Date().toLocaleString("en-US", {
                timeZone: "Asia/Dhaka",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
                month: "numeric",
                day: "numeric",
                year: "2-digit",
              });

              // Update commission on the specific referral entry
              const updatedReferrals = (referrerData.referrals || []).map(
                (r) =>
                  r.userId === deposit.userId
                    ? {
                        ...r,
                        commission: (r.commission || 0) + commission,
                        commissionPaidAt: now,
                      }
                    : r,
              );
              const newTotalCommission = updatedReferrals.reduce(
                (s, r) => s + (r.commission || 0),
                0,
              );

              await updateDoc(referrerRef, {
                balance: (referrerData.balance || 0) + commission,
                totalReferralCommission: newTotalCommission,
                referrals: updatedReferrals,
                balanceUpdated: true,
                balanceUpdatedAt: now,
                previousBalance: referrerData.balance || 0,
                updatedAt: new Date().toLocaleString("en-BD", {
                  timeZone: "Asia/Dhaka",
                }),
              });

              // Notify referrer: commission received
              const level = getReferralLevel(referralCount);
              await addNotification(
                userData.referredByUid,
                "commission",
                "Referral Commission Received 🎉",
                `You earned $${commission} commission! Your referral ${userData.name || userData.email} made their first deposit. (${level} level)`,
                {
                  amount: commission,
                  fromUser: userData.name || userData.email,
                  level,
                },
              );
            }
          }
        } catch (refErr) {
          console.error("Commission error:", refErr);
        }
      }

      // deposits auto-updates via onSnapshot
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setUpdating(null);
    }
  };

  const handleReject = async (depositId) => {
    setUpdating(depositId);
    try {
      // Find deposit amount for notification
      const depSnap = await getDoc(doc(db, "deposits", depositId));
      const depData = depSnap.exists() ? depSnap.data() : {};
      await updateDoc(doc(db, "deposits", depositId), {
        status: "REJECTED",
        rejectedAt: new Date().toLocaleString("en-BD", {
          timeZone: "Asia/Dhaka",
        }),
      });
      if (depData.userId) {
        await addNotification(
          depData.userId,
          "deposit_rejected",
          "Deposit Rejected ❌",
          `Your deposit of $${depData.amount || 0} was rejected. Please contact support.`,
          { amount: depData.amount },
        );
      }
      // deposits auto-updates via onSnapshot
    } catch (err) {
      console.error("Reject error:", err);
    } finally {
      setUpdating(null);
    }
  };

  // ── Users ───────────────────────────────────────────────────────────────────
  const fetchUsers = () => {
    setUsersLoading(true);
    const unsubscribe = onSnapshot(
      collection(db, "users"),
      (snapshot) => {
        const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        setUsers(data);
        // Only initialize inputs for new users (don't override what admin is typing)
        setBalanceInputs((prev) => {
          const next = { ...prev };
          data.forEach((u) => {
            if (!(u.id in next)) next[u.id] = (u.balance || 0).toString();
          });
          return next;
        });
        setWithdrawalInputs((prev) => {
          const next = { ...prev };
          data.forEach((u) => {
            if (!(u.id in next))
              next[u.id] = (u.tradingAccount?.balance || 0).toString();
          });
          return next;
        });
        setUsersLoading(false);
      },
      (err) => {
        console.error("Error fetching users:", err);
        setUsersLoading(false);
      },
    );
    return unsubscribe;
  };

  const fetchWithdrawals = () => {
    setWithdrawalsLoading(true);
    const unsubscribe = onSnapshot(
      collection(db, "withdrawals"),
      (snap) => {
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setWithdrawals(data);
        setWithdrawalsLoading(false);
      },
      (err) => {
        console.error("withdrawals error:", err);
        setWithdrawalsLoading(false);
      },
    );
    return unsubscribe;
  };

  const handleWithdrawalAction = async (wId, action, withdrawal) => {
    setWUpdating(wId);
    try {
      await updateDoc(doc(db, "withdrawals", wId), {
        status: action,
        processedAt: new Date().toLocaleString("en-BD", {
          timeZone: "Asia/Dhaka",
        }),
      });
      if (action === "COMPLETED") {
        const userRef = doc(db, "users", withdrawal.userId);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const ud = userSnap.data();
          const now = new Date().toLocaleString("en-US", {
            timeZone: "Asia/Dhaka",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
            month: "numeric",
            day: "numeric",
            year: "2-digit",
          });
          await updateDoc(userRef, {
            balance: Math.max(0, (ud.balance || 0) - withdrawal.amount),
            totalWithdrawal: (ud.totalWithdrawal || 0) + withdrawal.amount,
            lastWithdrawal: { amount: withdrawal.amount, timestamp: now },
            updatedAt: new Date().toLocaleString("en-BD", {
              timeZone: "Asia/Dhaka",
            }),
          });

          // Mark all included deposit trades as WITHDRAWN
          if (withdrawal.depositIds && withdrawal.depositIds.length > 0) {
            const { writeBatch } = await import("firebase/firestore");
            const batch = writeBatch(db);
            withdrawal.depositIds.forEach((depId) => {
              batch.update(doc(db, "deposits", depId), {
                tradeStatus: "WITHDRAWN",
                withdrawnAt: new Date().toLocaleString("en-BD", {
                  timeZone: "Asia/Dhaka",
                }),
              });
            });
            await batch.commit();
          }
        }
        await addNotification(
          withdrawal.userId,
          "withdrawal_completed",
          "Withdrawal Completed ✅",
          `Your withdrawal of $${withdrawal.amount} has been processed successfully to your wallet.`,
          { amount: withdrawal.amount, address: withdrawal.address },
        );
      } else if (action === "REJECTED") {
        await addNotification(
          withdrawal.userId,
          "withdrawal_rejected",
          "Withdrawal Rejected ❌",
          `Your withdrawal request of $${withdrawal.amount} was rejected. Please contact support.`,
          { amount: withdrawal.amount },
        );
      }
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setWUpdating(null);
    }
  };

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    if (tab === "users" && users.length === 0) {
      const unsub = fetchUsers();
      window.__usersUnsub = unsub;
    }
    if (tab === "withdrawals" && withdrawals.length === 0) {
      const unsub = fetchWithdrawals();
      window.__withdrawalsUnsub = unsub;
    }
  };

  // Update current balance
  const handleBalanceUpdate = async (userId) => {
    const newBalance = parseFloat(balanceInputs[userId]);
    if (isNaN(newBalance) || newBalance < 0) {
      alert("Enter a valid amount");
      return;
    }
    setBalanceUpdating(userId);
    try {
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);
      const oldBalance = userSnap.exists() ? userSnap.data().balance || 0 : 0;
      const userEmail = userSnap.exists() ? userSnap.data().email : "—";
      const now = new Date().toLocaleString("en-US", {
        timeZone: "Asia/Dhaka",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        month: "numeric",
        day: "numeric",
        year: "2-digit",
      });

      await updateDoc(userRef, {
        balance: newBalance,
        previousBalance: oldBalance,
        balanceUpdated: true,
        balanceUpdatedAt: now,
        updatedAt: new Date().toLocaleString("en-BD", {
          timeZone: "Asia/Dhaka",
        }),
      });

      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, balance: newBalance } : u)),
      );
      setLastUpdated({
        userEmail,
        field: "Current Balance",
        oldValue: oldBalance,
        newValue: newBalance,
        time: now,
      });
      await addNotification(
        userId,
        "balance_updated",
        "Balance Updated 💰",
        `Your account balance has been updated from $${oldBalance.toFixed(2)} to $${newBalance.toFixed(2)}.`,
        { oldBalance, newBalance },
      );
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setBalanceUpdating(null);
    }
  };

  // Update withdrawal — adds to totalWithdrawal, saves lastWithdrawal
  const handleWithdrawalUpdate = async (userId) => {
    const amount = parseFloat(withdrawalInputs[userId]);
    if (isNaN(amount) || amount <= 0) {
      alert("Enter a valid amount greater than 0");
      return;
    }
    setWithdrawalUpdating(userId);
    try {
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.exists() ? userSnap.data() : {};
      const currentTotal = userData.totalWithdrawal || 0;
      const newTotal = currentTotal + amount;
      const userEmail = userData.email || "—";
      const now = new Date().toLocaleString("en-US", {
        timeZone: "Asia/Dhaka",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        month: "numeric",
        day: "numeric",
        year: "2-digit",
      });

      await updateDoc(userRef, {
        totalWithdrawal: newTotal,
        lastWithdrawal: { amount, timestamp: now },
        withdrawalUpdatedAt: now,
        updatedAt: new Date().toLocaleString("en-BD", {
          timeZone: "Asia/Dhaka",
        }),
      });

      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? {
                ...u,
                totalWithdrawal: newTotal,
                lastWithdrawal: { amount, timestamp: now },
              }
            : u,
        ),
      );
      setLastUpdated({
        userEmail,
        field: "Withdrawal +" + amount.toFixed(2),
        oldValue: currentTotal,
        newValue: newTotal,
        time: now,
      });
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setWithdrawalUpdating(null);
    }
  };

  // Update commission for a specific referred user
  const handleCommissionUpdate = async (
    referrerId,
    referredUserId,
    referredIndex,
  ) => {
    const amount = parseFloat(
      commissionInputs[`${referrerId}-${referredIndex}`] || 0,
    );
    if (isNaN(amount) || amount < 0) {
      alert("Enter a valid amount");
      return;
    }
    setCommissionUpdating(`${referrerId}-${referredIndex}`);
    try {
      const userRef = doc(db, "users", referrerId);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) return;
      const userData = userSnap.data();
      const updatedReferrals = userData.referrals.map((r, i) =>
        i === referredIndex ? { ...r, commission: amount } : r,
      );
      const totalCommission = updatedReferrals.reduce(
        (sum, r) => sum + (r.commission || 0),
        0,
      );
      await updateDoc(userRef, {
        referrals: updatedReferrals,
        totalReferralCommission: totalCommission,
      });
      // Update modal state live
      setReferralModal((prev) => ({
        ...prev,
        referrals: updatedReferrals,
        totalReferralCommission: totalCommission,
      }));
      setUsers((prev) =>
        prev.map((u) =>
          u.id === referrerId
            ? {
                ...u,
                referrals: updatedReferrals,
                totalReferralCommission: totalCommission,
              }
            : u,
        ),
      );
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setCommissionUpdating(null);
    }
  };

  // ── Computed ────────────────────────────────────────────────────────────────
  const filtered = deposits.filter((d) =>
    filter === "ALL" ? true : d.status === filter,
  );
  const totalPending = deposits.filter((d) => d.status === "PENDING").length;
  const totalApproved = deposits.filter((d) => d.status === "APPROVED").length;
  const totalAmount = deposits
    .filter((d) => d.status === "APPROVED")
    .reduce((s, d) => s + (d.amount || 0), 0);
  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.phone?.includes(searchQuery),
  );

  if (loading)
    return (
      <div className="min-h-screen bg-[#0A0D14] flex items-center justify-center">
        <p className="text-gray-500 text-sm">Loading...</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#0A0D14] py-10 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
            <p className="text-gray-500 text-sm">Vantis Capital Management</p>
          </div>
          <button
            onClick={() =>
              activeTab === "deposits" ? fetchDeposits() : fetchUsers()
            }
            className="px-4 py-2 bg-white/5 border border-white/10 text-gray-300 text-sm rounded-xl hover:bg-white/10 transition-colors"
          >
            ↻ Refresh
          </button>
        </div>

        {/* Main tabs */}
        <div className="flex gap-2 mb-8">
          {[
            {
              key: "deposits",
              label: "Deposits",
              badge: totalPending > 0 ? totalPending : null,
              badgeColor: "bg-amber-500/20 text-amber-400",
            },
            {
              key: "users",
              label: "Users",
              badge: users.length > 0 ? users.length : null,
              badgeColor: "bg-violet-500/20 text-violet-400",
            },
            {
              key: "withdrawals",
              label: "Withdrawals",
              badge:
                withdrawals.filter((w) => w.status === "PENDING").length > 0
                  ? withdrawals.filter((w) => w.status === "PENDING").length
                  : null,
              badgeColor: "bg-rose-500/20 text-rose-400",
            },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleTabSwitch(tab.key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? "bg-white text-black"
                  : "bg-white/5 border border-white/10 text-gray-400 hover:text-white"
              }`}
            >
              {tab.label}
              {tab.badge !== null && (
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === tab.key ? "bg-black/10 text-black" : tab.badgeColor}`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ══════════ DEPOSITS ══════════ */}
        {activeTab === "deposits" && (
          <div>
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-5">
                <p className="text-amber-400/70 text-xs mb-1">Pending</p>
                <p className="text-amber-400 text-2xl font-bold">
                  {totalPending}
                </p>
              </div>
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-5">
                <p className="text-emerald-400/70 text-xs mb-1">Approved</p>
                <p className="text-emerald-400 text-2xl font-bold">
                  {totalApproved}
                </p>
              </div>
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-5">
                <p className="text-blue-400/70 text-xs mb-1">
                  Total Approved Amount
                </p>
                <p className="text-blue-400 text-2xl font-bold">
                  ${totalAmount.toFixed(2)}
                </p>
              </div>
            </div>

            <div className="flex gap-2 mb-6">
              {["PENDING", "APPROVED", "REJECTED", "ALL"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilter(tab)}
                  className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                    filter === tab
                      ? "bg-white text-black"
                      : "bg-white/5 border border-white/10 text-gray-400 hover:text-white"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl overflow-hidden">
              {filtered.length === 0 ? (
                <div className="py-16 text-center text-gray-600">
                  No deposits found
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/5">
                        {[
                          "User",
                          "Amount",
                          "TXID",
                          "Time",
                          "Status",
                          "Action",
                        ].map((h) => (
                          <th
                            key={h}
                            className="text-left text-gray-500 text-xs font-medium px-6 py-4"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((deposit) => (
                        <tr
                          key={deposit.id}
                          className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]"
                        >
                          <td className="px-6 py-4">
                            <p className="text-white text-sm">
                              {deposit.userEmail}
                            </p>
                            <p className="text-gray-600 text-xs">
                              {deposit.userId?.slice(0, 8)}...
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-emerald-400 font-bold">
                              ${deposit.amount}
                            </p>
                            <p className="text-gray-600 text-xs">USDT TRC20</p>
                          </td>
                          <td className="px-6 py-4">
                            <p
                              className="text-gray-300 text-xs font-mono max-w-[160px] truncate"
                              title={deposit.txId}
                            >
                              {deposit.txId}
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-gray-400 text-xs">
                              {deposit.createdAt}
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                                deposit.status === "PENDING"
                                  ? "bg-amber-500/15 text-amber-400"
                                  : deposit.status === "APPROVED"
                                    ? "bg-emerald-500/15 text-emerald-400"
                                    : "bg-red-500/15 text-red-400"
                              }`}
                            >
                              {deposit.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {deposit.status === "PENDING" ? (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleApprove(deposit)}
                                  disabled={updating === deposit.id}
                                  className="px-3 py-1.5 bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 text-xs font-medium rounded-lg hover:bg-emerald-500/25 transition-colors disabled:opacity-50"
                                >
                                  {updating === deposit.id ? "..." : "Approve"}
                                </button>
                                <button
                                  onClick={() => handleReject(deposit.id)}
                                  disabled={updating === deposit.id}
                                  className="px-3 py-1.5 bg-red-500/15 text-red-400 border border-red-500/20 text-xs font-medium rounded-lg hover:bg-red-500/25 transition-colors disabled:opacity-50"
                                >
                                  Reject
                                </button>
                              </div>
                            ) : (
                              <span className="text-gray-600 text-xs">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══════════ USERS ══════════ */}
        {activeTab === "users" && (
          <div>
            {/* Last updated card */}
            {lastUpdated && (
              <div className="flex items-center gap-4 mb-5 p-4 bg-amber-500/8 border border-amber-500/20 rounded-2xl">
                <div className="w-9 h-9 rounded-xl bg-amber-500/15 flex items-center justify-center shrink-0">
                  <svg
                    className="w-4 h-4 text-amber-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
                    />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-amber-400 text-xs font-semibold mb-0.5">
                    Last Updated
                  </p>
                  <p className="text-white text-sm font-medium truncate">
                    {lastUpdated.userEmail}
                  </p>
                  <p className="text-gray-500 text-xs">
                    {lastUpdated.field}:{" "}
                    <span className="text-rose-400">
                      ${lastUpdated.oldValue.toFixed(2)}
                    </span>
                    {" → "}
                    <span className="text-emerald-400">
                      ${lastUpdated.newValue.toFixed(2)}
                    </span>
                    {" · "}
                    {lastUpdated.time}
                  </p>
                </div>
                <button
                  onClick={() => setLastUpdated(null)}
                  className="text-gray-600 hover:text-gray-400 transition-colors shrink-0"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            )}

            {/* Search + total */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 relative">
                <svg
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                  />
                </svg>
                <input
                  type="text"
                  placeholder="Search by name, email or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 text-sm focus:outline-none focus:border-amber-400/50 transition-colors"
                />
              </div>
              <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl px-5 py-3 shrink-0">
                <p className="text-violet-400/70 text-xs mb-0.5">Total Users</p>
                <p className="text-violet-400 text-xl font-bold">
                  {users.length}
                </p>
              </div>
            </div>

            {usersLoading ? (
              <div className="py-16 text-center text-gray-600">
                Loading users...
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="py-16 text-center text-gray-600">
                No users found
              </div>
            ) : (
              <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/5">
                        {[
                          "User",
                          "Phone",
                          "Balance",
                          "Set Balance",
                          "Withdrawn",
                          "Add Withdrawal",
                          "Ref Code",
                          "Referred By",
                          "Referrals",
                          "Status",
                          "Joined",
                        ].map((h) => (
                          <th
                            key={h}
                            className="text-left text-gray-500 text-xs font-medium px-5 py-4 whitespace-nowrap"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user) => (
                        <tr
                          key={user.id}
                          className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]"
                        >
                          {/* User */}
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                                {user.name
                                  ? user.name.slice(0, 2).toUpperCase()
                                  : user.email?.slice(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <p className="text-white text-sm font-medium whitespace-nowrap">
                                  {user.name || "—"}
                                </p>
                                <p className="text-gray-500 text-xs">
                                  {user.email}
                                </p>
                              </div>
                            </div>
                          </td>
                          {/* Phone */}
                          <td className="px-5 py-4">
                            <p className="text-gray-400 text-sm whitespace-nowrap">
                              {user.phone || "—"}
                            </p>
                          </td>
                          {/* Current balance */}
                          <td className="px-5 py-4">
                            <p className="text-amber-400 font-bold">
                              ${(user.balance || 0).toFixed(2)}
                            </p>
                          </td>
                          {/* Set current balance */}
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                value={
                                  balanceInputs[user.id] ?? (user.balance || 0)
                                }
                                onChange={(e) =>
                                  setBalanceInputs((prev) => ({
                                    ...prev,
                                    [user.id]: e.target.value,
                                  }))
                                }
                                className="w-24 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white text-xs focus:outline-none focus:border-amber-400/50 transition-colors"
                                min="0"
                                step="0.01"
                              />
                              <button
                                onClick={() => handleBalanceUpdate(user.id)}
                                disabled={balanceUpdating === user.id}
                                className="px-3 py-1.5 bg-amber-500/15 text-amber-400 border border-amber-500/20 text-xs font-medium rounded-lg hover:bg-amber-500/25 transition-colors disabled:opacity-50 shrink-0"
                              >
                                {balanceUpdating === user.id ? "..." : "Set"}
                              </button>
                            </div>
                          </td>
                          {/* Total withdrawn */}
                          <td className="px-5 py-4">
                            <div>
                              <p className="text-sky-400 font-bold">
                                ${(user.totalWithdrawal || 0).toFixed(2)}
                              </p>
                              {user.lastWithdrawal && (
                                <p className="text-gray-600 text-[10px] mt-0.5">
                                  Last: $
                                  {user.lastWithdrawal.amount?.toFixed(2)} ·{" "}
                                  {user.lastWithdrawal.timestamp}
                                </p>
                              )}
                            </div>
                          </td>
                          {/* Set withdrawal balance */}
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                value={
                                  withdrawalInputs[user.id] ??
                                  (user.tradingAccount?.balance || 0)
                                }
                                onChange={(e) =>
                                  setWithdrawalInputs((prev) => ({
                                    ...prev,
                                    [user.id]: e.target.value,
                                  }))
                                }
                                className="w-24 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white text-xs focus:outline-none focus:border-sky-400/50 transition-colors"
                                min="0"
                                step="0.01"
                              />
                              <button
                                onClick={() => handleWithdrawalUpdate(user.id)}
                                disabled={withdrawalUpdating === user.id}
                                className="px-3 py-1.5 bg-sky-500/15 text-sky-400 border border-sky-500/20 text-xs font-medium rounded-lg hover:bg-sky-500/25 transition-colors disabled:opacity-50 shrink-0"
                              >
                                {withdrawalUpdating === user.id ? "..." : "Set"}
                              </button>
                            </div>
                          </td>
                          {/* Referral Code */}
                          <td className="px-5 py-4">
                            <p className="text-amber-400 text-xs font-mono font-bold">
                              {user.referralCode || "—"}
                            </p>
                          </td>
                          {/* Referred By */}
                          <td className="px-5 py-4">
                            <p className="text-gray-400 text-xs font-mono">
                              {user.referredBy || "—"}
                            </p>
                          </td>
                          {/* Referrals count + level */}
                          <td className="px-5 py-4">
                            {user.referrals?.length > 0 ? (
                              <div className="flex flex-col gap-1">
                                <button
                                  onClick={() => setReferralModal(user)}
                                  className="flex items-center gap-1.5 px-2.5 py-1 bg-violet-500/15 text-violet-400 border border-violet-500/20 text-xs font-medium rounded-lg hover:bg-violet-500/25 transition-colors w-fit"
                                >
                                  <svg
                                    className="w-3 h-3"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
                                    />
                                  </svg>
                                  {user.referrals.length}
                                </button>
                                <span
                                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full w-fit ${
                                    user.referrals.length >= 11
                                      ? "bg-yellow-500/20 text-yellow-400"
                                      : user.referrals.length >= 6
                                        ? "bg-slate-400/20 text-slate-300"
                                        : "bg-orange-700/20 text-orange-400"
                                  }`}
                                >
                                  {getReferralLevel(user.referrals.length)}
                                </span>
                              </div>
                            ) : (
                              <span className="text-gray-700 text-xs">0</span>
                            )}
                          </td>
                          {/* Status */}
                          <td className="px-5 py-4">
                            <span
                              className={`text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap ${
                                user.status === "active"
                                  ? "bg-emerald-500/15 text-emerald-400"
                                  : "bg-red-500/15 text-red-400"
                              }`}
                            >
                              {user.status || "active"}
                            </span>
                          </td>
                          {/* Joined */}
                          <td className="px-5 py-4">
                            <p className="text-gray-500 text-xs whitespace-nowrap">
                              {user.createdAt
                                ? new Date(user.createdAt).toLocaleDateString(
                                    "en-US",
                                    {
                                      year: "numeric",
                                      month: "short",
                                      day: "numeric",
                                    },
                                  )
                                : "—"}
                            </p>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ══════════ WITHDRAWALS TAB ══════════ */}
      {activeTab === "withdrawals" && (
        <div>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-5">
              <p className="text-rose-400/70 text-xs mb-1">Pending</p>
              <p className="text-rose-400 text-2xl font-bold">
                {withdrawals.filter((w) => w.status === "PENDING").length}
              </p>
            </div>
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-5">
              <p className="text-emerald-400/70 text-xs mb-1">Completed</p>
              <p className="text-emerald-400 text-2xl font-bold">
                {withdrawals.filter((w) => w.status === "COMPLETED").length}
              </p>
            </div>
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-5">
              <p className="text-blue-400/70 text-xs mb-1">Total Paid Out</p>
              <p className="text-blue-400 text-2xl font-bold">
                $
                {withdrawals
                  .filter((w) => w.status === "COMPLETED")
                  .reduce((s, w) => s + (w.amount || 0), 0)
                  .toFixed(2)}
              </p>
            </div>
          </div>

          {/* Filter */}
          <div className="flex gap-2 mb-6">
            {["PENDING", "COMPLETED", "REJECTED", "ALL"].map((f) => (
              <button
                key={f}
                onClick={() => setWFilter(f)}
                className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                  wFilter === f
                    ? "bg-white text-black"
                    : "bg-white/5 border border-white/10 text-gray-400 hover:text-white"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {withdrawalsLoading ? (
            <div className="py-16 text-center text-gray-600">Loading...</div>
          ) : (
            <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl overflow-hidden">
              {withdrawals.filter(
                (w) => wFilter === "ALL" || w.status === wFilter,
              ).length === 0 ? (
                <div className="py-16 text-center text-gray-600">
                  No withdrawal requests found
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/5">
                        {[
                          "User",
                          "Amount",
                          "Address",
                          "Requested At",
                          "Status",
                          "Action",
                        ].map((h) => (
                          <th
                            key={h}
                            className="text-left text-gray-500 text-xs font-medium px-6 py-4"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {withdrawals
                        .filter(
                          (w) => wFilter === "ALL" || w.status === wFilter,
                        )
                        .map((w) => (
                          <tr
                            key={w.id}
                            className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]"
                          >
                            <td className="px-6 py-4">
                              <p className="text-white text-sm">
                                {w.userName || w.userEmail}
                              </p>
                              <p className="text-gray-600 text-xs">
                                {w.userEmail}
                              </p>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-rose-400 font-bold">
                                ${(w.amount || 0).toFixed(2)}
                              </p>
                              <p className="text-gray-600 text-xs">
                                USDT TRC20
                              </p>
                            </td>
                            <td className="px-6 py-4">
                              <p
                                className="text-gray-300 text-xs font-mono max-w-[160px] truncate"
                                title={w.address}
                              >
                                {w.address}
                              </p>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-gray-400 text-xs">
                                {w.requestedAt || w.createdAt?.slice(0, 10)}
                              </p>
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                                  w.status === "PENDING"
                                    ? "bg-amber-500/15 text-amber-400"
                                    : w.status === "COMPLETED"
                                      ? "bg-emerald-500/15 text-emerald-400"
                                      : "bg-red-500/15 text-red-400"
                                }`}
                              >
                                {w.status}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              {w.status === "PENDING" ? (
                                <div className="flex gap-2">
                                  <button
                                    onClick={() =>
                                      handleWithdrawalAction(
                                        w.id,
                                        "COMPLETED",
                                        w,
                                      )
                                    }
                                    disabled={wUpdating === w.id}
                                    className="px-3 py-1.5 bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 text-xs font-medium rounded-lg hover:bg-emerald-500/25 transition-colors disabled:opacity-50"
                                  >
                                    {wUpdating === w.id ? "..." : "Complete"}
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleWithdrawalAction(
                                        w.id,
                                        "REJECTED",
                                        w,
                                      )
                                    }
                                    disabled={wUpdating === w.id}
                                    className="px-3 py-1.5 bg-red-500/15 text-red-400 border border-red-500/20 text-xs font-medium rounded-lg hover:bg-red-500/25 transition-colors disabled:opacity-50"
                                  >
                                    Reject
                                  </button>
                                </div>
                              ) : (
                                <span className="text-gray-600 text-xs">—</span>
                              )}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ══════════ REFERRAL DETAIL MODAL ══════════ */}
      {referralModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 pb-4 sm:pb-0">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setReferralModal(null)}
          />
          <div className="relative w-full max-w-lg bg-[#0F1318] border border-white/[0.08] rounded-3xl shadow-2xl overflow-hidden">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.07]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
                  {referralModal.name
                    ? referralModal.name.slice(0, 2).toUpperCase()
                    : referralModal.email?.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">
                    {referralModal.name || referralModal.email}
                  </p>
                  <p className="text-gray-500 text-xs">
                    Referral Code:{" "}
                    <span className="text-amber-400 font-mono">
                      {referralModal.referralCode}
                    </span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setReferralModal(null)}
                className="text-gray-600 hover:text-gray-300 transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3 px-6 py-4 border-b border-white/[0.07]">
              <div className="text-center">
                <p className="text-violet-400 text-2xl font-bold">
                  {referralModal.referrals?.length || 0}
                </p>
                <p className="text-gray-600 text-xs mt-0.5">Total Referrals</p>
              </div>
              <div className="text-center">
                <p className="text-emerald-400 text-2xl font-bold">
                  ${(referralModal.totalReferralCommission || 0).toFixed(2)}
                </p>
                <p className="text-gray-600 text-xs mt-0.5">Total Commission</p>
              </div>
              <div className="text-center">
                <p className="text-emerald-400 text-sm font-mono font-bold mt-1">
                  {referralModal.referredBy || "—"}
                </p>
                <p className="text-gray-600 text-xs mt-0.5">Referred By</p>
              </div>
            </div>

            {/* Referred users list */}
            <div className="max-h-72 overflow-y-auto">
              {referralModal.referrals?.length === 0 ? (
                <div className="py-10 text-center text-gray-600 text-sm">
                  No referrals yet
                </div>
              ) : (
                <div className="divide-y divide-white/[0.05]">
                  {referralModal.referrals?.map((r, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 px-6 py-4 hover:bg-white/[0.02]"
                    >
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-400/60 to-purple-500/60 flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {r.name
                          ? r.name.slice(0, 2).toUpperCase()
                          : r.email?.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">
                          {r.name || "—"}
                        </p>
                        <p className="text-gray-500 text-xs truncate">
                          {r.email}
                        </p>
                        <p className="text-gray-600 text-[10px] mt-0.5">
                          {r.joinedAt
                            ? new Date(r.joinedAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })
                            : "—"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {r.commission > 0 && (
                          <span className="text-emerald-400 text-xs font-bold">
                            ${r.commission?.toFixed(2)}
                          </span>
                        )}
                        <input
                          type="number"
                          placeholder="0.00"
                          value={
                            commissionInputs[`${referralModal.id}-${i}`] ??
                            (r.commission || "")
                          }
                          onChange={(e) =>
                            setCommissionInputs((prev) => ({
                              ...prev,
                              [`${referralModal.id}-${i}`]: e.target.value,
                            }))
                          }
                          className="w-20 px-2 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white text-xs focus:outline-none focus:border-emerald-400/50 transition-colors"
                          min="0"
                          step="0.01"
                        />
                        <button
                          onClick={() =>
                            handleCommissionUpdate(
                              referralModal.id,
                              r.userId,
                              i,
                            )
                          }
                          disabled={
                            commissionUpdating === `${referralModal.id}-${i}`
                          }
                          className="px-2.5 py-1.5 bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 text-xs font-medium rounded-lg hover:bg-emerald-500/25 transition-colors disabled:opacity-50"
                        >
                          {commissionUpdating === `${referralModal.id}-${i}`
                            ? "..."
                            : "Set"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer note for future commission */}
            <div className="px-6 py-4 border-t border-white/[0.07] bg-white/[0.01]">
              <p className="text-gray-600 text-xs text-center">
                Set commission amount per referred user
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
