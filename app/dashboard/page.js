// app/dashboard/page.js
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { auth, db } from "../lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";

const ADMIN_EMAIL = "khaialamu@gmail.com";

// ── Balance Updated Modal (shown to user when admin updates balance) ───────────
// ── Plan logic: based on latest approved deposit amount ────────────────────────
// $50-99 → Starter 10% | $100-149 → Inner 13% | $150-199 → Smart 15%
// $200-249 → Grower 17% | $250-299 → Ninja 18% | $300+ → Master 20%
const PLANS = [
  { key:"master",  min:300, max:Infinity, profit:0.20, label:"Master",  emoji:"👑", color:"from-amber-400 to-yellow-600",   border:"border-amber-400/30",   profitStr:"20%" },
  { key:"ninja",   min:250, max:299,      profit:0.18, label:"Ninja",   emoji:"⚡", color:"from-pink-500 to-pink-700",      border:"border-pink-500/30",    profitStr:"18%" },
  { key:"grower",  min:200, max:249,      profit:0.17, label:"Grower",  emoji:"📈", color:"from-orange-500 to-orange-700",  border:"border-orange-500/30",  profitStr:"17%" },
  { key:"smart",   min:150, max:199,      profit:0.15, label:"Smart",   emoji:"🧠", color:"from-violet-500 to-violet-700",  border:"border-violet-500/30",  profitStr:"15%" },
  { key:"inner",   min:100, max:149,      profit:0.13, label:"Inner",   emoji:"💎", color:"from-emerald-500 to-emerald-700",border:"border-emerald-500/30", profitStr:"13%" },
  { key:"starter", min:50,  max:99,       profit:0.10, label:"Starter", emoji:"🌱", color:"from-blue-500 to-blue-700",      border:"border-blue-500/30",    profitStr:"10%" },
];
const DEFAULT_PLAN = PLANS[PLANS.length - 1]; // Starter as fallback

function getActivePlan(deposits) {
  // Find latest approved deposit
  const approved = (deposits || [])
    .filter(d => d.status === "APPROVED")
    .sort((a, b) => new Date(b.approvedAt || 0).getTime() - new Date(a.approvedAt || 0).getTime());
  if (!approved.length) return DEFAULT_PLAN;
  const amount = approved[0].amount || 0;
  return PLANS.find(p => amount >= p.min && amount <= p.max) || DEFAULT_PLAN;
}

