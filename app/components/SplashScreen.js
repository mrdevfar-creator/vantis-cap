"use client";
// app/components/SplashScreen.js

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

// ── Seeded pseudo-random ──────────────────────────────────────────────────────
function seededRand(seed) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

// ── Realistic OHLC candle data ────────────────────────────────────────────────
const CANDLES = (() => {
  const rand = seededRand(42);
  let price = 184.5;
  return Array.from({ length: 28 }, () => {
    const move = (rand() - 0.46) * 6;
    const open = price;
    const close = price + move;
    const high = Math.max(open, close) + rand() * 3;
    const low = Math.min(open, close) - rand() * 3;
    price = close;
    return { open, close, high, low, bull: close >= open };
  });
})();

const MIN_P = Math.min(...CANDLES.map((c) => c.low));
const MAX_P = Math.max(...CANDLES.map((c) => c.high));
const P_RNG = MAX_P - MIN_P;

// ── Ticker items ──────────────────────────────────────────────────────────────
const TICKERS = [
  { sym: "BTC/USDT", price: "67,432.10", chg: "+2.34%", up: true },
  { sym: "ETH/USDT", price: "3,521.88", chg: "+1.87%", up: true },
  { sym: "XAU/USD", price: "2,318.45", chg: "+0.62%", up: true },
  { sym: "EUR/USD", price: "1.0847", chg: "-0.18%", up: false },
  { sym: "S&P 500", price: "5,234.18", chg: "+0.91%", up: true },
  { sym: "NASDAQ", price: "16,742.39", chg: "+1.12%", up: true },
  { sym: "BNB/USDT", price: "598.24", chg: "+3.01%", up: true },
  { sym: "SOL/USDT", price: "172.55", chg: "+4.22%", up: true },
];

