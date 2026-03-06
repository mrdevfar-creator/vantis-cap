"use client";

import { useState } from "react";

const monthlyData = [
  { month: "Jan", return: 4.2, cumulative: 4.2 },
  { month: "Feb", return: 3.8, cumulative: 8.2 },
  { month: "Mar", return: -1.2, cumulative: 6.9 },
  { month: "Apr", return: 5.6, cumulative: 12.9 },
  { month: "May", return: 4.1, cumulative: 17.5 },
  { month: "Jun", return: 2.9, cumulative: 21.0 },
  { month: "Jul", return: 6.3, cumulative: 28.6 },
  { month: "Aug", return: -0.8, cumulative: 27.6 },
  { month: "Sep", return: 3.5, cumulative: 32.1 },
  { month: "Oct", return: 4.7, cumulative: 38.3 },
  { month: "Nov", return: 2.1, cumulative: 41.2 },
  { month: "Dec", return: 3.6, cumulative: 46.3 },
];

// Updated: starts from 2020 (7 years active), consistent with homepage
const yearlyData = [
  { year: "2020", return: 24.8 },
  { year: "2021", return: 31.4 },
  { year: "2022", return: 19.6 },
  { year: "2023", return: 38.2 },
  { year: "2024", return: 43.1 },
  { year: "2025", return: 46.3 },
];

const metrics = [
  { label: "Total Return (2025)", value: "+46.3%", color: "text-emerald-400" },
  { label: "Win Rate", value: "78%", color: "text-amber-400" },
  { label: "Max Drawdown", value: "-1.8%", color: "text-rose-400" },
  { label: "Sharpe Ratio", value: "2.18", color: "text-sky-400" },
  { label: "Avg Monthly Return", value: "+3.86%", color: "text-violet-400" },
  { label: "Profitable Months", value: "10/12", color: "text-emerald-400" },
];

export default function TrPerformance() {
  const [view, setView] = useState("monthly");

  const maxReturn = Math.max(...monthlyData.map((d) => Math.abs(d.return)));
  const maxYearly = Math.max(...yearlyData.map((d) => d.return));

  return (
    <section
      id="performance"
      className="bg-[#0D0D0D] py-24 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-14">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-xs font-medium text-gray-400 tracking-widest uppercase">
                Performance
              </span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-white leading-tight">
              Numbers that{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
                speak truth
              </span>
            </h2>
          </div>

          {/* Toggle */}
          <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-full p-1 w-fit">
            {["monthly", "yearly"].map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 capitalize ${
                  view === v
                    ? "bg-white text-black"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart */}
          <div className="lg:col-span-2 bg-white/[0.03] border border-white/[0.07] rounded-2xl p-7">
            <p className="text-gray-400 text-sm mb-6">
              {view === "monthly"
                ? "Monthly Returns — 2025"
                : "Annual Returns — 2020–2025 (7 Years)"}
            </p>

            {view === "monthly" ? (
              <div className="flex items-end gap-1.5 h-48">
                {monthlyData.map((d) => (
                  <div
                    key={d.month}
                    className="flex-1 flex flex-col items-center gap-1"
                  >
                    <div
                      className="w-full flex flex-col items-center justify-end"
                      style={{ height: "160px" }}
                    >
                      <div
                        className={`w-full rounded-t-md transition-all duration-500 ${
                          d.return >= 0
                            ? "bg-gradient-to-t from-emerald-600 to-emerald-400"
                            : "bg-gradient-to-t from-rose-600 to-rose-400"
                        }`}
                        style={{
                          height: `${(Math.abs(d.return) / maxReturn) * 130}px`,
                          minHeight: "4px",
                        }}
                      />
                    </div>
                    <span className="text-gray-500 text-[10px]">{d.month}</span>
                    <span
                      className={`text-[10px] font-semibold ${d.return >= 0 ? "text-emerald-400" : "text-rose-400"}`}
                    >
                      {d.return > 0 ? "+" : ""}
                      {d.return}%
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-end gap-4 h-48">
                {yearlyData.map((d) => (
                  <div
                    key={d.year}
                    className="flex-1 flex flex-col items-center gap-2"
                  >
                    <div
                      className="w-full flex flex-col items-center justify-end"
                      style={{ height: "160px" }}
                    >
                      <div
                        className="w-full rounded-t-lg bg-gradient-to-t from-amber-600 to-amber-400 transition-all duration-500"
                        style={{ height: `${(d.return / maxYearly) * 140}px` }}
                      />
                    </div>
                    <span className="text-gray-400 text-xs font-medium">
                      {d.year}
                    </span>
                    <span className="text-amber-400 text-xs font-bold">
                      +{d.return}%
                    </span>
                  </div>
                ))}
              </div>
            )}

            {view === "monthly" && (
              <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between">
                <p className="text-gray-500 text-xs">
                  Cumulative return (2025)
                </p>
                <p className="text-emerald-400 text-lg font-bold">+46.3%</p>
              </div>
            )}
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
            {metrics.map((m) => (
              <div
                key={m.label}
                className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-5 hover:bg-white/[0.05] transition-colors"
              >
                <p className="text-gray-500 text-xs mb-2">{m.label}</p>
                <p className={`text-2xl font-bold ${m.color}`}>{m.value}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="mt-6 text-xs text-gray-700 text-center">
          Past performance is not indicative of future results. All figures are
          audited and verified. Platform active since 2020.
        </p>
      </div>
    </section>
  );
}