// ── 1. Live Portfolio Ticker ───────────────────────────────────────────────────
function LiveTicker({ balance, plan }) {
  const [displayed, setDisplayed] = useState(balance);
  const targetRef = useRef(balance);
  useEffect(() => {
    targetRef.current = balance;
    setDisplayed(balance);
  }, [balance]);
  useEffect(() => {
    if (!balance || balance <= 0) return;
    // Slowly increment by tiny random amounts to simulate live trading
    const interval = setInterval(() => {
      setDisplayed(prev => {
        const micro = (Math.random() * 0.003 * (plan?.profit || 0.1) * balance);
        return prev + micro;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [balance, plan]);
  return (
    <span className="tabular-nums">
      ${displayed.toFixed(2)}
    </span>
  );
}

// ── 2. Cycle Complete Celebration ─────────────────────────────────────────────
function CycleCelebration({ profit, onClose }) {
  const [show, setShow] = useState(true);
  const particles = Array.from({length: 18}, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 0.8,
    color: ["#F0B90B","#0ECB81","#F6465D","#60A5FA","#A78BFA","#FB923C"][i % 6],
    size: 6 + Math.random() * 6,
  }));
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => { setShow(false); onClose?.(); }} />
      {/* Confetti */}
      {particles.map(p => (
        <div key={p.id} className="absolute pointer-events-none"
          style={{
            left: `${p.x}%`, top: "-10px",
            width: p.size, height: p.size,
            borderRadius: Math.random() > 0.5 ? "50%" : "2px",
            background: p.color,
            animation: `fall ${1.5 + Math.random()}s ${p.delay}s ease-in forwards`,
          }}
        />
      ))}
      <style>{`
        @keyframes fall { to { transform: translateY(110vh) rotate(720deg); opacity: 0; } }
        @keyframes popIn { from { transform: scale(0.5); opacity: 0; } to { transform: scale(1); opacity: 1; } }
      `}</style>
      <div className="relative bg-[#0F1318] border border-amber-500/30 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl shadow-amber-500/10"
        style={{animation: "popIn 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards"}}>
        <div className="text-5xl mb-4">🎉</div>
        <h2 className="text-white text-2xl font-black mb-2">Cycle Complete!</h2>
        <p className="text-gray-400 text-sm mb-6">Your 96-hour trading cycle has ended. Your profit is ready to withdraw!</p>
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 mb-6">
          <p className="text-gray-500 text-xs mb-1">Estimated Profit</p>
          <p className="text-emerald-400 text-3xl font-black">+${profit.toFixed(2)}</p>
        </div>
        <button onClick={() => { setShow(false); onClose?.(); }}
          className="w-full py-3.5 bg-gradient-to-r from-amber-400 to-orange-500 text-black font-black rounded-xl hover:opacity-90 transition-all active:scale-95">
          Withdraw Now 🚀
        </button>
      </div>
    </div>
  );
}

// ── 3. Milestone Badges ────────────────────────────────────────────────────────
function MilestoneBadges({ deposits, totalDeposit }) {
  const approved = (deposits || []).filter(d => d.status === "APPROVED");
  const badges = [
    { id:"first",    label:"First Deposit",   emoji:"🌟", unlocked: approved.length >= 1,  color:"from-amber-400 to-yellow-500" },
    { id:"third",    label:"3rd Deposit",      emoji:"🔥", unlocked: approved.length >= 3,  color:"from-orange-400 to-red-500"   },
    { id:"fifth",    label:"5th Deposit",      emoji:"💪", unlocked: approved.length >= 5,  color:"from-pink-400 to-rose-500"    },
    { id:"hun",      label:"$100 Invested",    emoji:"💯", unlocked: totalDeposit >= 100,   color:"from-blue-400 to-blue-600"    },
    { id:"fivehun",  label:"$500 Milestone",   emoji:"🏆", unlocked: totalDeposit >= 500,   color:"from-violet-400 to-purple-600"},
    { id:"k",        label:"$1K Club",         emoji:"👑", unlocked: totalDeposit >= 1000,  color:"from-amber-400 to-yellow-500" },
  ];
  const unlocked = badges.filter(b => b.unlocked);
  const locked = badges.filter(b => !b.unlocked);
  if (unlocked.length === 0 && locked.length === 0) return null;
  return (
    <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-5">
      <p className="text-white text-sm font-semibold mb-4">Your Badges</p>
      <div className="flex flex-wrap gap-2">
        {unlocked.map(b => (
          <div key={b.id} className={`flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r ${b.color} shadow-lg`}>
            <span className="text-base">{b.emoji}</span>
            <span className="text-white text-xs font-bold">{b.label}</span>
          </div>
        ))}
        {locked.slice(0, 3).map(b => (
          <div key={b.id} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06] opacity-40">
            <span className="text-base grayscale">🔒</span>
            <span className="text-gray-600 text-xs">{b.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── 5. Profit History Chart ────────────────────────────────────────────────────
function ProfitChart({ deposits }) {
  const approved = (deposits || [])
    .filter(d => d.status === "APPROVED")
    .sort((a, b) => new Date(a.approvedAt || 0).getTime() - new Date(b.approvedAt || 0).getTime())
    .slice(-8); // last 8
  if (approved.length === 0) return null;
  const bars = approved.map(d => {
    const plan = getActivePlan([d]);
    return {
      profit: (d.amount || 0) * plan.profit,
      deposit: d.amount || 0,
      label: d.approvedAt
        ? new Date(d.approvedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })
        : "—",
      plan: plan.label,
      color: plan.color,
    };
  });
  const maxProfit = Math.max(...bars.map(b => b.profit), 1);
  return (
    <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-5">
      <div className="flex items-center justify-between mb-5">
        <p className="text-white text-sm font-semibold">Profit History</p>
        <span className="text-gray-600 text-xs">{bars.length} cycle{bars.length !== 1 ? "s" : ""}</span>
      </div>
      <div className="flex items-end gap-2 h-32">
        {bars.map((b, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
            <div className="relative w-full flex flex-col justify-end" style={{height:"96px"}}>
              {/* Tooltip */}
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#1A1F28] border border-white/10 rounded-lg px-2 py-1 text-[10px] text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-10">
                +${b.profit.toFixed(2)}
              </div>
              <div
                className={`w-full rounded-t-lg bg-gradient-to-t ${b.color} transition-all duration-700 relative overflow-hidden`}
                style={{ height: `${Math.max((b.profit / maxProfit) * 90, 6)}px` }}
              >
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
            <span className="text-gray-600 text-[9px]">{b.label}</span>
            <span className="text-emerald-400 text-[9px] font-bold">+${b.profit.toFixed(0)}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t border-white/[0.05] flex items-center justify-between">
        <span className="text-gray-600 text-xs">Total Profit Earned</span>
        <span className="text-emerald-400 font-bold text-sm">
          +${bars.reduce((s, b) => s + b.profit, 0).toFixed(2)}
        </span>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// FEATURE COMPONENTS
// ══════════════════════════════════════════════════════════════════════════════

// ── 1. Live Activity Feed ─────────────────────────────────────────────────────
const ACTIVITY_NAMES = [
  ["A***n","BD"],["S***h","US"],["R***l","UK"],["M***a","AE"],["F***d","CA"],
  ["T***r","AU"],["N***i","SG"],["K***m","MY"],["J***e","PH"],["O***s","NG"],
  ["P***k","IN"],["H***n","DE"],["Y***f","FR"],["I***a","TR"],["B***o","ZA"],
  ["C***s","BR"],["D***a","ID"],["E***l","PK"],["G***i","EG"],["L***n","MX"],
];
const ACTIVITY_TYPES = [
  (n,c,a) => ({ msg:`${n} from ${c} just deposited $${a}`, icon:"💰", color:"text-emerald-400" }),
  (n,c,a) => ({ msg:`${n} from ${c} earned $${(a*0.15).toFixed(0)} profit`, icon:"📈", color:"text-amber-400" }),
  (n,c,a) => ({ msg:`${n} from ${c} withdrew $${a}`, icon:"🏦", color:"text-blue-400" }),
  (n,c,a) => ({ msg:`${n} from ${c} joined Vantis Capital`, icon:"🌟", color:"text-violet-400" }),
  (n,c,a) => ({ msg:`${n} from ${c} upgraded to ${["Inner","Smart","Grower","Ninja","Master"][Math.floor(a/5)%5]} plan`, icon:"⬆️", color:"text-pink-400" }),
];
const AMOUNTS = [50,75,100,120,150,175,200,250,300,350,400,500];

function LiveActivityFeed() {
  const [activities, setActivities] = useState(() => {
    // Seed initial 4 items
    return Array.from({length:4}, (_,i) => {
      const [name,country] = ACTIVITY_NAMES[(i*7)%ACTIVITY_NAMES.length];
      const amt = AMOUNTS[(i*3)%AMOUNTS.length];
      const type = ACTIVITY_TYPES[(i*2)%ACTIVITY_TYPES.length];
      return { id:i, ...type(name,country,amt), age: (i+1)*18 };
    });
  });
  const seedRef = useRef(100);

  useEffect(() => {
    const interval = setInterval(() => {
      const idx = seedRef.current % ACTIVITY_NAMES.length;
      const [name,country] = ACTIVITY_NAMES[idx];
      const amt = AMOUNTS[seedRef.current % AMOUNTS.length];
      const typeIdx = seedRef.current % ACTIVITY_TYPES.length;
      const activity = { id: Date.now(), ...ACTIVITY_TYPES[typeIdx](name,country,amt), age:0 };
      seedRef.current++;
      setActivities(prev => [activity, ...prev.slice(0,4)]);
    }, 4500 + (seedRef.current % 3)*1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl overflow-hidden">
      <div className="px-5 py-3.5 border-b border-white/[0.05] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <p className="text-white text-sm font-semibold">Live Activity</p>
        </div>
        <span className="text-gray-600 text-xs">Real-time</span>
      </div>
      <div className="divide-y divide-white/[0.03]">
        {activities.map((a, i) => (
          <div key={a.id}
            className="flex items-center gap-3 px-5 py-3 transition-all duration-700"
            style={{opacity: 1 - i*0.18, transform: i===0 ? "translateY(0)" : "none"}}
          >
            <span className="text-base shrink-0">{a.icon}</span>
            <p className={`text-xs flex-1 ${a.color}`}>{a.msg}</p>
            <span className="text-gray-700 text-[10px] shrink-0">{i===0?"just now":`${(i)*Math.ceil(4.5)}m ago`}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── 2. Live Investor Counter ──────────────────────────────────────────────────
function LiveInvestorCounter() {
  const BASE = 120000;
  // Deterministic seed: use day-of-year so it grows day by day
  const dayOffset = Math.floor((Date.now() - new Date("2020-01-01").getTime()) / 86400000);
  const [count, setCount] = useState(BASE + dayOffset * 3 + Math.floor(Math.random()*20));

  useEffect(() => {
    // +1 every 8–16 seconds — believable organic growth
    const tick = () => {
      setCount(c => c + 1);
      setTimeout(tick, 8000 + Math.random()*8000);
    };
    const t = setTimeout(tick, 8000 + Math.random()*8000);
    return () => clearTimeout(t);
  }, []);

  const fmt = (n) => n.toLocaleString("en-US");

  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-violet-500/8 border border-violet-500/15 rounded-2xl">
      <div className="w-9 h-9 rounded-xl bg-violet-500/15 flex items-center justify-center shrink-0">
        <span className="text-lg">👥</span>
      </div>
      <div className="flex-1">
        <p className="text-gray-500 text-xs">Active Investors Worldwide</p>
        <p className="text-violet-400 text-lg font-black tabular-nums">{fmt(count)}</p>
      </div>
      <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        LIVE
      </span>
    </div>
  );
}

// ── 3. Daily Profit Pulse ─────────────────────────────────────────────────────
function DailyProfitPulse() {
  // Platform AUM ~$45M, avg daily return ~0.07% = ~$31,500/day
  // At midnight resets, grows through the day based on time
  const getDailyProfit = () => {
    const now = new Date();
    const secondsInDay = now.getHours()*3600 + now.getMinutes()*60 + now.getSeconds();
    const dayFraction = secondsInDay / 86400;
    // Base $28,000 + intraday growth up to ~$34,000 with slight randomness seeded by date
    const seed = now.getDate() + now.getMonth()*31;
    const base = 28000 + (seed % 12) * 400;
    return base + dayFraction * (5800 + (seed % 800));
  };

  const [profit, setProfit] = useState(getDailyProfit);

  useEffect(() => {
    const interval = setInterval(() => {
      setProfit(getDailyProfit());
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const fmt = (n) => "$" + n.toLocaleString("en-US", {minimumFractionDigits:2, maximumFractionDigits:2});

  return (
    <div className="relative overflow-hidden flex items-center gap-3 px-4 py-3 bg-amber-500/8 border border-amber-500/15 rounded-2xl">
      <div className="absolute inset-0 bg-gradient-to-r from-amber-500/3 to-transparent pointer-events-none" />
      <div className="w-9 h-9 rounded-xl bg-amber-500/15 flex items-center justify-center shrink-0">
        <span className="text-lg">💹</span>
      </div>
      <div className="flex-1">
        <p className="text-gray-500 text-xs">Platform Profit Today</p>
        <p className="text-amber-400 text-lg font-black tabular-nums transition-all duration-1000">{fmt(profit)}</p>
      </div>
      <div className="text-right">
        <span className="text-[10px] text-amber-400/70">
          {new Date().toLocaleDateString("en-US",{month:"short",day:"numeric"})}
        </span>
        <div className="flex items-center gap-1 justify-end mt-0.5">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-[10px] text-amber-400 font-semibold">LIVE</span>
        </div>
      </div>
    </div>
  );
}

// ── 4. Login Streak Tracker ───────────────────────────────────────────────────
function StreakTracker({ streak }) {
  if (!streak || streak < 1) return null;
  const fire = streak >= 7 ? "🔥" : streak >= 3 ? "⚡" : "✨";
  const label = streak >= 30 ? "Legendary" : streak >= 14 ? "Elite" : streak >= 7 ? "Hot Streak" : streak >= 3 ? "On Fire" : "Getting Started";
  const color = streak >= 7 ? "from-orange-500/10 to-red-500/5 border-orange-500/20" : streak >= 3 ? "from-amber-500/10 to-orange-500/5 border-amber-500/20" : "from-blue-500/10 to-violet-500/5 border-blue-500/20";
  const textColor = streak >= 7 ? "text-orange-400" : streak >= 3 ? "text-amber-400" : "text-blue-400";

  return (
    <div className={`flex items-center gap-3 px-4 py-3 bg-gradient-to-r ${color} border rounded-2xl`}>
      <span className="text-2xl">{fire}</span>
      <div className="flex-1">
        <p className={`${textColor} text-sm font-black`}>{streak}-Day Streak · {label}</p>
        <p className="text-gray-600 text-xs">Keep logging in daily to maintain your streak!</p>
      </div>
      <div className="flex gap-1">
        {Array.from({length: Math.min(streak, 7)}, (_,i) => (
          <div key={i} className={`w-2.5 h-2.5 rounded-full ${i < streak ? (streak >= 7 ? "bg-orange-400" : streak >= 3 ? "bg-amber-400" : "bg-blue-400") : "bg-white/10"}`} />
        ))}
      </div>
    </div>
  );
}

// ── 5. Bonus Cycle Countdown ──────────────────────────────────────────────────
function BonusCycleCountdown() {
  // Synced to real week — bonus "resets" every Sunday midnight UTC
  const getNextSunday = () => {
    const now = new Date();
    const day = now.getUTCDay(); // 0=Sun
    const daysUntil = day === 0 ? 7 : 7 - day;
    const next = new Date(now);
    next.setUTCDate(now.getUTCDate() + daysUntil);
    next.setUTCHours(0,0,0,0);
    return next.getTime();
  };

  const [msLeft, setMsLeft] = useState(() => getNextSunday() - Date.now());
  // Bonus % rotates weekly — seeded by week number so consistent
  const weekNum = Math.floor(Date.now() / (7*24*3600*1000));
  const bonusPcts = [22, 21, 23, 22, 24, 21, 23];
  const bonusPct = bonusPcts[weekNum % bonusPcts.length];

  useEffect(() => {
    const interval = setInterval(() => {
      setMsLeft(getNextSunday() - Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const s = Math.floor(msLeft / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const fmt = d > 0 ? `${d}d ${h}h ${String(m).padStart(2,"0")}m` : `${h}h ${String(m).padStart(2,"0")}m ${String(sec).padStart(2,"0")}s`;

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-pink-500/10 via-rose-500/5 to-transparent border border-pink-500/20 rounded-2xl p-4">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -inset-x-full top-0 h-px bg-gradient-to-r from-transparent via-pink-400/40 to-transparent animate-[shimmer_3s_linear_infinite]" />
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-pink-500/15 flex items-center justify-center shrink-0">
            <span className="text-lg">⏰</span>
          </div>
          <div>
            <p className="text-pink-400 text-xs font-bold uppercase tracking-wider">Limited Bonus Cycle</p>
            <p className="text-white text-sm font-black">+{bonusPct}% Return This Week</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-gray-500 text-[10px] mb-0.5">Ends in</p>
          <p className="text-pink-400 font-mono font-black text-sm">{fmt}</p>
        </div>
      </div>
    </div>
  );
}

// ── 6. VIP Tier Progress ──────────────────────────────────────────────────────
const VIP_TIERS = [
  { name:"Bronze",  min:0,    max:499,   emoji:"🥉", color:"from-amber-700 to-yellow-800",   text:"text-amber-600",  border:"border-amber-700/30",  bg:"bg-amber-900/10" },
  { name:"Silver",  min:500,  max:1499,  emoji:"🥈", color:"from-gray-400 to-slate-500",     text:"text-gray-300",   border:"border-gray-500/30",   bg:"bg-gray-500/8"   },
  { name:"Gold",    min:1500, max:4999,  emoji:"🥇", color:"from-yellow-400 to-amber-500",   text:"text-yellow-400", border:"border-yellow-500/30", bg:"bg-yellow-500/8" },
  { name:"Platinum",min:5000, max:14999, emoji:"💎", color:"from-cyan-400 to-blue-500",      text:"text-cyan-400",   border:"border-cyan-500/30",   bg:"bg-cyan-500/8"   },
  { name:"Elite",   min:15000,max:Infinity,emoji:"👑",color:"from-amber-400 to-yellow-300",  text:"text-amber-300",  border:"border-amber-400/30",  bg:"bg-amber-400/8"  },
];
const VIP_PERKS = {
  Bronze:  ["Priority support","Basic analytics"],
  Silver:  ["Priority support","Advanced analytics","Early access"],
  Gold:    ["VIP support","Full analytics","Early access","Bonus cycles"],
  Platinum:["Dedicated manager","All features","Exclusive bonuses","Higher limits"],
  Elite:   ["Personal advisor","All features","Maximum bonuses","Unlimited withdrawals"],
};

function VIPTierProgress({ totalDeposit }) {
  const total = totalDeposit || 0;
  const current = VIP_TIERS.findIndex(t => total >= t.min && total <= t.max);
  const tier = VIP_TIERS[Math.max(current, 0)];
  const next = VIP_TIERS[current + 1];
  const pct = next ? Math.min(((total - tier.min) / (next.min - tier.min)) * 100, 100) : 100;
  const toNext = next ? next.min - total : 0;
  const perks = VIP_PERKS[tier.name] || [];

  return (
    <div className={`${tier.bg} border ${tier.border} rounded-2xl p-5 relative overflow-hidden`}>
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -inset-x-full top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shimmer_4s_linear_infinite]" />
      </div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{tier.emoji}</span>
          <div>
            <p className={`${tier.text} font-black text-lg`}>{tier.name} Member</p>
            <p className="text-gray-500 text-xs">Total deposited: ${total.toLocaleString()}</p>
          </div>
        </div>
        {next && (
          <div className="text-right">
            <p className="text-gray-600 text-[10px]">Next: {next.name} {next.emoji}</p>
            <p className={`${tier.text} text-xs font-bold`}>${toNext.toLocaleString()} away</p>
          </div>
        )}
      </div>

      {/* Progress bar to next tier */}
      {next && (
        <div className="mb-4">
          <div className="h-2 bg-white/[0.05] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${tier.color} relative overflow-hidden transition-all duration-1000`}
              style={{width:`${pct}%`}}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent animate-[shimmer_2s_linear_infinite]" />
            </div>
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-gray-600 text-[10px]">{tier.name}</span>
            <span className="text-gray-600 text-[10px]">{pct.toFixed(0)}%</span>
            <span className="text-gray-600 text-[10px]">{next.name}</span>
          </div>
        </div>
      )}
      {!next && (
        <div className="mb-4 flex items-center gap-2 px-3 py-2 bg-amber-400/10 border border-amber-400/20 rounded-xl">
          <span>👑</span>
          <p className="text-amber-300 text-xs font-bold">You've reached the highest tier!</p>
        </div>
      )}

      {/* Perks */}
      <div className="flex flex-wrap gap-2">
        {perks.map(p => (
          <span key={p} className={`text-[10px] px-2.5 py-1 rounded-full ${tier.bg} border ${tier.border} ${tier.text} font-medium`}>
            ✓ {p}
          </span>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════

function BalanceUpdatedModal({ oldBalance, newBalance, onClose }) {
  const diff = newBalance - oldBalance;
  const increased = diff >= 0;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative w-full max-w-sm bg-[#0F1318] border border-white/[0.08] rounded-3xl p-8 shadow-2xl">
        {/* Animated icon */}
        <div className="flex items-center justify-center mb-6">
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center border ${
              increased
                ? "bg-emerald-400/15 border-emerald-500/30"
                : "bg-rose-400/15 border-rose-500/30"
            }`}
          >
            <svg
              className={`w-8 h-8 ${increased ? "text-emerald-400" : "text-rose-400"}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.8}
            >
              {increased ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 6L9 12.75l4.306-4.307a11.95 11.95 0 015.814 5.519l2.74 1.22m0 0l-5.94 2.28m5.94-2.28l-2.28-5.941"
                />
              )}
            </svg>
          </div>
        </div>

        <h2 className="text-white text-xl font-bold text-center mb-1">
          Balance Updated
        </h2>
        <p className="text-gray-500 text-sm text-center mb-8">
          Your account balance has been updated by the admin.
        </p>

        <div className="space-y-3 mb-8">
          <div className="flex items-center justify-between p-4 bg-white/[0.03] border border-white/[0.06] rounded-xl">
            <p className="text-gray-500 text-sm">Previous Balance</p>
            <p className="text-rose-400 font-bold">${oldBalance.toFixed(2)}</p>
          </div>
          <div className="flex items-center justify-between p-4 bg-white/[0.03] border border-white/[0.06] rounded-xl">
            <p className="text-gray-500 text-sm">New Balance</p>
            <p className="text-emerald-400 font-bold">
              ${newBalance.toFixed(2)}
            </p>
          </div>
          <div
            className={`flex items-center justify-between p-4 rounded-xl border ${
              increased
                ? "bg-emerald-500/5 border-emerald-500/15"
                : "bg-rose-500/5 border-rose-500/15"
            }`}
          >
            <p className="text-gray-500 text-sm">Change</p>
            <p
              className={`font-bold ${increased ? "text-emerald-400" : "text-rose-400"}`}
            >
              {increased ? "+" : ""}${diff.toFixed(2)}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3.5 bg-gradient-to-r from-amber-400 to-orange-500 text-black font-bold rounded-xl hover:opacity-90 transition-all"
        >
          Got it
        </button>
      </div>
    </div>
  );
}

// ── Withdraw Tab Component ─────────────────────────────────────────────────────
function WithdrawTab({ user, userData, deposits }) {
  const [address, setAddress] = useState(userData?.withdrawalAddress || "");
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [now, setNow] = useState(Date.now());

  // Tick every second to update countdowns
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const CYCLE_MS = 96 * 60 * 60 * 1000;

  // Build per-trade status from deposits
  const trades = (deposits || [])
    .filter(d => d.status === "APPROVED" && d.tradeStatus !== "WITHDRAWN")
    .map(d => {
      const approvedTime = d.approvedAt ? new Date(d.approvedAt).getTime() : 0;
      const elapsed = now - approvedTime;
      const ready = elapsed >= CYCLE_MS;
      const remaining = ready ? 0 : CYCLE_MS - elapsed;
      const plan = getActivePlan([d]);
      const profit = (d.amount || 0) * plan.profit;
      return {
        id: d.id,
        amount: d.amount || 0,
        profit,
        total: (d.amount || 0) + profit,
        plan,
        ready,
        remaining,
        approvedTime,
        pct: ready ? 100 : Math.min((elapsed / CYCLE_MS) * 100, 100),
      };
    })
    .sort((a, b) => b.approvedTime - a.approvedTime);

  const readyTrades = trades.filter(t => t.ready);
  const runningTrades = trades.filter(t => !t.ready);
  const totalAvailable = readyTrades.reduce((s, t) => s + t.total, 0);
  const hasReady = readyTrades.length > 0;

  const fmtTime = (ms) => {
    const s = Math.floor(ms / 1000);
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return h > 0
      ? `${h}h ${String(m).padStart(2,"0")}m ${String(sec).padStart(2,"0")}s`
      : `${m}m ${String(sec).padStart(2,"0")}s`;
  };

  const handleSubmit = async () => {
    if (!hasReady) return;
    const requestedAmt = parseFloat(amount);
    if (!requestedAmt || requestedAmt <= 0) { setError("Enter a valid amount"); return; }
    if (requestedAmt > totalAvailable) { setError(`Maximum available is $${totalAvailable.toFixed(2)}`); return; }
    if (!address.trim()) { setError("Enter a withdrawal address"); return; }
    setSubmitting(true);
    setError("");
    try {
      const { collection, addDoc } = await import("firebase/firestore");
      const now_str = new Date().toLocaleString("en-US", {
        timeZone: "Asia/Dhaka", hour: "2-digit", minute: "2-digit",
        hour12: true, month: "numeric", day: "numeric", year: "2-digit",
      });
      await addDoc(collection(db, "withdrawals"), {
        userId: user.uid,
        userEmail: user.email,
        userName: userData?.name || "",
        amount: requestedAmt,
        address: address.trim(),
        status: "PENDING",
        depositIds: readyTrades.map(t => t.id),
        tradeCount: readyTrades.length,
        createdAt: new Date().toISOString(),
        requestedAt: now_str,
      });
      setSubmitted(true);
    } catch (err) {
      setError("Failed to submit: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) return (
    <div className="max-w-md mx-auto mt-8 text-center">
      <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto mb-5">
        <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h3 className="text-white text-xl font-bold mb-2">Request Submitted</h3>
      <p className="text-gray-500 text-sm mb-2">Your withdrawal of <span className="text-white font-bold">${parseFloat(amount || totalAvailable).toFixed(2)}</span> has been sent to admin.</p>
      <p className="text-gray-600 text-xs mb-6">{readyTrades.length} trade{readyTrades.length > 1 ? "s" : ""} included</p>
      <button onClick={() => setSubmitted(false)} className="px-6 py-2.5 bg-white/5 border border-white/10 text-gray-300 text-sm rounded-xl hover:bg-white/10 transition-all">
        Back
      </button>
    </div>
  );

  return (
    <div className="max-w-lg space-y-4">

      {/* Available to Withdraw */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent border border-emerald-500/20 p-6">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <p className="text-emerald-400/70 text-xs font-semibold uppercase tracking-widest mb-1">Available to Withdraw</p>
        <p className="text-white text-3xl font-black mb-1">${totalAvailable.toFixed(2)}</p>
        <p className="text-gray-500 text-sm">
          {hasReady
            ? `${readyTrades.length} trade${readyTrades.length > 1 ? "s" : ""} completed · includes deposit + profit`
            : runningTrades.length > 0
            ? "Trades still running — check countdowns below"
            : "No active trades yet"}
        </p>
      </div>

      {/* Running Trades */}
      {runningTrades.length > 0 && (
        <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-white/[0.05]">
            <p className="text-white text-sm font-semibold">🔄 Running Trades ({runningTrades.length})</p>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {runningTrades.map(t => (
              <div key={t.id} className="px-5 py-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r ${t.plan.color} text-white`}>
                      {t.plan.emoji} {t.plan.label}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-bold text-sm">${t.amount.toFixed(2)}</p>
                    <p className="text-emerald-400 text-xs">+${t.profit.toFixed(2)} profit</p>
                  </div>
                </div>
                <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden mb-1.5">
                  <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 relative overflow-hidden transition-all duration-1000" style={{width:`${t.pct}%`}}>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_linear_infinite]" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 text-[10px]">{t.pct.toFixed(1)}% complete</span>
                  <span className="text-amber-400 font-mono text-xs font-bold">{fmtTime(t.remaining)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ready Trades */}
      {readyTrades.length > 0 && (
        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-emerald-500/10">
            <p className="text-emerald-400 text-sm font-semibold">✅ Ready to Withdraw ({readyTrades.length})</p>
          </div>
          <div className="divide-y divide-emerald-500/10">
            {readyTrades.map(t => (
              <div key={t.id} className="px-5 py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r ${t.plan.color} text-white`}>
                    {t.plan.emoji} {t.plan.label}
                  </span>
                  <span className="text-gray-500 text-xs">${t.amount.toFixed(2)} deposit</span>
                </div>
                <div className="text-right">
                  <p className="text-emerald-400 font-bold text-sm">${t.total.toFixed(2)}</p>
                  <p className="text-emerald-600 text-[10px]">+${t.profit.toFixed(2)}</p>
                </div>
              </div>
            ))}
            <div className="px-5 py-3.5 flex items-center justify-between bg-emerald-500/5">
              <span className="text-emerald-400 text-sm font-bold">Total</span>
              <span className="text-emerald-400 text-lg font-black">${totalAvailable.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Withdraw Form */}
      {hasReady && (
        <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-5 space-y-4">
          <p className="text-white font-semibold text-sm">Withdrawal Request</p>
          {error && <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">{error}</p>}

          {/* Amount input */}
          <div>
            <label className="text-gray-400 text-xs font-medium block mb-2">Amount (USD)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-bold">$</span>
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="0.00"
                min="1"
                step="0.01"
                max={totalAvailable}
                className="w-full pl-8 pr-24 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 text-sm focus:outline-none focus:border-emerald-400/50 transition-colors"
              />
              <button
                onClick={() => setAmount(totalAvailable.toFixed(2))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 transition-colors"
              >
                MAX
              </button>
            </div>
            <div className="flex items-center justify-between mt-1.5">
              <p className="text-gray-600 text-xs">Available: <span className="text-emerald-400 font-semibold">${totalAvailable.toFixed(2)}</span> from {readyTrades.length} trade{readyTrades.length > 1 ? "s" : ""}</p>
              {amount && parseFloat(amount) > 0 && parseFloat(amount) <= totalAvailable && (
                <p className="text-gray-600 text-xs">Remaining: <span className="text-gray-400">${(totalAvailable - parseFloat(amount)).toFixed(2)}</span></p>
              )}
            </div>
          </div>

          {/* Address input */}
          <div>
            <label className="text-gray-400 text-xs font-medium block mb-2">Withdrawal Address (USDT TRC20)</label>
            <input
              type="text"
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder="Your USDT TRC20 wallet address"
              className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 text-sm focus:outline-none focus:border-emerald-400/50 transition-colors font-mono text-xs"
            />
          </div>
          <button
            onClick={handleSubmit}
            disabled={submitting || !amount || parseFloat(amount) <= 0}
            className="w-full py-3.5 bg-gradient-to-r from-emerald-400 to-teal-500 text-black text-sm font-black rounded-xl hover:opacity-90 disabled:opacity-50 transition-all active:scale-95"
          >
            {submitting ? "Submitting..." : `Withdraw $${parseFloat(amount) > 0 ? parseFloat(amount).toFixed(2) : "0.00"}`}
          </button>
        </div>
      )}

      {!hasReady && trades.length === 0 && (
        <div className="bg-gray-500/5 border border-gray-500/15 rounded-2xl p-6 text-center">
          <p className="text-gray-500 text-sm">No active trades yet. Make a deposit to start trading.</p>
        </div>
      )}
    </div>
  );
}
// ── Cycle Countdown (live ticking) ────────────────────────────────────────────
function CycleCountdown({ initialMs }) {
  const [ms, setMs] = useState(initialMs);
  useEffect(() => {
    const interval = setInterval(() => {
      setMs(prev => {
        if (prev <= 1000) { clearInterval(interval); return 0; }
        return prev - 1000;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const fmt = h > 0
    ? `${h}h ${String(m).padStart(2,"0")}m ${String(sec).padStart(2,"0")}s`
    : `${m}m ${String(sec).padStart(2,"0")}s`;
  return <span className="text-amber-400 font-mono font-bold">{fmt}</span>;
}

// ── Shared content ─────────────────────────────────────────────────────────────
function MainContent({
  activeTab,
  setActiveTab,
  user,
  userData,
  editing,
  setEditing,
  formData,
  handleInputChange,
  handleUpdateProfile,
  updating,
  error,
  saveSuccess,
  deposits,
  withdrawals,
  profilePct,
  showCelebration,
  setShowCelebration,
}) {
  const STATS = [
    {
      label: "Balance",
      value: "$" + (userData?.balance || 0).toFixed(2),
      sub: userData?.balanceUpdatedAt
        ? "Updated " + userData.balanceUpdatedAt
        : "Available",
      grad: "from-amber-400 to-orange-500",
      bg: "from-amber-500/10 to-orange-500/5",
      border: "border-amber-500/15",
      d: "M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.172-.879-1.172-2.303 0-3.182.53-.399 1.19-.62 1.97-.62.78 0 1.44.221 1.97.62",
    },
    {
      label: "Deposited",
      value: "$" + (userData?.totalDeposit || 0).toFixed(2),
      sub: "All time",
      grad: "from-emerald-400 to-teal-500",
      bg: "from-emerald-500/10 to-teal-500/5",
      border: "border-emerald-500/15",
      d: "M9 8.25H7.5a2.25 2.25 0 00-2.25 2.25v9a2.25 2.25 0 002.25 2.25h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25H15M9 12l3 3m0 0l3-3m-3 3V2.25",
    },
    {
      label: "Total Withdrawn",
      value: "$" + (userData?.totalWithdrawal || 0).toFixed(2),
      sub: "All time",
      grad: "from-rose-400 to-pink-500",
      bg: "from-rose-500/10 to-pink-500/5",
      border: "border-rose-500/15",
      d: "M9 8.25H7.5a2.25 2.25 0 00-2.25 2.25v9a2.25 2.25 0 002.25 2.25h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25H15m0-3l-3-3m0 0L9 5.25M12 2.25v13.5",
    },
    {
      label: "Last Withdrawal",
      value: userData?.lastWithdrawal
        ? "$" + (userData.lastWithdrawal.amount || 0).toFixed(2)
        : "—",
      sub: userData?.lastWithdrawal?.timestamp || "No withdrawals yet",
      grad: "from-orange-400 to-red-500",
      bg: "from-orange-500/10 to-red-500/5",
      border: "border-orange-500/15",
      d: "M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z",
    },
    {
      label: "Account",
      value:
        (userData?.tradingAccount?.type || "standard")[0].toUpperCase() +
        (userData?.tradingAccount?.type || "standard").slice(1),
      sub: userData?.tradingAccount?.leverage || "1:100",
      grad: "from-violet-400 to-purple-500",
      bg: "from-violet-500/10 to-purple-500/5",
      border: "border-violet-500/15",
      d: "M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    },
  ];

  const initials = userData?.name
    ? userData.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : user?.email?.slice(0, 2).toUpperCase();

  return (
    <div>
      {/* Cycle Complete Celebration */}
      {showCelebration && (
        <CycleCelebration
          profit={(() => {
            const plan = getActivePlan(deposits);
            const approved = deposits.filter(d => d.status === "APPROVED")
              .sort((a,b) => new Date(b.approvedAt||0).getTime() - new Date(a.approvedAt||0).getTime());
            return approved.length ? (approved[0].amount || 0) * plan.profit : 0;
          })()}
          onClose={() => setShowCelebration(false)}
        />
      )}
      {saveSuccess && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl px-5 py-3.5 shadow-xl">
          <svg
            className="w-4 h-4 text-emerald-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.5 12.75l6 6 9-13.5"
            />
          </svg>
          <p className="text-emerald-400 text-sm font-medium">
            Profile updated successfully
          </p>
        </div>
      )}
      {error && (
        <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-2xl px-5 py-3.5 mb-5">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* OVERVIEW */}
      {activeTab === "overview" && (
        <div className="space-y-5">
          {/* Animated Welcome Card with Plan Badge */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent border border-amber-500/15 p-6">
            <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
            {/* Animated shimmer */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
              <div className="absolute -inset-x-full top-0 h-px bg-gradient-to-r from-transparent via-amber-400/30 to-transparent animate-[shimmer_3s_linear_infinite]" style={{animationDuration:"3s"}} />
            </div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-amber-400/70 text-xs font-semibold uppercase tracking-widest mb-1">
                  {(() => {
                    const h = new Date().getHours();
                    return h < 12 ? "☀️ Good Morning" : h < 17 ? "🌤 Good Afternoon" : h < 21 ? "🌆 Good Evening" : "🌙 Good Night";
                  })()}
                </p>
                <h2 className="text-2xl font-bold text-white mb-1">
                  {userData?.name || user?.email?.split("@")[0]} 👋
                </h2>
                <p className="text-gray-500 text-sm">Here is your portfolio overview.</p>
              </div>
              {/* Animated Plan Badge */}
              {(() => {
                const p = getActivePlan(deposits);
                return (
                  <div className={`shrink-0 relative overflow-hidden rounded-2xl bg-gradient-to-br ${p.color} p-4 min-w-[100px] text-center border ${p.border} shadow-lg`}>
                    <div className="absolute inset-0 bg-white/5 animate-pulse" style={{animationDuration:"2s"}} />
                    <div className="text-2xl mb-1">{p.emoji}</div>
                    <p className="text-white text-xs font-bold">{p.label}</p>
                    <p className="text-white/70 text-[10px]">+{p.profitStr} / cycle</p>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* ── Feature Row 1: Bonus Countdown + Daily Profit + Investor Counter ── */}
          <div className="grid grid-cols-1 gap-3">
            <BonusCycleCountdown />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <DailyProfitPulse />
              <LiveInvestorCounter />
            </div>
          </div>

          {/* ── Streak Tracker ── */}
          <StreakTracker streak={userData?.loginStreak || 0} />

          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            {STATS.map((s) => (
              <div
                key={s.label}
                className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${s.bg} border ${s.border} p-4`}
              >
                <div
                  className={`w-8 h-8 rounded-lg bg-gradient-to-br ${s.grad} flex items-center justify-center mb-3`}
                >
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.8}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d={s.d}
                    />
                  </svg>
                </div>
                <p className="text-gray-500 text-xs mb-0.5">{s.label}</p>
                <p className="text-white text-lg font-bold tabular-nums">
                  {s.label === "Balance"
                    ? <LiveTicker balance={userData?.balance || 0} plan={getActivePlan(deposits)} />
                    : s.value}
                </p>
                <p className="text-gray-600 text-xs">{s.sub}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            <Link
              href="/deposit"
              className="group flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.07] hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 group-hover:bg-emerald-500/20 transition-colors">
                <svg
                  className="w-5 h-5 text-emerald-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.8}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4.5v15m7.5-7.5h-15"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-white font-semibold text-sm">
                  Make a Deposit
                </p>
                <p className="text-gray-600 text-xs">
                  Add funds via USDT TRC20
                </p>
              </div>
              <svg
                className="w-4 h-4 text-gray-700 group-hover:text-emerald-400 transition-colors"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                />
              </svg>
            </Link>

            {/* Feature 4 — Repeat Last Deposit */}
            {(() => {
              const lastDep = deposits.find(d => d.status === "APPROVED");
              if (!lastDep) return null;
              const plan = getActivePlan([lastDep]);
              return (
                <Link
                  href={`/deposit?amount=${lastDep.amount}`}
                  className="group flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.07] hover:border-amber-500/30 hover:bg-amber-500/5 transition-all relative overflow-hidden"
                >
                  <div className="absolute top-2 right-2">
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/20">
                      QUICK
                    </span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 group-hover:bg-amber-500/20 transition-colors">
                    <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-semibold text-sm">Repeat Last Deposit</p>
                    <p className="text-amber-400/70 text-xs font-medium">${lastDep.amount} · {plan.label} (+{plan.profitStr})</p>
                  </div>
                  <svg className="w-4 h-4 text-gray-700 group-hover:text-amber-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </Link>
              );
            })()}
            <button
              onClick={() => setActiveTab("profile")}
              className="group flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.07] hover:border-violet-500/30 hover:bg-violet-500/5 transition-all text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0 group-hover:bg-violet-500/20 transition-colors">
                <svg
                  className="w-5 h-5 text-violet-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.8}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-white font-semibold text-sm">Edit Profile</p>
                <p className="text-gray-600 text-xs">Update your details</p>
              </div>
              <svg
                className="w-4 h-4 text-gray-700 group-hover:text-violet-400 transition-colors"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                />
              </svg>
            </button>
            <button
              onClick={() => setActiveTab("trading")}
              className="group flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.07] hover:border-sky-500/30 hover:bg-sky-500/5 transition-all text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center shrink-0 group-hover:bg-sky-500/20 transition-colors">
                <svg
                  className="w-5 h-5 text-sky-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.8}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-white font-semibold text-sm">
                  Trading Account
                </p>
                <p className="text-gray-600 text-xs">View account details</p>
              </div>
              <svg
                className="w-4 h-4 text-gray-700 group-hover:text-sky-400 transition-colors"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                />
              </svg>
            </button>
          </div>

          {/* ── Active Trades Overview + Earnings Estimator ── */}
          {(() => {
            const CYCLE_MS = 96 * 60 * 60 * 1000;
            const activeTrades = (deposits || [])
              .filter(d => d.status === "APPROVED" && d.tradeStatus !== "WITHDRAWN")
              .map(d => {
                const t = d.approvedAt ? new Date(d.approvedAt).getTime() : 0;
                const elapsed = Date.now() - t;
                const ready = elapsed >= CYCLE_MS;
                const plan = getActivePlan([d]);
                return {
                  id: d.id, amount: d.amount || 0, plan, ready,
                  pct: ready ? 100 : Math.min((elapsed / CYCLE_MS) * 100, 100),
                  remaining: ready ? 0 : CYCLE_MS - elapsed,
                  profit: (d.amount || 0) * plan.profit,
                };
              });
            const running = activeTrades.filter(t => !t.ready);
            const ready = activeTrades.filter(t => t.ready);
            const totalAvail = ready.reduce((s, t) => s + t.amount + t.profit, 0);
            const totalRunningDeposit = running.reduce((s, t) => s + t.amount, 0);
            const totalRunningProfit = running.reduce((s, t) => s + t.profit, 0);

            // For progress bar: show most recent running trade
            const latestRunning = running.sort((a,b) => b.pct - a.pct)[0];

            return (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Active Trades Summary */}
                <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-white text-sm font-semibold">Active Trades</p>
                    <div className="flex items-center gap-2">
                      {running.length > 0 && (
                        <span className="flex items-center gap-1 text-[10px] font-semibold text-amber-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                          {running.length} Running
                        </span>
                      )}
                      {ready.length > 0 && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                          {ready.length} Ready ✓
                        </span>
                      )}
                      {activeTrades.length === 0 && (
                        <span className="text-[10px] text-gray-600">No trades</span>
                      )}
                    </div>
                  </div>

                  {latestRunning && (
                    <>
                      <div className="h-2 bg-white/[0.05] rounded-full overflow-hidden mb-1.5">
                        <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 relative overflow-hidden transition-all duration-1000" style={{width:`${latestRunning.pct}%`}}>
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_linear_infinite]" />
                        </div>
                      </div>
                      <div className="flex justify-between text-[10px] mb-3">
                        <span className="text-gray-600">{latestRunning.pct.toFixed(1)}%</span>
                        <CycleCountdown initialMs={latestRunning.remaining} />
                      </div>
                    </>
                  )}

                  <div className="space-y-2">
                    {running.length > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-500 text-xs">{running.length} running trade{running.length > 1 ? "s" : ""}</span>
                        <span className="text-white text-xs font-semibold">${totalRunningDeposit.toFixed(2)} → +${totalRunningProfit.toFixed(2)}</span>
                      </div>
                    )}
                    {ready.length > 0 && (
                      <div className="flex justify-between">
                        <span className="text-emerald-400 text-xs">{ready.length} ready trade{ready.length > 1 ? "s" : ""}</span>
                        <span className="text-emerald-400 text-xs font-bold">${totalAvail.toFixed(2)} available</span>
                      </div>
                    )}
                    {activeTrades.length === 0 && (
                      <p className="text-gray-600 text-xs">Deposit to start your first trade</p>
                    )}
                  </div>
                </div>

                {/* Earnings Estimator — all active trades */}
                <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-5">
                  <p className="text-white text-sm font-semibold mb-4">Earnings Estimator</p>
                  {activeTrades.length === 0 ? (
                    <p className="text-gray-600 text-xs">No active trades to estimate.</p>
                  ) : (
                    <div className="space-y-2">
                      {activeTrades.slice(0,4).map(t => (
                        <div key={t.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className={`w-1.5 h-1.5 rounded-full ${t.ready ? "bg-emerald-400" : "bg-amber-400"}`} />
                            <span className="text-gray-500 text-xs">{t.plan.emoji} ${t.amount} · {t.plan.profitStr}</span>
                          </div>
                          <span className={`text-xs font-bold ${t.ready ? "text-emerald-400" : "text-gray-400"}`}>
                            +${t.profit.toFixed(2)}
                          </span>
                        </div>
                      ))}
                      {activeTrades.length > 4 && (
                        <p className="text-gray-600 text-[10px]">+{activeTrades.length - 4} more trades</p>
                      )}
                      <div className="h-px bg-white/[0.06] my-1" />
                      <div className="flex justify-between">
                        <span className="text-gray-400 text-xs font-semibold">Total Profit (all trades)</span>
                        <span className="text-amber-400 text-sm font-black">
                          +${activeTrades.reduce((s,t) => s + t.profit, 0).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          {/* ── Milestone Badges ── */}
          <MilestoneBadges deposits={deposits} totalDeposit={userData?.totalDeposit || 0} />

          {/* ── VIP Tier Progress ── */}
          <VIPTierProgress totalDeposit={userData?.totalDeposit || 0} />

          {/* ── Profit History Chart ── */}
          <ProfitChart deposits={deposits} />

          {/* ── Live Activity Feed ── */}
          <LiveActivityFeed />

          {/* ── Profile Completion Bar ── */}
          {profilePct < 100 && (
            <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-white text-sm font-semibold">Profile Completion</p>
                  <p className="text-gray-600 text-xs mt-0.5">
                    {profilePct < 60
                      ? "Complete your profile to unlock all features"
                      : profilePct < 100
                      ? "Almost there! A few more steps remaining"
                      : "Profile complete ✓"}
                  </p>
                </div>
                <span className={`text-lg font-black ${profilePct < 60 ? "text-rose-400" : profilePct < 100 ? "text-amber-400" : "text-emerald-400"}`}>
                  {profilePct}%
                </span>
              </div>
              {/* Animated progress bar */}
              <div className="h-2 bg-white/[0.05] rounded-full overflow-hidden mb-4">
                <div
                  className={`h-full rounded-full transition-all duration-1000 relative overflow-hidden ${profilePct < 60 ? "bg-gradient-to-r from-rose-500 to-pink-400" : profilePct < 100 ? "bg-gradient-to-r from-amber-400 to-orange-400" : "bg-gradient-to-r from-emerald-400 to-teal-400"}`}
                  style={{ width: `${profilePct}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_linear_infinite]" />
                </div>
              </div>
              {/* Checklist */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { label: "Full Name",    done: !!userData?.name,                  action: "profile" },
                  { label: "Phone Number", done: !!userData?.phone,                 action: "profile" },
                  { label: "Wallet Address",done: !!userData?.withdrawalAddress,    action: "profile" },
                  { label: "First Deposit",done: !!(userData?.totalDeposit > 0),    action: null },
                  { label: "Referral Code",done: !!(userData?.referralCode),        action: null },
                ].map((item) => (
                  <div
                    key={item.label}
                    onClick={() => item.action && setActiveTab(item.action)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs transition-all ${
                      item.done
                        ? "bg-emerald-500/8 border border-emerald-500/15 text-emerald-400"
                        : item.action
                        ? "bg-white/[0.03] border border-white/[0.07] text-gray-500 cursor-pointer hover:border-amber-400/30 hover:text-amber-400"
                        : "bg-white/[0.03] border border-white/[0.07] text-gray-600"
                    }`}
                  >
                    <span className="text-sm">{item.done ? "✓" : "○"}</span>
                    {item.label}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-5">
            <p className="text-gray-500 text-xs font-semibold uppercase tracking-widest mb-4">
              Account Information
            </p>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Name", value: userData?.name || "—" },
                { label: "Email", value: user?.email },
                { label: "Phone", value: userData?.phone || "—" },
                {
                  label: "Member Since",
                  value: userData?.createdAt
                    ? new Date(userData.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                    : "—",
                },
              ].map((item) => (
                <div key={item.label}>
                  <p className="text-gray-600 text-xs mb-1">{item.label}</p>
                  <p className="text-white text-sm font-medium truncate">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* PROFILE */}
      {activeTab === "profile" && (
        <div className="max-w-2xl">
          <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6">
            <div className="flex items-center gap-4 mb-6 pb-5 border-b border-white/[0.06]">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white text-lg font-bold shadow-xl shadow-violet-500/20 shrink-0">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-white font-bold truncate">
                  {userData?.name || "Your Name"}
                </h2>
                <p className="text-gray-500 text-sm truncate">{user?.email}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span className="text-emerald-400 text-xs">
                    {userData?.status || "active"}
                  </span>
                </div>
              </div>
              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="shrink-0 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-300 hover:bg-white/10 transition-all"
                >
                  Edit
                </button>
              )}
            </div>
            {editing ? (
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                {[
                  {
                    label: "Full Name",
                    name: "name",
                    type: "text",
                    placeholder: "Your full name",
                    req: true,
                  },
                  {
                    label: "Phone Number",
                    name: "phone",
                    type: "tel",
                    placeholder: "+1 234 567 8900",
                  },
                  {
                    label: "Withdrawal Address",
                    name: "withdrawalAddress",
                    type: "text",
                    placeholder: "Your wallet address",
                  },
                ].map((f) => (
                  <div key={f.name}>
                    <label className="text-gray-400 text-xs font-medium block mb-2">
                      {f.label}
                    </label>
                    <input
                      type={f.type}
                      name={f.name}
                      value={formData[f.name]}
                      onChange={handleInputChange}
                      placeholder={f.placeholder}
                      required={f.req}
                      className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 text-sm focus:outline-none focus:border-amber-400/50 transition-colors"
                    />
                  </div>
                ))}
                <div className="flex gap-3 pt-1">
                  <button
                    type="submit"
                    disabled={updating}
                    className="px-6 py-3 bg-gradient-to-r from-amber-400 to-orange-500 text-black text-sm font-bold rounded-xl hover:opacity-90 disabled:opacity-50 transition-all"
                  >
                    {updating ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="px-6 py-3 bg-white/5 border border-white/10 text-gray-300 text-sm rounded-xl hover:bg-white/10 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-1">
                {[
                  { label: "Full Name", value: userData?.name || "—" },
                  { label: "Email", value: user?.email },
                  { label: "Phone", value: userData?.phone || "—" },
                  {
                    label: "Member Since",
                    value: userData?.createdAt
                      ? new Date(userData.createdAt).toLocaleDateString(
                          "en-US",
                          { year: "numeric", month: "long", day: "numeric" },
                        )
                      : "—",
                  },
                  {
                    label: "Withdrawal Address",
                    value: userData?.withdrawalAddress || "Not set",
                    mono: true,
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between py-3.5 border-b border-white/[0.05] last:border-0"
                  >
                    <p className="text-gray-500 text-sm shrink-0">
                      {item.label}
                    </p>
                    <p
                      className={`text-white text-sm font-medium max-w-[55%] text-right truncate${item.mono ? " font-mono text-xs" : ""}`}
                    >
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* WITHDRAW */}
      {activeTab === "withdraw" && (
        <div className="space-y-5">
          <WithdrawTab user={user} userData={userData} deposits={deposits} />

          {/* ── Withdrawal Request History ── */}
          {withdrawals && withdrawals.length > 0 && (
            <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
                <p className="text-white font-semibold text-sm">Withdrawal Requests</p>
                <span className="text-gray-600 text-xs">{withdrawals.length} request{withdrawals.length > 1 ? "s" : ""}</span>
              </div>
              <div className="divide-y divide-white/[0.04]">
                {withdrawals.map((w) => {
                  const isPending   = w.status === "PENDING";
                  const isApproved  = w.status === "APPROVED" || w.status === "COMPLETED";
                  const isRejected  = w.status === "REJECTED";
                  return (
                    <div key={w.id} className="px-5 py-4">
                      <div className="flex items-center gap-4 mb-3">
                        {/* Animated status icon */}
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 relative overflow-hidden ${isPending ? "bg-amber-500/15" : isApproved ? "bg-emerald-500/15" : "bg-rose-500/15"}`}>
                          {isPending && <div className="absolute inset-0 bg-amber-400/10 animate-pulse" />}
                          <svg className={`w-5 h-5 relative z-10 ${isPending ? "text-amber-400" : isApproved ? "text-emerald-400" : "text-rose-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            {isApproved
                              ? <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              : isRejected
                              ? <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              : <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                            }
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <p className="text-white font-bold">${(w.amount || 0).toFixed(2)}</p>
                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${isPending ? "bg-amber-500/15 text-amber-400" : isApproved ? "bg-emerald-500/15 text-emerald-400" : "bg-rose-500/15 text-rose-400"}`}>
                              {w.status}
                            </span>
                          </div>
                          <p className="text-gray-600 text-xs truncate font-mono">{w.address || "—"}</p>
                          <p className="text-gray-700 text-[10px] mt-0.5">{w.requestedAt || w.createdAt?.slice(0,10) || "—"}</p>
                        </div>
                      </div>

                      {/* Animated status pipeline */}
                      <div className="flex items-center gap-1">
                        {["Requested", "Processing", "Completed"].map((step, i) => {
                          const stepDone = isApproved ? true : isPending ? i === 0 : false;
                          const stepActive = isPending && i === 1;
                          return (
                            <div key={step} className="flex items-center gap-1 flex-1">
                              <div className={`flex-1 flex flex-col items-center gap-1`}>
                                <div className={`w-full h-1 rounded-full transition-all duration-700 ${stepDone ? "bg-emerald-400" : stepActive ? "bg-amber-400/50" : "bg-white/[0.06]"} relative overflow-hidden`}>
                                  {stepActive && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/60 to-transparent animate-[shimmer_1.5s_linear_infinite]" />}
                                </div>
                                <span className={`text-[9px] font-medium ${stepDone ? "text-emerald-400" : stepActive ? "text-amber-400" : "text-gray-700"}`}>{step}</span>
                              </div>
                              {i < 2 && <div className={`w-1 h-1 rounded-full mb-3 shrink-0 ${stepDone ? "bg-emerald-400" : "bg-white/[0.08]"}`} />}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* REFERRAL */}
      {activeTab === "referral" && (
        <div className="max-w-2xl space-y-5">
          {/* Referral code card */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/15 p-6">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
            <p className="text-amber-400/70 text-xs font-semibold uppercase tracking-widest mb-3">
              Your Referral Code
            </p>
            <div className="flex items-center gap-3 mb-4">
              <p className="text-white text-3xl font-bold tracking-widest font-mono">
                {userData?.referralCode || "—"}
              </p>
            </div>
            <p className="text-gray-500 text-sm mb-5">
              Share your unique link and earn rewards when friends join.
            </p>
            <div className="flex items-center gap-2 p-3 bg-white/[0.05] border border-white/10 rounded-xl mb-4">
              <p className="text-gray-400 text-xs font-mono flex-1 truncate">
                {typeof window !== "undefined"
                  ? window.location.origin
                  : "https://yoursite.com"}
                /signup?ref={userData?.referralCode}&uid=...
              </p>
              <button
                onClick={() => {
                  const link = `${window.location.origin}/signup?ref=${userData?.referralCode}&uid=${user?.uid}`;
                  navigator.clipboard.writeText(link);
                }}
                className="shrink-0 px-3 py-1.5 bg-amber-500/15 text-amber-400 border border-amber-500/20 text-xs font-medium rounded-lg hover:bg-amber-500/25 transition-colors"
              >
                Copy Link
              </button>
            </div>

            {/* Share buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  const link = `${window.location.origin}/signup?ref=${userData?.referralCode}&uid=${user?.uid}`;
                  const msg = encodeURIComponent(`🚀 Join Vantis Capital and start earning with algorithmic trading!\n\nUse my referral link: ${link}`);
                  window.open(`https://wa.me/?text=${msg}`, "_blank");
                }}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#25D366]/10 border border-[#25D366]/20 text-[#25D366] text-xs font-semibold hover:bg-[#25D366]/20 transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp
              </button>
              <button
                onClick={() => {
                  const link = `${window.location.origin}/signup?ref=${userData?.referralCode}&uid=${user?.uid}`;
                  const msg = encodeURIComponent(`🚀 Join Vantis Capital and start earning with algorithmic trading!\n\nUse my referral link: ${link}`);
                  window.open(`https://t.me/share/url?url=${encodeURIComponent(link)}&text=${msg}`, "_blank");
                }}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#229ED9]/10 border border-[#229ED9]/20 text-[#229ED9] text-xs font-semibold hover:bg-[#229ED9]/20 transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.96 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                </svg>
                Telegram
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-violet-500/10 border border-violet-500/15 rounded-2xl p-5">
              <p className="text-violet-400/70 text-xs mb-1">Total Referrals</p>
              <p className="text-violet-400 text-3xl font-bold">
                {userData?.referrals?.length || 0}
              </p>
            </div>
            <div className="bg-emerald-500/10 border border-emerald-500/15 rounded-2xl p-5">
              <p className="text-emerald-400/70 text-xs mb-1">
                Total Commission
              </p>
              <p className="text-emerald-400 text-3xl font-bold">
                ${(userData?.totalReferralCommission || 0).toFixed(2)}
              </p>
            </div>
            <div className="bg-amber-500/10 border border-amber-500/15 rounded-2xl p-5">
              <p className="text-amber-400/70 text-xs mb-1">Referred By</p>
              <p className="text-amber-400 text-sm font-bold mt-1">
                {userData?.referredBy || "—"}
              </p>
            </div>
          </div>

          {/* Referral list */}
          <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-white/[0.06]">
              <p className="text-white font-semibold text-sm">
                People You Referred
              </p>
            </div>
            {!userData?.referrals?.length ? (
              <div className="py-12 text-center">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-3">
                  <svg
                    className="w-6 h-6 text-gray-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
                    />
                  </svg>
                </div>
                <p className="text-gray-600 text-sm">No referrals yet</p>
                <p className="text-gray-700 text-xs mt-1">
                  Share your link to get started
                </p>
              </div>
            ) : (
              <div className="divide-y divide-white/[0.05]">
                {userData.referrals.map((r, i) => (
                  <div key={i} className="flex items-center gap-3 px-5 py-3.5">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {r.name
                        ? r.name.slice(0, 2).toUpperCase()
                        : r.email?.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">
                        {r.name || "—"}
                      </p>
                      <p className="text-gray-500 text-xs truncate">
                        {r.email}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-gray-600 text-xs">
                        {r.joinedAt
                          ? new Date(r.joinedAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : "—"}
                      </p>
                      {r.commission > 0 && (
                        <p className="text-emerald-400 text-xs font-bold mt-0.5">
                          +${r.commission?.toFixed(2)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TRADING */}
      {activeTab === "trading" && (
        <div className="max-w-2xl space-y-4">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-sky-500/10 to-blue-500/5 border border-sky-500/15 p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-500/25 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-sky-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.8}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941"
                  />
                </svg>
              </div>
              <div>
                <p className="text-white font-bold">Trading Account</p>
                <p className="text-gray-500 text-xs">
                  Your active trading profile
                </p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                {
                  label: "Type",
                  value:
                    (userData?.tradingAccount?.type ||
                      "standard")[0].toUpperCase() +
                    (userData?.tradingAccount?.type || "standard").slice(1),
                },
                {
                  label: "Leverage",
                  value: userData?.tradingAccount?.leverage || "1:100",
                },
                {
                  label: "Balance",
                  value:
                    "$" + (userData?.tradingAccount?.balance || 0).toFixed(2),
                  sub: userData?.withdrawalUpdatedAt
                    ? "Updated " + userData.withdrawalUpdatedAt
                    : undefined,
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="bg-white/5 rounded-xl p-4 border border-white/[0.07]"
                >
                  <p className="text-gray-500 text-xs mb-1">{item.label}</p>
                  <p className="text-white font-bold">{item.value}</p>
                  {item.sub && (
                    <p className="text-gray-600 text-[10px] mt-1 truncate">
                      {item.sub}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-emerald-500/5 border border-emerald-500/15 rounded-2xl">
            <div className="w-9 h-9 rounded-full bg-emerald-500/15 flex items-center justify-center shrink-0">
              <svg
                className="w-4 h-4 text-emerald-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <p className="text-emerald-400 font-semibold text-sm">
                Account Active
              </p>
              <p className="text-gray-500 text-xs">
                Your account is in good standing
              </p>
            </div>
          </div>

          {/* ── Transaction History ── */}
          <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
              <p className="text-white font-semibold text-sm">Transaction History</p>
              <span className="text-gray-600 text-xs">{deposits.length} records</span>
            </div>
            {deposits.length === 0 ? (
              <div className="py-12 text-center">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                  </svg>
                </div>
                <p className="text-gray-600 text-sm">No transactions yet</p>
              </div>
            ) : (
              <div className="divide-y divide-white/[0.04]">
                {deposits.map((dep) => {
                  const isApproved = dep.status === "APPROVED";
                  const isRejected = dep.status === "REJECTED";
                  const isPending = dep.status === "PENDING";
                  return (
                    <div key={dep.id} className="flex items-center gap-4 px-5 py-4">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isApproved ? "bg-emerald-500/15" : isRejected ? "bg-rose-500/15" : "bg-amber-500/15"}`}>
                        <svg className={`w-4 h-4 ${isApproved ? "text-emerald-400" : isRejected ? "text-rose-400" : "text-amber-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          {isApproved ? (
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 8.25H7.5a2.25 2.25 0 00-2.25 2.25v9a2.25 2.25 0 002.25 2.25h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25H15M9 12l3 3m0 0l3-3m-3 3V2.25" />
                          ) : isRejected ? (
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                          )}
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-semibold">Deposit</p>
                        <p className="text-gray-600 text-xs truncate">
                          {dep.createdAt
                            ? new Date(dep.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                            : "—"}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-white font-bold text-sm">${(dep.amount || 0).toFixed(2)}</p>
                        <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full mt-0.5 ${isApproved ? "bg-emerald-500/15 text-emerald-400" : isRejected ? "bg-rose-500/15 text-rose-400" : "bg-amber-500/15 text-amber-400"}`}>
                          {dep.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    withdrawalAddress: "",
  });
  const [deposits, setDeposits] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [profilePct, setProfilePct] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const celebrationShownRef = useRef(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        await loadUserData(user.uid);
        await fetchDeposits(user.uid);
        await fetchWithdrawals(user.uid);
      } else {
        router.push("/login");
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  // Check if cycle just completed — show celebration once
  useEffect(() => {
    if (!deposits.length || celebrationShownRef.current) return;
    const cycleMs = 96 * 60 * 60 * 1000;
    const approved = deposits.filter(d => d.status === "APPROVED")
      .sort((a, b) => new Date(b.approvedAt || 0).getTime() - new Date(a.approvedAt || 0).getTime());
    if (!approved.length) return;
    const elapsed = Date.now() - new Date(approved[0].approvedAt || 0).getTime();
    const sessionKey = `vantis_celebrated_${approved[0].id}`;
    if (elapsed >= cycleMs && !sessionStorage.getItem(sessionKey)) {
      celebrationShownRef.current = true;
      sessionStorage.setItem(sessionKey, "1");
      setTimeout(() => setShowCelebration(true), 800);
    }
  }, [deposits]);

  const fetchDeposits = async (userId) => {
    try {
      const { collection, query, where, getDocs } =
        await import("firebase/firestore");
      // No orderBy — avoids Firestore composite index requirement
      const q = query(
        collection(db, "deposits"),
        where("userId", "==", userId),
      );
      const snap = await getDocs(q);
      const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      // Sort client-side: newest first
      docs.sort((a, b) => {
        const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return tb - ta;
      });
      setDeposits(docs);
    } catch (e) {
      console.error("fetch deposits error:", e);
    }
  };

  const fetchWithdrawals = async (userId) => {
    try {
      const { collection, query, where, getDocs } = await import("firebase/firestore");
      const q = query(collection(db, "withdrawals"), where("userId", "==", userId));
      const snap = await getDocs(q);
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      docs.sort((a, b) => {
        const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return tb - ta;
      });
      setWithdrawals(docs);
    } catch (e) {
      console.error("fetch withdrawals error:", e);
    }
  };

  const loadUserData = async (userId) => {
    try {
      const docSnap = await getDoc(doc(db, "users", userId));
      if (docSnap.exists()) {
        const data = docSnap.data();
        setFormData({
          name: data.name || "",
          phone: data.phone || "",
          withdrawalAddress: data.withdrawalAddress || "",
        });
        // Calculate profile completion
        const fields = [
          !!data.name,
          !!data.phone,
          !!data.withdrawalAddress,
          !!(data.totalDeposit > 0),
          !!(data.referralCode),
        ];
        setProfilePct(Math.round((fields.filter(Boolean).length / fields.length) * 100));

        // ── Streak tracking ──
        const todayStr = new Date().toISOString().slice(0,10); // "2026-03-09"
        const lastLogin = data.lastLoginDate || "";
        const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0,10);
        let newStreak = data.loginStreak || 0;
        if (lastLogin !== todayStr) {
          newStreak = lastLogin === yesterday ? newStreak + 1 : 1;
          await updateDoc(doc(db, "users", userId), {
            lastLoginDate: todayStr,
            loginStreak: newStreak,
          });
          data.loginStreak = newStreak;
          data.lastLoginDate = todayStr;
        }
        setUserData({...data});

        // Clear balanceUpdated flag silently (no modal)
        if (data.balanceUpdated === true || data.withdrawalUpdated === true) {
          await updateDoc(doc(db, "users", userId), {
            balanceUpdated: false,
            withdrawalUpdated: false,
          });
        }
      } else {
        setUserData({
          name: "",
          phone: "",
          withdrawalAddress: "",
          balance: 0,
          totalDeposit: 0,
          totalWithdrawal: 0,
          status: "active",
          createdAt: new Date().toISOString(),
          tradingAccount: { type: "standard", leverage: "1:100", balance: 0 },
        });
      }
    } catch (err) {
      setError("Failed to load data.");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (e) {}
  };
  const handleInputChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setError("");
    try {
      await updateDoc(doc(db, "users", user.uid), {
        name: formData.name,
        phone: formData.phone,
        withdrawalAddress: formData.withdrawalAddress,
        updatedAt: new Date().toISOString(),
      });
      await loadUserData(user.uid);
      setEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setError("Failed to update: " + err.message);
    } finally {
      setUpdating(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-[#060810] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 animate-pulse flex items-center justify-center">
            <svg
              className="w-6 h-6 text-black"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941"
              />
            </svg>
          </div>
          <p className="text-gray-500 text-sm">Loading dashboard...</p>
        </div>
      </div>
    );

  const initials = userData?.name
    ? userData.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : user?.email?.slice(0, 2).toUpperCase();

  const NAV = [
    {
      key: "overview",
      label: "Overview",
      d: "M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z",
    },
    {
      key: "profile",
      label: "Profile",
      d: "M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z",
    },
    {
      key: "trading",
      label: "Trading",
      d: "M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941",
    },
    {
      key: "referral",
      label: "Referral",
      d: "M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z",
    },
    {
      key: "withdraw",
      label: "Withdraw",
      d: "M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z",
    },
  ];

  const contentProps = {
    activeTab,
    setActiveTab,
    user,
    userData,
    editing,
    setEditing,
    formData,
    handleInputChange,
    handleUpdateProfile,
    updating,
    error,
    saveSuccess,
    deposits,
    withdrawals,
    profilePct,
    showCelebration,
    setShowCelebration,
  };

  return (
    <div className="min-h-screen bg-[#060810] text-white">
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/4 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-violet-500/4 rounded-full blur-[100px]" />
      </div>

      {/* DESKTOP */}
      <div className="hidden lg:flex h-screen overflow-hidden relative z-10">
        <aside className="w-64 shrink-0 h-screen flex flex-col bg-white/[0.02] border-r border-white/[0.06]">
          <div className="px-6 py-6 border-b border-white/[0.06] shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
                <svg
                  className="w-5 h-5 text-black"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941"
                  />
                </svg>
              </div>
              <div>
                <p className="text-white text-sm font-bold">Vantis Capital</p>
                <p className="text-gray-600 text-[10px]">Investment Platform</p>
              </div>
            </div>
          </div>
          <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
            {NAV.map((item) => (
              <button
                key={item.key}
                onClick={() => setActiveTab(item.key)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === item.key ? "bg-white/8 text-white border border-white/10" : "text-gray-500 hover:text-gray-300 hover:bg-white/4"}`}
              >
                <svg
                  className="w-4 h-4 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.8}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d={item.d}
                  />
                </svg>
                {item.label}
                {activeTab === item.key && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-amber-400" />
                )}
              </button>
            ))}
            <div className="pt-2 border-t border-white/[0.06] space-y-1 mt-1">
              <Link
                href="/deposit"
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-emerald-400 hover:bg-emerald-500/8 transition-all"
              >
                <svg
                  className="w-4 h-4 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.8}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4.5v15m7.5-7.5h-15"
                  />
                </svg>
                Make a Deposit
              </Link>
              {user?.email === ADMIN_EMAIL && (
                <Link
                  href="/admin"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-gray-600 hover:text-gray-300 hover:bg-white/4 transition-all"
                >
                  <svg
                    className="w-4 h-4 shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.8}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.108-1.204l-.526-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  Admin Panel
                </Link>
              )}
            </div>
          </nav>
          <div className="px-3 py-4 border-t border-white/[0.06] shrink-0">
            <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-white/[0.03] mb-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-xs font-semibold truncate">
                  {userData?.name || "User"}
                </p>
                <p className="text-gray-600 text-[10px] truncate">
                  {user?.email}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-gray-500 hover:text-red-400 hover:bg-red-500/8 transition-all"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.8}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
                />
              </svg>
              Sign Out
            </button>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto">
          <header className="sticky top-0 z-10 bg-[#060810]/90 backdrop-blur-xl border-b border-white/[0.06] px-8 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-white font-bold text-lg">
                {activeTab === "overview"
                  ? "Dashboard Overview"
                  : activeTab === "profile"
                    ? "My Profile"
                    : "Trading Account"}
              </h1>
              <p className="text-gray-600 text-xs">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-400 text-xs font-medium capitalize">
                {userData?.status || "active"}
              </span>
            </div>
          </header>
          <div className="px-8 py-8">
            <MainContent {...contentProps} />
          </div>
        </main>
      </div>

      {/* MOBILE */}
      <div className="lg:hidden flex flex-col min-h-screen relative z-10">
        <header className="sticky top-0 z-20 bg-[#060810]/95 backdrop-blur-xl border-b border-white/[0.06] px-4 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
              <svg
                className="w-4 h-4 text-black"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941"
                />
              </svg>
            </div>
            <span className="text-white text-sm font-bold">Vantis Capital</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-400 text-[10px] font-medium">
                Active
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="text-gray-500 hover:text-red-400 transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.8}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
                />
              </svg>
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto px-4 py-5 pb-24">
          <MainContent {...contentProps} />
        </main>
        <nav className="fixed bottom-0 left-0 right-0 z-20 bg-[#0D1117]/95 backdrop-blur-xl border-t border-white/[0.08] flex items-center justify-around px-2 py-2">
          {NAV.filter(item => user?.email === ADMIN_EMAIL ? item.key !== "withdraw" : true).map((item) => (
            <button
              key={item.key}
              onClick={() => setActiveTab(item.key)}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all ${activeTab === item.key ? "text-amber-400" : "text-gray-600"}`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d={item.d} />
              </svg>
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          ))}
          {user?.email !== ADMIN_EMAIL && (
            <Link
              href="/deposit"
              className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl text-emerald-400"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              <span className="text-[10px] font-medium">Deposit</span>
            </Link>
          )}
          {user?.email === ADMIN_EMAIL && (
            <Link
              href="/admin"
              className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl text-amber-400"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
              <span className="text-[10px] font-medium">Admin</span>
            </Link>
          )}
        </nav>
      </div>
    </div>
  );
}