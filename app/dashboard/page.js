// app/dashboard/page.js
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { auth, db } from "../lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, updateDoc, collection, addDoc, query, where, getDocs, onSnapshot, orderBy } from "firebase/firestore";

const ADMIN_EMAIL = "khaialamu@gmail.com";

// ── Balance Updated Modal (shown to user when admin updates balance) ───────────
function BalanceUpdatedModal({ oldBalance, newBalance, onClose }) {
  const diff = newBalance - oldBalance;
  const increased = diff >= 0;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative w-full max-w-sm bg-[#0F1318] border border-white/[0.08] rounded-3xl p-8 shadow-2xl">
        {/* Animated icon */}
        <div className="flex items-center justify-center mb-6">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border ${
            increased
              ? "bg-emerald-400/15 border-emerald-500/30"
              : "bg-rose-400/15 border-rose-500/30"
          }`}>
            <svg className={`w-8 h-8 ${increased ? "text-emerald-400" : "text-rose-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              {increased
                ? <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                : <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6L9 12.75l4.306-4.307a11.95 11.95 0 015.814 5.519l2.74 1.22m0 0l-5.94 2.28m5.94-2.28l-2.28-5.941" />
              }
            </svg>
          </div>
        </div>

        <h2 className="text-white text-xl font-bold text-center mb-1">Balance Updated</h2>
        <p className="text-gray-500 text-sm text-center mb-8">Your account balance has been updated by the admin.</p>

        <div className="space-y-3 mb-8">
          <div className="flex items-center justify-between p-4 bg-white/[0.03] border border-white/[0.06] rounded-xl">
            <p className="text-gray-500 text-sm">Previous Balance</p>
            <p className="text-rose-400 font-bold">${oldBalance.toFixed(2)}</p>
          </div>
          <div className="flex items-center justify-between p-4 bg-white/[0.03] border border-white/[0.06] rounded-xl">
            <p className="text-gray-500 text-sm">New Balance</p>
            <p className="text-emerald-400 font-bold">${newBalance.toFixed(2)}</p>
          </div>
          <div className={`flex items-center justify-between p-4 rounded-xl border ${
            increased ? "bg-emerald-500/5 border-emerald-500/15" : "bg-rose-500/5 border-rose-500/15"
          }`}>
            <p className="text-gray-500 text-sm">Change</p>
            <p className={`font-bold ${increased ? "text-emerald-400" : "text-rose-400"}`}>
              {increased ? "+" : ""}${diff.toFixed(2)}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3.5 bg-gradient-to-r from-amber-400 to-orange-500 text-black font-bold rounded-xl hover:opacity-90 transition-all"
        >
          Got it
        </button>
      </div>
    </div>
  );
}


