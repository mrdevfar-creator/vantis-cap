const testimonials = [
  {
    name: "Marcus Chen",
    role: "Software Engineer, Singapore",
    avatar: "MC",
    avatarColor: "from-blue-400 to-indigo-500",
    rating: 5,
    text: "I was skeptical at first, but the live trading dashboard convinced me. Six months in and I've seen consistent monthly returns. The transparency is unlike anything I've seen in this space.",
    return: "+31.4%",
    duration: "6 months",
  },
  {
    name: "Sarah Williams",
    role: "Business Owner, UAE",
    avatar: "SW",
    avatarColor: "from-rose-400 to-pink-500",
    rating: 5,
    text: "Finally a managed fund that actually shows you what's happening in real time. My Growth plan has been delivering exactly what was promised. The weekly reports are detailed and honest.",
    return: "+47.2%",
    duration: "11 months",
  },
  {
    name: "Ahmed Al-Rashid",
    role: "Retired Investor, Kuwait",
    avatar: "AR",
    avatarColor: "from-amber-400 to-orange-500",
    rating: 5,
    text: "The Elite plan is worth every penny. Having a dedicated account manager who explains every move gives me peace of mind. My capital has grown significantly with minimal stress.",
    return: "+62.8%",
    duration: "18 months",
  },
  {
    name: "Priya Sharma",
    role: "Doctor, India",
    avatar: "PS",
    avatarColor: "from-emerald-400 to-teal-500",
    rating: 5,
    text: "As someone with no trading experience, this was perfect. They handle everything while I focus on my career. Withdrawals processed within 24 hours every single time.",
    return: "+19.6%",
    duration: "4 months",
  },
  {
    name: "Thomas Mueller",
    role: "Entrepreneur, Germany",
    avatar: "TM",
    avatarColor: "from-violet-400 to-purple-500",
    rating: 5,
    text: "I compared 6 different managed trading services. This was the only one that showed live trading data and had audited returns. The Sharpe ratio alone sold me.",
    return: "+38.9%",
    duration: "9 months",
  },
  {
    name: "Jessica Park",
    role: "Marketing Director, USA",
    avatar: "JP",
    avatarColor: "from-cyan-400 to-sky-500",
    rating: 5,
    text: "Started with the Starter plan to test the waters. Results were so strong I upgraded to Growth after 2 months. Customer support is always responsive and knowledgeable.",
    return: "+24.1%",
    duration: "5 months",
  },
];

export default function Testimonial() {
  return (
    <section className="bg-[#0D0D0D] py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span className="text-xs font-medium text-gray-400 tracking-widest uppercase">
              Testimonials
            </span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-white leading-tight mb-4">
            Investors who{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">
              trust us
            </span>
          </h2>
          <p className="text-gray-400 text-base">
            Real results from real investors. Every review is verified and
            linked to a live account.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <div
              key={t.name}
              className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-7 hover:bg-white/[0.05] hover:border-white/15 transition-all duration-300 flex flex-col"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-5">
                {Array(t.rating)
                  .fill(0)
                  .map((_, s) => (
                    <svg
                      key={s}
                      className="w-4 h-4 text-amber-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
              </div>

              {/* Quote */}
              <p className="text-gray-400 text-sm leading-relaxed flex-1 mb-6">
                &ldquo;{t.text}&rdquo;
              </p>

              {/* Return badge */}
              <div className="flex items-center justify-between mb-5 bg-white/5 rounded-xl px-4 py-3">
                <div>
                  <p className="text-xs text-gray-500">Total Return</p>
                  <p className="text-emerald-400 text-lg font-bold">
                    {t.return}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Duration</p>
                  <p className="text-white text-sm font-medium">{t.duration}</p>
                </div>
              </div>

              {/* Author */}
              <div className="flex items-center gap-3 pt-5 border-t border-white/5">
                <div
                  className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.avatarColor} flex items-center justify-center text-white text-xs font-bold shrink-0`}
                >
                  {t.avatar}
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">{t.name}</p>
                  <p className="text-gray-500 text-xs">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust bar */}
        <div className="mt-14 flex flex-wrap items-center justify-center gap-8 text-gray-600 text-xs">
          <span className="flex items-center gap-2">
            <svg
              className="w-4 h-4 text-emerald-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
              />
            </svg>
            All reviews verified
          </span>
          <span className="flex items-center gap-2">
            <svg
              className="w-4 h-4 text-emerald-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
              />
            </svg>
            Linked to live accounts
          </span>
          <span className="flex items-center gap-2">
            <svg
              className="w-4 h-4 text-emerald-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
              />
            </svg>
            Returns independently audited
          </span>
        </div>
      </div>
    </section>
  );
}
