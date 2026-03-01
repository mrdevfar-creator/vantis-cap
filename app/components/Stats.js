"use client";

import { useState, useEffect } from "react";

const getYearsActive = () => {
  const startYear = 2019;
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0 = Jan, 1 = Feb
  return month >= 1 ? year - startYear : year - startYear - 1;
};

const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const CLIENTS_KEY = "stats_clients";
const PAYOUTS_KEY = "stats_payouts";
const PAYOUTS_LAST_UPDATED_KEY = "stats_payouts_last_updated";
const CLIENTS_LAST_UPDATED_KEY = "stats_clients_last_updated";

export default function Stats() {
  const [years] = useState(getYearsActive());
  const [clients, setClients] = useState(null);
  const [payouts, setPayouts] = useState(null);

  // Initialize from localStorage
  useEffect(() => {
    // --- Clients ---
    const savedClients = localStorage.getItem(CLIENTS_KEY);
    const savedClientsTime = localStorage.getItem(CLIENTS_LAST_UPDATED_KEY);

    if (savedClients) {
      let currentClients = parseInt(savedClients);
      // If time has passed since last save, catch up missed increments
      if (savedClientsTime) {
        const minutesPassed = Math.floor(
          (Date.now() - parseInt(savedClientsTime)) / 60000,
        );
        for (let i = 0; i < minutesPassed; i++) {
          const weights = [0, 0, 0, 0, 0, 1, 1, 2, 2, 5];
          currentClients += weights[randInt(0, weights.length - 1)];
        }
      }
      setClients(currentClients);
      localStorage.setItem(CLIENTS_KEY, currentClients.toString());
      localStorage.setItem(CLIENTS_LAST_UPDATED_KEY, Date.now().toString());
    } else {
      // First time — set initial value
      const initial = 189761;
      setClients(initial);
      localStorage.setItem(CLIENTS_KEY, initial.toString());
      localStorage.setItem(CLIENTS_LAST_UPDATED_KEY, Date.now().toString());
    }

    // --- Payouts ---
    const savedPayouts = localStorage.getItem(PAYOUTS_KEY);
    const savedPayoutsTime = localStorage.getItem(PAYOUTS_LAST_UPDATED_KEY);

    if (savedPayouts) {
      let currentPayouts = parseInt(savedPayouts);
      // Catch up missed hourly increments
      if (savedPayoutsTime) {
        const hoursPassed = Math.floor(
          (Date.now() - parseInt(savedPayoutsTime)) / 3600000,
        );
        for (let i = 0; i < hoursPassed; i++) {
          currentPayouts += randInt(500, 5000);
        }
      }
      setPayouts(currentPayouts);
      localStorage.setItem(PAYOUTS_KEY, currentPayouts.toString());
      localStorage.setItem(PAYOUTS_LAST_UPDATED_KEY, Date.now().toString());
    } else {
      // First time
      const initial = randInt(3000000, 3500000);
      setPayouts(initial);
      localStorage.setItem(PAYOUTS_KEY, initial.toString());
      localStorage.setItem(PAYOUTS_LAST_UPDATED_KEY, Date.now().toString());
    }
  }, []);

  // Clients: update every 1 minute
  useEffect(() => {
    if (clients === null) return;
    const interval = setInterval(() => {
      const weights = [0, 0, 0, 0, 0, 1, 1, 2, 2, 5];
      const increment = weights[randInt(0, weights.length - 1)];
      setClients((prev) => {
        const updated = prev + increment;
        localStorage.setItem(CLIENTS_KEY, updated.toString());
        localStorage.setItem(CLIENTS_LAST_UPDATED_KEY, Date.now().toString());
        return updated;
      });
    }, 60000);
    return () => clearInterval(interval);
  }, [clients]);

  // Payouts: update every 1 hour
  useEffect(() => {
    if (payouts === null) return;
    const interval = setInterval(() => {
      const increment = randInt(500, 5000);
      setPayouts((prev) => {
        const updated = prev + increment;
        localStorage.setItem(PAYOUTS_KEY, updated.toString());
        localStorage.setItem(PAYOUTS_LAST_UPDATED_KEY, Date.now().toString());
        return updated;
      });
    }, 3600000);
    return () => clearInterval(interval);
  }, [payouts]);

  const formatPayouts = (amount) => "$" + amount.toLocaleString("en-US");

  if (clients === null || payouts === null) return null;

  return (
    <section className="py-10 bg-gray-100 sm:py-16 lg:py-24">
      <div className="max-w-5xl px-4 mx-auto sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold leading-tight text-black sm:text-4xl lg:text-5xl">
            Numbers tell our story
          </h2>
          <p className="mt-3 text-xl leading-relaxed text-gray-600 md:mt-8">
            Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet
            sint. Velit officia consequat duis.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 mt-10 text-center lg:mt-24 sm:gap-x-8 md:grid-cols-3">
          {/* Years */}
          <div>
            <h3 className="font-bold text-5xl">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-600 to-blue-600">
                {years}+
              </span>
            </h3>
            <p className="mt-4 text-xl font-medium text-gray-900">
              Years in business
            </p>
            <p className="text-base mt-0.5 text-gray-500">
              Creating the successful path
            </p>
          </div>

          {/* Clients */}
          <div>
            <h3 className="font-bold text-5xl">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-600 to-blue-600">
                {clients.toLocaleString("en-US")}
              </span>
            </h3>
            <p className="mt-4 text-xl font-medium text-gray-900">
              Successful Clients
            </p>
            <p className="text-base mt-0.5 text-gray-500">
              In last {years} years
            </p>
          </div>

          {/* Payouts */}
          <div>
            <h3 className="font-bold text-5xl">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-600 to-blue-600">
                {formatPayouts(payouts)}
              </span>
            </h3>
            <p className="mt-4 text-xl font-medium text-gray-900">Payouts</p>
            <p className="text-base mt-0.5 text-gray-500">
              Working for your success
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
