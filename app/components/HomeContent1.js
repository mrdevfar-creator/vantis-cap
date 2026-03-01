"use client";

import { useState, useEffect } from "react";

// এই keys গুলো route.js এর return format এর সাথে exact match
const markets = [
  { symbol: "XAU/USD", label: "XAU/USD", icon: "🥇" },
  { symbol: "BTC/USD", label: "BTC/USD", icon: "₿" },
  { symbol: "EUR/USD", label: "EUR/USD", icon: "💶" },
];

export default function HomeContent1() {
  const [prices, setPrices] = useState({
    "XAU/USD": null,
    "BTC/USD": null,
    "EUR/USD": null,
  });
  const [prevPrices, setPrevPrices] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPrices = async () => {
    try {
      setError(null);
      const res = await fetch("/api/prices", { cache: "no-store" });
      if (!res.ok) throw new Error("API error");
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setPrices((prev) => {
        if (prev["BTC/USD"] !== null) setPrevPrices(prev);
        return {
          "XAU/USD": data["XAU/USD"] ?? null,
          "BTC/USD": data["BTC/USD"] ?? null,
          "EUR/USD": data["EUR/USD"] ?? null,
        };
      });
      setLoading(false);
    } catch (err) {
      setError("Price fetch failed");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, 15000);
    return () => clearInterval(interval);
  }, []);

  const formatPrice = (symbol, price) => {
    if (price === null || price === undefined) return "N/A";
    if (symbol === "EUR/USD") return price.toFixed(4);
    return price.toLocaleString("en-US", { maximumFractionDigits: 2 });
  };

  const getChange = (symbol, current) => {
    const prev = prevPrices[symbol];
    if (!prev || !current) return null;
    return current - prev;
  };

  return (
    <div className="mt-6 space-y-4">
      {error && <p className="text-xs text-red-400">{error}</p>}
      {markets.map((market) => {
        const price = prices[market.symbol];
        const change = getChange(market.symbol, price);

        return (
          <div
            key={market.symbol}
            className="flex items-center justify-between p-3 bg-white rounded-xl shadow-sm border border-gray-100"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center bg-gray-50 rounded-lg text-xl">
                {market.icon}
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">
                  {market.label}
                </p>
                <p className="text-xs text-gray-400">Live Price</p>
              </div>
            </div>

            <div className="text-right">
              {loading ? (
                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
              ) : (
                <>
                  <p className="text-sm font-bold text-gray-900">
                    {price ? `$${formatPrice(market.symbol, price)}` : "N/A"}
                  </p>
                  {change !== null && (
                    <p
                      className={`text-xs font-medium ${change >= 0 ? "text-green-500" : "text-red-500"}`}
                    >
                      {change >= 0 ? "▲" : "▼"} {Math.abs(change).toFixed(4)}
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        );
      })}
      <p className="text-xs text-gray-400 text-right">
        🔄 Auto-updates every 15s
      </p>
    </div>
  );
}
