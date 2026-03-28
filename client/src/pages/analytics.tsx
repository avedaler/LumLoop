import { useState } from "react";
import {
  TrendingUp, TrendingDown, Heart, Moon, Brain, Zap,
  Activity, Pill, Sparkles, ChevronRight, Dna
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip,
  BarChart, Bar
} from "recharts";

const sleepData = [
  { day: "Mon", hours: 7.2, quality: 85 },
  { day: "Tue", hours: 6.8, quality: 78 },
  { day: "Wed", hours: 7.5, quality: 92 },
  { day: "Thu", hours: 7.1, quality: 88 },
  { day: "Fri", hours: 6.5, quality: 72 },
  { day: "Sat", hours: 8.1, quality: 95 },
  { day: "Sun", hours: 7.8, quality: 90 },
];

const hrvData = [
  { day: "Mon", hrv: 52 },
  { day: "Tue", hrv: 48 },
  { day: "Wed", hrv: 58 },
  { day: "Thu", hrv: 62 },
  { day: "Fri", hrv: 55 },
  { day: "Sat", hrv: 68 },
  { day: "Sun", hrv: 65 },
];

const stressData = [
  { day: "Mon", level: 65 },
  { day: "Tue", level: 72 },
  { day: "Wed", level: 48 },
  { day: "Thu", level: 42 },
  { day: "Fri", level: 58 },
  { day: "Sat", level: 32 },
  { day: "Sun", level: 35 },
];

const adherenceData = [
  { day: "Mon", pct: 83 },
  { day: "Tue", pct: 100 },
  { day: "Wed", pct: 67 },
  { day: "Thu", pct: 100 },
  { day: "Fri", pct: 83 },
  { day: "Sat", pct: 100 },
  { day: "Sun", pct: 67 },
];

const biomarkers = [
  { name: "Cortisol", value: "14.2 μg/dL", trend: "down", status: "Improving", color: "text-emerald-400" },
  { name: "Vitamin D", value: "48 ng/mL", trend: "up", status: "Optimal", color: "text-amber-400" },
  { name: "hs-CRP", value: "0.8 mg/L", trend: "down", status: "Low risk", color: "text-emerald-400" },
  { name: "Testosterone", value: "680 ng/dL", trend: "up", status: "Healthy", color: "text-blue-400" },
  { name: "Fasting Glucose", value: "88 mg/dL", trend: "down", status: "Optimal", color: "text-emerald-400" },
  { name: "HbA1c", value: "5.1%", trend: "down", status: "Excellent", color: "text-emerald-400" },
];

const timeframes = ["7D", "30D", "90D", "1Y"];

