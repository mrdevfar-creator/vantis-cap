const plans = [
  {
    name: "Starter",
    min: "$500",
    profitShare: "20%",
    duration: "30 days",
    returnEst: "8–12%",
    accent: "from-sky-400 to-blue-500",
    features: [
      "Minimum $500 deposit",
      "Monthly profit distribution",
      "Real-time dashboard access",
      "Email support",
      "Withdraw anytime",
    ],
    popular: false,
  },
  {
    name: "Growth",
    min: "$5,000",
    profitShare: "15%",
    duration: "30 days",
    returnEst: "15–22%",
    accent: "from-amber-400 to-orange-500",
    features: [
      "Minimum $5,000 deposit",
      "Weekly profit distribution",
      "Priority dashboard access",
      "Dedicated account manager",
      "Withdraw anytime",
      "Monthly strategy report",
    ],
    popular: true,
  },
  {
    name: "Elite",
    min: "$25,000",
    profitShare: "10%",
    duration: "30 days",
    returnEst: "25–38%",
    accent: "from-violet-400 to-purple-500",
    features: [
      "Minimum $25,000 deposit",
      "Daily profit distribution",
      "Custom strategy allocation",
      "VIP account manager",
      "Withdraw anytime",
      "Weekly strategy report",
      "Direct trader access",
    ],
    popular: false,
  },
];

export default function TrInvestmentplans() {
  return (
    <section id="plans" className="bg-[#0D0D0D] py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span className="text-xs font-medium text-gray-400 tracking-widest uppercase">
              Investment Plans
            </span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-white leading-tight mb-4">
            Simple, transparent{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">
              pricing
            </span>
          </h2>
          <p className="text-gray-400 text-base leading-relaxed">
            No hidden fees. You only pay when you profit — our success is tied
            directly to yours.
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl border p-8 flex flex-col transition-all duration-300 hover:-translate-y-1 ${
                plan.popular
                  ? "bg-white/[0.06] border-amber-500/30 shadow-xl shadow-amber-500/10"
                  : "bg-white/[0.03] border-white/[0.07] hover:border-white/15"
              }`}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-400 to-orange-500 text-black text-xs font-bold px-4 py-1 rounded-full">
                    ⭐ Most Popular
                  </span>
                </div>
              )}

              {/* Plan name & accent */}
              <div
                className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${plan.accent} text-white mb-5 shadow-lg`}
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
                    d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>

              <h3 className="text-xl font-bold text-white mb-1">{plan.name}</h3>
              <p className="text-gray-500 text-sm mb-6">
                Min. deposit {plan.min}
              </p>

              {/* Key numbers */}
              <div className="grid grid-cols-2 gap-3 mb-8">
                <div className="bg-white/5 rounded-xl p-3 text-center">
                  <p
                    className={`text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r ${plan.accent}`}
                  >
                    {plan.returnEst}
                  </p>
                  <p className="text-gray-500 text-xs mt-0.5">Est. Return</p>
                </div>
                <div className="bg-white/5 rounded-xl p-3 text-center">
                  <p className="text-lg font-bold text-white">
                    {plan.profitShare}
                  </p>
                  <p className="text-gray-500 text-xs mt-0.5">Profit Share</p>
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <svg
                      className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4.5 12.75l6 6 9-13.5"
                      />
                    </svg>
                    <span className="text-gray-400 text-sm">{f}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <a
                href="#"
                className={`inline-flex items-center justify-center gap-2 w-full py-3.5 rounded-full text-sm font-bold transition-all duration-200 ${
                  plan.popular
                    ? "bg-gradient-to-r from-amber-400 to-orange-500 text-black hover:opacity-90"
                    : "bg-white/5 border border-white/10 text-white hover:bg-white/10"
                }`}
              >
                Get Started
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
                    d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                  />
                </svg>
              </a>
            </div>
          ))}
        </div>

        <p className="mt-10 text-xs text-gray-700 text-center">
          Returns are estimates based on historical performance. Capital at
          risk. All plans include a segregated account and full withdrawal
          rights.
        </p>
      </div>
    </section>
  );
}
