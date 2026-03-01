const awards = [
  {
    year: "2024",
    title: "Best Managed Fund",
    org: "Global Finance Awards",
    category: "Trade Management",
    accent: "from-amber-400 to-orange-500",
    icon: "🏆",
  },
  {
    year: "2024",
    title: "Most Transparent Platform",
    org: "FinTech Innovators Summit",
    category: "Investor Transparency",
    accent: "from-emerald-400 to-teal-500",
    icon: "🌟",
  },
  {
    year: "2023",
    title: "Top Performing Forex Fund",
    org: "FX Week Excellence Awards",
    category: "Retail Fund Category",
    accent: "from-blue-400 to-indigo-500",
    icon: "🥇",
  },
  {
    year: "2023",
    title: "Best Risk Management",
    org: "Hedge Fund Intelligence",
    category: "Risk & Compliance",
    accent: "from-violet-400 to-purple-500",
    icon: "🛡️",
  },
  {
    year: "2022",
    title: "Rising Star in Crypto Trading",
    org: "Digital Asset Summit",
    category: "Institutional Crypto",
    accent: "from-rose-400 to-pink-500",
    icon: "🚀",
  },
  {
    year: "2021",
    title: "Investor's Choice Award",
    org: "WealthTech Global",
    category: "Client Satisfaction",
    accent: "from-cyan-400 to-sky-500",
    icon: "❤️",
  },
];

const pressLogos = [
  "Forbes",
  "Bloomberg",
  "Financial Times",
  "Reuters",
  "CoinDesk",
  "The Wall Street Journal",
];

export default function AwardsRecognition() {
  return (
    <section className="bg-[#F9F8F6] py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-black/5 border border-black/10 rounded-full px-4 py-1.5 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
            <span className="text-xs font-medium text-gray-500 tracking-widest uppercase">
              Awards & Recognition
            </span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight mb-4">
            Recognized by the{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500">
              industry&apos;s best
            </span>
          </h2>
          <p className="text-gray-500 text-base">
            Our performance and transparency have earned recognition from the
            world&apos;s leading financial institutions and media.
          </p>
        </div>

        {/* Awards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-16">
          {awards.map((award) => (
            <div
              key={award.title}
              className="group bg-white border border-black/[0.06] rounded-2xl p-7 hover:shadow-lg hover:shadow-black/5 hover:-translate-y-1 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-5">
                <span className="text-3xl">{award.icon}</span>
                <span className="text-xs font-bold text-gray-400 bg-black/5 px-3 py-1 rounded-full">
                  {award.year}
                </span>
              </div>

              <h3 className="text-base font-bold text-gray-900 mb-1">
                {award.title}
              </h3>
              <p
                className={`text-sm font-semibold text-transparent bg-clip-text bg-gradient-to-r ${award.accent} mb-3`}
              >
                {award.org}
              </p>
              <p className="text-gray-400 text-xs">{award.category}</p>

              {/* Accent line */}
              <div
                className={`mt-5 h-[3px] w-12 rounded-full bg-gradient-to-r ${award.accent} group-hover:w-full transition-all duration-500`}
              />
            </div>
          ))}
        </div>

        {/* Press mentions */}
        <div className="bg-white border border-black/[0.06] rounded-2xl px-8 py-10">
          <p className="text-center text-gray-400 text-xs font-medium tracking-widest uppercase mb-8">
            As Featured In
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8">
            {pressLogos.map((logo) => (
              <span
                key={logo}
                className="text-gray-300 text-sm font-bold tracking-wide hover:text-gray-500 transition-colors cursor-default"
              >
                {logo}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