export default function Analytics() {
  const [timeframe, setTimeframe] = useState("7D");

  return (
    <div className="min-h-screen bg-background">
      <header className="px-5 pt-14 pb-2">
        <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">
          Health Intelligence
        </p>
        <h1 className="text-lg font-semibold text-foreground tracking-tight mt-1">
          Progress Analytics
        </h1>
      </header>

      <div className="px-5 pb-8 stagger-children">
        {/* Biological Age Hero */}
        <div className="bg-gradient-to-br from-primary/8 via-card to-card border border-primary/15 rounded-2xl p-4 mb-5">
          <div className="flex items-center gap-1.5 mb-2">
            <Dna size={12} className="text-primary" />
            <span className="text-[10px] text-primary uppercase tracking-widest font-semibold">Biological Wellness Age Trend</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-mono font-bold text-foreground">34.2</span>
                <span className="text-sm text-muted-foreground">years</span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5">Chronological: 41</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 justify-end">
                <TrendingDown size={14} className="text-emerald-400" />
                <span className="text-sm font-mono font-bold text-emerald-400">-2.3 yrs</span>
              </div>
              <p className="text-[10px] text-emerald-400">since joining LumLoop</p>
            </div>
          </div>
          <div className="grid grid-cols-5 gap-1.5 mt-3 pt-3 border-t border-border/20">
            {[
              { label: "Cardio", val: "32", d: "-4" },
              { label: "Sleep", val: "35", d: "-2" },
              { label: "Metabolic", val: "36", d: "-1.5" },
              { label: "Immune", val: "33", d: "-3" },
              { label: "Muscle", val: "35", d: "-1" },
            ].map((d) => (
              <div key={d.label} className="text-center">
                <p className="text-[8px] text-muted-foreground uppercase">{d.label}</p>
                <p className="text-xs font-mono font-semibold text-foreground">{d.val}</p>
                <p className="text-[8px] text-emerald-400 font-mono">{d.d}yr</p>
              </div>
            ))}
          </div>
        </div>

        {/* Timeframe selector */}
        <div className="flex gap-1 mb-5 bg-secondary/50 rounded-xl p-1">
          {timeframes.map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`flex-1 py-1.5 rounded-lg text-[11px] font-semibold transition-colors ${
                timeframe === tf
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground/70"
              }`}
              data-testid={`tf-${tf.toLowerCase()}`}
            >
              {tf}
            </button>
          ))}
        </div>

        {/* AI Insight */}
        <div className="bg-primary/5 border border-primary/10 rounded-2xl p-3.5 flex items-start gap-3 mb-5">
          <Sparkles size={14} className="text-primary mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-medium text-foreground">Weekly Analysis</p>
            <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">
              HRV improved 15% since adding evening Ashwagandha. Sleep quality correlates strongly with your supplement adherence on those days. Cortisol trending down 22% over 30 days.
            </p>
          </div>
        </div>

        {/* Sleep Quality Chart */}
        <div className="bg-card border border-border/50 rounded-2xl p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Moon size={14} className="text-blue-400" />
              <h3 className="text-xs font-semibold text-foreground">Sleep Quality</h3>
            </div>
            <div className="flex items-center gap-1.5">
              <TrendingUp size={12} className="text-emerald-400" />
              <span className="text-[10px] font-mono text-emerald-400">+8%</span>
            </div>
          </div>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sleepData}>
                <defs>
                  <linearGradient id="sleepGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(200 40% 55%)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="hsl(200 40% 55%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" tick={{ fontSize: 9, fill: "hsl(40 6% 55%)" }} axisLine={false} tickLine={false} />
                <YAxis hide domain={[60, 100]} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(220 8% 12%)",
                    border: "1px solid hsl(220 6% 18%)",
                    borderRadius: "8px",
                    fontSize: "11px",
                    color: "hsl(40 10% 92%)",
                  }}
                />
                <Area type="monotone" dataKey="quality" stroke="hsl(200 40% 55%)" fill="url(#sleepGrad)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* HRV + Stress Row */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* HRV */}
          <div className="bg-card border border-border/50 rounded-2xl p-3">
            <div className="flex items-center gap-1.5 mb-2">
              <Heart size={12} className="text-rose-400" />
              <span className="text-[10px] font-semibold text-foreground">HRV</span>
              <TrendingUp size={10} className="text-emerald-400 ml-auto" />
            </div>
            <div className="h-20">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={hrvData}>
                  <defs>
                    <linearGradient id="hrvGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(0 50% 55%)" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="hsl(0 50% 55%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="hrv" stroke="hsl(350 50% 60%)" fill="url(#hrvGrad)" strokeWidth={1.5} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <p className="text-center font-mono text-sm font-semibold text-foreground">68 ms</p>
            <p className="text-center text-[9px] text-emerald-400">+15% this week</p>
          </div>

          {/* Stress Recovery */}
          <div className="bg-card border border-border/50 rounded-2xl p-3">
            <div className="flex items-center gap-1.5 mb-2">
              <Brain size={12} className="text-purple-400" />
              <span className="text-[10px] font-semibold text-foreground">Stress</span>
              <TrendingDown size={10} className="text-emerald-400 ml-auto" />
            </div>
            <div className="h-20">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stressData}>
                  <Bar dataKey="level" fill="hsl(280 30% 50%)" radius={[2, 2, 0, 0]} opacity={0.6} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-center font-mono text-sm font-semibold text-foreground">Low</p>
            <p className="text-center text-[9px] text-emerald-400">-22% vs last week</p>
          </div>
        </div>

        {/* Supplement Adherence */}
        <div className="bg-card border border-border/50 rounded-2xl p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Pill size={14} className="text-emerald-400" />
              <h3 className="text-xs font-semibold text-foreground">Supplement Adherence</h3>
            </div>
            <span className="text-xs font-mono text-foreground">86%</span>
          </div>
          <div className="h-16">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={adherenceData}>
                <XAxis dataKey="day" tick={{ fontSize: 9, fill: "hsl(40 6% 55%)" }} axisLine={false} tickLine={false} />
                <Bar dataKey="pct" fill="hsl(152 30% 48%)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Biomarkers */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-foreground">Biomarker Insights</h3>
            <span className="text-[10px] text-muted-foreground">Last panel: Mar 10</span>
          </div>
          <div className="space-y-2">
            {biomarkers.map((b) => (
              <div
                key={b.name}
                className="bg-card border border-border/50 rounded-xl px-3.5 py-2.5 flex items-center gap-3"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground">{b.name}</p>
                  <p className="text-[10px] text-muted-foreground">{b.status}</p>
                </div>
                <span className="font-mono text-xs font-semibold text-foreground">{b.value}</span>
                {b.trend === "up" ? (
                  <TrendingUp size={12} className={b.color} />
                ) : (
                  <TrendingDown size={12} className={b.color} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
