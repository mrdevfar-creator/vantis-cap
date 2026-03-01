"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const stats = [
  { value: "$284M+", label: "Assets Under Management" },
  { value: "94.7%", label: "Win Rate (2024)" },
  { value: "38%", label: "Avg. Annual Return" },
  { value: "1,200+", label: "Active Investors" },
];

export default function InvestHero() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="relative bg-[#0D0D0D] overflow-hidden min-h-screen flex items-center">
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Gradient blobs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-amber-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-medium text-gray-400 tracking-widest uppercase">
              Professional Trade Management
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-[1.05] mb-6">
            Your Capital,{" "}
            <span className="relative">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400">
                Professionally
              </span>
            </span>
            <br />
            Managed.
          </h1>

          <p className="text-gray-400 text-lg sm:text-xl leading-relaxed max-w-2xl mx-auto mb-10">
            We trade Forex, Gold, and Crypto markets on your behalf using proven
            strategies — so your money works while you don&apos;t.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
            <Link
              href="#plans"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black text-sm font-bold rounded-full hover:bg-amber-400 transition-all duration-200 hover:-translate-y-0.5 shadow-lg shadow-white/10"
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
              href="#performance"
              className="inline-flex items-center gap-2 px-8 py-4 border border-white/10 text-white text-sm font-medium rounded-full hover:border-white/30 transition-colors"
            >
              View Performance
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/5 rounded-2xl overflow-hidden">
            {stats.map((s) => (
              <div
                key={s.label}
                className="bg-[#0D0D0D] px-6 py-8 hover:bg-white/[0.03] transition-colors"
              >
                <p className="text-3xl font-bold text-white mb-1">{s.value}</p>
                <p className="text-gray-500 text-sm">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Trust note */}
          <p className="mt-8 text-xs text-gray-600">
            Capital at risk. Past performance does not guarantee future results.
            Regulated & audited.
          </p>
        </div>
      </div>
    </section>
  );
}
