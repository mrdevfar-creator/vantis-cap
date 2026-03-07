import React from "react";
import InvestHero from "../components/TrMnagmePage/InvestHero";
import TrPerformance from "../components/TrMnagmePage/TrPerformance";
import TrHowitWork from "../components/TrMnagmePage/trHowitWork";
import TrInvestmentplans from "../components/TrMnagmePage/TrInvestmentplans";
import RiskStrategy from "../components/TrMnagmePage/RiskStrategy";
import Testimonial from "../components/TrMnagmePage/Testimonial";
import CtaSection from "../components/TrMnagmePage/CtaSection";
import DepositArea from "../components/DepositArea";

export const metadata = {
  title: "Trading Management - Vantis Capital",
};

const page = () => {
  return (
    <>
      <InvestHero />
      <TrPerformance />
      <TrHowitWork />
      <DepositArea />
      {/* <TrInvestmentplans /> */}
      <RiskStrategy />
      <Testimonial />
      <CtaSection />
    </>
  );
};

export default page;
