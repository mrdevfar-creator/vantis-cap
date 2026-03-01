const milestones = [
  {
    year: "2012",
    title: "Founded in London",
    text: "Three ex-Goldman Sachs traders pooled their expertise to build a fund management firm with one rule: treat every client's capital like our own.",
    accent: "from-amber-400 to-orange-500",
  },
  {
    year: "2015",
    title: "First $10M AUM",
    text: "Word spread fast. Within 3 years, we crossed $10 million in assets under management with a track record of zero negative annual returns.",
    accent: "from-emerald-400 to-teal-500",
  },
  {
    year: "2018",
    title: "Expanded to Crypto Markets",
    text: "Recognizing the structural shift in global markets, we added Bitcoin and Ethereum trading desks, becoming early institutional movers.",
    accent: "from-blue-400 to-indigo-500",
  },
  {
    year: "2020",
    title: "Launched Retail Platform",
    text: "We democratized access by opening our fund to retail investors with a $500 minimum — delivering institutional performance to everyone.",
    accent: "from-violet-400 to-purple-500",
  },
  {
    year: "2023",
    title: "Live Trading Dashboard",
    text: "We became the first managed fund to show investors their capital being traded in real-time — setting a new industry standard for transparency.",
    accent: "from-rose-400 to-pink-500",
  },
  {
    year: "2024",
    title: "$284M AUM & Growing",
    text: "Today we manage capital for 1,200+ investors across 40 countries, with our strongest-ever annual return of 38% and zero capital loss events.",
    accent: "from-cyan-400 to-sky-500",
  },
];

export default function Ourstory() {
  return (
    <section className="bg-[#F9F8F6] py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-16">
          <div>
            <div className="inline-flex items-center gap-2 bg-black/5 border border-black/10 rounded-full px-4 py-1.5 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
              <span className="text-xs font-medium text-gray-500 tracking-widest uppercase">Our Story</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight">
              Built on{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500">
                12 years
              </span>{" "}
              of trust
            </h2>
          </div>
          <p className="text-gray-500 text-base max-w-sm lg:text-right">
            From a small London office to a global trading operation — here&apos;s how we got here.
          </p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-black/10 via-black/10 to-transparent hidden sm:block" />

          <div className="space-y-8">
            {milestones.map((m, i) => (
              <div key={m.year} className="relative flex gap-8 sm:pl-20">
                {/* Dot */}
                <div className="hidden sm:flex absolute left-0 top-6 items-center justify-center">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${m.accent} flex items-center justify-center shadow-md shrink-0`}>
                    <span className="text-white text-xs font-bold">{m.year}</span>
                  </div>
                </div>

                {/* Card */}
                <div className="flex-1 bg-white border border-black/[0.06] rounded-2xl p-7 hover:shadow-md hover:shadow-black/5 hover:-translate-y-0.5 transition-all duration-300">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <h3 className="text-base font-bold text-gray-900">{m.title}</h3>
                    <span className={`sm:hidden text-xs font-bold px-3 py-1 rounded-full bg-gradient-to-r ${m.accent} text-white shrink-0`}>
                      {m.year}
                    </span>
                  </div>
                  <p className="text-gray-500 text-sm leading-relaxed">{m.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}