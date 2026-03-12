export default function AboutHero() {
  return (
    <section className="relative bg-[#0D0D0D] overflow-hidden py-28 px-4 sm:px-6 lg:px-8">
      {/* Grid background */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Gradient blobs */}
      <div className="absolute top-0 left-1/3 w-[500px] h-[500px] rounded-full bg-amber-500/8 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/3 w-[400px] h-[400px] rounded-full bg-emerald-500/8 blur-[120px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left */}
          <div>
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span className="text-xs font-medium text-gray-400 tracking-widest uppercase">
                About Us
              </span>
            </div>

            <h1 className="text-5xl sm:text-6xl font-bold text-white leading-[1.05] mb-6">
              We exist to{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400">
                democratize
              </span>{" "}
              professional trading.
            </h1>

            <p className="text-gray-400 text-lg leading-relaxed mb-10 max-w-lg">
              For decades, institutional-grade trading was reserved for the
              ultra-wealthy. We changed that. Since 2019, we&apos;ve been
              bridging the gap between Wall Street expertise and everyday
              investors.
            </p>

            <div className="flex items-center gap-6">
              <div className="h-12 w-px bg-white/10" />
              <p className="text-gray-500 text-sm italic">
                &ldquo;The mission is simple: grow our clients&apos; wealth the
                same way we&apos;d grow our own.&rdquo;
              </p>
            </div>
          </div>

          {/* Right — Mission Cards */}
          <div className="grid grid-cols-2 gap-4">
            {[
              {
                icon: "🎯",
                title: "Our Mission",
                text: "Make professional trade management accessible to every investor, regardless of portfolio size.",
              },
              {
                icon: "👁",
                title: "Our Vision",
                text: "A world where your money works as hard as you do — transparently and efficiently.",
              },
              {
                icon: "⚖️",
                title: "Our Promise",
                text: "Full transparency. Audited results. No hidden fees. Your capital, always protected.",
              },
              {
                icon: "🌍",
                title: "Our Reach",
                text: "Thousand+ investors across 40+ countries, all managed from our global trading desk.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6 hover:bg-white/[0.05] transition-colors"
              >
                <span className="text-2xl mb-3 block">{item.icon}</span>
                <h3 className="text-white text-sm font-bold mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-500 text-xs leading-relaxed">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
