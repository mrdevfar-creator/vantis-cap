"use client";

import { useState, useEffect, useRef } from "react";

// ─── TradingView: Forex Performance ──────────────────────────────────────────
function ForexPerformanceWidget() {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = "";

    const script = document.createElement("script");
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-forex-heat-map.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      width: "100%",
      height: 400,
      currencies: ["EUR", "USD", "JPY", "GBP", "CHF", "AUD", "CAD", "NZD"],
      isTransparent: true,
      colorTheme: "dark",
      locale: "en",
    });
    containerRef.current.appendChild(script);
  }, []);

  return (
    <div className="tradingview-widget-container" ref={containerRef}>
      <div className="tradingview-widget-container__widget" />
    </div>
  );
}

// ─── TradingView: Global Inflation Map ───────────────────────────────────────
function InflationMapWidget() {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = "";

    const script = document.createElement("script");
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-map.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbol: "inflation",
      width: "100%",
      height: 500,
      colorTheme: "dark",
      isTransparent: true,
      locale: "en",
    });
    containerRef.current.appendChild(script);
  }, []);

  return (
    <div className="tradingview-widget-container" ref={containerRef}>
      <div className="tradingview-widget-container__widget" />
    </div>
  );
}

// ─── Helpers ────────────────────────────────────────────────────────────────
const fmt = (n, d = 2) =>
  n == null
    ? "—"
    : n.toLocaleString("en-US", {
        minimumFractionDigits: d,
        maximumFractionDigits: d,
      });

const fmtCompact = (n) => {
  if (n == null) return "—";
  if (n >= 1e12) return "$" + (n / 1e12).toFixed(2) + "T";
  if (n >= 1e9) return "$" + (n / 1e9).toFixed(2) + "B";
  if (n >= 1e6) return "$" + (n / 1e6).toFixed(2) + "M";
  return "$" + fmt(n);
};

const rand = (min, max) => Math.random() * (max - min) + min;
const randInt = (min, max) => Math.floor(rand(min, max + 1));
const randItem = (arr) => arr[randInt(0, arr.length - 1)];

// ─── Market Sessions ─────────────────────────────────────────────────────────
const SESSIONS = [
  { name: "Tokyo", open: 0, close: 9, color: "from-rose-400 to-pink-500" },
  { name: "London", open: 8, close: 17, color: "from-blue-400 to-indigo-500" },
  {
    name: "New York",
    open: 13,
    close: 22,
    color: "from-amber-400 to-orange-500",
  },
  { name: "Sydney", open: 22, close: 7, color: "from-emerald-400 to-teal-500" },
];

const getSessionStatus = (session) => {
  const utcH = new Date().getUTCHours();
  if (session.open < session.close)
    return utcH >= session.open && utcH < session.close;
  return utcH >= session.open || utcH < session.close;
};

// ─── Trade Feed ──────────────────────────────────────────────────────────────
const TRADE_SYMBOLS = [
  "BTC/USD",
  "ETH/USD",
  "XAU/USD",
  "SOL/USD",
  "NAS100",
  "OIL/USD",
  "S&P500",
  "BNB/USD",
  "XAG/USD",
];
const TRADE_TYPES = ["BUY", "SELL"];
const TRADE_STATUSES = [
  "EXECUTED",
  "EXECUTED",
  "EXECUTED",
  "PENDING",
  "PARTIAL",
];
const TRADER_IDS = [
  "TR-0041",
  "TR-0087",
  "TR-0023",
  "TR-0156",
  "TR-0099",
  "TR-0312",
];

const genTrade = () => {
  const price = rand(100, 95000);
  const lots = parseFloat(rand(0.01, 10).toFixed(2));
  return {
    id: Math.random().toString(36).slice(2, 8).toUpperCase(),
    symbol: randItem(TRADE_SYMBOLS),
    type: randItem(TRADE_TYPES),
    lots,
    price: parseFloat(price.toFixed(2)),
    amount: parseFloat((lots * price).toFixed(2)),
    status: randItem(TRADE_STATUSES),
    trader: randItem(TRADER_IDS),
    time: new Date(),
    pnl: parseFloat(rand(-800, 1500).toFixed(2)),
  };
};

