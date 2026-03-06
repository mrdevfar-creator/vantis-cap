"use client";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import DepositArea from "@/app/components/DepositArea";

// ── Animated Chart Background ─────────────────────────────────────────────────
function ChartBg() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;
    let w, h;
    const resize = () => {
      w = canvas.width = canvas.offsetWidth;
      h = canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);
    const generatePath = (amplitude, yBase) => {
      const pts = [];
      let y = yBase;
      for (let x = 0; x <= w + 40; x += 18) {
        y += (Math.random() - 0.49) * amplitude;
        y = Math.max(yBase - amplitude * 3, Math.min(yBase + amplitude * 3, y));
        pts.push({ x, y });
      }
      return pts;
    };
    let lines = [
      { pts: [], color: "rgba(240,185,11,0.18)", width: 1.5, speed: 0.18 },
      { pts: [], color: "rgba(0,200,150,0.12)", width: 1, speed: 0.12 },
      { pts: [], color: "rgba(240,185,11,0.08)", width: 1, speed: 0.22 },
    ];
    const initLines = () => {
      lines[0].pts = generatePath(12, h * 0.35);
      lines[1].pts = generatePath(8, h * 0.55);
      lines[2].pts = generatePath(16, h * 0.7);
    };
    initLines();
    window.addEventListener("resize", initLines);
    let offset = 0;
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      offset += 0.4;
      lines.forEach((line) => {
        ctx.beginPath();
        ctx.strokeStyle = line.color;
        ctx.lineWidth = line.width;
        const shift = offset * line.speed;
        line.pts.forEach((pt, i) => {
          const x = pt.x - (shift % (w + 40));
          i === 0 ? ctx.moveTo(x, pt.y) : ctx.lineTo(x, pt.y);
        });
        ctx.stroke();
        ctx.beginPath();
        line.pts.forEach((pt, i) => {
          const x = pt.x - (shift % (w + 40)) + w + 40;
          i === 0 ? ctx.moveTo(x, pt.y) : ctx.lineTo(x, pt.y);
        });
        ctx.stroke();
      });
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);
  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full opacity-60"
    />
  );
}

// ── Ticker Bar ────────────────────────────────────────────────────────────────
const TICKERS = [
  { sym: "BTC/USDT", price: "67,234.50", chg: "+2.14%" },
  { sym: "ETH/USDT", price: "3,521.80", chg: "+1.87%" },
  { sym: "XAU/USD", price: "2,318.40", chg: "+0.63%" },
  { sym: "EUR/USD", price: "1.0821", chg: "-0.12%" },
  { sym: "BNB/USDT", price: "412.30", chg: "+3.21%" },
  { sym: "S&P 500", price: "5,248.80", chg: "+0.41%" },
  { sym: "GBP/USD", price: "1.2654", chg: "-0.08%" },
  { sym: "NAS100", price: "18,320.00", chg: "+0.92%" },
];
function TickerBar() {
  return (
    <div className="bg-[#0d1117] border-b border-[#1e2329] overflow-hidden">
      <div
        className="flex whitespace-nowrap py-2"
        style={{ animation: "marquee 28s linear infinite" }}
      >
        {[...TICKERS, ...TICKERS].map((t, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-2 mx-6 text-xs font-mono shrink-0"
          >
            <span className="text-gray-400">{t.sym}</span>
            <span className="text-white font-semibold">{t.price}</span>
            <span
              className={
                t.chg.startsWith("+") ? "text-emerald-400" : "text-red-400"
              }
            >
              {t.chg}
            </span>
          </span>
        ))}
      </div>
      <style>{`@keyframes marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}`}</style>
    </div>
  );
}

