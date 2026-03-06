"use client";
import Link from "next/link";
import { useState } from "react";
import DepositArea from "@/app/components/DepositArea";

// All 6 deposit plans mirrored for the calculator
const CALC_PLANS = [
  { name: "Starter", min: 50, returnPct: 110, profit: 10 },
  { name: "Inner", min: 100, returnPct: 113, profit: 13 },
  { name: "Smart", min: 150, returnPct: 115, profit: 15 },
  { name: "Grower", min: 200, returnPct: 117, profit: 17 },
  { name: "Ninja", min: 250, returnPct: 118, profit: 18 },
  { name: "Master", min: 300, returnPct: 120, profit: 20 },
];

const ASSETS = [
  {
    name: "Forex",
    icon: "💱",
    desc: "Major & minor currency pairs traded 24/5 across global interbank markets.",
    instruments: "80+ pairs",
    leverage: "Up to 1:500",
  },
  {
    name: "Crypto",
    icon: "₿",
    desc: "Top cryptocurrencies including BTC, ETH, BNB and more — 24/7, 365 days.",
    instruments: "50+ coins",
    leverage: "Up to 1:100",
  },
  {
    name: "Commodities",
    icon: "🥇",
    desc: "Gold, Silver, Crude Oil and other safe-haven assets that hedge market risk.",
    instruments: "30+ assets",
    leverage: "Up to 1:200",
  },
  {
    name: "Indices",
    icon: "📈",
    desc: "S&P 500, Nasdaq, FTSE, DAX and other global stock market indices.",
    instruments: "20+ indices",
    leverage: "Up to 1:300",
  },
];

const SECURITY_POINTS = [
  {
    icon: "🧊",
    title: "95% Cold Storage",
    desc: "Only 5% of client funds are active at any time. The rest sit in offline multi-signature cold wallets — completely insulated from trading losses.",
  },
  {
    icon: "🛡️",
    title: "2% Hard Stop-Loss",
    desc: "Every single trade carries an automatic stop-loss. Maximum loss per position is hard-capped at 2% of active capital. No exceptions.",
  },
  {
    icon: "⚡",
    title: "Automatic Circuit Breakers",
    desc: "If volatility spikes beyond safe thresholds — flash crashes, black swan events — our system halts all trading and moves to cash within 200ms.",
  },
  {
    icon: "📋",
    title: "Quarterly Independent Audits",
    desc: "Trading performance and fund management are audited every quarter by independent firms. All claims about win rates and returns are third-party verified.",
  },
];

