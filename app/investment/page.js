"use client";
import React from "react";
import InHero from "../components/InvestmentPage/InHero";
import HowItWorks from "../components/HowItWorks";
import WhyChoose from "../components/InvestmentPage/WhyChoose";
import InFaq from "../components/InvestmentPage/InFaq";
import LiveTrade from "../components/LiveTrade/LiveTrade";

const page = () => {
  return (
    <>
      <header>
        <title>Investment - Vantis Capital</title>
      </header>
      <InHero />
      <HowItWorks />
      <WhyChoose />
      <LiveTrade />
      <InFaq />
    </>
  );
};

export default page;
