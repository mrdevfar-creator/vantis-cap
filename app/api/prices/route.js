export const dynamic = "force-dynamic";

const fetchWithTimeout = async (url, options = {}, timeout = 6000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
      cache: "no-store",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        ...(options.headers || {}),
      },
    });
    clearTimeout(id);
    return res;
  } catch {
    clearTimeout(id);
    return null;
  }
};

// Crypto: Coinbase
const getCrypto = async (pair) => {
  try {
    const res = await fetchWithTimeout(
      `https://api.coinbase.com/v2/prices/${pair}/spot`,
    );
    if (!res?.ok) return null;
    const data = await res.json();
    return parseFloat(data?.data?.amount) || null;
  } catch {
    return null;
  }
};

// Forex: open.er-api.com (primary) → frankfurter (fallback)
const getForex = async (from, to) => {
  // Primary
  try {
    const res = await fetchWithTimeout(
      `https://open.er-api.com/v6/latest/${from}`,
    );
    if (res?.ok) {
      const data = await res.json();
      const rate = data?.rates?.[to];
      if (rate) return parseFloat(rate.toFixed(5));
    }
  } catch {}

  // Fallback
  try {
    const res = await fetchWithTimeout(
      `https://api.frankfurter.app/latest?from=${from}&to=${to}`,
    );
    if (res?.ok) {
      const data = await res.json();
      const rate = data?.rates?.[to];
      if (rate) return parseFloat(rate.toFixed(5));
    }
  } catch {}

  return null;
};

// Gold: try multiple free sources
const getGold = async () => {
  // Source 1: metals.live
  try {
    const res = await fetchWithTimeout("https://metals.live/api/spot");
    if (res?.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        const gold = data.find((m) => m.metal === "gold" || m.name === "gold");
        if (gold?.price) return parseFloat(gold.price);
      }
    }
  } catch {}

  // Source 2: Yahoo Finance GC=F
  try {
    const res = await fetchWithTimeout(
      "https://query1.finance.yahoo.com/v8/finance/chart/GC=F?interval=1m&range=1d",
    );
    if (res?.ok) {
      const data = await res.json();
      const price = data?.chart?.result?.[0]?.meta?.regularMarketPrice;
      if (price) return parseFloat(price.toFixed(2));
    }
  } catch {}

  // Source 3: Yahoo Finance v7
  try {
    const res = await fetchWithTimeout(
      "https://query2.finance.yahoo.com/v8/finance/chart/GC=F?interval=1m&range=1d",
    );
    if (res?.ok) {
      const data = await res.json();
      const price = data?.chart?.result?.[0]?.meta?.regularMarketPrice;
      if (price) return parseFloat(price.toFixed(2));
    }
  } catch {}

  return null;
};

// Silver
const getSilver = async () => {
  try {
    const res = await fetchWithTimeout("https://metals.live/api/spot");
    if (res?.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        const silver = data.find(
          (m) => m.metal === "silver" || m.name === "silver",
        );
        if (silver?.price) return parseFloat(silver.price);
      }
    }
  } catch {}

  try {
    const res = await fetchWithTimeout(
      "https://query1.finance.yahoo.com/v8/finance/chart/SI=F?interval=1m&range=1d",
    );
    if (res?.ok) {
      const data = await res.json();
      const price = data?.chart?.result?.[0]?.meta?.regularMarketPrice;
      if (price) return parseFloat(price.toFixed(3));
    }
  } catch {}

  return null;
};

// NAS100
const getNasdaq = async () => {
  try {
    const res = await fetchWithTimeout(
      "https://query1.finance.yahoo.com/v8/finance/chart/NQ=F?interval=1m&range=1d",
    );
    if (res?.ok) {
      const data = await res.json();
      const price = data?.chart?.result?.[0]?.meta?.regularMarketPrice;
      if (price) return parseFloat(price.toFixed(2));
    }
  } catch {}

  try {
    const res = await fetchWithTimeout(
      "https://query2.finance.yahoo.com/v8/finance/chart/NQ=F?interval=1m&range=1d",
    );
    if (res?.ok) {
      const data = await res.json();
      const price = data?.chart?.result?.[0]?.meta?.regularMarketPrice;
      if (price) return parseFloat(price.toFixed(2));
    }
  } catch {}

  return null;
};

export async function GET() {
  try {
    const [btc, eth, eurusd, gbpusd, usdjpy, xau, xag, nas100] =
      await Promise.all([
        getCrypto("BTC-USD"),
        getCrypto("ETH-USD"),
        getForex("EUR", "USD"),
        getForex("GBP", "USD"),
        getForex("USD", "JPY"),
        getGold(),
        getSilver(),
        getNasdaq(),
      ]);

    return Response.json({
      "BTC/USD": btc,
      "ETH/USD": eth,
      "EUR/USD": eurusd,
      "GBP/USD": gbpusd,
      "USD/JPY": usdjpy,
      "XAU/USD": xau,
      "XAG/USD": xag,
      NAS100: nas100,
    });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
