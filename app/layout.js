"use client";
// app/layout.js
// Shows logo splash screen for 4 seconds on first visit (homepage load)
// After splash, navigates to homepage normally.
// Login success → dashboard transition also goes through splash.

import { DM_Sans } from "next/font/google";
import "./globals.css";
import Nav from "./components/Nav";
import Footer from "./components/Footer";
import SplashScreen from "./components/SplashScreen";
import { useState, useEffect } from "react";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export default function RootLayout({ children }) {
  const [showSplash, setShowSplash] = useState(false);
  const [splashDone, setSplashDone] = useState(false);

  useEffect(() => {
    // Show splash only once per session (not on every page nav)
    const splashShown = sessionStorage.getItem("vantis_splash_shown");
    if (!splashShown) {
      setShowSplash(true);
    } else {
      setSplashDone(true);
    }
  }, []);

  const handleSplashFinish = () => {
    sessionStorage.setItem("vantis_splash_shown", "1");
    setShowSplash(false);
    setSplashDone(true);
  };

  return (
    <html lang="en">
      <body className={dmSans.className}>
        {/* Splash — shown once per session */}
        {showSplash && <SplashScreen onFinish={handleSplashFinish} />}

        {/* Main content — hidden under splash until done */}
        <div style={{ visibility: splashDone ? "visible" : "hidden" }}>
          <Nav />
          {children}
          <Footer />
        </div>
      </body>
    </html>
  );
}