export default function InvestmentPage() {
  const [selectedPlan, setSelectedPlan] = useState(CALC_PLANS[1]); // default: Inner
  const [amount, setAmount] = useState(100);

  const totalReturn = +((amount * selectedPlan.returnPct) / 100).toFixed(2);
  const profit = +((amount * selectedPlan.profit) / 100).toFixed(2);

  // Ensure amount never goes below plan minimum when plan changes
  const handlePlanChange = (plan) => {
    setSelectedPlan(plan);
    if (amount < plan.min) setAmount(plan.min);
  };

  return (
    <div className="bg-white overflow-x-hidden">
      {/* ── PAGE HERO ── */}
      <section className="relative bg-[#0B0E17] pt-20 pb-28 sm:pt-24 sm:pb-36 overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        <div className="absolute top-0 left-1/4 w-[500px] h-[400px] bg-[#F0B90B]/8 rounded-full blur-[100px]" />
        <div className="relative z-10 max-w-4xl mx-auto px-5 sm:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-[#F0B90B]/10 border border-[#F0B90B]/20 rounded-full px-4 py-1.5 mb-6">
            <span className="text-[#F0B90B] text-xs font-bold uppercase tracking-widest">
              Investment Plans
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white leading-tight mb-5">
            Choose Your
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F0B90B] to-[#F8D12F]">
              Growth Path
            </span>
          </h1>
          <p className="text-gray-400 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
            Six carefully crafted investment tiers starting from just{" "}
            <strong className="text-white">$50</strong>. All plans include
            96-hour automated trade cycles, real-time dashboard, and instant
            withdrawals after timeout.
          </p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white to-transparent" />
      </section>

      {/* ── DEPOSIT PLANS ── */}
      <DepositArea />

      {/* ── ROI CALCULATOR ── */}
      <section className="bg-[#0B0E17] py-20 sm:py-24 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[#F0B90B]/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto px-5 sm:px-8">
          <div className="text-center mb-12">
            <p className="text-[#F0B90B] text-xs font-bold uppercase tracking-widest mb-3">
              ROI Calculator
            </p>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-3">
              Estimate Your Returns
            </h2>
            <p className="text-gray-500 text-sm">
              Adjust the sliders to see your potential earnings per 96-hour
              trade cycle.
            </p>
          </div>

          <div className="bg-[#131722] border border-[#2a2e39] rounded-2xl overflow-hidden">
            <div className="grid md:grid-cols-2 gap-0">
              {/* LEFT — controls */}
              <div className="p-6 sm:p-8 border-b md:border-b-0 md:border-r border-[#2a2e39]">
                <p className="text-gray-400 text-sm font-semibold mb-6">
                  Configure your investment
                </p>

                {/* Plan selector */}
                <div className="mb-7">
                  <label className="text-gray-500 text-xs font-semibold uppercase tracking-wider block mb-3">
                    Select Plan
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {CALC_PLANS.map((p) => (
                      <button
                        key={p.name}
                        onClick={() => handlePlanChange(p)}
                        className={`py-2.5 px-2 rounded-xl text-xs font-bold border transition-all duration-200 ${
                          selectedPlan.name === p.name
                            ? "bg-[#F0B90B] border-[#F0B90B] text-black"
                            : "border-[#2a2e39] text-gray-400 hover:border-[#F0B90B]/30 hover:text-white"
                        }`}
                      >
                        <span className="block">{p.name}</span>
                        <span className="block text-[9px] mt-0.5 font-medium opacity-70">
                          +{p.profit}%
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Amount slider */}
                <div className="mb-6">
                  <div className="flex justify-between mb-2">
                    <label className="text-gray-500 text-xs font-semibold uppercase tracking-wider">
                      Investment Amount
                    </label>
                    <span className="text-white font-black text-sm">
                      ${amount.toLocaleString()}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={selectedPlan.min}
                    max={10000}
                    step={selectedPlan.min}
                    value={amount}
                    onChange={(e) => setAmount(+e.target.value)}
                    className="w-full accent-[#F0B90B] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-gray-600 mt-1">
                    <span>Min: ${selectedPlan.min}</span>
                    <span>$10,000</span>
                  </div>
                </div>

                {/* Plan summary */}
                <div className="bg-[#0B0E17] border border-[#2a2e39] rounded-xl p-4 space-y-2.5">
                  {[
                    { label: "Plan", value: selectedPlan.name },
                    { label: "Min. Deposit", value: `$${selectedPlan.min}` },
                    { label: "Trading Time", value: "4 days (96 hours)" },
                    {
                      label: "Return Rate",
                      value: `${selectedPlan.returnPct}%`,
                    },
                    { label: "Profit", value: `+${selectedPlan.profit}%` },
                  ].map((r) => (
                    <div key={r.label} className="flex justify-between text-xs">
                      <span className="text-gray-500">{r.label}</span>
                      <span className="text-white font-semibold">
                        {r.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* RIGHT — results */}
              <div className="p-6 sm:p-8 flex flex-col justify-between">
                <div>
                  <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-6">
                    Your Estimated Results
                  </p>

                  <div className="text-center mb-8">
                    <p className="text-gray-500 text-xs mb-2">
                      Total After Cycle
                    </p>
                    <p className="text-white text-5xl sm:text-6xl font-black mb-1 tabular-nums">
                      $
                      {totalReturn.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                    <div className="inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1 mt-2">
                      <span className="text-emerald-400 text-xs font-bold">
                        +${profit.toFixed(2)} profit · {selectedPlan.profit}%
                        return
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    {[
                      {
                        label: "Your Deposit",
                        value: `$${amount.toLocaleString()}`,
                        color: "text-white",
                      },
                      {
                        label: "Estimated Profit",
                        value: `+$${profit.toFixed(2)}`,
                        color: "text-emerald-400",
                      },
                      {
                        label: "Total After 4 Days",
                        value: `$${totalReturn.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                        color: "text-[#F0B90B]",
                      },
                    ].map((r) => (
                      <div
                        key={r.label}
                        className="flex items-center justify-between bg-[#0B0E17] border border-[#2a2e39] rounded-xl px-4 py-3"
                      >
                        <span className="text-gray-500 text-xs">{r.label}</span>
                        <span className={`font-black text-sm ${r.color}`}>
                          {r.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Link href="/signup">
                    <button className="w-full bg-[#F0B90B] hover:bg-[#F8D12F] text-black font-bold py-3.5 rounded-xl text-sm transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#F0B90B]/25 active:scale-95">
                      Start with {selectedPlan.name} Plan →
                    </button>
                  </Link>
                  <p className="text-gray-700 text-[10px] text-center mt-3">
                    *Estimates based on historical averages. Not a financial
                    guarantee.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── ASSET CLASSES ── */}
      <section className="bg-gray-50 py-20 sm:py-24">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 lg:px-20">
          <div className="text-center mb-12">
            <p className="text-[#F0B90B] text-xs font-bold uppercase tracking-widest mb-3">
              Diversification
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 mb-4">
              What We Trade For You
            </h2>
            <p className="text-gray-500 mt-3 max-w-lg mx-auto text-sm">
              Your capital is deployed across 4 major asset classes
              simultaneously — maximizing returns while distributing risk
              intelligently.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {ASSETS.map((a) => (
              <div
                key={a.name}
                className="group bg-white border border-gray-100 rounded-2xl p-6 hover:border-[#F0B90B]/30 hover:shadow-lg hover:shadow-[#F0B90B]/5 transition-all duration-300 hover:-translate-y-1"
              >
                <span className="text-4xl mb-4 block">{a.icon}</span>
                <h3 className="text-gray-900 font-bold text-lg mb-2">
                  {a.name}
                </h3>
                <p className="text-gray-500 text-xs leading-relaxed mb-5">
                  {a.desc}
                </p>
                <div className="space-y-2 pt-4 border-t border-gray-100">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Instruments</span>
                    <span className="text-gray-700 font-semibold">
                      {a.instruments}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Max Leverage</span>
                    <span className="text-[#F0B90B] font-semibold">
                      {a.leverage}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECURITY ── */}
      <section className="bg-white py-20 sm:py-24">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 lg:px-20">
          <div className="text-center mb-12">
            <p className="text-[#F0B90B] text-xs font-bold uppercase tracking-widest mb-3">
              Security & Risk
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 mb-4">
              Your Capital is Protected
            </h2>
            <p className="text-gray-500 max-w-lg mx-auto text-sm">
              Multiple independent layers of risk management protect your
              investment around the clock.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            {SECURITY_POINTS.map((s) => (
              <div
                key={s.title}
                className="flex gap-4 bg-gray-50 border border-gray-100 rounded-2xl p-6 hover:border-[#F0B90B]/20 hover:bg-white transition-all duration-300"
              >
                <div className="w-11 h-11 rounded-xl bg-[#F0B90B]/10 border border-[#F0B90B]/20 flex items-center justify-center text-xl shrink-0">
                  {s.icon}
                </div>
                <div>
                  <h3 className="text-gray-900 font-bold text-sm mb-1.5">
                    {s.title}
                  </h3>
                  <p className="text-gray-500 text-xs leading-relaxed">
                    {s.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── REFERRAL CTA ── */}
      <section className="bg-[#0B0E17] py-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[400px] bg-[#F0B90B]/6 rounded-full blur-[100px]" />
        <div className="relative z-10 max-w-5xl mx-auto px-5 sm:px-8 grid md:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div>
            <p className="text-[#F0B90B] text-xs font-bold uppercase tracking-widest mb-4">
              Referral Program
            </p>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
              Earn While Others Invest
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Share your unique referral link. Every time someone makes their
              first deposit through your link, you earn automatic commission —
              paid instantly to your balance.
            </p>
            <div className="space-y-2.5">
              {[
                {
                  tier: "🥉 Bronze (1–5 referrals)",
                  commission: "$1 per referral",
                },
                {
                  tier: "🥈 Silver (6–10 referrals)",
                  commission: "$2 per referral",
                },
                {
                  tier: "🥇 Gold (11+ referrals)",
                  commission: "$3 per referral",
                },
              ].map((r) => (
                <div
                  key={r.tier}
                  className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-4 py-3"
                >
                  <span className="text-gray-300 text-sm">{r.tier}</span>
                  <span className="text-[#F0B90B] font-bold text-sm">
                    {r.commission}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-[#131722] border border-[#2a2e39] rounded-2xl p-7 text-center">
            <p className="text-gray-400 text-sm mb-2">
              Potential earnings (50 Gold referrals)
            </p>
            <p className="text-white text-5xl sm:text-6xl font-black mb-1">
              $150+
            </p>
            <p className="text-gray-500 text-xs mb-7">
              passive income per batch · fully automatic
            </p>
            <Link href="/signup">
              <button className="w-full bg-[#F0B90B] hover:bg-[#F8D12F] text-black font-bold py-3.5 rounded-xl text-sm transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#F0B90B]/25 active:scale-95">
                Start Earning Referral Commissions
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── BOTTOM CTA ── */}
      <section className="bg-white py-20 text-center">
        <div className="max-w-2xl mx-auto px-5">
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4">
            Ready to Invest?
          </h2>
          <p className="text-gray-500 mb-8 text-sm">
            Create your account in 2 minutes and start your first trade cycle
            today. Begin from just $50.
          </p>
          <Link href="/signup">
            <button className="inline-flex items-center gap-2 bg-[#0B0E17] hover:bg-[#1a1f2e] text-white font-bold px-10 py-4 rounded-xl text-sm transition-all hover:-translate-y-0.5 hover:shadow-xl active:scale-95">
              Open Free Account
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                />
              </svg>
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
}
