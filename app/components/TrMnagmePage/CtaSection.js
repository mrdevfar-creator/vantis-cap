export default function CtaSection() {
  return (
    <section className="bg-[#F9F8F6] py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="relative bg-[#0D0D0D] rounded-3xl overflow-hidden px-8 py-16 sm:px-16 text-center">
          {/* Background blobs */}
          <div className="absolute top-0 left-1/4 w-64 h-64 rounded-full bg-amber-500/10 blur-[80px] pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full bg-emerald-500/10 blur-[80px] pointer-events-none" />

          {/* Grid overlay */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />

          <div className="relative">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-medium text-gray-400 tracking-widest uppercase">
                Start Today
              </span>
            </div>

            <h2 className="text-4xl sm:text-5xl font-bold text-white leading-tight mb-5">
              Ready to grow{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">
                your wealth?
              </span>
            </h2>

            <p className="text-gray-400 text-base sm:text-lg leading-relaxed max-w-xl mx-auto mb-10">
              Join 1,200+ investors already growing their capital. Start with as
              little as $500 — no experience needed.
            </p>

            {/* Form */}
            <div className="flex flex-col sm:flex-row items-center gap-3 max-w-md mx-auto mb-8">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full sm:flex-1 px-5 py-4 rounded-full bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-amber-400/50 focus:bg-white/8 transition-colors"
              />
              <button
                type="button"
                className="w-full sm:w-auto shrink-0 px-7 py-4 bg-gradient-to-r from-amber-400 to-orange-500 text-black text-sm font-bold rounded-full hover:opacity-90 hover:-translate-y-0.5 transition-all duration-200 shadow-lg shadow-amber-500/20"
              >
                Get Started
              </button>
            </div>

            {/* Trust signals */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-gray-600">
              <span className="flex items-center gap-1.5">
                <svg
                  className="w-3.5 h-3.5 text-emerald-500"
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
                No commitment required
              </span>
              <span className="flex items-center gap-1.5">
                <svg
                  className="w-3.5 h-3.5 text-emerald-500"
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
                Withdraw anytime
              </span>
              <span className="flex items-center gap-1.5">
                <svg
                  className="w-3.5 h-3.5 text-emerald-500"
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
                Segregated accounts
              </span>
              <span className="flex items-center gap-1.5">
                <svg
                  className="w-3.5 h-3.5 text-emerald-500"
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
                24/7 support
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
