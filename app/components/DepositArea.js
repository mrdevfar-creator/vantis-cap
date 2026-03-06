"use client";
import Link from "next/link";

const PLANS = [
  {
    name: "Starter",
    minDeposit: 50,
    returnPct: 110,
    profit: 10,
    color: "#60A5FA",
    gradient: "from-blue-400 to-blue-600",
    borderActive: "border-blue-500/40",
    bgActive: "bg-blue-500/5",
    glowColor: "rgba(96,165,250,0.15)",
    badge: null,
    icon: "🌱",
  },
  {
    name: "Inner",
    minDeposit: 100,
    returnPct: 113,
    profit: 13,
    color: "#34D399",
    gradient: "from-emerald-400 to-green-600",
    borderActive: "border-emerald-500/40",
    bgActive: "bg-emerald-500/5",
    glowColor: "rgba(52,211,153,0.15)",
    badge: null,
    icon: "💎",
  },
  {
    name: "Smart",
    minDeposit: 150,
    returnPct: 115,
    profit: 15,
    color: "#A78BFA",
    gradient: "from-violet-400 to-purple-600",
    borderActive: "border-violet-500/40",
    bgActive: "bg-violet-500/5",
    glowColor: "rgba(167,139,250,0.15)",
    badge: "Popular",
    icon: "🧠",
  },
  {
    name: "Grower",
    minDeposit: 200,
    returnPct: 117,
    profit: 17,
    color: "#FB923C",
    gradient: "from-orange-400 to-orange-600",
    borderActive: "border-orange-500/40",
    bgActive: "bg-orange-500/5",
    glowColor: "rgba(251,146,60,0.15)",
    badge: null,
    icon: "📈",
  },
  {
    name: "Ninja",
    minDeposit: 250,
    returnPct: 118,
    profit: 18,
    color: "#F472B6",
    gradient: "from-pink-400 to-rose-600",
    borderActive: "border-pink-500/40",
    bgActive: "bg-pink-500/5",
    glowColor: "rgba(244,114,182,0.15)",
    badge: null,
    icon: "⚡",
  },
  {
    name: "Master",
    minDeposit: 300,
    returnPct: 120,
    profit: 20,
    color: "#F0B90B",
    gradient: "from-amber-400 to-yellow-500",
    borderActive: "border-amber-400/50",
    bgActive: "bg-amber-400/5",
    glowColor: "rgba(240,185,11,0.18)",
    badge: "Best Value",
    icon: "👑",
  },
];

const COMMON_FEATURES = [
  "Real-time dashboard access",
  "Email support",
  "Instant withdraw after timeout",
  "No risk",
];

