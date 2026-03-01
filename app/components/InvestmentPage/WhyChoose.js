const reasons = [
  {
    number: "01",
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
        />
      </svg>
    ),
    title: "Lightning Fast Delivery",
    description:
      "We move at startup speed without sacrificing quality. Your project ships on time, every time — no excuses, no delays.",
    accent: "from-amber-400 to-orange-500",
    tag: "Speed",
  },
  {
    number: "02",
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
        />
      </svg>
    ),
    title: "Enterprise-Grade Security",
    description:
      "Bank-level encryption and compliance built into every layer. Your data is protected by infrastructure trusted by Fortune 500 companies.",
    accent: "from-emerald-400 to-teal-500",
    tag: "Trust",
  },
  {
    number: "03",
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
        />
      </svg>
    ),
    title: "Data-Driven Results",
    description:
      "Every decision we make is backed by real analytics. We measure what matters and optimize relentlessly until your metrics speak for themselves.",
    accent: "from-blue-400 to-indigo-500",
    tag: "Growth",
  },
  {
    number: "04",
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
        />
      </svg>
    ),
    title: "Dedicated Expert Team",
    description:
      "You get a hand-picked team of specialists — not generalists. Senior engineers, designers, and strategists committed to your success.",
    accent: "from-rose-400 to-pink-500",
    tag: "Expertise",
  },
  {
    number: "05",
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    title: "24/7 Priority Support",
    description:
      "Real humans, real answers. Our support team is on-call around the clock, with guaranteed response times that actually mean something.",
    accent: "from-violet-400 to-purple-500",
    tag: "Support",
  },
  {
    number: "06",
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z"
        />
      </svg>
    ),
    title: "Transparent Pricing",
    description:
      "No hidden fees. No surprise invoices. One clear price that covers everything — so you can plan your budget with complete confidence.",
    accent: "from-cyan-400 to-sky-500",
    tag: "Value",
  },
];

const stats = [
  { value: "98%", label: "Client Satisfaction" },
  { value: "500+", label: "Projects Delivered" },
  { value: "12+", label: "Years Experience" },
  { value: "40+", label: "Team Experts" },
];

export default function WhyChoose() {
  return (
    <section className="bg-[#0D0D0D] text-white py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-20">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span className="text-xs font-medium text-gray-400 tracking-widest uppercase">
                Why Choose Us
              </span>
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] text-white">
              The difference is{" "}
              <span className="relative">
                <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400">
                  in the details
                </span>
                <span className="absolute bottom-1 left-0 right-0 h-[3px] bg-gradient-to-r from-amber-400 to-rose-400 opacity-40 rounded-full"></span>
              </span>
            </h2>
          </div>
          <p className="text-gray-400 text-base leading-relaxed max-w-md lg:text-right">
            We don&apos;t just deliver projects — we build partnerships. Every
            client gets our full attention, expertise, and commitment to
            excellence.
          </p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/5 rounded-2xl overflow-hidden mb-20">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-[#0D0D0D] px-8 py-8 text-center hover:bg-white/[0.03] transition-colors"
            >
              <p className=" text-4xl font-bold text-white mb-1">
                {stat.value}
              </p>
              <p className="text-gray-500 text-sm">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reasons.map((item) => (
            <div
              key={item.number}
              className="group relative bg-white/[0.03] border border-white/[0.07] rounded-2xl p-7 hover:bg-white/[0.06] hover:border-white/15 transition-all duration-300"
            >
              {/* Top Row */}
              <div className="flex items-start justify-between mb-6">
                <div
                  className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${item.accent} text-white shadow-lg`}
                >
                  {item.icon}
                </div>
                <span className="text-xs font-medium text-white/20 tracking-widest">
                  {item.number}
                </span>
              </div>

              {/* Content */}
              <h3 className="text-lg font-bold text-white mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:${item.accent} transition-all duration-300">
                {item.title}
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-6">
                {item.description}
              </p>

              {/* Tag */}
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-semibold px-3 py-1 rounded-full bg-gradient-to-r ${item.accent} bg-opacity-10 text-transparent bg-clip-text`}
                  style={{ WebkitBackgroundClip: "text" }}
                >
                  #{item.tag}
                </span>
                <svg
                  className="w-4 h-4 text-white/20 group-hover:text-white/60 group-hover:translate-x-1 transition-all duration-300"
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
              </div>

              {/* Hover glow */}
              <div
                className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-gradient-to-br ${item.accent}`}
                style={{ opacity: 0, filter: "blur(40px)", zIndex: -1 }}
              />
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <p className="text-gray-500 text-sm mb-6">
            Still not convinced? See what our clients have to say.
          </p>
          <div className="inline-flex items-center gap-4">
            <a
              href="#"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black text-sm font-semibold rounded-full hover:bg-gray-100 transition-colors"
            >
              Get Started Free
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
            <a
              href="#"
              className="inline-flex items-center gap-2 px-8 py-4 border border-white/10 text-white text-sm font-medium rounded-full hover:border-white/30 transition-colors"
            >
              View Case Studies
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
