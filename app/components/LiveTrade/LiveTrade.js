"use client";

import { useState, useEffect, useRef } from "react";

const PAIRS = [
  { symbol: "XAU/USD", digits: 2, type: "metal" },
  { symbol: "EUR/USD", digits: 5, type: "forex" },
  { symbol: "BTC/USD", digits: 2, type: "crypto" },
  { symbol: "GBP/USD", digits: 5, type: "forex" },
  { symbol: "XAG/USD", digits: 3, type: "metal" },
  { symbol: "ETH/USD", digits: 2, type: "crypto" },
  { symbol: "USD/JPY", digits: 3, type: "forex" },
  { symbol: "NAS100", digits: 2, type: "index" },
];

const TRADER_NAME = "Alexander Mercer";
const ACCOUNT_ID = "PRO-****-7741";

const randFloat = (min, max, digits = 2) =>
  parseFloat((Math.random() * (max - min) + min).toFixed(digits));
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randItem = (arr) => arr[randInt(0, arr.length - 1)];

const fmt = (n, digits = 2) =>
  n.toLocaleString("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });

const fmtTime = (date) =>
  date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

const fmtDate = (date) =>
  date.toLocaleDateString("en-US", { month: "short", day: "2-digit" });

const generateTrades = (prices, weekend) => {
  const isOpen = (type) => (type === "crypto" ? true : !weekend);
  const trades = [];
  const usedTickets = new Set();
  const availablePairs = PAIRS.filter(
    (p) => isOpen(p.type) && prices[p.symbol],
  );
  if (availablePairs.length === 0) return [];

  const count = Math.min(8, availablePairs.length * 2);
  for (let i = 0; i < count; i++) {
    const pair = availablePairs[i % availablePairs.length];
    const price = prices[pair.symbol];
    const dir = randItem(["BUY", "SELL"]);
    const lots = randFloat(0.1, 5.0, 2);
    const slipPips = randFloat(5, 80);
    const pipValue = pair.symbol.includes("JPY")
      ? 0.01
      : pair.digits === 5
        ? 0.0001
        : pair.digits === 2
          ? 0.1
          : 0.001;
    const openPrice =
      dir === "BUY" ? price - slipPips * pipValue : price + slipPips * pipValue;
    const pnl =
      dir === "BUY"
        ? (price - openPrice) * lots * 1000
        : (openPrice - price) * lots * 1000;

    let ticket;
    do {
      ticket = randInt(10000000, 99999999);
    } while (usedTickets.has(ticket));
    usedTickets.add(ticket);

    const openTime = new Date(
      Date.now() - randInt(0, 23) * 3600000 - randInt(0, 59) * 60000,
    );

    trades.push({
      ticket,
      symbol: pair.symbol,
      type: dir,
      lots: lots.toFixed(2),
      openPrice: openPrice.toFixed(pair.digits),
      currentPrice: price.toFixed(pair.digits),
      pnl: parseFloat(pnl.toFixed(2)),
      openTime,
      digits: pair.digits,
    });
  }
  return trades;
};

const fluctuate = (prices, weekend) => {
  const isOpen = (type) => (type === "crypto" ? true : !weekend);
  const next = { ...prices };
  PAIRS.forEach((p) => {
    if (!isOpen(p.type) || !next[p.symbol]) return;
    const pip = p.symbol.includes("JPY")
      ? 0.01
      : p.digits === 5
        ? 0.0001
        : p.digits === 2
          ? 0.5
          : 0.01;
    next[p.symbol] = parseFloat(
      (next[p.symbol] + (Math.random() - 0.48) * pip * randInt(1, 6)).toFixed(
        p.digits,
      ),
    );
  });
  return next;
};

export default function LiveTrade() {
  const [prices, setPrices] = useState({});
  const [trades, setTrades] = useState([]);
  const [balance] = useState(280000.0);
  const [equity, setEquity] = useState(280000.0);
  const [showBalance, setShowBalance] = useState(false);
  const [now, setNow] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [weekend, setWeekend] = useState(false); // client-only, avoids hydration mismatch
  const [flashMap, setFlashMap] = useState({});
  const [loading, setLoading] = useState(true);
  const prevPrices = useRef({});

  // Set weekend & clock after mount (client only)
  useEffect(() => {
    setMounted(true);
    setNow(new Date());
    const day = new Date().getUTCDay();
    setWeekend(day === 0 || day === 6);
    const t = setInterval(() => {
      setNow(new Date());
      const d = new Date().getUTCDay();
      setWeekend(d === 0 || d === 6);
    }, 1000);
    return () => clearInterval(t);
  }, []);

  // Fetch real prices
  const fetchPrices = async () => {
    try {
      const res = await fetch("/api/prices", { cache: "no-store" });
      const data = await res.json();
      if (data.error) return;
      setPrices((prev) => {
        prevPrices.current = prev;
        const flashes = {};
        PAIRS.forEach((p) => {
          if (
            data[p.symbol] &&
            prev[p.symbol] &&
            data[p.symbol] !== prev[p.symbol]
          )
            flashes[p.symbol] = data[p.symbol] > prev[p.symbol] ? "up" : "down";
        });
        setFlashMap(flashes);
        setTimeout(() => setFlashMap({}), 400);
        return data;
      });
      setLoading(false);
    } catch {}
  };

  useEffect(() => {
    fetchPrices();
    const t = setInterval(fetchPrices, 15000);
    return () => clearInterval(t);
  }, []);

  // Init trades once prices loaded
  useEffect(() => {
    if (!loading && Object.keys(prices).length > 0 && trades.length === 0)
      setTrades(generateTrades(prices, weekend));
  }, [loading, prices]);

  // Local fluctuation every 2s
  useEffect(() => {
    if (loading) return;
    const t = setInterval(() => {
      setPrices((prev) => {
        if (Object.keys(prev).length === 0) return prev;
        const next = fluctuate(prev, weekend);
        prevPrices.current = prev;
        const flashes = {};
        PAIRS.forEach((p) => {
          if (next[p.symbol] !== prev[p.symbol])
            flashes[p.symbol] = next[p.symbol] > prev[p.symbol] ? "up" : "down";
        });
        setFlashMap(flashes);
        setTimeout(() => setFlashMap({}), 400);
        return next;
      });
    }, 2000);
    return () => clearInterval(t);
  }, [loading, weekend]);

  // Update P&L
  useEffect(() => {
    if (trades.length === 0 || Object.keys(prices).length === 0) return;
    setTrades((prev) =>
      prev.map((t) => {
        const price = prices[t.symbol];
        if (!price) return t;
        const open = parseFloat(t.openPrice);
        const lots = parseFloat(t.lots);
        const pip = t.symbol.includes("JPY")
          ? 0.01
          : t.digits === 5
            ? 0.0001
            : t.digits === 2
              ? 0.5
              : 0.01;
        const pnl =
          t.type === "BUY"
            ? ((price - open) / pip) *
              lots *
              (t.symbol.includes("JPY") ? 0.9 : 1)
            : ((open - price) / pip) *
              lots *
              (t.symbol.includes("JPY") ? 0.9 : 1);
        return {
          ...t,
          currentPrice: price.toFixed(t.digits),
          pnl: parseFloat(pnl.toFixed(2)),
        };
      }),
    );
  }, [prices]);

  // Update equity
  useEffect(() => {
    const totalPnl = trades.reduce((s, t) => s + t.pnl, 0);
    setEquity(parseFloat((balance + totalPnl).toFixed(2)));
  }, [trades]);

  const totalPnl = trades.reduce((s, t) => s + t.pnl, 0);
  const profitTrades = trades.filter((t) => t.pnl > 0).length;
  const margin = equity * 0.12;
  const freeMargin = equity - margin;
  const marginLevel = ((equity / margin) * 100).toFixed(1);
  const isOpen = (type) => (type === "crypto" ? true : !weekend);
  const maskValue = (val) => (showBalance ? val : "****.**");

  return (
    <div
      style={{
        fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
      }}
      className="bg-[#0a0e17] text-gray-100 min-h-screen w-full p-4 md:p-6"
    >
      {/* Top Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-3">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center font-bold text-black text-sm">
              AM
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#0a0e17]"></span>
          </div>
          <div>
            <p className="text-white font-semibold text-sm">{TRADER_NAME}</p>
            <p className="text-gray-500 text-xs">{ACCOUNT_ID}</p>
            <p className="text-gray-500 text-xs">Data provided by myfxbook</p>
          </div>
          {mounted && (
            <div
              className={`flex items-center gap-1.5 ml-2 px-2.5 py-1 rounded-full border ${weekend ? "bg-red-500/10 border-red-500/20" : "bg-emerald-500/10 border-emerald-500/20"}`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${weekend ? "bg-red-400" : "bg-emerald-400 animate-pulse"}`}
              ></span>
              <span
                className={`text-xs font-medium ${weekend ? "text-red-400" : "text-emerald-400"}`}
              >
                {weekend ? "MARKET CLOSED" : "LIVE"}
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-4">
          {mounted && weekend && (
            <p className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
              Weekend — Forex & Metals closed · Crypto active
            </p>
          )}
          <div className="text-right">
            <p className="text-gray-400 text-xs">Server Time (UTC)</p>
            <p className="text-white text-sm font-semibold tabular-nums">
              {mounted && now ? now.toUTCString().slice(0, 25) : "--"}
            </p>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          {
            label: "Equity",
            value: `$${maskValue(fmt(equity))}`,
            color: "text-white",
            sub: "Live balance",
          },
          {
            label: "Floating P&L",
            value: `${totalPnl >= 0 ? "+" : ""}$${maskValue(fmt(totalPnl))}`,
            color: totalPnl >= 0 ? "text-emerald-400" : "text-red-400",
            sub: `${profitTrades}/${trades.length} profitable`,
          },
          {
            label: "Free Margin",
            value: `$${maskValue(fmt(freeMargin))}`,
            color: "text-sky-400",
            sub: "Available",
          },
          {
            label: "Margin Level",
            value: `${marginLevel}%`,
            color: "text-amber-400",
            sub: "Utilization",
          },
        ].map((card) => (
          <div
            key={card.label}
            className="bg-[#111827] border border-white/5 rounded-xl p-4 hover:border-white/10 transition-colors"
          >
            <div className="flex items-center justify-between mb-1">
              <p className="text-gray-500 text-xs">{card.label}</p>
              {card.label === "Equity" && (
                <button
                  onClick={() => setShowBalance((v) => !v)}
                  className="text-gray-600 hover:text-gray-400 transition-colors text-xs"
                >
                  {showBalance ? "👁" : "🙈"}
                </button>
              )}
            </div>
            <p className={`text-lg font-bold tabular-nums ${card.color}`}>
              {card.value}
            </p>
            <p className="text-gray-600 text-xs mt-0.5">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Market Watch */}
      <div className="bg-[#111827] border border-white/5 rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <p className="text-gray-400 text-xs font-semibold uppercase tracking-widest">
            Market Watch
          </p>
          <p className="text-gray-600 text-xs">
            {loading ? "Fetching prices..." : "Live · updates every 15s"}
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {PAIRS.map((pair) => {
            const flash = flashMap[pair.symbol];
            const curr = prices[pair.symbol];
            const prev = prevPrices.current[pair.symbol];
            const isUp = curr && prev ? curr >= prev : true;
            const open = !mounted ? true : isOpen(pair.type);

            return (
              <div
                key={pair.symbol}
                className={`rounded-lg p-2.5 border transition-all duration-300 ${
                  !open
                    ? "bg-[#0a0e17] border-white/5 opacity-40"
                    : flash === "up"
                      ? "bg-emerald-500/10 border-emerald-500/30"
                      : flash === "down"
                        ? "bg-red-500/10 border-red-500/30"
                        : "bg-[#0a0e17] border-white/5"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-gray-300 text-xs font-semibold">
                    {pair.symbol}
                  </span>
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                      !open
                        ? "bg-gray-500/20 text-gray-500"
                        : pair.type === "crypto"
                          ? "bg-purple-500/20 text-purple-400"
                          : pair.type === "metal"
                            ? "bg-amber-500/20 text-amber-400"
                            : pair.type === "index"
                              ? "bg-sky-500/20 text-sky-400"
                              : "bg-blue-500/20 text-blue-400"
                    }`}
                  >
                    {open ? pair.type.toUpperCase() : "CLOSED"}
                  </span>
                </div>
                {loading || !curr ? (
                  <div className="h-4 w-16 bg-white/5 rounded animate-pulse mt-1" />
                ) : (
                  <>
                    <p
                      className={`text-sm font-bold tabular-nums ${open ? (isUp ? "text-emerald-400" : "text-red-400") : "text-gray-600"}`}
                    >
                      {curr?.toFixed(pair.digits)}
                    </p>
                    {!open && (
                      <p className="text-xs text-gray-600 mt-0.5">Weekend</p>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Open Positions */}
      <div className="bg-[#111827] border border-white/5 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
          <div className="flex items-center gap-3">
            <p className="text-gray-300 text-sm font-semibold">
              Open Positions
            </p>
            <span className="text-xs bg-white/5 border border-white/10 text-gray-400 px-2 py-0.5 rounded-full">
              {trades.length} active
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-emerald-400 text-xs">Updating</span>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-600 text-sm">
            Loading positions...
          </div>
        ) : trades.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500 text-sm">No open positions</p>
            {weekend && (
              <p className="text-amber-500/70 text-xs mt-2">
                Forex & metal markets are closed on weekends
              </p>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-white/5">
                  {[
                    "Ticket",
                    "Symbol",
                    "Type",
                    "Lots",
                    "Open Price",
                    "Current",
                    "Open Time",
                    "P&L",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-gray-500 font-medium uppercase tracking-wider whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {trades.map((trade, i) => (
                  <tr
                    key={trade.ticket}
                    className={`border-b border-white/5 hover:bg-white/[0.02] transition-colors ${i % 2 === 0 ? "" : "bg-white/[0.01]"}`}
                  >
                    <td className="px-4 py-3 text-gray-500 tabular-nums">
                      {trade.ticket}
                    </td>
                    <td className="px-4 py-3 text-white font-semibold">
                      {trade.symbol}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded font-bold ${trade.type === "BUY" ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"}`}
                      >
                        {trade.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-300 tabular-nums">
                      {trade.lots}
                    </td>
                    <td className="px-4 py-3 text-gray-400 tabular-nums">
                      {trade.openPrice}
                    </td>
                    <td className="px-4 py-3 tabular-nums">
                      <span
                        className={
                          parseFloat(trade.currentPrice) >=
                          parseFloat(trade.openPrice)
                            ? "text-emerald-400"
                            : "text-red-400"
                        }
                      >
                        {trade.currentPrice}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap tabular-nums">
                      {mounted
                        ? `${fmtDate(trade.openTime)} ${fmtTime(trade.openTime)}`
                        : "--"}
                    </td>
                    <td className="px-4 py-3 tabular-nums font-semibold">
                      <span
                        className={
                          trade.pnl >= 0 ? "text-emerald-400" : "text-red-400"
                        }
                      >
                        {trade.pnl >= 0 ? "+" : "-"}$
                        {maskValue(fmt(Math.abs(trade.pnl)))}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-white/10 bg-white/[0.02]">
                  <td
                    colSpan={7}
                    className="px-4 py-3 text-gray-400 font-semibold uppercase tracking-wider text-xs"
                  >
                    Total Floating P&L
                  </td>
                  <td className="px-4 py-3 font-bold tabular-nums text-sm">
                    <span
                      className={
                        totalPnl >= 0 ? "text-emerald-400" : "text-red-400"
                      }
                    >
                      {totalPnl >= 0 ? "+" : "-"}$
                      {maskValue(fmt(Math.abs(totalPnl)))}
                    </span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      <p className="text-center text-gray-700 text-xs mt-4">
        All positions update in real-time ·{" "}
        {mounted && now ? now.toUTCString().slice(0, 16) : "--"}
      </p>
    </div>
  );
}
