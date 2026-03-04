"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, addDoc } from "firebase/firestore";
import Link from "next/link";

const TRC20_ADDRESS = "TYourTRC20AddressHere"; // ← এখানে আপনার আসল TRC20 address দিন

export default function DepositPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState({
    amount: "",
    txId: "",
  });
  const [error, setError] = useState("");

  // Auth check
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        router.push("/login");
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  // TRC20 address copy
  const handleCopy = () => {
    navigator.clipboard.writeText(TRC20_ADDRESS);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.amount || !formData.txId) {
      setError("সব তথ্য পূরণ করুন");
      return;
    }
    if (isNaN(formData.amount) || parseFloat(formData.amount) <= 0) {
      setError("সঠিক পরিমাণ লিখুন");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      // Firestore এ deposit request save করুন
      await addDoc(collection(db, "deposits"), {
        userId: user.uid,
        userEmail: user.email,
        amount: parseFloat(formData.amount),
        txId: formData.txId,
        method: "CRYPTO_USDT_TRC20",
        status: "PENDING",
        createdAt: new Date().toLocaleString("en-BD", {
          timeZone: "Asia/Dhaka",
        }),
      });

      setShowModal(true);
      setFormData({ amount: "", txId: "" });
    } catch (err) {
      setError("সমস্যা হয়েছে, আবার চেষ্টা করুন");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0D14] flex items-center justify-center">
        <p className="text-white">লোড হচ্ছে...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0D14] py-10 px-4">
      <div className="max-w-lg mx-auto">
        {/* Back button */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-gray-400 text-sm mb-8 hover:text-white transition-colors"
        >
          ← ড্যাশবোর্ডে ফিরুন
        </Link>

        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-8">
          <h1 className="text-2xl font-bold text-white mb-2">ডিপোজিট করুন</h1>
          <p className="text-gray-400 text-sm mb-8">
            USDT (TRC20) পাঠান এবং নিচের ফর্ম পূরণ করুন
          </p>

          {/* TRC20 Address */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-5 mb-6">
            <p className="text-gray-400 text-xs font-medium uppercase tracking-widest mb-3">
              আমাদের TRC20 Address
            </p>
            <div className="flex items-center gap-3">
              <p className="text-white text-sm font-mono break-all flex-1">
                {TRC20_ADDRESS}
              </p>
              <button
                onClick={handleCopy}
                className="shrink-0 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold rounded-lg transition-colors"
              >
                {copied ? "✓ Copied" : "Copy"}
              </button>
            </div>
            <p className="text-amber-400/70 text-xs mt-3">
              ⚠️ শুধুমাত্র USDT TRC20 পাঠান। অন্য coin পাঠালে ফেরত পাবেন না।
            </p>
          </div>

          {/* Form */}
          <div className="space-y-5">
            {/* Amount */}
            <div>
              <label className="text-gray-400 text-xs font-medium block mb-2">
                কত USDT পাঠিয়েছেন? *
              </label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="যেমন: 100"
                className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 text-sm focus:outline-none focus:border-amber-400/50 transition-colors"
              />
            </div>

            {/* Transaction ID */}
            <div>
              <label className="text-gray-400 text-xs font-medium block mb-2">
                Transaction ID (TXID) *
              </label>
              <input
                type="text"
                name="txId"
                value={formData.txId}
                onChange={handleChange}
                placeholder="Transaction hash টি paste করুন"
                className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 text-sm focus:outline-none focus:border-amber-400/50 transition-colors"
              />
              <p className="text-gray-600 text-xs mt-1.5">
                TronScan এ আপনার transaction এর hash টি copy করুন
              </p>
            </div>

            {/* Error */}
            {error && (
              <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3">
                {error}
              </p>
            )}

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full py-4 bg-gradient-to-r from-amber-400 to-orange-500 text-black text-sm font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "জমা হচ্ছে..." : "ডিপোজিট জমা দিন"}
            </button>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
          <div className="bg-[#0D1117] border border-white/10 rounded-2xl p-8 max-w-sm w-full text-center">
            <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-5">
              <svg
                className="w-8 h-8 text-amber-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-white text-xl font-bold mb-2">
              অনুরোধ জমা হয়েছে
            </h2>
            <p className="text-gray-400 text-sm mb-6">
              আপনার ডিপোজিট রিকোয়েস্ট পেন্ডিং আছে। Admin যাচাই করার পরে আপনার
              ব্যালেন্স আপডেট হবে।
            </p>
            <button
              onClick={() => {
                setShowModal(false);
                router.push("/dashboard");
              }}
              className="w-full py-3 bg-white text-black text-sm font-bold rounded-xl hover:bg-gray-100 transition-colors"
            >
              ড্যাশবোর্ডে ফিরুন
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
