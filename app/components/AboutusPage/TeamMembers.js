const team = [
  {
    name: "James Hartwell",
    role: "Founder & Head of Trading",
    avatar: "JH",
    avatarColor: "from-amber-400 to-orange-500",
    bio: "Former Goldman Sachs VP with 18 years in FX and commodities. Manages overall strategy and senior trader oversight.",
    stats: [
      { label: "Experience", value: "18 yrs" },
      { label: "Trades Led", value: "50k+" },
    ],
    tags: ["Forex", "Gold", "Strategy"],
  },
  {
    name: "Sophia Chen",
    role: "Co-Founder & Risk Director",
    avatar: "SC",
    avatarColor: "from-rose-400 to-pink-500",
    bio: "Ex-JPMorgan quant analyst. Architect of our proprietary risk framework that has kept max drawdown below 5% across all market cycles.",
    stats: [
      { label: "Experience", value: "14 yrs" },
      { label: "Risk Models", value: "12+" },
    ],
    tags: ["Risk", "Quant", "Compliance"],
  },
  {
    name: "Omar Khalid",
    role: "Senior Crypto Trader",
    avatar: "OK",
    avatarColor: "from-violet-400 to-purple-500",
    bio: "Pioneer in institutional crypto trading since 2016. Built our crypto desk from zero to $70M+ in managed crypto assets.",
    stats: [
      { label: "Experience", value: "9 yrs" },
      { label: "Crypto AUM", value: "$70M" },
    ],
    tags: ["BTC", "ETH", "Momentum"],
  },
  {
    name: "Priya Nair",
    role: "Client Relations Director",
    avatar: "PN",
    avatarColor: "from-emerald-400 to-teal-500",
    bio: "Ensures every investor gets white-glove service. Oversees onboarding, reporting, and the 24/7 support team across all time zones.",
    stats: [
      { label: "Clients Served", value: "1,200+" },
      { label: "Satisfaction", value: "98%" },
    ],
    tags: ["Support", "Onboarding", "CRM"],
  },
  {
    name: "Lucas Brennan",
    role: "Lead Forex Analyst",
    avatar: "LB",
    avatarColor: "from-blue-400 to-indigo-500",
    bio: "Macro economist turned trader. Specializes in G10 currency pairs and has called 9 out of the last 10 major FX macro moves.",
    stats: [
      { label: "Experience", value: "11 yrs" },
      { label: "Accuracy", value: "91%" },
    ],
    tags: ["EUR/USD", "Macro", "Analysis"],
  },
  {
    name: "Aisha Rahman",
    role: "Compliance & Legal Officer",
    avatar: "AR",
    avatarColor: "from-cyan-400 to-sky-500",
    bio: "Ensures full regulatory compliance across 40+ jurisdictions. Oversees all KYC/AML processes and third-party fund audits.",
    stats: [
      { label: "Experience", value: "10 yrs" },
      { label: "Jurisdictions", value: "40+" },
    ],
    tags: ["Legal", "KYC", "Audit"],
  },
];

export default function TeamMembers() {
  return (
    <section className="bg-[#0D0D0D] py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span className="text-xs font-medium text-gray-400 tracking-widest uppercase">
              The Team
            </span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-white leading-tight mb-4">
            The people behind{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">
              your returns
            </span>
          </h2>
          <p className="text-gray-400 text-base">
            Ex-Goldman, JPMorgan, and hedge fund professionals — united by one
            goal: growing your capital.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {team.map((member) => (
            <div
              key={member.name}
              className="group bg-white/[0.03] border border-white/[0.07] rounded-2xl p-7 hover:bg-white/[0.05] hover:border-white/15 transition-all duration-300"
            >
              {/* Avatar + Name */}
              <div className="flex items-center gap-4 mb-5">
                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${member.avatarColor} flex items-center justify-center text-white font-bold text-sm shadow-lg shrink-0`}
                >
                  {member.avatar}
                </div>
                <div>
                  <h3 className="text-white text-sm font-bold">
                    {member.name}
                  </h3>
                  <p className="text-gray-500 text-xs mt-0.5">{member.role}</p>
                </div>
              </div>

              {/* Bio */}
              <p className="text-gray-400 text-sm leading-relaxed mb-5">
                {member.bio}
              </p>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                {member.stats.map((s) => (
                  <div
                    key={s.label}
                    className="bg-white/5 rounded-xl p-3 text-center"
                  >
                    <p className="text-white text-sm font-bold">{s.value}</p>
                    <p className="text-gray-500 text-xs mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {member.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs bg-white/5 border border-white/10 text-gray-400 px-2.5 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
