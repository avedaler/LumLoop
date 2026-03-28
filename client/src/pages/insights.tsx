import { useQuery } from "@tanstack/react-query";
import { useUser } from "../App";
import { apiRequest } from "../lib/queryClient";
import { Dna, TrendingUp, TrendingDown, Heart, Moon, Brain, Zap, Pill, Sparkles, Activity } from "lucide-react";
import { AreaChart, Area, XAxis, ResponsiveContainer, BarChart, Bar } from "recharts";
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
      <header className="px-5 pt-14 pb-2">
        <h1 className="text-lg font-semibold text-foreground tracking-tight">Insights</h1>
        <p className="text-[10px] text-muted-foreground mt-0.5">Your health intelligence</p>
      </header>

      <div className="px-5 pb-8">
        {/* Bio Age Trend — THE hero of Insights */}
        <div className="bg-card border border-primary/10 rounded-2xl p-4 mb-4">
          <div className="flex items-center gap-1.5 mb-3">
            <Dna size={11} className="text-primary" />
            <span className="text-[9px] text-primary uppercase tracking-[0.2em] font-bold">Bio Age Trend</span>
          </div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="font-serif text-3xl font-medium text-foreground">{latest?.bioAge?.toFixed(1) || "34.2"}</span>
              <span className="text-xs text-muted-foreground ml-1">years</span>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 justify-end">
                <TrendingDown size={12} className="text-emerald-400" />
                <span className="text-sm font-mono font-bold text-emerald-400">-{bioAgeDelta.toFixed(1)}yr</span>
              </div>
              <p className="text-[9px] text-emerald-400/70">this week</p>
            </div>
          </div>
          {/* Organ breakdown */}
          <div className="grid grid-cols-5 gap-1.5 pt-3 border-t border-border/20">
            {[
              { label: "Cardio", val: latest?.cardioAge?.toFixed(0) || "32", icon: Heart, color: "text-rose-400" },
              { label: "Sleep", val: latest?.sleepAge?.toFixed(0) || "35", icon: Moon, color: "text-blue-400" },
              { label: "Metabolic", val: latest?.metabolicAge?.toFixed(0) || "36", icon: Activity, color: "text-amber-400" },
              { label: "Immune", val: latest?.immuneAge?.toFixed(0) || "33", icon: Zap, color: "text-emerald-400" },
              { label: "Muscle", val: latest?.muscleAge?.toFixed(0) || "35", icon: Brain, color: "text-purple-400" },
            ].map((o) => (
              <div key={o.label} className="text-center">
                <o.icon size={9} className={`${o.color} mx-auto mb-0.5 opacity-50`} />
                <p className="text-[7px] text-muted-foreground/60 uppercase">{o.label}</p>
                <p className="text-[12px] font-mono font-semibold text-foreground">{o.val}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly AI Summary */}
        <div className="bg-card border border-primary/8 rounded-2xl p-4 mb-4 flex items-start gap-3">
          <Sparkles size={13} className="text-primary shrink-0 mt-0.5" />
          <div>
            <p className="text-[11px] font-semibold text-foreground mb-0.5">Weekly Analysis</p>
            <p className="text-[10px] text-muted-foreground leading-[1.6]">
              HRV improved 15% since adding evening Ashwagandha. Sleep quality correlates strongly with supplement adherence. Cortisol trending down 22% over 30 days.
            </p>
          </div>
        </div>

        {/* Metric cards — compact grid */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {/* Sleep */}
          <div className="bg-card border border-border/40 rounded-xl p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Moon size={11} className="text-blue-400" />
                <span className="text-[10px] font-semibold text-foreground">Sleep</span>
              </div>
              <TrendingUp size={10} className="text-emerald-400" />
            </div>
            <div className="h-14">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs><linearGradient id="sg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="hsl(210 40% 55%)" stopOpacity={0.3} /><stop offset="100%" stopColor="hsl(210 40% 55%)" stopOpacity={0} /></linearGradient></defs>
                  <Area type="monotone" dataKey="sleep" stroke="hsl(210 40% 55%)" fill="url(#sg)" strokeWidth={1.5} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <p className="text-center font-mono text-xs font-semibold text-foreground">{latest?.sleepScore || 92}%</p>
          </div>

          {/* HRV */}
          <div className="bg-card border border-border/40 rounded-xl p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Heart size={11} className="text-rose-400" />
                <span className="text-[10px] font-semibold text-foreground">HRV</span>
              </div>
              <TrendingUp size={10} className="text-emerald-400" />
            </div>
            <div className="h-14">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs><linearGradient id="hg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="hsl(350 50% 55%)" stopOpacity={0.2} /><stop offset="100%" stopColor="hsl(350 50% 55%)" stopOpacity={0} /></linearGradient></defs>
                  <Area type="monotone" dataKey="hrv" stroke="hsl(350 50% 60%)" fill="url(#hg)" strokeWidth={1.5} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <p className="text-center font-mono text-xs font-semibold text-foreground">{latest?.hrv || 68}ms</p>
          </div>

          {/* Energy */}
          <div className="bg-card border border-border/40 rounded-xl p-3">
            <div className="flex items-center gap-1.5 mb-2">
              <Zap size={11} className="text-amber-400" />
              <span className="text-[10px] font-semibold text-foreground">Energy</span>
            </div>
            <p className="text-center font-mono text-lg font-bold text-foreground">{latest?.energyLevel || "High"}</p>
            <p className="text-center text-[8px] text-emerald-400">+12% vs avg</p>
          </div>

          {/* Adherence */}
          <div className="bg-card border border-border/40 rounded-xl p-3">
            <div className="flex items-center gap-1.5 mb-2">
              <Pill size={11} className="text-emerald-400" />
              <span className="text-[10px] font-semibold text-foreground">Adherence</span>
            </div>
            <p className="text-center font-mono text-lg font-bold text-foreground">86%</p>
            <p className="text-center text-[8px] text-emerald-400">This week</p>
          </div>
        </div>

        {/* Biomarkers preview */}
        <div className="bg-card border border-border/40 rounded-2xl p-4">
          <h3 className="text-[11px] font-semibold text-foreground mb-3">Biomarker Insights</h3>
          {[
            { name: "Cortisol", value: "14.2 ug/dL", status: "Improving", trend: "down" },
            { name: "Vitamin D", value: "48 ng/mL", status: "Optimal", trend: "up" },
            { name: "hs-CRP", value: "0.8 mg/L", status: "Low risk", trend: "down" },
          ].map((b) => (
            <div key={b.name} className="flex items-center justify-between py-2 border-b border-border/15 last:border-0">
              <div>
                <p className="text-[11px] font-medium text-foreground">{b.name}</p>
                <p className="text-[8px] text-muted-foreground">{b.status}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-foreground">{b.value}</span>
                {b.trend === "down" ? <TrendingDown size={10} className="text-emerald-400" /> : <TrendingUp size={10} className="text-emerald-400" />}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
