"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Logo from "../public/vantis-trs-logo.png";

export default function Nav() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="text-sm text-white w-full">
      {/* Promo Banner */}
      <div className="text-center font-medium py-2 bg-gradient-to-r from-violet-500 via-[#9938CA] to-[#E0724A]">
        <p>
          Exclusive Price Drop! Hurry,{" "}
          <span className="underline underline-offset-2">Offer Ends Soon!</span>
        </p>
      </div>

      {/* Navbar */}
      <nav className="relative h-[70px] flex items-center justify-between px-6 md:px-16 lg:px-24 xl:px-32 py-4 bg-white text-gray-900 transition-all shadow">
        {/* Logo */}
        {/* <Link> */}
        <Image
          height={"400"}
          width={"100"}
          alt="Vantis Capital Logo"
          src={Logo}
        ></Image>
        {/* </Link> */}

        {/* Desktop Nav Links */}
        <ul className="hidden md:flex items-center space-x-8 md:pl-28">
          <li>
            <Link href="/">Home</Link>
          </li>
          <li>
            <Link href="/investment">Investment</Link>
          </li>
          <li>
            <Link href="/trading-management">Trade Management</Link>
          </li>
          <li>
            <Link href="/live-market">Live Market</Link>
          </li>
          <li>
            <Link href="/about-us">About Us</Link>
          </li>
          <li>
            <Link href="/contact">Contact Us</Link>
          </li>
        </ul>

        {/* Desktop CTA Button */}
        <Link href="/login">
          <button className="md:inline hidden bg-white hover:bg-red-500 hover:text-white border border-red-300 ml-20 px-9 py-2 rounded-full active:scale-95 transition-all">
            Sign Up
          </button>
        </Link>

        {/* Mobile Menu Toggle Button */}
        <button
          aria-label="menu-btn"
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          className="inline-block md:hidden active:scale-90 transition"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="30"
            height="30"
            viewBox="0 0 30 30"
          >
            <path d="M3 7a1 1 0 1 0 0 2h24a1 1 0 1 0 0-2zm0 7a1 1 0 1 0 0 2h24a1 1 0 1 0 0-2zm0 7a1 1 0 1 0 0 2h24a1 1 0 1 0 0-2z" />
          </svg>
        </button>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="mobile-menu absolute top-[70px] left-0 w-full bg-white shadow-sm p-6 md:hidden z-50">
            <ul className="flex flex-col space-y-4 text-lg">
              <li>
                <Link href="#" className="text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm">
                  Services
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm">
                  Portfolio
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm">
                  Pricing
                </Link>
              </li>
            </ul>

            <button
              type="button"
              className="bg-white text-gray-600 border border-gray-300 mt-6 text-sm hover:bg-gray-50 active:scale-95 transition-all w-40 h-11 rounded-full"
            >
              Get started
            </button>
          </div>
        )}
      </nav>
    </div>
  );
}