// ── Withdraw Tab Component ─────────────────────────────────────────────────────
function WithdrawTab({ user, userData, deposits, withdrawalRequests }) {
  const [amount, setAmount] = useState("");
  const [address, setAddress] = useState(userData?.withdrawalAddress || "");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [timeLeft, setTimeLeft] = useState(null);

  // Check if 1 hour has passed since last approved deposit
  const getWithdrawStatus = () => {
    if (!deposits || deposits.length === 0) return { allowed: false, reason: "no_deposit" };
    const lastDeposit = deposits[0];
    // Try createdAt first (ISO), fallback: if unparseable allow withdrawal
    let depositTime = NaN;
    if (lastDeposit.createdAt) depositTime = new Date(lastDeposit.createdAt).getTime();
    // If date is invalid or very old (>24h), just allow
    if (isNaN(depositTime) || depositTime <= 0) return { allowed: true };
    const now = Date.now();
    const lockTime = 96 * 60 * 60 * 1000; // 96 hours
    const elapsed = now - depositTime;
    if (elapsed >= lockTime) return { allowed: true };
    return { allowed: false, reason: "too_soon", remaining: lockTime - elapsed };
  };

  useEffect(() => {
    const status = getWithdrawStatus();
    if (!status.allowed && status.reason === "too_soon") {
      setTimeLeft(status.remaining);
      const interval = setInterval(() => {
        const s = getWithdrawStatus();
        if (s.allowed) { setTimeLeft(null); clearInterval(interval); }
        else setTimeLeft(s.remaining);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [deposits]);

  const formatTime = (ms) => {
    const totalSec = Math.floor(ms / 1000);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    if (h > 0) return `${h}h ${m.toString().padStart(2, "0")}m ${s.toString().padStart(2, "0")}s`;
    return `${m}m ${s.toString().padStart(2, "0")}s`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const status = getWithdrawStatus();
    if (!status.allowed) return;
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) { setError("Enter a valid amount"); return; }
    if (amt > (userData?.balance || 0)) { setError("Amount exceeds your balance"); return; }
    if (!address.trim()) { setError("Enter a withdrawal address"); return; }

    setSubmitting(true);
    setError("");
    try {
      await addDoc(collection(db, "withdrawals"), {
        userId: user.uid,
        userEmail: user.email,
        userName: userData?.name || "",
        amount: amt,
        address: address.trim(),
        status: "PENDING",
        createdAt: new Date().toISOString(),
        requestedAt: new Date().toLocaleString("en-US", { timeZone: "Asia/Dhaka", hour: "2-digit", minute: "2-digit", hour12: true, month: "numeric", day: "numeric", year: "2-digit" }),
      });
      setSubmitted(true);
      setAmount("");
    } catch (err) { setError("Failed to submit: " + err.message); }
    finally { setSubmitting(false); }
  };

  const status = getWithdrawStatus();

  const pendingRequests = (withdrawalRequests || []).filter(r => r.status === "PENDING");
  const hasPending = pendingRequests.length > 0;

  // Merge deposits + withdrawals into one timeline
  const history = [
    ...(deposits || []).map(d => ({ ...d, _type: "deposit" })),
    ...(withdrawalRequests || []).filter(r => r.status !== "PENDING").map(r => ({ ...r, _type: "withdrawal" })),
  ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  if (submitted) return (
    <div className="max-w-md mx-auto mt-8 text-center">
      <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto mb-5">
        <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h3 className="text-white text-xl font-bold mb-2">Request Submitted!</h3>
      <p className="text-gray-500 text-sm mb-2">Your withdrawal request has been sent to admin.</p>
      <p className="text-gray-600 text-xs mb-6">You can track the status below.</p>
      <button onClick={() => setSubmitted(false)} className="px-6 py-2.5 bg-white/5 border border-white/10 text-gray-300 text-sm rounded-xl hover:bg-white/10 transition-all">
        Back
      </button>
    </div>
  );

  return (
    <div className="max-w-lg space-y-5">
      {/* Balance info */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-rose-500/10 via-pink-500/5 to-transparent border border-rose-500/15 p-6">
        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />
        <p className="text-rose-400/70 text-xs font-semibold uppercase tracking-widest mb-1">Available Balance</p>
        <p className="text-white text-3xl font-bold mb-1">${(userData?.balance || 0).toFixed(2)}</p>
        <p className="text-gray-500 text-sm">Withdrawal address: <span className="text-gray-300 font-mono text-xs">{userData?.withdrawalAddress || "Not set"}</span></p>
      </div>

      {/* Not available state */}
      {!status.allowed && (
        <div className={`rounded-2xl border p-5 ${
          status.reason === "no_deposit"
            ? "bg-gray-500/5 border-gray-500/20"
            : "bg-amber-500/8 border-amber-500/20"
        }`}>
          <div className="flex items-start gap-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              status.reason === "no_deposit" ? "bg-gray-500/15" : "bg-amber-500/15"
            }`}>
              <svg className={`w-5 h-5 ${status.reason === "no_deposit" ? "text-gray-500" : "text-amber-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className={`font-semibold text-sm mb-1 ${status.reason === "no_deposit" ? "text-gray-400" : "text-amber-400"}`}>
                Your balance is not available for withdrawal
              </p>
              {status.reason === "no_deposit" && (
                <p className="text-gray-600 text-xs">You need at least one approved deposit to withdraw.</p>
              )}
              {status.reason === "too_soon" && timeLeft && (
                <div>
                  <p className="text-gray-500 text-xs mb-2">Your last deposit needs to be at least 96 hours old before you can withdraw.</p>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    <p className="text-amber-400 text-sm font-bold font-mono">Available in {formatTime(timeLeft)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Pending withdrawal requests */}
      {hasPending && (
        <div className="space-y-3">
          {pendingRequests.map(req => (
            <div key={req.id} className="flex items-center gap-4 p-4 bg-amber-500/8 border border-amber-500/20 rounded-2xl">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-white font-semibold text-sm">Withdrawal Pending</p>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 font-medium">Pending</span>
                </div>
                <p className="text-gray-500 text-xs">Amount: <span className="text-white font-bold">${(req.amount || 0).toFixed(2)}</span></p>
                <p className="text-gray-600 text-xs mt-0.5 font-mono truncate">{req.address}</p>
              </div>
              <p className="text-gray-600 text-xs shrink-0">{req.requestedAt || req.createdAt?.slice(0,10)}</p>
            </div>
          ))}
        </div>
      )}

      {/* Withdraw form — only if allowed and no pending */}
      {status.allowed && !hasPending && (
        <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6 space-y-4">
          <p className="text-white font-semibold text-sm">New Withdrawal Request</p>
          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-gray-400 text-xs font-medium block mb-2">Amount (USD)</label>
              <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
                placeholder="0.00" min="1" step="0.01" max={userData?.balance || 0}
                className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 text-sm focus:outline-none focus:border-rose-400/50 transition-colors" />
              <p className="text-gray-600 text-xs mt-1.5">Max: ${(userData?.balance || 0).toFixed(2)}</p>
            </div>
            <div>
              <label className="text-gray-400 text-xs font-medium block mb-2">Withdrawal Address (USDT TRC20)</label>
              <input type="text" value={address} onChange={e => setAddress(e.target.value)}
                placeholder="Your USDT TRC20 wallet address"
                className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 text-sm focus:outline-none focus:border-rose-400/50 transition-colors font-mono text-xs" />
            </div>
            <button type="submit" disabled={submitting}
              className="w-full py-3.5 bg-gradient-to-r from-rose-400 to-pink-500 text-white text-sm font-bold rounded-xl hover:opacity-90 disabled:opacity-50 transition-all">
              {submitting ? "Submitting..." : "Submit Withdrawal Request"}
            </button>
          </form>
        </div>
      )}

      {/* Transaction History */}
      {history.length > 0 && (
        <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/[0.06]">
            <p className="text-white font-semibold text-sm">Transaction History</p>
          </div>
          <div className="divide-y divide-white/[0.05]">
            {history.map((item, i) => {
              const isDeposit = item._type === "deposit";
              const isCompleted = item.status === "APPROVED" || item.status === "COMPLETED";
              const isRejected = item.status === "REJECTED";
              return (
                <div key={item.id || i} className="flex items-center gap-4 px-5 py-4">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    isDeposit ? "bg-emerald-500/15" : "bg-rose-500/15"
                  }`}>
                    <svg className={`w-4 h-4 ${isDeposit ? "text-emerald-400" : "text-rose-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      {isDeposit
                        ? <path strokeLinecap="round" strokeLinejoin="round" d="M9 8.25H7.5a2.25 2.25 0 00-2.25 2.25v9a2.25 2.25 0 002.25 2.25h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25H15M9 12l3 3m0 0l3-3m-3 3V2.25" />
                        : <path strokeLinecap="round" strokeLinejoin="round" d="M9 8.25H7.5a2.25 2.25 0 00-2.25 2.25v9a2.25 2.25 0 002.25 2.25h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25H15m0-3l-3-3m0 0L9 5.25M12 2.25v13.5" />
                      }
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium">
                      {isDeposit ? "Deposit" : "Withdrawal"}
                    </p>
                    <p className="text-gray-600 text-xs">
                      {item.createdAt ? new Date(item.createdAt).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true }) : "—"}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`font-bold text-sm ${isDeposit ? "text-emerald-400" : "text-rose-400"}`}>
                      {isDeposit ? "+" : "-"}${(item.amount || 0).toFixed(2)}
                    </p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      isCompleted ? "bg-emerald-500/15 text-emerald-400"
                      : isRejected ? "bg-red-500/15 text-red-400"
                      : "bg-amber-500/15 text-amber-400"
                    }`}>
                      {isDeposit ? (item.status === "APPROVED" ? "Approved" : item.status) : (item.status === "COMPLETED" ? "Completed" : item.status === "REJECTED" ? "Rejected" : item.status)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Shared content ─────────────────────────────────────────────────────────────
function MainContent({ activeTab, setActiveTab, user, userData, editing, setEditing, formData, handleInputChange, handleUpdateProfile, updating, error, saveSuccess, deposits, withdrawalRequests }) {

  const STATS = [
    { label: "Balance", value: "$" + (userData?.balance || 0).toFixed(2), sub: userData?.balanceUpdatedAt ? "Updated " + userData.balanceUpdatedAt : "Available", grad: "from-amber-400 to-orange-500", bg: "from-amber-500/10 to-orange-500/5", border: "border-amber-500/15", d: "M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.172-.879-1.172-2.303 0-3.182.53-.399 1.19-.62 1.97-.62.78 0 1.44.221 1.97.62" },
    { label: "Deposited", value: "$" + (userData?.totalDeposit || 0).toFixed(2), sub: "All time", grad: "from-emerald-400 to-teal-500", bg: "from-emerald-500/10 to-teal-500/5", border: "border-emerald-500/15", d: "M9 8.25H7.5a2.25 2.25 0 00-2.25 2.25v9a2.25 2.25 0 002.25 2.25h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25H15M9 12l3 3m0 0l3-3m-3 3V2.25" },
    { label: "Total Withdrawn", value: "$" + (userData?.totalWithdrawal || 0).toFixed(2), sub: "All time", grad: "from-rose-400 to-pink-500", bg: "from-rose-500/10 to-pink-500/5", border: "border-rose-500/15", d: "M9 8.25H7.5a2.25 2.25 0 00-2.25 2.25v9a2.25 2.25 0 002.25 2.25h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25H15m0-3l-3-3m0 0L9 5.25M12 2.25v13.5" },
    { label: "Last Withdrawal", value: userData?.lastWithdrawal ? "$" + (userData.lastWithdrawal.amount || 0).toFixed(2) : "—", sub: userData?.lastWithdrawal?.timestamp || "No withdrawals yet", grad: "from-orange-400 to-red-500", bg: "from-orange-500/10 to-red-500/5", border: "border-orange-500/15", d: "M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" },
    { label: "Account", value: (userData?.tradingAccount?.type || "standard")[0].toUpperCase() + (userData?.tradingAccount?.type || "standard").slice(1), sub: userData?.tradingAccount?.leverage || "1:100", grad: "from-violet-400 to-purple-500", bg: "from-violet-500/10 to-purple-500/5", border: "border-violet-500/15", d: "M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
  ];

  const initials = userData?.name
    ? userData.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : user?.email?.slice(0, 2).toUpperCase();

  return (
    <div>
      {saveSuccess && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl px-5 py-3.5 shadow-xl">
          <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
          <p className="text-emerald-400 text-sm font-medium">Profile updated successfully</p>
        </div>
      )}
      {error && (
        <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-2xl px-5 py-3.5 mb-5">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* OVERVIEW */}
      {activeTab === "overview" && (
        <div className="space-y-5">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent border border-amber-500/15 p-6">
            <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
            <p className="text-amber-400/70 text-xs font-semibold uppercase tracking-widest mb-1">Welcome back</p>
            <h2 className="text-2xl font-bold text-white mb-1">{userData?.name || user?.email?.split("@")[0]} 👋</h2>
            <p className="text-gray-500 text-sm">Here is your portfolio overview.</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            {STATS.map(s => (
              <div key={s.label} className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${s.bg} border ${s.border} p-4`}>
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${s.grad} flex items-center justify-center mb-3`}>
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d={s.d} /></svg>
                </div>
                <p className="text-gray-500 text-xs mb-0.5">{s.label}</p>
                <p className="text-white text-lg font-bold tabular-nums">{s.value}</p>
                <p className="text-gray-600 text-xs">{s.sub}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            <Link href="/deposit" className="group flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.07] hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 group-hover:bg-emerald-500/20 transition-colors">
                <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
              </div>
              <div className="flex-1"><p className="text-white font-semibold text-sm">Make a Deposit</p><p className="text-gray-600 text-xs">Add funds via USDT TRC20</p></div>
              <svg className="w-4 h-4 text-gray-700 group-hover:text-emerald-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
            </Link>
            <button onClick={() => setActiveTab("profile")} className="group flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.07] hover:border-violet-500/30 hover:bg-violet-500/5 transition-all text-left">
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0 group-hover:bg-violet-500/20 transition-colors">
                <svg className="w-5 h-5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
              </div>
              <div className="flex-1"><p className="text-white font-semibold text-sm">Edit Profile</p><p className="text-gray-600 text-xs">Update your details</p></div>
              <svg className="w-4 h-4 text-gray-700 group-hover:text-violet-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
            </button>
            <button onClick={() => setActiveTab("trading")} className="group flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.07] hover:border-sky-500/30 hover:bg-sky-500/5 transition-all text-left">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center shrink-0 group-hover:bg-sky-500/20 transition-colors">
                <svg className="w-5 h-5 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" /></svg>
              </div>
              <div className="flex-1"><p className="text-white font-semibold text-sm">Trading Account</p><p className="text-gray-600 text-xs">View account details</p></div>
              <svg className="w-4 h-4 text-gray-700 group-hover:text-sky-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
            </button>
          </div>

          <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-5">
            <p className="text-gray-500 text-xs font-semibold uppercase tracking-widest mb-4">Account Information</p>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Name", value: userData?.name || "—" },
                { label: "Email", value: user?.email },
                { label: "Phone", value: userData?.phone || "—" },
                { label: "Member Since", value: userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "—" },
              ].map(item => (
                <div key={item.label}><p className="text-gray-600 text-xs mb-1">{item.label}</p><p className="text-white text-sm font-medium truncate">{item.value}</p></div>
              ))}
            </div>
          </div>

          {/* Transaction History in Overview */}
          {((deposits?.length > 0) || (withdrawalRequests?.length > 0)) && (
            <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
                <p className="text-white font-semibold text-sm">Transaction History</p>
                <button onClick={() => setActiveTab("withdraw")} className="text-amber-400 text-xs hover:text-amber-300 transition-colors">View all →</button>
              </div>
              <div className="divide-y divide-white/[0.05]">
                {[
                  ...(deposits || []).map(d => ({ ...d, _type: "deposit" })),
                  ...(withdrawalRequests || []).map(r => ({ ...r, _type: "withdrawal" })),
                ]
                  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                  .slice(0, 8)
                  .map((item, i) => {
                    const isDeposit = item._type === "deposit";
                    const isSuccess = item.status === "APPROVED" || item.status === "COMPLETED";
                    const isRejected = item.status === "REJECTED";
                    const isPending = !isSuccess && !isRejected;
                    return (
                      <div key={item.id || i} className="flex items-center gap-4 px-5 py-3.5">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          isPending ? "bg-amber-500/15" : isDeposit ? "bg-emerald-500/15" : "bg-rose-500/15"
                        }`}>
                          <svg className={`w-4 h-4 ${isPending ? "text-amber-400" : isDeposit ? "text-emerald-400" : "text-rose-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            {isDeposit
                              ? <path strokeLinecap="round" strokeLinejoin="round" d="M9 8.25H7.5a2.25 2.25 0 00-2.25 2.25v9a2.25 2.25 0 002.25 2.25h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25H15M9 12l3 3m0 0l3-3m-3 3V2.25" />
                              : <path strokeLinecap="round" strokeLinejoin="round" d="M9 8.25H7.5a2.25 2.25 0 00-2.25 2.25v9a2.25 2.25 0 002.25 2.25h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25H15m0-3l-3-3m0 0L9 5.25M12 2.25v13.5" />
                            }
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium">{isDeposit ? "Deposit" : "Withdrawal"}</p>
                          <p className="text-gray-600 text-xs">
                            {item.createdAt ? new Date(item.createdAt).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true }) : "—"}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className={`font-bold text-sm ${isPending ? "text-amber-400" : isDeposit ? "text-emerald-400" : "text-rose-400"}`}>
                            {isDeposit ? "+" : "-"}${(item.amount || 0).toFixed(2)}
                          </p>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            isSuccess ? "bg-emerald-500/15 text-emerald-400"
                            : isRejected ? "bg-red-500/15 text-red-400"
                            : "bg-amber-500/15 text-amber-400"
                          }`}>
                            {isPending ? "Pending" : isSuccess ? (isDeposit ? "Approved" : "Completed") : "Rejected"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* PROFILE */}
      {activeTab === "profile" && (
        <div className="max-w-2xl">
          <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6">
            <div className="flex items-center gap-4 mb-6 pb-5 border-b border-white/[0.06]">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white text-lg font-bold shadow-xl shadow-violet-500/20 shrink-0">{initials}</div>
              <div className="flex-1 min-w-0">
                <h2 className="text-white font-bold truncate">{userData?.name || "Your Name"}</h2>
                <p className="text-gray-500 text-sm truncate">{user?.email}</p>
                <div className="flex items-center gap-1.5 mt-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /><span className="text-emerald-400 text-xs">{userData?.status || "active"}</span></div>
              </div>
              {!editing && <button onClick={() => setEditing(true)} className="shrink-0 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-300 hover:bg-white/10 transition-all">Edit</button>}
            </div>
            {editing ? (
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                {[
                  { label: "Full Name", name: "name", type: "text", placeholder: "Your full name", req: true },
                  { label: "Phone Number", name: "phone", type: "tel", placeholder: "+1 234 567 8900" },
                  { label: "Withdrawal Address", name: "withdrawalAddress", type: "text", placeholder: "Your wallet address" },
                ].map(f => (
                  <div key={f.name}>
                    <label className="text-gray-400 text-xs font-medium block mb-2">{f.label}</label>
                    <input type={f.type} name={f.name} value={formData[f.name]} onChange={handleInputChange} placeholder={f.placeholder} required={f.req}
                      className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 text-sm focus:outline-none focus:border-amber-400/50 transition-colors" />
                  </div>
                ))}
                <div className="flex gap-3 pt-1">
                  <button type="submit" disabled={updating} className="px-6 py-3 bg-gradient-to-r from-amber-400 to-orange-500 text-black text-sm font-bold rounded-xl hover:opacity-90 disabled:opacity-50 transition-all">{updating ? "Saving..." : "Save Changes"}</button>
                  <button type="button" onClick={() => setEditing(false)} className="px-6 py-3 bg-white/5 border border-white/10 text-gray-300 text-sm rounded-xl hover:bg-white/10 transition-all">Cancel</button>
                </div>
              </form>
            ) : (
              <div className="space-y-1">
                {[
                  { label: "Full Name", value: userData?.name || "—" },
                  { label: "Email", value: user?.email },
                  { label: "Phone", value: userData?.phone || "—" },
                  { label: "Member Since", value: userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "—" },
                  { label: "Withdrawal Address", value: userData?.withdrawalAddress || "Not set", mono: true },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between py-3.5 border-b border-white/[0.05] last:border-0">
                    <p className="text-gray-500 text-sm shrink-0">{item.label}</p>
                    <p className={`text-white text-sm font-medium max-w-[55%] text-right truncate${item.mono ? " font-mono text-xs" : ""}`}>{item.value}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* WITHDRAW */}
      {activeTab === "withdraw" && (
        <WithdrawTab user={user} userData={userData} deposits={deposits} withdrawalRequests={withdrawalRequests} />
      )}

      {/* REFERRAL */}
      {activeTab === "referral" && (
        <div className="max-w-2xl space-y-5">
          {/* Referral code card */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/15 p-6">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
            <p className="text-amber-400/70 text-xs font-semibold uppercase tracking-widest mb-3">Your Referral Code</p>
            <div className="flex items-center gap-3 mb-4">
              <p className="text-white text-3xl font-bold tracking-widest font-mono">{userData?.referralCode || "—"}</p>
            </div>
            <p className="text-gray-500 text-sm mb-5">Share your unique link and earn rewards when friends join.</p>
            <div className="flex items-center gap-2 p-3 bg-white/[0.05] border border-white/10 rounded-xl mb-4">
              <p className="text-gray-400 text-xs font-mono flex-1 truncate">
                {typeof window !== "undefined" ? window.location.origin : "https://yoursite.com"}/signup?ref={userData?.referralCode}&uid=...
              </p>
              <button
                onClick={() => {
                  const link = `${window.location.origin}/signup?ref=${userData?.referralCode}&uid=${user?.uid}`;
                  navigator.clipboard.writeText(link);
                }}
                className="shrink-0 px-3 py-1.5 bg-amber-500/15 text-amber-400 border border-amber-500/20 text-xs font-medium rounded-lg hover:bg-amber-500/25 transition-colors"
              >
                Copy Link
              </button>
            </div>
          </div>

          {/* Level + Stats */}
          {(() => {
            const count = userData?.referrals?.length || 0;
            const level = count >= 11 ? "Gold" : count >= 6 ? "Silver" : count >= 1 ? "Bronze" : null;
            const nextLevel = count >= 11 ? null : count >= 6 ? { name: "Gold", need: 11 - count, commission: "$3/referral" } : count >= 1 ? { name: "Silver", need: 6 - count, commission: "$2/referral" } : { name: "Bronze", need: 1 - count, commission: "$1/referral" };
            const levelColor = level === "Gold" ? "from-yellow-400 to-amber-500" : level === "Silver" ? "from-slate-300 to-slate-400" : "from-orange-400 to-amber-600";
            const levelBg = level === "Gold" ? "from-yellow-500/10 to-amber-500/5 border-yellow-500/20" : level === "Silver" ? "from-slate-400/10 to-slate-500/5 border-slate-400/20" : "from-orange-500/10 to-amber-600/5 border-orange-500/20";
            return (
              <>
                {level && (
                  <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${levelBg} border p-5`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400/70 text-xs mb-1">Your Level</p>
                        <p className={`text-2xl font-bold bg-gradient-to-r ${levelColor} bg-clip-text text-transparent`}>{level}</p>
                        <p className="text-gray-500 text-xs mt-1">
                          {level === "Gold" ? "$3 commission per referral" : level === "Silver" ? "$2 commission per referral" : "$1 commission per referral"}
                        </p>
                      </div>
                      <div className="text-4xl">{level === "Gold" ? "🥇" : level === "Silver" ? "🥈" : "🥉"}</div>
                    </div>
                    {nextLevel && (
                      <div className="mt-3 pt-3 border-t border-white/[0.06]">
                        <p className="text-gray-600 text-xs">{nextLevel.need} more referral{nextLevel.need > 1 ? "s" : ""} to reach <span className="text-white font-medium">{nextLevel.name}</span> ({nextLevel.commission})</p>
                      </div>
                    )}
                  </div>
                )}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-violet-500/10 border border-violet-500/15 rounded-2xl p-5">
                    <p className="text-violet-400/70 text-xs mb-1">Total Referrals</p>
                    <p className="text-violet-400 text-3xl font-bold">{count}</p>
                  </div>
                  <div className="bg-emerald-500/10 border border-emerald-500/15 rounded-2xl p-5">
                    <p className="text-emerald-400/70 text-xs mb-1">Total Commission</p>
                    <p className="text-emerald-400 text-3xl font-bold">${(userData?.totalReferralCommission || 0).toFixed(2)}</p>
                  </div>
                  <div className="bg-amber-500/10 border border-amber-500/15 rounded-2xl p-5">
                    <p className="text-amber-400/70 text-xs mb-1">Referred By</p>
                    <p className="text-amber-400 text-sm font-bold mt-1">{userData?.referredBy || "—"}</p>
                  </div>
                </div>
              </>
            );
          })()}

          {/* Referral list */}
          <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-white/[0.06]">
              <p className="text-white font-semibold text-sm">People You Referred</p>
            </div>
            {!userData?.referrals?.length ? (
              <div className="py-12 text-center">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                  </svg>
                </div>
                <p className="text-gray-600 text-sm">No referrals yet</p>
                <p className="text-gray-700 text-xs mt-1">Share your link to get started</p>
              </div>
            ) : (
              <div className="divide-y divide-white/[0.05]">
                {userData.referrals.map((r, i) => (
                  <div key={i} className="flex items-center gap-3 px-5 py-3.5">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {r.name ? r.name.slice(0, 2).toUpperCase() : r.email?.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{r.name || "—"}</p>
                      <p className="text-gray-500 text-xs truncate">{r.email}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-gray-600 text-xs">{r.joinedAt ? new Date(r.joinedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}</p>
                      {r.commission > 0 && <p className="text-emerald-400 text-xs font-bold mt-0.5">+${r.commission?.toFixed(2)}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TRADING */}
      {activeTab === "trading" && (
        <div className="max-w-2xl space-y-4">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-sky-500/10 to-blue-500/5 border border-sky-500/15 p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-500/25 flex items-center justify-center">
                <svg className="w-5 h-5 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" /></svg>
              </div>
              <div><p className="text-white font-bold">Trading Account</p><p className="text-gray-500 text-xs">Your active trading profile</p></div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Type", value: (userData?.tradingAccount?.type || "standard")[0].toUpperCase() + (userData?.tradingAccount?.type || "standard").slice(1) },
                { label: "Leverage", value: userData?.tradingAccount?.leverage || "1:100" },
                { label: "Balance", value: "$" + (userData?.tradingAccount?.balance || 0).toFixed(2), sub: userData?.withdrawalUpdatedAt ? "Updated " + userData.withdrawalUpdatedAt : undefined },
              ].map(item => (
                <div key={item.label} className="bg-white/5 rounded-xl p-4 border border-white/[0.07]">
                  <p className="text-gray-500 text-xs mb-1">{item.label}</p>
                  <p className="text-white font-bold">{item.value}</p>
                  {item.sub && <p className="text-gray-600 text-[10px] mt-1 truncate">{item.sub}</p>}
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-emerald-500/5 border border-emerald-500/15 rounded-2xl">
            <div className="w-9 h-9 rounded-full bg-emerald-500/15 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <div><p className="text-emerald-400 font-semibold text-sm">Account Active</p><p className="text-gray-500 text-xs">Your account is in good standing</p></div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [formData, setFormData] = useState({ name: "", phone: "", withdrawalAddress: "" });
  const [deposits, setDeposits] = useState([]);
  const [withdrawalRequests, setWithdrawalRequests] = useState([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        await loadUserData(user.uid);
        await fetchDeposits(user.uid);
        fetchWithdrawalRequests(user.uid);
      } else {
        router.push("/login");
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  const fetchDeposits = async (userId) => {
    try {
      const q = query(
        collection(db, "deposits"),
        where("userId", "==", userId),
        where("status", "==", "APPROVED")
      );
      const snap = await getDocs(q);
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setDeposits(data);
    } catch (e) { console.error("fetch deposits error:", e); }
  };

  const fetchWithdrawalRequests = (userId) => {
    const q = query(collection(db, "withdrawals"), where("userId", "==", userId));
    const unsubscribe = onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setWithdrawalRequests(data);
    }, (err) => console.error("withdrawal requests error:", err));
    return unsubscribe;
  };

  const loadUserData = async (userId) => {
    try {
      const docSnap = await getDoc(doc(db, "users", userId));
      if (docSnap.exists()) {
        const data = docSnap.data();
        setUserData(data);
        setFormData({ name: data.name || "", phone: data.phone || "", withdrawalAddress: data.withdrawalAddress || "" });

        // Clear balanceUpdated flag silently (no modal)
        if (data.balanceUpdated === true || data.withdrawalUpdated === true) {
          await updateDoc(doc(db, "users", userId), {
            balanceUpdated: false,
            withdrawalUpdated: false,
          });
        }
      } else {
        setUserData({ name: "", phone: "", withdrawalAddress: "", balance: 0, totalDeposit: 0, totalWithdrawal: 0, status: "active", createdAt: new Date().toISOString(), tradingAccount: { type: "standard", leverage: "1:100", balance: 0 } });
      }
    } catch (err) { setError("Failed to load data."); }
  };

  const handleLogout = async () => { try { await signOut(auth); router.push("/login"); } catch (e) {} };
  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleUpdateProfile = async (e) => {
    e.preventDefault(); setUpdating(true); setError("");
    try {
      await updateDoc(doc(db, "users", user.uid), { name: formData.name, phone: formData.phone, withdrawalAddress: formData.withdrawalAddress, updatedAt: new Date().toISOString() });
      await loadUserData(user.uid);
      setEditing(false); setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) { setError("Failed to update: " + err.message); }
    finally { setUpdating(false); }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#060810] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 animate-pulse flex items-center justify-center">
          <svg className="w-6 h-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" /></svg>
        </div>
        <p className="text-gray-500 text-sm">Loading dashboard...</p>
      </div>
    </div>
  );

  const initials = userData?.name ? userData.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : user?.email?.slice(0, 2).toUpperCase();

  const NAV = [
    { key: "overview", label: "Overview", d: "M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" },
    { key: "profile", label: "Profile", d: "M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" },
    { key: "trading", label: "Trading", d: "M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" },
    { key: "referral", label: "Referral", d: "M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" },
    { key: "withdraw", label: "Withdraw", d: "M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" },
  ];

  const contentProps = { activeTab, setActiveTab, user, userData, editing, setEditing, formData, handleInputChange, handleUpdateProfile, updating, error, saveSuccess, deposits, withdrawalRequests };

  return (
    <div className="min-h-screen bg-[#060810] text-white">
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/4 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-violet-500/4 rounded-full blur-[100px]" />
      </div>

      {/* DESKTOP */}
      <div className="hidden lg:flex h-screen overflow-hidden relative z-10">
        <aside className="w-64 shrink-0 h-screen flex flex-col bg-white/[0.02] border-r border-white/[0.06]">
          <div className="px-6 py-6 border-b border-white/[0.06] shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
                <svg className="w-5 h-5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" /></svg>
              </div>
              <div><p className="text-white text-sm font-bold">Vantis Capital</p><p className="text-gray-600 text-[10px]">Investment Platform</p></div>
            </div>
          </div>
          <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
            {NAV.map(item => (
              <button key={item.key} onClick={() => setActiveTab(item.key)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === item.key ? "bg-white/8 text-white border border-white/10" : "text-gray-500 hover:text-gray-300 hover:bg-white/4"}`}>
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d={item.d} /></svg>
                {item.label}
                {activeTab === item.key && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-amber-400" />}
              </button>
            ))}
            <div className="pt-2 border-t border-white/[0.06] space-y-1 mt-1">
              <Link href="/deposit" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-emerald-400 hover:bg-emerald-500/8 transition-all">
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                Make a Deposit
              </Link>
              {user?.email === ADMIN_EMAIL && (
                <Link href="/admin" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-gray-600 hover:text-gray-300 hover:bg-white/4 transition-all">
                  <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.108-1.204l-.526-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  Admin Panel
                </Link>
              )}
            </div>
          </nav>
          <div className="px-3 py-4 border-t border-white/[0.06] shrink-0">
            <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-white/[0.03] mb-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold shrink-0">{initials}</div>
              <div className="flex-1 min-w-0"><p className="text-white text-xs font-semibold truncate">{userData?.name || "User"}</p><p className="text-gray-600 text-[10px] truncate">{user?.email}</p></div>
            </div>
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-gray-500 hover:text-red-400 hover:bg-red-500/8 transition-all">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" /></svg>
              Sign Out
            </button>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto">
          <header className="sticky top-0 z-10 bg-[#060810]/90 backdrop-blur-xl border-b border-white/[0.06] px-8 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-white font-bold text-lg">{activeTab === "overview" ? "Dashboard Overview" : activeTab === "profile" ? "My Profile" : "Trading Account"}</h1>
              <p className="text-gray-600 text-xs">{new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-400 text-xs font-medium capitalize">{userData?.status || "active"}</span>
            </div>
          </header>
          <div className="px-8 py-8"><MainContent {...contentProps} /></div>
        </main>
      </div>

      {/* MOBILE */}
      <div className="lg:hidden flex flex-col min-h-screen relative z-10">
        <header className="sticky top-0 z-20 bg-[#060810]/95 backdrop-blur-xl border-b border-white/[0.06] px-4 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
              <svg className="w-4 h-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" /></svg>
            </div>
            <span className="text-white text-sm font-bold">Vantis Capital</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-400 text-[10px] font-medium">Active</span>
            </div>
            <button onClick={handleLogout} className="text-gray-500 hover:text-red-400 transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" /></svg>
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto px-4 py-5 pb-24"><MainContent {...contentProps} /></main>
        <nav className="fixed bottom-0 left-0 right-0 z-20 bg-[#0D1117]/95 backdrop-blur-xl border-t border-white/[0.08] flex items-center justify-around px-2 py-2">
          {NAV.map(item => (
            <button key={item.key} onClick={() => setActiveTab(item.key)}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${activeTab === item.key ? "text-amber-400" : "text-gray-600"}`}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d={item.d} /></svg>
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          ))}
          <Link href="/deposit" className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl text-emerald-400">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
            <span className="text-[10px] font-medium">Deposit</span>
          </Link>
        </nav>
      </div>
    </div>
  );
}