export default function DepositArea() {
  return (
    <section className="bg-[#080B11] py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      {/* Ambient glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-amber-400/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 mb-5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-60" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" />
            </span>
            <span className="text-xs font-semibold text-gray-400 tracking-widest uppercase">
              Deposit Plans
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-4">
            Choose Your{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">
              Investment Plan
            </span>
          </h2>
          <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
            All plans run on a{" "}
            <span className="text-white font-medium">4-day (96-hour)</span>{" "}
            trade cycle. Your capital grows automatically — withdraw instantly
            after timeout with zero risk.
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`relative group rounded-2xl border transition-all duration-300 hover:-translate-y-1.5 flex flex-col overflow-hidden
                ${
                  plan.badge
                    ? `${plan.borderActive} ${plan.bgActive}`
                    : "border-white/[0.07] bg-white/[0.025] hover:border-white/15"
                }`}
              style={{
                boxShadow: plan.badge
                  ? `0 0 40px ${plan.glowColor}, inset 0 1px 0 rgba(255,255,255,0.04)`
                  : "inset 0 1px 0 rgba(255,255,255,0.03)",
              }}
            >
              {/* Badge */}
              {plan.badge && (
                <div className="absolute top-0 left-0 right-0 flex justify-center -translate-y-0">
                  <span
                    className={`inline-flex items-center gap-1 bg-gradient-to-r ${plan.gradient} text-black text-[10px] font-bold px-4 py-1 rounded-b-lg tracking-wider uppercase`}
                  >
                    ⭐ {plan.badge}
                  </span>
                </div>
              )}

              <div
                className={`p-6 flex flex-col flex-1 ${plan.badge ? "pt-8" : ""}`}
              >
                {/* Icon + Name row */}
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-11 h-11 rounded-xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center text-xl shadow-lg flex-shrink-0`}
                    >
                      {plan.icon}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">
                        {plan.name}
                      </h3>
                      <p className="text-xs text-gray-500 font-medium">
                        Min. ${plan.minDeposit} deposit
                      </p>
                    </div>
                  </div>
                  {/* Cycle badge */}
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[10px] font-semibold text-gray-500 bg-white/5 border border-white/8 rounded-lg px-2.5 py-1">
                      96h Cycle
                    </span>
                  </div>
                </div>

                {/* Return highlight */}
                <div
                  className="rounded-xl p-4 mb-5 text-center relative overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${plan.glowColor}, rgba(255,255,255,0.02))`,
                    border: `1px solid ${plan.color}22`,
                  }}
                >
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-1">
                    Estimated Return
                  </p>
                  <p
                    className="text-4xl font-black leading-none"
                    style={{ color: plan.color }}
                  >
                    {plan.returnPct}%
                  </p>
                  <p className="text-xs text-gray-500 mt-1.5">
                    Profit:{" "}
                    <span
                      className="font-semibold"
                      style={{ color: plan.color }}
                    >
                      +{plan.profit}%
                    </span>{" "}
                    after 4 days
                  </p>
                  {/* Example calculation */}
                  <div className="mt-3 pt-3 border-t border-white/5 flex justify-center gap-6">
                    <div>
                      <p className="text-[10px] text-gray-600">Deposit</p>
                      <p className="text-xs font-bold text-gray-300">
                        ${plan.minDeposit}
                      </p>
                    </div>
                    <div className="text-gray-700 self-center text-sm">→</div>
                    <div>
                      <p className="text-[10px] text-gray-600">Returns</p>
                      <p
                        className="text-xs font-bold"
                        style={{ color: plan.color }}
                      >
                        ${((plan.minDeposit * plan.returnPct) / 100).toFixed(0)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-2.5 mb-6 flex-1">
                  <li className="flex items-center gap-2.5">
                    <span
                      className="flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-black"
                      style={{
                        background: `${plan.color}20`,
                        color: plan.color,
                      }}
                    >
                      ✓
                    </span>
                    <span className="text-gray-300 text-xs font-medium">
                      Min. deposit:{" "}
                      <span className="text-white font-semibold">
                        ${plan.minDeposit}
                      </span>
                    </span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span
                      className="flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-black"
                      style={{
                        background: `${plan.color}20`,
                        color: plan.color,
                      }}
                    >
                      ✓
                    </span>
                    <span className="text-gray-300 text-xs font-medium">
                      Trading time:{" "}
                      <span className="text-white font-semibold">
                        4 days (96 hours)
                      </span>
                    </span>
                  </li>
                  {COMMON_FEATURES.map((feat) => (
                    <li key={feat} className="flex items-center gap-2.5">
                      <span
                        className="flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-black"
                        style={{
                          background: `${plan.color}20`,
                          color: plan.color,
                        }}
                      >
                        ✓
                      </span>
                      <span className="text-gray-400 text-xs">{feat}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Link
                  href="/deposit"
                  className={`w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all duration-200 hover:opacity-90 hover:-translate-y-0.5 active:scale-95`}
                  style={
                    plan.badge
                      ? {
                          background: `linear-gradient(135deg, ${plan.color}, ${plan.color}bb)`,
                          color: "#000",
                          boxShadow: `0 8px 24px ${plan.glowColor}`,
                        }
                      : {
                          background: `${plan.color}14`,
                          color: plan.color,
                          border: `1px solid ${plan.color}30`,
                        }
                  }
                >
                  Deposit Now
                  <svg
                    className="w-3.5 h-3.5"
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
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom note */}
        <p className="mt-10 text-center text-xs text-gray-700 max-w-lg mx-auto leading-relaxed">
          Returns are estimates based on historical trading performance. All
          deposits are protected under our no-risk guarantee. Funds are released
          automatically after the 96-hour trade cycle completes.
        </p>
      </div>
    </section>
  );
}
