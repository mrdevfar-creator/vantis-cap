// app/signup/page.js
"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { auth, db } from "../lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, updateDoc, arrayUnion, getDoc } from "firebase/firestore";

function generateReferralCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "VC-";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [refCode, setRefCode] = useState("");
  const [refUid, setRefUid] = useState("");
  const [referrerName, setReferrerName] = useState("");

  useEffect(() => {
    const ref = searchParams.get("ref");
    const uid = searchParams.get("uid");
    if (ref) setRefCode(ref);
    if (uid) {
      setRefUid(uid);
      // Fetch referrer name directly by uid — no query needed
      getDoc(doc(db, "users", uid))
        .then((snap) => {
          if (snap.exists()) {
            const d = snap.data();
            setReferrerName(d.name || d.email?.split("@")[0] || "a friend");
          }
        })
        .catch(() => {});
    }
  }, [searchParams]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 1. Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password,
      );
      const user = userCredential.user;
      const newReferralCode = generateReferralCode();

      // 2. Save new user document
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
        tradingAccount: { type: "standard", leverage: "1:100", balance: 0 },
        referralCode: newReferralCode,
        referredBy: refCode || null,
        referredByUid: refUid || null,
        referrals: [],
      });

      // 3. Update referrer directly by uid — no query, no index needed
      if (refUid) {
        try {
          await updateDoc(doc(db, "users", refUid), {
            referrals: arrayUnion({
              userId: user.uid,
              name: formData.name,
              email: formData.email,
              joinedAt: new Date().toISOString(),
            }),
          });
          console.log("Referral updated successfully for uid:", refUid);
        } catch (refErr) {
          console.error("Referral update failed:", refErr);
        }
      }

      router.push("/dashboard");
    } catch (err) {
      console.error("Signup error:", err);
      if (err.code === "auth/email-already-in-use") {
        setError("This email is already registered. Please sign in.");
      } else if (err.code === "auth/weak-password") {
        setError("Password must be at least 6 characters.");
      } else {
        setError("Something went wrong: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080B10] flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-amber-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-violet-500/5 rounded-full blur-[100px]" />
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage:
              "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      <div className="relative w-full max-w-md py-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <svg
                className="w-5 h-5 text-black"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941"
                />
              </svg>
            </div>
            <span className="text-white text-xl font-bold tracking-tight">
              Vantis Capital
            </span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
          <p className="text-gray-500 text-sm">
            Join thousands of investors worldwide
          </p>
        </div>

        {refCode && (
          <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center shrink-0">
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
                  d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
                />
              </svg>
            </div>
            <div>
              <p className="text-amber-400 text-xs font-semibold">
                Referral Invitation
              </p>
              <p className="text-white text-sm">
                {referrerName
                  ? `${referrerName} invited you to join!`
                  : `Invited via referral code ${refCode}`}
              </p>
            </div>
          </div>
        )}

        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-8 backdrop-blur-sm">
          {error && (
            <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-6">
              <svg
                className="w-4 h-4 text-red-400 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                />
              </svg>
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-5">
            <div>
              <label className="text-gray-400 text-xs font-medium block mb-2">
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Smith"
                required
                className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 text-sm focus:outline-none focus:border-amber-400/50 focus:bg-white/[0.07] transition-colors"
              />
            </div>
            <div>
              <label className="text-gray-400 text-xs font-medium block mb-2">
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="example@email.com"
                required
                className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 text-sm focus:outline-none focus:border-amber-400/50 focus:bg-white/[0.07] transition-colors"
              />
            </div>
            <div>
              <label className="text-gray-400 text-xs font-medium block mb-2">
                Phone Number <span className="text-gray-600">(optional)</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1 234 567 8900"
                className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 text-sm focus:outline-none focus:border-amber-400/50 focus:bg-white/[0.07] transition-colors"
              />
            </div>
            <div>
              <label className="text-gray-400 text-xs font-medium block mb-2">
                Password *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min. 6 characters"
                  required
                  minLength="6"
                  className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 text-sm focus:outline-none focus:border-amber-400/50 focus:bg-white/[0.07] transition-colors pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? (
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
                        d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                      />
                    </svg>
                  ) : (
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
                        d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-amber-400 to-orange-500 text-black text-sm font-bold rounded-xl hover:opacity-90 hover:-translate-y-0.5 transition-all duration-200 shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="w-4 h-4 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Creating account...
                </span>
              ) : (
                "Create Account"
              )}
            </button>

            <p className="text-gray-600 text-xs text-center">
              By creating an account, you agree to our{" "}
              <span className="text-gray-400">Terms of Service</span> and{" "}
              <span className="text-gray-400">Privacy Policy</span>
            </p>
          </form>
        </div>

        <p className="text-center text-gray-600 text-sm mt-6">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-amber-400 hover:text-amber-300 font-medium transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#080B10] flex items-center justify-center">
          <p className="text-gray-500 text-sm">Loading...</p>
        </div>
      }
    >
      <SignupForm />
    </Suspense>
  );
}
