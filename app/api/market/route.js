export const dynamic = "force-dynamic";

const fetchSafe = async (url, timeout = 7000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      cache: "no-store",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "application/json",
      },
    });
    clearTimeout(id);
    return res;
  } catch {
    clearTimeout(id);
    return null;
  }
};

// Calculate % change — fallback from prevClose if direct field is null
const calcChange = (price, prevClose, directChange) => {
  if (directChange != null && directChange !== 0)
    return parseFloat(directChange.toFixed(4));
  if (price && prevClose && prevClose !== 0) {
    return parseFloat((((price - prevClose) / prevClose) * 100).toFixed(4));
  }
  return null;
};

// ── Crypto: Coinbase price + Yahoo Finance 24h change ──
const getCrypto = async (coinbasePair, yahooSymbol) => {
  const [priceRes, yahooRes] = await Promise.all([
    fetchSafe(`https://api.coinbase.com/v2/prices/${coinbasePair}/spot`),
    fetchSafe(
      `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?interval=1d&range=5d`,
    ),
  ]);

  let price = null;
  let change = null;

  // Price from Coinbase
  try {
    if (priceRes?.ok) {
      const data = await priceRes.json();
      price = parseFloat(data?.data?.amount) || null;
    }
  } catch {}

  // Change from Yahoo (5d daily data — first vs last close)
  try {
    if (yahooRes?.ok) {
      const data = await yahooRes.json();
      const meta = data?.chart?.result?.[0]?.meta;
      const quotes = data?.chart?.result?.[0]?.indicators?.quote?.[0];
      const closes = quotes?.close?.filter((c) => c != null) || [];

      // Try direct change first
      const directChange = meta?.regularMarketChangePercent;
      const prevClose = meta?.chartPreviousClose ?? meta?.previousClose;
      const currentPrice = price ?? meta?.regularMarketPrice;

      change = calcChange(currentPrice, prevClose, directChange);

      // If still null, use first and last close from 5d range
      if (change == null && closes.length >= 2) {
        const first = closes[0];
        const last = closes[closes.length - 1];
        if (first && last)
          change = parseFloat((((last - first) / first) * 100).toFixed(4));
      }
    }
  } catch {}

  return { price, change };
};

// ── Yahoo Finance: commodities & indices ──
const getYahoo = async (symbol) => {
  // Try 5d range for better change data
  const res = await fetchSafe(
    `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=5d`,
  );
  if (!res?.ok) {
    // Fallback to query2
    const res2 = await fetchSafe(
      `https://query2.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=5d`,
    );
    if (!res2?.ok) return { price: null, change: null };
    try {
      const data = await res2.json();
      return extractYahoo(data);
    } catch {
      return { price: null, change: null };
    }
  }
  try {
    const data = await res.json();
    return extractYahoo(data);
  } catch {
    return { price: null, change: null };
  }
};

const extractYahoo = (data) => {
  const meta = data?.chart?.result?.[0]?.meta;
  const quotes = data?.chart?.result?.[0]?.indicators?.quote?.[0];
  if (!meta) return { price: null, change: null };

  const price = meta.regularMarketPrice ?? null;
  const prevClose = meta.chartPreviousClose ?? meta.previousClose ?? null;
  const directPct = meta.regularMarketChangePercent ?? null;

  let change = calcChange(price, prevClose, directPct);

  // Final fallback: use closes array
  if (change == null) {
    const closes = quotes?.close?.filter((c) => c != null) || [];
    if (closes.length >= 2) {
      const first = closes[0];
      const last = closes[closes.length - 1];
      if (first && last)
        change = parseFloat((((last - first) / first) * 100).toFixed(4));
    }
  }

  return { price, change };
};

// ── Main handler ──
export async function GET() {
  try {
    const [btc, eth, sol, bnb, gold, silver, oil, nasdaq, sp500, dow] =
      await Promise.all([
        getCrypto("BTC-USD", "BTC-USD"),
        getCrypto("ETH-USD", "ETH-USD"),
        getCrypto("SOL-USD", "SOL-USD"),
        getCrypto("BNB-USD", "BNB-USD"),
        getYahoo("GC=F"),
        getYahoo("SI=F"),
        getYahoo("CL=F"),
        getYahoo("NQ=F"),
        getYahoo("%5EGSPC"),
        getYahoo("%5EDJI"),
      ]);

    return Response.json({
      crypto: [
        {
          symbol: "BTC",
          name: "Bitcoin",
          price: btc.price,
          change: btc.change,
          category: "crypto",
        },
        {
          symbol: "ETH",
          name: "Ethereum",
          price: eth.price,
          change: eth.change,
          category: "crypto",
        },
        {
          symbol: "SOL",
          name: "Solana",
          price: sol.price,
          change: sol.change,
          category: "crypto",
        },
        {
          symbol: "BNB",
          name: "BNB",
          price: bnb.price,
          change: bnb.change,
          category: "crypto",
        },
      ],
      commodities: [
        {
          symbol: "XAU",
          name: "Gold",
          price: gold.price,
          change: gold.change,
          category: "commodity",
        },
        {
          symbol: "XAG",
          name: "Silver",
          price: silver.price,
          change: silver.change,
          category: "commodity",
        },
        {
          symbol: "OIL",
          name: "Crude Oil",
          price: oil.price,
          change: oil.change,
          category: "commodity",
        },
      ],
      indices: [
        {
          symbol: "NAS100",
          name: "Nasdaq 100",
          price: nasdaq.price,
          change: nasdaq.change,
          category: "index",
        },
        {
          symbol: "S&P500",
          name: "S&P 500",
          price: sp500.price,
          change: sp500.change,
          category: "index",
        },
        {
          symbol: "DOW",
          name: "Dow Jones",
          price: dow.price,
          change: dow.change,
          category: "index",
        },
      ],
    });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
