import { useQuery } from "@tanstack/react-query";
import { useUser } from "../App";
import { apiRequest } from "../lib/queryClient";
import { Dna, TrendingUp, TrendingDown, Heart, Moon, Brain, Zap, Pill, Sparkles, Activity } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import type { DailyScore } from "@shared/schema";

export default function Insights() {
  const { user } = useUser();
  const userId = user?.id || 1;

  const { data: scores = [] } = useQuery<DailyScore[]>({
    queryKey: ["/api/scores", userId],
    queryFn: async () => { const r = await apiRequest("GET", `/api/scores/${userId}?limit=7`); return r.json(); },
  });

  const chartData = [...scores].reverse().map(s => ({
    day: new Date(s.date).toLocaleDateString("en", { weekday: "short" }),
    sleep: s.sleepScore,
    hrv: s.hrv,
    stress: s.stressLevel === "High" ? 70 : s.stressLevel === "Medium" ? 45 : 25,
    bioAge: s.bioAge,
  }));

  const latest = scores[0];
  const oldest = scores[scores.length - 1];
  const bioAgeDelta = latest && oldest ? (oldest.bioAge || 34.5) - (latest.bioAge || 34.2) : 0.3;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1200px] mx-auto px-6 py-8">
        {/* Page header */}
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-foreground tracking-tight">Insights</h1>
          <p className="text-xs text-muted-foreground mt-1">Your health intelligence</p>
        </div>

        {/* Top row: Bio Age Trend + Weekly Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          {/* Bio Age Trend — wide chart */}
          <div className="lg:col-span-2 bg-card border border-primary/10 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-1.5">
                <Dna size={14} className="text-primary" />
                <span className="text-sm font-semibold text-foreground">Bio Age Trend</span>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 justify-end">
                  <TrendingDown size={14} className="text-emerald-400" />
                  <span className="text-sm font-mono font-bold text-emerald-400">-{bioAgeDelta.toFixed(1)}yr</span>
                </div>
                <p className="text-[10px] text-emerald-400/70">this week</p>
              </div>
            </div>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="font-serif text-3xl font-medium text-foreground">{latest?.bioAge?.toFixed(1) || "34.2"}</span>
              <span className="text-sm text-muted-foreground">years</span>
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="bioGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(152 26% 46%)" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="hsl(152 26% 46%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(225 8% 13%)" />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: "hsl(38 6% 48%)" }} axisLine={false} tickLine={false} />
                  <YAxis hide domain={["dataMin - 1", "dataMax + 1"]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "hsl(225 10% 9%)", border: "1px solid hsl(225 8% 14%)", borderRadius: 8, fontSize: 12 }}
                    labelStyle={{ color: "hsl(38 14% 90%)" }}
                  />
                  <Area type="monotone" dataKey="bioAge" stroke="hsl(152 26% 46%)" fill="url(#bioGrad)" strokeWidth={2} dot={{ fill: "hsl(152 26% 46%)", r: 3 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Weekly AI Summary */}
          <div className="bg-card border border-primary/10 rounded-xl p-5 flex flex-col">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={14} className="text-primary" />
              <span className="text-sm font-semibold text-foreground">Weekly Analysis</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed flex-1">
              HRV improved 15% since adding evening Ashwagandha. Sleep quality correlates strongly with supplement adherence. Cortisol trending down 22% over 30 days.
            </p>
            {/* Organ breakdown */}
            <div className="grid grid-cols-5 gap-2 pt-4 mt-4 border-t border-border/20">
              {[
                { label: "Cardio", val: latest?.cardioAge?.toFixed(0) || "32", icon: Heart, color: "text-rose-400" },
                { label: "Sleep", val: latest?.sleepAge?.toFixed(0) || "35", icon: Moon, color: "text-blue-400" },
                { label: "Metabolic", val: latest?.metabolicAge?.toFixed(0) || "36", icon: Activity, color: "text-amber-400" },
                { label: "Immune", val: latest?.immuneAge?.toFixed(0) || "33", icon: Zap, color: "text-emerald-400" },
                { label: "Muscle", val: latest?.muscleAge?.toFixed(0) || "35", icon: Brain, color: "text-purple-400" },
              ].map((o) => (
                <div key={o.label} className="text-center">
                  <o.icon size={12} className={`${o.color} mx-auto mb-1 opacity-60`} />
                  <p className="text-xs font-mono font-semibold text-foreground">{o.val}</p>
                  <p className="text-[9px] text-muted-foreground/60 uppercase">{o.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Metric cards — 4-column grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Sleep */}
          <div className="bg-card border border-border/40 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Moon size={14} className="text-blue-400" />
                <span className="text-sm font-semibold text-foreground">Sleep</span>
              </div>
              <TrendingUp size={14} className="text-emerald-400" />
            </div>
            <div className="h-20 mb-3">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs><linearGradient id="sg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="hsl(210 40% 55%)" stopOpacity={0.3} /><stop offset="100%" stopColor="hsl(210 40% 55%)" stopOpacity={0} /></linearGradient></defs>
                  <Area type="monotone" dataKey="sleep" stroke="hsl(210 40% 55%)" fill="url(#sg)" strokeWidth={1.5} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <p className="text-center font-mono text-lg font-bold text-foreground">{latest?.sleepScore || 92}%</p>
            <p className="text-center text-xs text-muted-foreground">Score</p>
          </div>

          {/* HRV */}
          <div className="bg-card border border-border/40 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Heart size={14} className="text-rose-400" />
                <span className="text-sm font-semibold text-foreground">HRV</span>
              </div>
              <TrendingUp size={14} className="text-emerald-400" />
            </div>
            <div className="h-20 mb-3">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs><linearGradient id="hg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="hsl(350 50% 55%)" stopOpacity={0.2} /><stop offset="100%" stopColor="hsl(350 50% 55%)" stopOpacity={0} /></linearGradient></defs>
                  <Area type="monotone" dataKey="hrv" stroke="hsl(350 50% 60%)" fill="url(#hg)" strokeWidth={1.5} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <p className="text-center font-mono text-lg font-bold text-foreground">{latest?.hrv || 68}ms</p>
            <p className="text-center text-xs text-muted-foreground">Average</p>
          </div>

          {/* Energy */}
          <div className="bg-card border border-border/40 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Zap size={14} className="text-amber-400" />
              <span className="text-sm font-semibold text-foreground">Energy</span>
            </div>
            <p className="text-center font-mono text-2xl font-bold text-foreground mt-6">{latest?.energyLevel || "High"}</p>
            <p className="text-center text-xs text-emerald-400 mt-1">+12% vs avg</p>
          </div>

          {/* Adherence */}
          <div className="bg-card border border-border/40 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Pill size={14} className="text-emerald-400" />
              <span className="text-sm font-semibold text-foreground">Adherence</span>
            </div>
            <p className="text-center font-mono text-2xl font-bold text-foreground mt-6">86%</p>
            <p className="text-center text-xs text-emerald-400 mt-1">This week</p>
          </div>
        </div>

        {/* Biomarkers table */}
        <div className="bg-card border border-border/40 rounded-xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-border/30">
            <h3 className="text-sm font-semibold text-foreground">Biomarker Insights</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full" data-testid="biomarker-table">
              <thead>
                <tr className="border-b border-border/20">
                  <th className="text-left text-xs font-medium text-muted-foreground px-5 py-2.5">Biomarker</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-3 py-2.5">Value</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-3 py-2.5 hidden sm:table-cell">Status</th>
                  <th className="text-right text-xs font-medium text-muted-foreground px-5 py-2.5">Trend</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: "Cortisol", value: "14.2 ug/dL", status: "Improving", trend: "down" },
                  { name: "Vitamin D", value: "48 ng/mL", status: "Optimal", trend: "up" },
                  { name: "hs-CRP", value: "0.8 mg/L", status: "Low risk", trend: "down" },
                ].map((b) => (
                  <tr key={b.name} className="border-b border-border/10 last:border-0 hover:bg-secondary/20 transition-colors">
                    <td className="px-5 py-3">
                      <span className="text-sm font-medium text-foreground">{b.name}</span>
                    </td>
                    <td className="px-3 py-3">
                      <span className="text-sm font-mono text-foreground">{b.value}</span>
                    </td>
                    <td className="px-3 py-3 hidden sm:table-cell">
                      <span className="text-sm text-muted-foreground">{b.status}</span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      {b.trend === "down" ? <TrendingDown size={14} className="text-emerald-400 inline" /> : <TrendingUp size={14} className="text-emerald-400 inline" />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
