"use client";
// components/SplashScreen.js
// Place your logo HTML file at: public/logo-animation.html
// This component shows it for 4 seconds then calls onFinish()

import { useEffect, useRef, useState } from "react";

export default function SplashScreen({ onFinish }) {
  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    // Start fade-out at 3.4s, fully hide at 4s
    timerRef.current = setTimeout(() => {
      setFadeOut(true);
      setTimeout(() => {
        setVisible(false);
        onFinish?.();
      }, 600); // 600ms fade-out transition
    }, 3400);

    return () => clearTimeout(timerRef.current);
  }, [onFinish]);

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "#0B0E11",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "opacity 0.6s ease",
        opacity: fadeOut ? 0 : 1,
        pointerEvents: fadeOut ? "none" : "all",
      }}
    >
      {/* Logo animation iframe — loads your HTML logo file */}
      <iframe
        src="/logo-animation.html"
        style={{
          width: "100vw",
          height: "100vh",
          border: "none",
          background: "transparent",
        }}
        title="Vantis Capital Logo"
      />
    </div>
  );
}