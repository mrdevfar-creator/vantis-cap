const strategies = [
  {
    name: "Forex Swing Trading",
    markets: ["EUR/USD", "GBP/USD", "USD/JPY"],
    allocation: "40%",
    risk: "Medium",
    riskColor: "text-amber-400 bg-amber-400/10",
    description:
      "Multi-day positions capturing major currency trends. We use technical confluence and macro fundamentals.",
    accent: "from-blue-400 to-indigo-500",
  },
  {
    name: "Gold Scalping",
    markets: ["XAU/USD", "XAG/USD"],
    allocation: "35%",
    risk: "Low–Medium",
    riskColor: "text-emerald-400 bg-emerald-400/10",
    description:
      "High-frequency precision entries on precious metals using volume analysis and session-based setups.",
    accent: "from-amber-400 to-orange-500",
  },
  {
    name: "Crypto Momentum",
    markets: ["BTC/USD", "ETH/USD"],
    allocation: "25%",
    risk: "Medium–High",
    riskColor: "text-rose-400 bg-rose-400/10",
    description:
      "Trend-following positions in crypto during high-momentum breakouts. Strict stop-loss on every trade.",
    accent: "from-violet-400 to-purple-500",
  },
];

const riskControls = [
  { label: "Max Drawdown Limit", value: "5% per account", icon: "🛡️" },
  { label: "Stop Loss on Every Trade", value: "Mandatory", icon: "🔒" },
  { label: "Leverage Cap", value: "1:10 maximum", icon: "⚖️" },
  { label: "Daily Loss Limit", value: "2% of equity", icon: "📉" },
];

export default function RiskStrategy() {
  return (
    <section className="bg-[#F9F8F6] py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-14">
          <div>
            <div className="inline-flex items-center gap-2 bg-black/5 border border-black/10 rounded-full px-4 py-1.5 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
              <span className="text-xs font-medium text-gray-500 tracking-widest uppercase">
                Strategy & Risk
              </span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight">
              How we protect{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500">
                your capital
              </span>
            </h2>
          </div>
          <p className="text-gray-500 text-base leading-relaxed max-w-sm">
            Risk management isn&apos;t an afterthought — it&apos;s the
            foundation of every trade we make.
          </p>
        </div>

        {/* Strategies */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
          {strategies.map((s) => (
            <div
              key={s.name}
              className="bg-white border border-black/[0.06] rounded-2xl p-7 hover:shadow-md hover:shadow-black/5 hover:-translate-y-0.5 transition-all duration-300"
            >
              {/* Top */}
              <div className="flex items-start justify-between mb-5">
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.accent} flex items-center justify-center text-white shadow-sm`}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z"
                    />
                  </svg>
                </div>
                <span
                  className={`text-xs font-semibold px-3 py-1 rounded-full ${s.riskColor}`}
                >
                  {s.risk} Risk
                </span>
              </div>

              <h3 className="text-base font-bold text-gray-900 mb-2">
                {s.name}
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-5">
                {s.description}
              </p>

              {/* Markets */}
              <div className="flex flex-wrap gap-2 mb-5">
                {s.markets.map((m) => (
                  <span
                    key={m}
                    className="text-xs bg-black/5 text-gray-600 px-2.5 py-1 rounded-full font-medium"
                  >
                    {m}
                  </span>
                ))}
              </div>

              {/* Allocation */}
              <div className="flex items-center justify-between pt-4 border-t border-black/5">
                <span className="text-gray-400 text-xs">
                  Portfolio Allocation
                </span>
                <span
                  className={`text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r ${s.accent}`}
                >
                  {s.allocation}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Risk Controls */}
        <div className="bg-white border border-black/[0.06] rounded-2xl p-8">
          <h3 className="text-lg font-bold text-gray-900 mb-6">
            Risk Control Framework
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {riskControls.map((r) => (
              <div key={r.label} className="flex items-start gap-3">
                <span className="text-2xl mt-0.5">{r.icon}</span>
                <div>
                  <p className="text-gray-900 text-sm font-semibold">
                    {r.value}
                  </p>
                  <p className="text-gray-400 text-xs mt-0.5">{r.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
