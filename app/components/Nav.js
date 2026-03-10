"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import Logo from "../public/vantis-trs-logo.png";
import { auth } from "../lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Investment", href: "/investment" },
  { label: "Trade Management", href: "/trading-management" },
  { label: "Live Market", href: "/live-market" },
  { label: "About Us", href: "/about-us" },
  { label: "Contact Us", href: "/contact" },
];

// Words cycle animation for mobile tagline
function MobileTagline() {
  const words = [
    "Trade The Future",
    "Invest Smarter",
    "Grow Wealth",
    "Trade The Future",
  ];
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((i) => (i + 1) % (words.length - 1));
        setVisible(true);
      }, 400);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  const word = words[index];
  const colors = ["text-amber-500", "text-red-500", "text-violet-500"];

  return (
    <div className="md:hidden flex-1 flex justify-center items-center px-2 overflow-hidden">
      <p
        className="text-[11px] font-bold uppercase tracking-[0.18em] transition-all duration-400"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0px)" : "translateY(-6px)",
          transition: "opacity 0.4s ease, transform 0.4s ease",
        }}
      >
        {word.split(" ").map((w, wi) => (
          <span
            key={wi}
            className={`${colors[wi % colors.length]} ${wi > 0 ? "ml-[0.3em]" : ""}`}
          >
            {w}
          </span>
        ))}
      </p>
    </div>
  );
}

export default function Nav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthReady(true);
    });
    return () => unsub();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setMenuOpen(false);
    router.push("/");
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const close = (e) => {
      if (!e.target.closest("[data-mobile-menu]")) setMenuOpen(false);
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [menuOpen]);

  return (
    <div className="w-full sticky top-0 z-50">
      {/* Promo Banner */}
      <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-orange-500 text-white text-center text-xs font-medium py-2 tracking-wide select-none">
        Exclusive Offer — Limited time bonus on first deposit.{" "}
        <Link
          href="/signup"
          className="underline underline-offset-2 hover:opacity-80 transition-opacity"
        >
          Get started now →
        </Link>
      </div>

      {/* Navbar */}
      <nav
        className={`bg-white flex items-center justify-between h-[66px] px-5 md:px-10 lg:px-16 xl:px-24 border-b border-gray-100 transition-shadow duration-300 ${scrolled ? "shadow-md" : ""}`}
      >
        {/* Logo */}
        <Link href="/" className="shrink-0">
          <Image
            src={Logo}
            alt="Vantis Capital"
            height={400}
            width={100}
            className="object-contain h-10 w-auto"
            priority
          />
        </Link>

        {/* Mobile tagline */}
        <MobileTagline />

        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-6 lg:gap-8">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="relative text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors duration-200 pb-1 group inline-flex items-center gap-1.5"
              >
                {link.label === "Live Market" && (
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                )}
                {link.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-amber-400 to-red-500 rounded-full transition-all duration-300 group-hover:w-full" />
              </Link>
            </li>
          ))}
        </ul>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-4">
          {authReady &&
            (user ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1.5 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-red-50 hover:to-red-100 text-gray-700 hover:text-red-600 text-sm font-semibold px-5 py-2.5 rounded-xl transition-all duration-200 border border-gray-200 hover:border-red-200"
                >
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
                    />
                  </svg>
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
                >
                  Sign In
                </Link>
                <Link href="/signup">
                  <button className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-400 to-red-500 hover:from-amber-500 hover:to-red-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-red-200 active:scale-95">
                    Get Started
                    <svg
                      className="w-3.5 h-3.5"
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
              </>
            ))}
        </div>

        {/* Mobile hamburger */}
        <button
          data-mobile-menu
          aria-label="Toggle menu"
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen((v) => !v);
          }}
          className="md:hidden flex flex-col justify-center items-center w-10 h-10 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors gap-[5px] shrink-0"
        >
          <span
            className={`block w-[18px] h-[1.5px] bg-gray-600 rounded-full transition-all duration-300 origin-center ${menuOpen ? "translate-y-[6.5px] rotate-45" : ""}`}
          />
          <span
            className={`block w-[18px] h-[1.5px] bg-gray-600 rounded-full transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`}
          />
          <span
            className={`block w-[18px] h-[1.5px] bg-gray-600 rounded-full transition-all duration-300 origin-center ${menuOpen ? "-translate-y-[6.5px] -rotate-45" : ""}`}
          />
        </button>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          data-mobile-menu
          className="md:hidden bg-white border-b border-gray-100 shadow-lg px-5 pt-1 pb-4"
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="flex items-center justify-between py-3.5 text-[0.9375rem] font-medium text-gray-600 hover:text-gray-900 border-b border-gray-50 last:border-0 transition-colors"
            >
              <span className="flex items-center gap-2">
                {link.label === "Live Market" && (
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                )}
                {link.label}
              </span>
              <svg
                className="w-4 h-4 text-gray-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.25 4.5l7.5 7.5-7.5 7.5"
                />
              </svg>
            </Link>
          ))}
          <div className="flex gap-3 pt-4">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="flex-1"
                  onClick={() => setMenuOpen(false)}
                >
                  <button className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 to-red-500 text-white text-sm font-semibold hover:from-amber-500 hover:to-red-600 transition-all active:scale-95">
                    Dashboard
                  </button>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="flex-1"
                  onClick={() => setMenuOpen(false)}
                >
                  <button className="w-full py-3 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors">
                    Sign In
                  </button>
                </Link>
                <Link
                  href="/signup"
                  className="flex-1"
                  onClick={() => setMenuOpen(false)}
                >
                  <button className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 to-red-500 text-white text-sm font-semibold hover:from-amber-500 hover:to-red-600 transition-all active:scale-95">
                    Get Started
                  </button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
