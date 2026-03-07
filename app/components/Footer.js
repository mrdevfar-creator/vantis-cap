"use client";
import Link from "next/link";
import Image from "next/image";
import FooterLogo from "../public/vantis-trs-logo.png";

// ── Link data ─────────────────────────────────────────────────────────────────
const COLUMNS = [
  {
    heading: "Products",
    links: [
      { label: "Spot Trading",          href: "https://www.tradingview.com/trading/spot-and-margin/" },
      { label: "Investment Plans",      href: "/investment" },
      { label: "Deposit",               href: "/deposit" },
      { label: "Live Market",           href: "/live-market" },
      { label: "Trade Management",      href: "/trading-management" },
      { label: "Trading History",       href: "/trading-history" },
    ],
  },
  {
    heading: "Markets",
    links: [
      { label: "Crypto Markets",        href: "https://www.tradingview.com/markets/cryptocurrencies/" },
      { label: "Forex Markets",         href: "https://www.tradingview.com/markets/currencies/" },
      { label: "Commodities",           href: "https://www.tradingview.com/markets/commodities/" },
      { label: "Stock Indices",         href: "https://www.tradingview.com/markets/indices/" },
      { label: "Futures",               href: "https://www.tradingview.com/markets/futures/" },
      { label: "Market Overview",       href: "https://www.tradingview.com/markets/" },
    ],
  },
  {
    heading: "Tools & Analysis",
    links: [
      { label: "Live Charts",           href: "https://www.tradingview.com/chart/" },
      { label: "Screener",              href: "https://www.tradingview.com/screener/" },
      { label: "Economic Calendar",     href: "https://www.tradingview.com/economic-calendar/" },
      { label: "Market News",           href: "https://www.tradingview.com/news/" },
      { label: "Ideas & Signals",       href: "https://www.tradingview.com/ideas/" },
      { label: "Heat Map",              href: "https://www.tradingview.com/heatmap/" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About Us",              href: "/about-us" },
      { label: "Contact Us",            href: "/contact" },
      { label: "Testimonials",          href: "/testimonial" },
      { label: "Careers",               href: "#" },
      { label: "Press & Media",         href: "#" },
      { label: "Blog",                  href: "#" },
    ],
  },
  {
    heading: "Support",
    links: [
      { label: "Help Center",           href: "#" },
      { label: "Live Chat",             href: "#" },
      { label: "Terms of Service",      href: "#" },
      { label: "Privacy Policy",        href: "#" },
      { label: "Risk Disclosure",       href: "#" },
      { label: "AML Policy",            href: "#" },
    ],
  },
];

const SOCIALS = [
  {
    label: "X (Twitter)",
    href: "https://twitter.com",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    label: "Telegram",
    href: "https://telegram.org",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.96 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    href: "https://linkedin.com",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    label: "YouTube",
    href: "https://youtube.com",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#0B0E11] border-t border-[#1E2329]">

      {/* ── Main grid ── */}
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 pt-14 pb-10">

        {/* Top: brand + columns */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8 lg:gap-6 mb-12">

          {/* Brand — spans 1 col on mobile, full-width block on lg */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-1">
            {/* Logo */}
            <Link href="/" className="inline-flex items-center gap-2.5 mb-4 group">
              <Image
                src={FooterLogo}
                alt="Vantis Capital"
                width={140}
                height={40}
                className="h-10 w-auto"
              />
            </Link>

            <p className="text-[#848E9C] text-xs leading-relaxed mb-5">
              Institutional-grade algorithmic trading for everyone. Trusted by 120K+ investors in 180+ countries since 2020.
            </p>

            {/* Socials */}
            <div className="flex items-center gap-2">
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="w-8 h-8 rounded-lg bg-white/5 border border-[#2B3139] flex items-center justify-center text-[#848E9C] hover:text-white hover:border-[#F0B90B]/40 hover:bg-[#F0B90B]/8 transition-all duration-200"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {COLUMNS.map((col) => (
            <div key={col.heading}>
              <p className="text-white text-xs font-bold uppercase tracking-widest mb-4">
                {col.heading}
              </p>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    {link.href.startsWith("http") ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#848E9C] hover:text-white text-xs transition-colors duration-150 flex items-center gap-1.5 group"
                      >
                        {link.label}
                        <svg className="w-2.5 h-2.5 opacity-0 group-hover:opacity-50 transition-opacity shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                        </svg>
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-[#848E9C] hover:text-white text-xs transition-colors duration-150"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* ── Market status bar ── */}
        <div className="bg-[#12161C] border border-[#2B3139] rounded-xl px-5 py-3.5 mb-8 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-5 flex-wrap">
            {[
              { label: "Crypto",  status: "Open", color: "bg-emerald-400" },
              { label: "Forex",   status: "Open", color: "bg-emerald-400" },
              { label: "Gold",    status: "Open", color: "bg-emerald-400" },
              { label: "Indices", status: "Open", color: "bg-emerald-400" },
            ].map((m) => (
              <div key={m.label} className="flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full ${m.color} animate-pulse`} />
                <span className="text-[#848E9C] text-xs">{m.label}</span>
                <span className="text-emerald-400 text-xs font-semibold">{m.status}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[#848E9C] text-xs">Powered by</span>
            <a href="https://www.tradingview.com" target="_blank" rel="noopener noreferrer"
              className="text-xs font-semibold text-white hover:text-[#F0B90B] transition-colors">
              TradingView
            </a>
          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div className="border-t border-[#1E2329] pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[#474D57] text-xs">
            © 2019 – {currentYear} Vantis Capital. All rights reserved.
          </p>
          <div className="flex items-center gap-5 flex-wrap justify-center">
            {["Terms of Service", "Privacy Policy", "Risk Disclosure", "Cookie Policy"].map((item) => (
              <a key={item} href="#"
                className="text-[#474D57] hover:text-[#848E9C] text-xs transition-colors">
                {item}
              </a>
            ))}
          </div>
          <p className="text-[#474D57] text-xs text-center sm:text-right max-w-xs">
            Trading involves risk. Past performance ≠ future results.
          </p>
        </div>
      </div>
    </footer>
  );
}