// ── Stats Counter ─────────────────────────────────────────────────────────────
function Counter({
  target,
  prefix = "",
  suffix = "",
  duration = 2000,
  decimals = 0,
}) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = Date.now();
          const tick = () => {
            const elapsed = Date.now() - start;
            const progress = Math.min(elapsed / duration, 1);
            const ease = 1 - Math.pow(1 - progress, 3);
            const val = ease * target;
            setCount(
              decimals ? parseFloat(val.toFixed(decimals)) : Math.floor(val),
            );
            if (progress < 1) requestAnimationFrame(tick);
          };
          tick();
        }
      },
      { threshold: 0.3 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration, decimals]);
  return (
    <span ref={ref}>
      {prefix}
      {decimals ? count.toFixed(decimals) : count.toLocaleString()}
      {suffix}
    </span>
  );
}

// ── Daily Performance Card ────────────────────────────────────────────────────
const PERFORMANCE_ASSETS = [
  { sym: "BTC/USDT", icon: "₿", baseChg: 2.1 },
  { sym: "ETH/USDT", icon: "Ξ", baseChg: 1.8 },
  { sym: "XAU/USD", icon: "🥇", baseChg: 0.6 },
  { sym: "EUR/USD", icon: "€", baseChg: -0.1 },
  { sym: "BNB/USDT", icon: "B", baseChg: 3.2 },
  { sym: "NAS100", icon: "📈", baseChg: 0.9 },
];

// Seeded random: consistent within same day, changes day to day
function getDailyRandom(seed, min, max) {
  const today = new Date().toDateString();
  let hash = 0;
  for (let i = 0; i < (today + seed).length; i++) {
    hash = (hash << 5) - hash + (today + seed).charCodeAt(i);
    hash |= 0;
  }
  const normalized = (Math.abs(hash) % 1000) / 1000;
  return +(min + normalized * (max - min)).toFixed(2);
}