export default function SplashScreen({ onFinish }) {
  const [phase, setPhase] = useState(0); // 0=chart  1=logo  2=done
  const [chartPct, setChartPct] = useState(0); // 0 → 1
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);
  const rafRef = useRef(null);

  useEffect(() => {
    const KEY = "vantis_splash_v3";
    if (sessionStorage.getItem(KEY)) {
      onFinish?.();
      return;
    }
    sessionStorage.setItem(KEY, "1");

    // Draw chart 0→1 over 1900 ms
    const t0 = performance.now();
    const drawChart = (now) => {
      const p = Math.min((now - t0) / 1900, 1);
      setChartPct(p);
      if (p < 1) rafRef.current = requestAnimationFrame(drawChart);
    };
    rafRef.current = requestAnimationFrame(drawChart);

    // Phase 1 — logo at 2200 ms
    const p1 = setTimeout(() => setPhase(1), 2200);

    // Fade + finish at 4400 ms
    const p2 = setTimeout(() => {
      setFading(true);
      setTimeout(() => {
        setVisible(false);
        onFinish?.();
      }, 600);
    }, 4400);

    return () => {
      clearTimeout(p1);
      clearTimeout(p2);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [onFinish]);

  if (!visible) return null;

  // SVG math
  const W = 320,
    H = 110;
  const cw = W / CANDLES.length;
  const toY = (p) => H - ((p - MIN_P) / P_RNG) * (H * 0.82) - H * 0.09;
  const vis = Math.ceil(chartPct * CANDLES.length);
  const last = CANDLES[Math.max(vis - 1, 0)];
  const linePath = CANDLES.slice(0, vis)
    .map((c, i) => `${i === 0 ? "M" : "L"}${(i + 0.5) * cw},${toY(c.close)}`)
    .join(" ");

  return (
    <div
      className={`fixed inset-0 z-[9999] bg-[#060810] flex flex-col items-center justify-center overflow-hidden transition-opacity duration-500 ${fading ? "opacity-0" : "opacity-100"}`}
    >
      {/* ── Glow orbs (Tailwind only) ── */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-48 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-32 bg-violet-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* ════ PHASE 0 — Chart & Stats ════ */}
      {phase === 0 && (
        <div className="flex flex-col items-center gap-5 w-full max-w-sm px-5">
          {/* Header */}
          <div className="text-center">
            <p className="font-mono font-bold text-[11px] tracking-[5px] uppercase text-amber-500/60">
              VANTIS CAPITAL
            </p>
            <p className="font-mono text-[9px] tracking-[3px] mt-1 text-white/20">
              ALGORITHMIC TRADING PLATFORM
            </p>
          </div>

          {/* Chart card */}
          <div className="w-full rounded-2xl bg-white/[0.02] border border-white/[0.06] p-4 relative overflow-hidden">
            {/* Live dot + price */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-mono text-[10px] text-white/35">
                  BTC / USDT · 1H
                </span>
              </div>
              <span className="font-mono text-xs font-bold text-emerald-400">
                ${last?.close.toFixed(2)}
              </span>
            </div>

            {/* SVG — only SVG attrs are inline, unavoidable */}
            <svg
              width="100%"
              height={H}
              viewBox={`0 0 ${W} ${H}`}
              preserveAspectRatio="none"
            >
              {/* Grid */}
              {[0.25, 0.5, 0.75].map((y) => (
                <line
                  key={y}
                  x1={0}
                  y1={H * y}
                  x2={W}
                  y2={H * y}
                  stroke="rgba(255,255,255,0.04)"
                  strokeWidth={1}
                />
              ))}

              {/* Candles */}
              {CANDLES.slice(0, vis).map((c, i) => {
                const x = (i + 0.5) * cw;
                const bodyTop = toY(Math.max(c.open, c.close));
                const bodyBot = toY(Math.min(c.open, c.close));
                const bh = Math.max(bodyBot - bodyTop, 1.5);
                const col = c.bull ? "#0ECB81" : "#F6465D";
                return (
                  <g key={i}>
                    <line
                      x1={x}
                      y1={toY(c.high)}
                      x2={x}
                      y2={toY(c.low)}
                      stroke={col}
                      strokeWidth={0.8}
                      opacity={0.6}
                    />
                    <rect
                      x={x - cw * 0.32}
                      y={bodyTop}
                      width={cw * 0.64}
                      height={bh}
                      fill={col}
                      opacity={0.92}
                      rx={1}
                    />
                  </g>
                );
              })}

              {/* Price line */}
              {vis > 1 && (
                <path
                  d={linePath}
                  fill="none"
                  stroke="#F0B90B"
                  strokeWidth={1.5}
                  opacity={0.5}
                />
              )}
            </svg>

            {/* Step dots — shows chart drawing progress without inline style */}
            <div className="mt-3 flex gap-1.5 justify-center">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className={`h-0.5 flex-1 rounded-full transition-all duration-300 ${
                    i < Math.ceil(chartPct * 8)
                      ? "bg-amber-400/70"
                      : "bg-white/10"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Stats row */}
          <div className="flex gap-2.5 w-full">
            {[
              { label: "AUM", val: "$45M+", cls: "text-amber-400" },
              { label: "Win Rate", val: "78%", cls: "text-emerald-400" },
              { label: "Investors", val: "120K+", cls: "text-blue-400" },
            ].map((s) => (
              <div
                key={s.label}
                className="flex-1 text-center rounded-xl py-2 bg-white/[0.02] border border-white/[0.05]"
              >
                <p className={`font-mono font-black text-base ${s.cls}`}>
                  {s.val}
                </p>
                <p className="text-[9px] uppercase tracking-widest mt-0.5 text-white/25">
                  {s.label}
                </p>
              </div>
            ))}
          </div>

          {/* Mini ticker (static, no scroll animation) */}
          <div className="flex gap-4 flex-wrap justify-center">
            {TICKERS.slice(0, 4).map((t) => (
              <div key={t.sym} className="flex items-center gap-1.5">
                <span className="font-mono text-[10px] text-white/30">
                  {t.sym}
                </span>
                <span
                  className={`font-mono text-[10px] font-bold ${t.up ? "text-emerald-400" : "text-red-400"}`}
                >
                  {t.chg}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ════ PHASE 1 — Logo Reveal ════ */}
      {phase === 1 && (
        <div className="flex flex-col items-center gap-6 animate-[fadeInUp_0.6s_ease-out_forwards]">
          {/* Logo ring */}
          <div className="relative">
            {/* Outer glow ring */}
            <div className="absolute inset-0 rounded-[28px] bg-amber-400/10 blur-xl animate-pulse" />
            <div className="relative w-28 h-28 rounded-[28px] bg-amber-500/10 border border-amber-500/25 flex items-center justify-center">
              <Image
                src="/vantis-trs-logo.png"
                alt="Vantis Capital"
                width={64}
                height={64}
                className="object-contain"
              />
            </div>
          </div>

          {/* Brand name */}
          <div className="text-center">
            <p className="font-black text-2xl tracking-[4px] uppercase text-amber-400">
              Vantis Capital
            </p>
            <p className="text-[10px] tracking-[4px] uppercase mt-1.5 text-white/25">
              Algorithmic Trading
            </p>
          </div>

          {/* Animated loading bar — Tailwind animate-[...] */}
          <div className="w-40 h-0.5 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-amber-400 to-yellow-300 rounded-full animate-[loadBar_2s_ease-out_forwards]" />
          </div>

          {/* Ticker row */}
          <div className="flex gap-5 flex-wrap justify-center mt-1">
            {TICKERS.map((t) => (
              <div key={t.sym} className="flex items-center gap-1.5">
                <span className="font-mono text-[10px] text-white/30">
                  {t.sym}
                </span>
                <span
                  className={`font-mono text-[10px] font-bold ${t.up ? "text-emerald-400" : "text-red-400"}`}
                >
                  {t.chg}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Bottom status bar ── */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-amber-500/10 bg-black/50 px-5 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-mono text-[10px] text-white/30">
            Markets Open
          </span>
        </div>
        <div className="flex gap-4">
          {TICKERS.slice(0, 3).map((t) => (
            <span key={t.sym} className="font-mono text-[10px] text-white/25">
              {t.sym}{" "}
              <span className={t.up ? "text-emerald-400" : "text-red-400"}>
                {t.chg}
              </span>
            </span>
          ))}
        </div>
        <span className="font-mono text-[10px] text-white/20">
          VANTIS CAPITAL
        </span>
      </div>
    </div>
  );
}
