import Link from "next/link";

export default function AboutCTA() {
  return (
    <section className="bg-[#0D0D0D] py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          {/* Left */}
          <div>
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-medium text-gray-400 tracking-widest uppercase">
                Join Us
              </span>
            </div>

            <h2 className="text-4xl sm:text-5xl font-bold text-white leading-tight mb-6">
              Become part of our{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">
                investor family
              </span>
            </h2>

            <p className="text-gray-400 text-base leading-relaxed mb-10 max-w-lg">
              You&apos;ve seen our story, met our team, and reviewed our
              results. Now it&apos;s your turn. Join 1,200+ investors who trust
              us with their capital every single day.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/investment"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-400 to-orange-500 text-black text-sm font-bold rounded-full hover:opacity-90 hover:-translate-y-0.5 transition-all duration-200 shadow-lg shadow-amber-500/20"
              >
                Start Investing
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
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-white/10 text-white text-sm font-medium rounded-full hover:border-white/30 transition-colors"
              >
                Talk to Our Team
              </Link>
            </div>
          </div>

          {/* Right — Quick stats */}
          <div className="grid grid-cols-2 gap-4">
            {[
              {
                value: "2020",
                label: "Year Founded",
                accent: "from-amber-400 to-orange-500",
              },
              {
                value: "$45M+",
                label: "Assets Managed",
                accent: "from-emerald-400 to-teal-500",
              },
              {
                value: "40+",
                label: "Countries Served",
                accent: "from-blue-400 to-indigo-500",
              },
              {
                value: "7+",
                label: "Years Zero Capital Loss",
                accent: "from-violet-400 to-purple-500",
              },
            ].map((s) => (
              <div
                key={s.label}
                className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-7 hover:bg-white/[0.05] transition-colors"
              >
                <p
                  className={`text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${s.accent} mb-2`}
                >
                  {s.value}
                </p>
                <p className="text-gray-500 text-sm">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