function DailyPerformanceCard() {
  const [assets, setAssets] = useState([]);
  const [lastUpdate, setLastUpdate] = useState("");
  const [totalReturn, setTotalReturn] = useState(0);
  const [winCount, setWinCount] = useState(0);

  useEffect(() => {
    const generated = PERFORMANCE_ASSETS.map((a, i) => {
      const variance = getDailyRandom(`${a.sym}-${i}`, -2.5, 2.5);
      const chg = +(a.baseChg + variance).toFixed(2);
      return { ...a, chg };
    });
    setAssets(generated);
    const wins = generated.filter((a) => a.chg > 0).length;
    setWinCount(wins);
    const avg = generated.reduce((s, a) => s + a.chg, 0) / generated.length;
    setTotalReturn(+avg.toFixed(2));
    const now = new Date();
    setLastUpdate(
      now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
    );
  }, []);

  // Mini sparkline bars (randomly generated per day)
  const getSparkBars = (sym) =>
    Array.from({ length: 8 }, (_, i) =>
      getDailyRandom(`${sym}-bar-${i}`, 20, 100),
    );

  return (
    <div className="bg-[#131722] border border-[#2a2e39] rounded-2xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#2a2e39]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#F0B90B] to-orange-500 flex items-center justify-center">
            <svg
              className="w-3.5 h-3.5 text-black"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941"
              />
            </svg>
          </div>
          <div>
            <p className="text-white text-xs font-bold leading-none">
              Daily Performance
            </p>
            <p className="text-gray-500 text-[10px] mt-0.5">
              Updated {lastUpdate}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400"></span>
          </span>
          <span className="text-emerald-400 text-[10px] font-bold">LIVE</span>
        </div>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-3 gap-px bg-[#2a2e39]">
        {[
          {
            label: "Today's Avg",
            value: `${totalReturn > 0 ? "+" : ""}${totalReturn}%`,
            color: totalReturn >= 0 ? "text-emerald-400" : "text-red-400",
          },
          {
            label: "Winning",
            value: `${winCount}/${PERFORMANCE_ASSETS.length}`,
            color: "text-[#F0B90B]",
          },
          { label: "Cycle ROI", value: "3–12%", color: "text-white" },
        ].map((s) => (
          <div key={s.label} className="bg-[#131722] px-3 py-2.5 text-center">
            <p className={`text-sm font-black ${s.color}`}>{s.value}</p>
            <p className="text-gray-600 text-[10px] mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Asset rows */}
      <div className="divide-y divide-[#1e2636]">
        {assets.map((a) => {
          const bars = getSparkBars(a.sym);
          const isUp = a.chg >= 0;
          return (
            <div
              key={a.sym}
              className="flex items-center gap-3 px-5 py-3 hover:bg-white/[0.02] transition-colors"
            >
              {/* Icon */}
              <div className="w-7 h-7 rounded-full bg-[#2a2e39] flex items-center justify-center text-xs font-bold text-gray-300 shrink-0">
                {a.icon}
              </div>
              {/* Symbol */}
              <div className="flex-1 min-w-0">
                <p className="text-white text-xs font-semibold">{a.sym}</p>
              </div>
              {/* Sparkline */}
              <div className="flex items-end gap-[2px] h-6 shrink-0">
                {bars.map((h, i) => (
                  <div
                    key={i}
                    className="w-[3px] rounded-sm"
                    style={{
                      height: `${h}%`,
                      background: isUp
                        ? `rgba(52,211,153,${0.3 + (i / bars.length) * 0.7})`
                        : `rgba(248,113,113,${0.3 + (i / bars.length) * 0.7})`,
                    }}
                  />
                ))}
              </div>
              {/* Change */}
              <div
                className={`text-xs font-bold min-w-[46px] text-right ${isUp ? "text-emerald-400" : "text-red-400"}`}
              >
                {isUp ? "▲" : "▼"} {Math.abs(a.chg).toFixed(2)}%
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-[#2a2e39] flex items-center justify-between">
        <span className="text-gray-600 text-[10px]">
          Data refreshes daily at 00:00 UTC
        </span>
        <Link href="/live-market">
          <span className="text-[#F0B90B] text-[10px] font-semibold hover:underline cursor-pointer">
            View all →
          </span>
        </Link>
      </div>
    </div>
  );
}

// ── Main Homepage ─────────────────────────────────────────────────────────────
export default function HomePage() {
  const [activeFaq, setActiveFaq] = useState(null);

  const faqs = [
    {
      q: "How do I start investing with Vantis Capital?",
      a: "Simply create a free account, make your first USDT TRC20 deposit (min $50), and choose your preferred investment plan. Your 96-hour trade cycle begins automatically after admin approval.",
    },
    {
      q: "What is the minimum investment amount?",
      a: "You can start investing with as little as $50 on our Starter plan — the most accessible entry point in the market. No experience required.",
    },
    {
      q: "How are my funds secured?",
      a: "Your funds are protected through multi-layer encryption, cold storage protocols, and our dedicated risk management team that monitors positions 24/7 with a hard 2% drawdown cap per trade.",
    },
    {
      q: "When can I withdraw my profits?",
      a: "Withdrawals are instant after your 96-hour trade cycle completes. Funds are sent directly to your registered USDT TRC20 wallet within 24-48 hours of your request.",
    },
    {
      q: "Is Vantis Capital regulated?",
      a: "Vantis Capital operates under strict financial compliance standards with transparent reporting. Our trading operations are audited quarterly by independent firms.",
    },
    {
      q: "What returns can I expect?",
      a: "Returns depend on your chosen plan — from 110% (Starter) to 120% (Master). These are estimated returns based on historical performance of our 96-hour trade cycles.",
    },
  ];

  const testimonials = [
    {
      name: "James R.",
      role: "Retail Investor",
      country: "🇺🇸",
      text: "I started with $50 on the Starter plan just to test. Got my withdrawal in 38 hours. Now I'm on Master tier. The daily performance card on the homepage convinced me it was legit.",
      rating: 5,
    },
    {
      name: "Sarah K.",
      role: "Forex Trader",
      country: "🇬🇧",
      text: "The transparency is what sets Vantis apart. Real-time server tracking, live performance data — it feels like a professional trading terminal for regular investors.",
      rating: 5,
    },
    {
      name: "Mohammed A.",
      role: "Portfolio Manager",
      country: "🇦🇪",
      text: "Referred three colleagues already. The referral commission system is generous and the daily performance updates make it easy to convince others.",
      rating: 5,
    },
    {
      name: "Priya S.",
      role: "Tech Entrepreneur",
      country: "🇮🇳",
      text: "Clean UI, fast withdrawals, responsive support. The 6 plan options mean I can scale gradually without ever feeling locked in. My portfolio has grown 40% in 6 months.",
      rating: 5,
    },
  ];

  return (
    <div className="bg-white overflow-x-hidden">
      {/* ── TICKER ── */}
      <TickerBar />

      {/* ── HERO ── */}
      <section className="relative min-h-screen bg-[#0B0E17] flex items-center overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
        <div className="absolute top-1/3 -left-32 w-[500px] h-[500px] bg-[#F0B90B]/6 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-0 w-[400px] h-[400px] bg-emerald-500/4 rounded-full blur-[100px] pointer-events-none" />
        <ChartBg />

        <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 lg:px-20 py-20 w-full">
          <div className="grid lg:grid-cols-2 gap-12 xl:gap-20 items-center">
            {/* LEFT */}
            <div>
              <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 mb-7">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                </span>
                <span className="text-emerald-400 text-xs font-bold tracking-widest uppercase">
                  Markets Open · Live Trading Active
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl xl:text-7xl font-black text-white leading-[1.04] tracking-tight mb-5">
                Institutional
                <br />
                Trading.
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F0B90B] via-[#F8D12F] to-[#FFE066]">
                  For Everyone.
                </span>
              </h1>

              <p className="text-gray-400 text-base sm:text-lg leading-relaxed mb-8 max-w-[520px]">
                Access algorithmic trading strategies starting at just{" "}
                <strong className="text-white">$50</strong>. Automated 96-hour
                trade cycles with full transparency and instant withdrawals
                after timeout.
              </p>

              <div className="flex flex-wrap gap-3 mb-10">
                <Link href="/signup">
                  <button className="inline-flex items-center gap-2 bg-[#F0B90B] hover:bg-[#F8D12F] text-black font-black px-7 py-3.5 rounded-xl text-sm transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#F0B90B]/30 active:scale-95">
                    Start Trading Free
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
                  </button>
                </Link>
                <Link href="/investment">
                  <button className="inline-flex items-center gap-2 border border-white/15 hover:border-white/30 text-white/75 hover:text-white font-semibold px-7 py-3.5 rounded-xl text-sm transition-all hover:bg-white/5">
                    View Plans
                  </button>
                </Link>
              </div>

              <div className="flex flex-wrap gap-x-6 gap-y-2.5">
                {[
                  { icon: "🔒", text: "256-bit Encryption" },
                  { icon: "⚡", text: "Instant Withdraw" },
                  { icon: "🌍", text: "120K+ Investors" },
                  { icon: "📋", text: "Quarterly Audits" },
                ].map((b) => (
                  <div key={b.text} className="flex items-center gap-2">
                    <span>{b.icon}</span>
                    <span className="text-gray-500 text-xs font-medium">
                      {b.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT — Daily Performance Card */}
            <div className="hidden lg:block">
              <DailyPerformanceCard />
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent pointer-events-none" />
      </section>

      {/* ── STATS ── */}
      <section className="bg-white py-16 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {[
              {
                target: 7,
                suffix: "+ Years",
                label: "Platform Active",
                sub: "Since 2017",
                prefix: "",
              },
              {
                target: 120,
                suffix: "K+",
                label: "Active Investors",
                sub: "Worldwide",
                prefix: "",
              },
              {
                target: 45,
                suffix: "M+",
                label: "Assets Under Mgmt.",
                sub: "Total USD",
                prefix: "$",
              },
              {
                target: 41,
                suffix: "M+",
                label: "Total Payouts",
                sub: "Paid to investors",
                prefix: "$",
              },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 tabular-nums leading-none mb-2">
                  <Counter
                    target={s.target}
                    prefix={s.prefix}
                    suffix={s.suffix}
                  />
                </p>
                <p className="text-gray-800 font-semibold text-sm">{s.label}</p>
                <p className="text-gray-400 text-xs mt-0.5">{s.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="bg-gray-50 py-20 sm:py-24">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-20">
          <div className="text-center mb-14">
            <p className="text-[#F0B90B] text-xs font-bold uppercase tracking-widest mb-3">
              Simple Process
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 mb-4">
              Start Earning in 4 Steps
            </h2>
            <p className="text-gray-500 max-w-lg mx-auto text-sm sm:text-base">
              No trading knowledge needed. From signup to first withdrawal, the
              whole process takes under 5 days.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                n: "01",
                icon: "👤",
                title: "Create Free Account",
                desc: "Sign up with email and password in under 2 minutes. No ID verification required.",
                time: "~2 min",
              },
              {
                n: "02",
                icon: "💳",
                title: "Deposit USDT TRC20",
                desc: "Fund from $50 via USDT TRC20. Deposit approved by admin and reflected immediately.",
                time: "~15 min",
              },
              {
                n: "03",
                icon: "🤖",
                title: "Algorithm Activates",
                desc: "Your capital is deployed across our trading servers. 96-hour cycle begins automatically.",
                time: "Immediate",
              },
              {
                n: "04",
                icon: "💰",
                title: "Withdraw Profits",
                desc: "Withdraw instantly after cycle ends. USDT sent to your wallet within 24-48 hours.",
                time: "24–48h",
              },
            ].map((s) => (
              <div
                key={s.n}
                className="bg-white border border-gray-100 hover:border-[#F0B90B]/30 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#F0B90B]/5"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl">{s.icon}</span>
                  <span className="text-gray-100 font-black text-4xl leading-none">
                    {s.n}
                  </span>
                </div>
                <h3 className="text-gray-900 font-bold text-sm mb-2">
                  {s.title}
                </h3>
                <p className="text-gray-500 text-xs leading-relaxed mb-4">
                  {s.desc}
                </p>
                <div className="inline-flex items-center gap-1.5 bg-[#F0B90B]/8 rounded-full px-3 py-1">
                  <svg
                    className="w-3 h-3 text-[#F0B90B]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="text-[#F0B90B] text-[10px] font-bold">
                    {s.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DEPOSIT PLANS ── */}
      <DepositArea />

      {/* ── TESTIMONIALS ── */}
      <section className="bg-white py-20 sm:py-24">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-20">
          <div className="text-center mb-12">
            <p className="text-[#F0B90B] text-xs font-bold uppercase tracking-widest mb-3">
              Trusted Worldwide
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 mb-4">
              What Our Investors Say
            </h2>
            <div className="flex items-center justify-center gap-1 mt-3">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="text-[#F0B90B] text-xl">
                  ★
                </span>
              ))}
              <span className="text-gray-500 text-sm ml-2">
                4.9/5 from 12,400+ reviews
              </span>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {testimonials.map((t, i) => (
              <div
                key={i}
                className="bg-gray-50 border border-gray-100 rounded-2xl p-6 hover:border-[#F0B90B]/20 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(t.rating)].map((_, j) => (
                    <span key={j} className="text-[#F0B90B] text-sm">
                      ★
                    </span>
                  ))}
                </div>
                <p className="text-gray-700 text-sm leading-relaxed mb-5">
                  {t.text}
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#F0B90B] to-orange-500 flex items-center justify-center text-black text-xs font-black shrink-0">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="text-gray-900 text-sm font-bold">
                      {t.name} {t.country}
                    </p>
                    <p className="text-gray-400 text-xs">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="bg-gray-50 py-20 sm:py-24">
        <div className="max-w-3xl mx-auto px-5 sm:px-8">
          <div className="text-center mb-12">
            <p className="text-[#F0B90B] text-xs font-bold uppercase tracking-widest mb-3">
              FAQ
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900">
              Common Questions
            </h2>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className={`bg-white border rounded-xl overflow-hidden transition-all duration-200 ${activeFaq === i ? "border-[#F0B90B]/30 shadow-sm" : "border-gray-100"}`}
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left gap-4"
                >
                  <span className="font-semibold text-gray-900 text-sm">
                    {faq.q}
                  </span>
                  <span
                    className={`shrink-0 w-6 h-6 rounded-full border flex items-center justify-center transition-all duration-200 ${activeFaq === i ? "bg-[#F0B90B] border-[#F0B90B] text-black rotate-45" : "border-gray-200 text-gray-400"}`}
                  >
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 4.5v15m7.5-7.5h-15"
                      />
                    </svg>
                  </span>
                </button>
                {activeFaq === i && (
                  <div className="px-5 pb-4">
                    <p className="text-gray-500 text-sm leading-relaxed">
                      {faq.a}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="bg-[#0B0E17] py-20 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#F0B90B]/8 rounded-full blur-[80px]" />
        <div className="relative z-10 max-w-3xl mx-auto px-5 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4">
            Ready to Start
            <br />
            <span className="text-[#F0B90B]">Growing Your Wealth?</span>
          </h2>
          <p className="text-gray-400 mb-8 text-sm sm:text-base">
            Join 120,000+ investors who trust Vantis Capital. Start from just
            $50.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <button className="bg-[#F0B90B] hover:bg-[#F8D12F] text-black font-bold px-10 py-4 rounded-xl text-sm transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#F0B90B]/25 active:scale-95">
                Create Free Account
              </button>
            </Link>
            <Link href="/investment">
              <button className="border border-white/15 text-white/80 hover:text-white hover:border-white/30 font-medium px-10 py-4 rounded-xl text-sm transition-all hover:bg-white/5">
                View Investment Plans
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      {/* <footer className="bg-[#0d1117] border-t border-[#1e2329] py-14">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-20">
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-10 mb-12">
            <div className="sm:col-span-2 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#F0B90B] to-orange-500 flex items-center justify-center shrink-0">
                  <svg
                    className="w-4 h-4 text-black"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941"
                    />
                  </svg>
                </div>
                <span className="text-white font-black text-lg tracking-tight">
                  Vantis Capital
                </span>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed max-w-sm">
                Professional investment management platform trusted by 120,000+
                investors worldwide. Start from $50.
              </p>
              <div className="flex gap-4 mt-5">
                {["Twitter", "Telegram", "LinkedIn"].map((s) => (
                  <a
                    key={s}
                    href="#"
                    className="text-gray-600 hover:text-[#F0B90B] text-xs transition-colors"
                  >
                    {s}
                  </a>
                ))}
              </div>
            </div>
            <div>
              <p className="text-white text-sm font-bold mb-4">Platform</p>
              <ul className="space-y-2.5">
                {[
                  ["Investment Plans", "/investment"],
                  ["Live Markets", "/live-market"],
                  ["Trade Management", "/trading-management"],
                  ["About Us", "/about-us"],
                ].map(([l, h]) => (
                  <li key={l}>
                    <Link
                      href={h}
                      className="text-gray-500 hover:text-white text-sm transition-colors"
                    >
                      {l}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-white text-sm font-bold mb-4">Support</p>
              <ul className="space-y-2.5">
                {[
                  ["Contact Us", "/contact"],
                  ["FAQ", "#faq"],
                  ["Terms of Service", "#"],
                  ["Privacy Policy", "#"],
                ].map(([l, h]) => (
                  <li key={l}>
                    <a
                      href={h}
                      className="text-gray-500 hover:text-white text-sm transition-colors"
                    >
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="border-t border-[#1e2329] pt-7 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-gray-600 text-xs">
              © 2024 Vantis Capital. All rights reserved.
            </p>
            <p className="text-gray-700 text-xs text-center sm:text-right">
              Trading involves risk. Past performance is not indicative of
              future results.
            </p>
          </div>
        </div>
      </footer> */}
    </div>
  );
}
