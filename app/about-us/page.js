import React from "react";
import AboutHero from "../components/AboutusPage/AboutHero";
import Ourstory from "../components/AboutusPage/Ourstory";
import TeamMembers from "../components/AboutusPage/TeamMembers";
import AwardsRecognition from "../components/AboutusPage/AwardsRecognition";
import AboutCTA from "../components/AboutusPage/AboutCTA";

export const metadata = {
  title: "About Us - Vantis Capital",
};

const page = () => {
  return (
    <>
      <AboutHero />
      <Ourstory />
      <TeamMembers />
      <AwardsRecognition />
      <AboutCTA />
    </>
  );
};

export default page;