// ─── Sparkline ───────────────────────────────────────────────────────────────
function Sparkline({ data, positive }) {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const w = 80,
    h = 32;
  const pts = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / range) * h;
      return `${x},${y}`;
    })
    .join(" ");
  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      className="overflow-visible"
    >
      <polyline
        points={pts}
        fill="none"
        stroke={positive ? "#34d399" : "#f87171"}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ─── Category config ──────────────────────────────────────────────────────────
const CAT_CONFIG = {
  crypto: {
    label: "Crypto",
    color: "from-violet-400 to-purple-500",
    bg: "bg-violet-500/10 text-violet-400",
  },
  commodity: {
    label: "Commodity",
    color: "from-amber-400 to-orange-500",
    bg: "bg-amber-500/10 text-amber-400",
  },
  index: {
    label: "Index",
    color: "from-sky-400 to-blue-500",
    bg: "bg-sky-500/10 text-sky-400",
  },
};

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function LiveMarket() {
  const [data, setData] = useState({
    crypto: [],
    commodities: [],
    indices: [],
  });
  const [history, setHistory] = useState({});
  const [flashes, setFlashes] = useState({});
  const [trades, setTrades] = useState([]);
  const [now, setNow] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const prevRef = useRef({});

  const allItems = [
    ...(data.crypto || []),
    ...(data.commodities || []),
    ...(data.indices || []),
  ];

  // ── Fetch market data ──
  const fetchMarket = async () => {
    try {
      const res = await fetch("/api/market", { cache: "no-store" });
      const json = await res.json();
      if (json.error) return;

      const newFlashes = {};
      [
        ...(json.crypto || []),
        ...(json.commodities || []),
        ...(json.indices || []),
      ].forEach((item) => {
        const prev = prevRef.current[item.symbol];
        if (prev && item.price && item.price !== prev)
          newFlashes[item.symbol] = item.price > prev ? "up" : "down";
      });
      setFlashes(newFlashes);
      setTimeout(() => setFlashes({}), 600);

      setHistory((h) => {
        const next = { ...h };
        [
          ...(json.crypto || []),
          ...(json.commodities || []),
          ...(json.indices || []),
        ].forEach((item) => {
          if (item.price)
            next[item.symbol] = [
              ...(next[item.symbol] || []).slice(-19),
              item.price,
            ];
        });
        return next;
      });

      const flat = {};
      [
        ...(json.crypto || []),
        ...(json.commodities || []),
        ...(json.indices || []),
      ].forEach((i) => {
        if (i.price) flat[i.symbol] = i.price;
      });
      prevRef.current = flat;

      setData(json);
      setLoading(false);
    } catch {}
  };

  useEffect(() => {
    setMounted(true);
    fetchMarket();
    const t = setInterval(fetchMarket, 15000);
    return () => clearInterval(t);
  }, []);

  // ── Clock ──
  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // ── Trade feed ──
  useEffect(() => {
    setTrades(Array(14).fill(0).map(genTrade));
    const t = setInterval(
      () => {
        setTrades((prev) => [genTrade(), ...prev.slice(0, 19)]);
      },
      randInt(1200, 3000),
    );
    return () => clearInterval(t);
  }, []);

  const filtered =
    activeTab === "all"
      ? allItems
      : activeTab === "crypto"
        ? data.crypto || []
        : activeTab === "commodity"
          ? data.commodities || []
          : data.indices || [];

  const topMovers = [...allItems]
    .filter((i) => i.change != null)
    .sort((a, b) => Math.abs(b.change) - Math.abs(a.change))
    .slice(0, 4);

  const gainers = allItems.filter((i) => (i.change ?? 0) > 0).length;
  const total = allItems.filter((i) => i.change != null).length;
  const bullPct = total ? Math.round((gainers / total) * 100) : 50;

  return (
    <div className="bg-[#0A0D14] min-h-screen text-white">
      {/* ── Ticker Bar ── */}
      <div className="border-b border-white/5 bg-[#0D1117] overflow-x-auto">
        <div className="flex items-center gap-8 px-6 py-2.5 whitespace-nowrap min-w-max">
          {allItems.map((item) => (
            <div key={item.symbol} className="flex items-center gap-2 shrink-0">
              <span className="text-gray-400 text-xs font-semibold">
                {item.symbol}
              </span>
              <span
                className={`text-xs font-bold tabular-nums transition-colors duration-300 ${
                  flashes[item.symbol] === "up"
                    ? "text-emerald-300"
                    : flashes[item.symbol] === "down"
                      ? "text-red-300"
                      : "text-white"
                }`}
              >
                {item.price ? `$${fmt(item.price)}` : "—"}
              </span>
              {item.change != null && (
                <span
                  className={`text-[10px] font-medium ${item.change >= 0 ? "text-emerald-400" : "text-red-400"}`}
                >
                  {item.change >= 0 ? "▲" : "▼"}
                  {Math.abs(item.change).toFixed(2)}%
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-400 text-xs font-medium">
                  LIVE
                </span>
              </div>
              <h1 className="text-xl font-bold text-white">Live Market</h1>
            </div>
            <p className="text-gray-500 text-sm">
              {mounted && now ? now.toUTCString().slice(0, 25) : "--"} UTC
            </p>
          </div>

          {/* Sessions */}
          <div className="flex items-center gap-2 flex-wrap">
            {SESSIONS.map((s) => {
              const open = mounted ? getSessionStatus(s) : false;
              return (
                <div
                  key={s.name}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
                    open
                      ? "bg-white/5 border-white/15 text-white"
                      : "border-white/5 text-gray-600"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${open ? "bg-emerald-400 animate-pulse" : "bg-gray-700"}`}
                  />
                  {s.name}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Summary Row ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {[
            {
              label: "Total Markets",
              value: allItems.length.toString(),
              sub: "Tracked live",
            },
            {
              label: "Market Sentiment",
              value: `${bullPct}% Bullish`,
              sub: `${gainers}/${total} gaining`,
              color: bullPct >= 50 ? "text-emerald-400" : "text-red-400",
            },
            {
              label: "Top Gainer",
              value: topMovers[0]
                ? `${topMovers[0].symbol} +${Math.abs(topMovers[0].change ?? 0).toFixed(2)}%`
                : "—",
              sub: "24h change",
              color: "text-emerald-400",
            },
            {
              label: "Data Refresh",
              value: "Every 15s",
              sub: "Real-time feed",
            },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-5 py-4"
            >
              <p className="text-gray-500 text-xs mb-1">{s.label}</p>
              <p className={`text-base font-bold ${s.color || "text-white"}`}>
                {s.value}
              </p>
              <p className="text-gray-600 text-xs mt-0.5">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* ── Main Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Price Cards */}
          <div className="lg:col-span-2 space-y-5">
            {/* Tabs */}
            <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-full p-1 w-fit">
              {[
                { key: "all", label: "All" },
                { key: "crypto", label: "Crypto" },
                { key: "commodity", label: "Commodities" },
                { key: "index", label: "Indices" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                    activeTab === tab.key
                      ? "bg-white text-black"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {loading
                ? Array(6)
                    .fill(0)
                    .map((_, i) => (
                      <div
                        key={i}
                        className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 animate-pulse"
                      >
                        <div className="h-3 w-16 bg-white/10 rounded mb-3" />
                        <div className="h-6 w-24 bg-white/10 rounded mb-2" />
                        <div className="h-2 w-12 bg-white/5 rounded" />
                      </div>
                    ))
                : filtered.map((item) => {
                    const cat = CAT_CONFIG[item.category] || CAT_CONFIG.crypto;
                    const flash = flashes[item.symbol];
                    const isUp = (item.change ?? 0) >= 0;
                    const spark = history[item.symbol] || [];
                    return (
                      <div
                        key={item.symbol}
                        className={`relative bg-white/[0.03] border rounded-2xl p-5 transition-all duration-300 overflow-hidden ${
                          flash === "up"
                            ? "border-emerald-500/40 bg-emerald-500/5"
                            : flash === "down"
                              ? "border-red-500/40 bg-red-500/5"
                              : "border-white/[0.06] hover:border-white/15 hover:bg-white/[0.05]"
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-white text-sm font-bold">
                                {item.symbol}
                              </span>
                              <span
                                className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${cat.bg}`}
                              >
                                {cat.label}
                              </span>
                            </div>
                            <span className="text-gray-500 text-xs">
                              {item.name}
                            </span>
                          </div>
                          <Sparkline data={spark} positive={isUp} />
                        </div>

                        <p
                          className={`text-xl font-bold tabular-nums mb-1 transition-colors duration-300 ${
                            flash === "up"
                              ? "text-emerald-300"
                              : flash === "down"
                                ? "text-red-300"
                                : "text-white"
                          }`}
                        >
                          {item.price ? `$${fmt(item.price)}` : "—"}
                        </p>

                        <div className="flex items-center gap-2">
                          {item.change != null ? (
                            <span
                              className={`flex items-center gap-1 text-xs font-semibold ${isUp ? "text-emerald-400" : "text-red-400"}`}
                            >
                              {isUp ? "▲" : "▼"}{" "}
                              {Math.abs(item.change).toFixed(2)}%
                            </span>
                          ) : (
                            <span className="text-gray-600 text-xs">
                              No change data
                            </span>
                          )}
                          <span className="text-gray-600 text-xs">24h</span>
                        </div>

                        {flash && (
                          <div
                            className={`absolute top-3 right-3 w-2 h-2 rounded-full ${
                              flash === "up" ? "bg-emerald-400" : "bg-red-400"
                            } animate-ping`}
                          />
                        )}
                      </div>
                    );
                  })}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-5">
            {/* Sentiment */}
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
              <p className="text-gray-400 text-xs font-semibold uppercase tracking-widest mb-5">
                Market Sentiment
              </p>
              <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                <span>Bearish</span>
                <span>Bullish</span>
              </div>
              <div className="relative h-3 bg-white/5 rounded-full overflow-hidden mb-3">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-red-500 via-amber-400 to-emerald-400"
                  style={{ width: "100%" }}
                />
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-2 border-gray-900 shadow-lg transition-all duration-1000"
                  style={{ left: `calc(${bullPct}% - 8px)` }}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p
                    className={`text-xl font-bold ${bullPct >= 50 ? "text-emerald-400" : "text-red-400"}`}
                  >
                    {bullPct >= 50 ? "Bullish" : "Bearish"}
                  </p>
                  <p className="text-gray-500 text-xs">
                    {bullPct}% of markets up
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-white text-sm font-bold">
                    {gainers} / {total}
                  </p>
                  <p className="text-gray-500 text-xs">Markets gaining</p>
                </div>
              </div>
            </div>

            {/* Top Movers */}
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
              <p className="text-gray-400 text-xs font-semibold uppercase tracking-widest mb-4">
                Top Movers (24h)
              </p>
              <div className="space-y-3">
                {topMovers.length === 0
                  ? Array(4)
                      .fill(0)
                      .map((_, i) => (
                        <div
                          key={i}
                          className="h-10 bg-white/5 rounded-xl animate-pulse"
                        />
                      ))
                  : topMovers.map((item) => {
                      const isUp = (item.change ?? 0) >= 0;
                      return (
                        <div
                          key={item.symbol}
                          className="flex items-center justify-between py-2 border-b border-white/5 last:border-0"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-8 h-8 rounded-lg bg-gradient-to-br ${CAT_CONFIG[item.category]?.color || "from-gray-400 to-gray-600"} flex items-center justify-center`}
                            >
                              <span className="text-white text-[9px] font-bold">
                                {item.symbol.slice(0, 3)}
                              </span>
                            </div>
                            <div>
                              <p className="text-white text-xs font-bold">
                                {item.symbol}
                              </p>
                              <p className="text-gray-500 text-[10px]">
                                {item.name}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-white text-xs font-bold">
                              ${fmt(item.price)}
                            </p>
                            <p
                              className={`text-[10px] font-semibold ${isUp ? "text-emerald-400" : "text-red-400"}`}
                            >
                              {isUp ? "▲" : "▼"}{" "}
                              {Math.abs(item.change ?? 0).toFixed(2)}%
                            </p>
                          </div>
                        </div>
                      );
                    })}
              </div>
            </div>
          </div>
        </div>

        {/* ══ Terminal Trading Activity ══ */}
        <div className="mt-8 rounded-2xl overflow-hidden border border-emerald-500/20 shadow-2xl shadow-emerald-500/5">
          {/* Title bar */}
          <div className="flex items-center justify-between bg-[#0D1A0D] border-b border-emerald-500/15 px-5 py-3">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-500/70" />
                <span className="w-3 h-3 rounded-full bg-amber-500/70" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/70" />
              </div>
              <span className="text-emerald-400/60 text-xs font-mono">
                trade_activity_monitor.sh
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-400 text-[10px] font-mono tracking-widest">
                  LIVE STREAM
                </span>
              </div>
              <span className="text-emerald-400/40 text-[10px] font-mono">
                {mounted && now
                  ? now.toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                      hour12: false,
                    })
                  : "--:--:--"}{" "}
                UTC
              </span>
            </div>
          </div>

          {/* Terminal body */}
          <div className="bg-[#060D06] p-5 font-mono">
            {/* Column headers */}
            <div className="grid grid-cols-7 gap-2 text-[10px] text-emerald-500/40 uppercase tracking-widest pb-2 border-b border-emerald-500/10 mb-2 px-1">
              <span>Time</span>
              <span>Trade ID</span>
              <span>Symbol</span>
              <span>Type</span>
              <span className="text-right">Lots</span>
              <span className="text-right">Amount</span>
              <span className="text-right">P&amp;L / Status</span>
            </div>

            {/* Rows */}
            <div className="space-y-0.5 max-h-80 overflow-hidden">
              {trades.slice(0, 16).map((trade, i) => (
                <div
                  key={trade.id}
                  className={`grid grid-cols-7 gap-2 text-[11px] px-1 py-1.5 rounded transition-all duration-500 ${
                    i === 0
                      ? "bg-emerald-500/8 border border-emerald-500/15"
                      : "hover:bg-emerald-500/[0.04]"
                  }`}
                >
                  <span className="text-emerald-500/50">
                    {mounted
                      ? trade.time.toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                          hour12: false,
                        })
                      : "--:--:--"}
                  </span>
                  <span className="text-emerald-400/50">#{trade.id}</span>
                  <span className="text-emerald-300 font-semibold">
                    {trade.symbol}
                  </span>
                  <span
                    className={`font-bold tracking-widest ${trade.type === "BUY" ? "text-emerald-400" : "text-red-400"}`}
                  >
                    {trade.type === "BUY" ? "▲ BUY " : "▼ SELL"}
                  </span>
                  <span className="text-emerald-200/60 text-right">
                    {trade.lots}
                  </span>
                  <span className="text-emerald-200/60 text-right">
                    {fmtCompact(trade.amount)}
                  </span>
                  <span
                    className={`text-right font-semibold ${
                      trade.status === "PENDING"
                        ? "text-amber-400/80"
                        : trade.status === "PARTIAL"
                          ? "text-sky-400/80"
                          : trade.pnl >= 0
                            ? "text-emerald-400"
                            : "text-red-400"
                    }`}
                  >
                    {trade.status === "PENDING"
                      ? "PENDING…"
                      : trade.status === "PARTIAL"
                        ? "PARTIAL"
                        : (trade.pnl >= 0 ? "+" : "") +
                          "$" +
                          Math.abs(trade.pnl).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Blinking cursor */}
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-emerald-500/10">
              <span className="text-emerald-500/40 text-[11px]">$</span>
              <span className="text-emerald-400/70 text-[11px]">
                monitoring {TRADE_SYMBOLS.length} instruments across all
                sessions
              </span>
              <span className="inline-block w-1.5 h-3.5 bg-emerald-400 animate-pulse ml-0.5" />
            </div>
          </div>
        </div>

        {/* ══ TradingView Widgets ══ */}
        <div className="mt-10 space-y-6">
          {/* Forex Performance */}
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/[0.06] flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <p className="text-white font-semibold text-sm">
                Forex Performance
              </p>
              <span className="text-gray-600 text-xs ml-auto">
                Powered by TradingView
              </span>
            </div>
            <ForexPerformanceWidget />
          </div>

          {/* Global Inflation Map */}
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/[0.06] flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <p className="text-white font-semibold text-sm">
                Global Inflation Map
              </p>
              <span className="text-gray-600 text-xs ml-auto">
                Powered by TradingView
              </span>
            </div>
            <InflationMapWidget />
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-700 text-xs mt-8">
          Market data updates every 15 seconds · Prices sourced from Coinbase,
          CoinGecko &amp; Yahoo Finance · For informational purposes only
        </p>
      </div>
    </div>
  );
}
