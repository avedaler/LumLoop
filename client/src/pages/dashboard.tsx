import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useUser } from "../App";
import { apiRequest, queryClient } from "../lib/queryClient";
import ScoreRing from "../components/score-ring";
import LumLoopLogo from "../components/lumloop-logo";
import {
  Moon, Zap, Brain, Pill, Utensils, Snowflake, ChevronRight,
  Sparkles, TrendingUp, Heart, ArrowUpRight, Dna, FlaskConical,
  Shield, Activity, TrendingDown, Clock
} from "lucide-react";
import type { DailyScore, Supplement, SupplementLog, Meal } from "@shared/schema";

export default function Dashboard() {
  const { user } = useUser();
  const userId = user?.id || 1;
  const todayStr = new Date().toISOString().split("T")[0];

  const { data: todayScore } = useQuery<DailyScore>({
    queryKey: ["/api/scores", userId, "today"],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/scores/${userId}/today`);
      return res.json();
    },
  });

  const { data: supplements = [] } = useQuery<Supplement[]>({
    queryKey: ["/api/supplements", userId],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/supplements/${userId}`);
      return res.json();
    },
  });

  const { data: suppLogs = [] } = useQuery<SupplementLog[]>({
    queryKey: ["/api/supplement-logs", userId, todayStr],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/supplement-logs/${userId}/${todayStr}`);
      return res.json();
    },
  });

  const { data: meals = [] } = useQuery<Meal[]>({
    queryKey: ["/api/meals", userId, todayStr],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/meals/${userId}/${todayStr}`);
      return res.json();
    },
  });

  const toggleSuppMutation = useMutation({
    mutationFn: async ({ logId, taken }: { logId: number; taken: boolean }) => {
      const res = await apiRequest("PATCH", `/api/supplement-logs/${logId}`, { taken });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/supplement-logs", userId, todayStr] });
    },
  });

  const organAges = todayScore ? [
    { label: "Cardio", age: todayScore.cardioAge?.toFixed(0) || "32", delta: ((todayScore.cardioAge || 32) - 41).toFixed(1), icon: Heart, color: "text-rose-400" },
    { label: "Sleep", age: todayScore.sleepAge?.toFixed(0) || "35", delta: ((todayScore.sleepAge || 35) - 41).toFixed(1), icon: Moon, color: "text-blue-400" },
    { label: "Metabolic", age: todayScore.metabolicAge?.toFixed(0) || "36", delta: ((todayScore.metabolicAge || 36) - 41).toFixed(1), icon: Activity, color: "text-amber-400" },
    { label: "Immune", age: todayScore.immuneAge?.toFixed(0) || "33", delta: ((todayScore.immuneAge || 33) - 41).toFixed(1), icon: Shield, color: "text-emerald-400" },
    { label: "Muscle", age: todayScore.muscleAge?.toFixed(0) || "35", delta: ((todayScore.muscleAge || 35) - 41).toFixed(1), icon: Zap, color: "text-purple-400" },
  ] : [];

  const suppWithLogs = supplements.map((s) => {
    const log = suppLogs.find((l) => l.supplementId === s.id);
    return { ...s, log, taken: log?.taken || false };
  });

  const takenCount = suppWithLogs.filter(s => s.taken).length;
  const lunchAndDinner = meals.filter(m => m.mealType === "lunch" || m.mealType === "dinner");

  return (
    <div className="min-h-screen bg-background">
      <header className="px-5 pt-14 pb-3 flex items-center justify-between">
        <div>
          <p className="text-[10px] text-muted-foreground tracking-[0.15em] uppercase font-medium">Good Morning</p>
          <h1 className="text-lg font-semibold text-foreground tracking-tight mt-0.5">{user?.name || "User"}</h1>
        </div>
        <LumLoopLogo size={28} />
      </header>

      <div className="px-5 pb-8 stagger-children">
        {/* Bio Age Hero */}
        <div className="bg-card border border-primary/12 rounded-[20px] p-5 mb-4 glow-sage relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/6 via-transparent to-transparent pointer-events-none rounded-[20px]" />
          <div className="relative">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <Dna size={11} className="text-primary" />
                  <p className="text-[9px] text-primary uppercase tracking-[0.2em] font-bold">Biological Wellness Age</p>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-serif text-[42px] font-medium text-foreground tracking-tight leading-none">
                    {todayScore?.bioAge?.toFixed(1) || "34.2"}
                  </span>
                  <span className="text-sm text-muted-foreground font-light">years</span>
                </div>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span className="text-[10px] text-muted-foreground">Chronological: 41</span>
                  <span className="text-[10px] text-primary font-semibold flex items-center gap-0.5">
                    <TrendingDown size={9} />
                    {(41 - (todayScore?.bioAge || 34.2)).toFixed(1)}yr younger
                  </span>
                </div>
              </div>
              <ScoreRing score={todayScore?.readiness || 87} size={82} strokeWidth={4} label="Ready" />
            </div>
            {organAges.length > 0 && (
              <div className="grid grid-cols-5 gap-1 pt-3.5 border-t border-border/30">
                {organAges.map((o) => (
                  <div key={o.label} className="text-center">
                    <o.icon size={10} className={`${o.color} mx-auto mb-1 opacity-60`} />
                    <p className="text-[8px] text-muted-foreground/70 uppercase tracking-wider leading-none">{o.label}</p>
                    <p className="text-[13px] font-mono font-semibold text-foreground mt-0.5">{o.age}</p>
                    <p className="text-[8px] font-mono text-emerald-400/80">{o.delta}yr</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {[
            { icon: Moon, label: "Sleep", value: todayScore?.sleepHours ? `${todayScore.sleepHours.toFixed(0)}h` : "7h 42m", sub: `${todayScore?.sleepScore || 92}%`, color: "text-blue-400", bg: "bg-blue-500/8" },
            { icon: Zap, label: "Energy", value: todayScore?.energyLevel || "High", sub: "+12%", color: "text-amber-400", bg: "bg-amber-500/8" },
            { icon: Heart, label: "HRV", value: `${todayScore?.hrv || 68}ms`, sub: "Optimal", color: "text-rose-400", bg: "bg-rose-500/8" },
            { icon: Brain, label: "Focus", value: `${todayScore?.focusScore || 94}`, sub: "Peak", color: "text-purple-400", bg: "bg-purple-500/8" },
          ].map((s) => (
            <div key={s.label} className={`${s.bg} border border-border/30 rounded-2xl px-2 py-2.5 text-center`}>
              <s.icon size={13} className={`${s.color} mx-auto mb-1.5 opacity-80`} />
              <p className="text-[11px] font-mono font-semibold text-foreground">{s.value}</p>
              <p className="text-[8px] text-muted-foreground mt-0.5">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* GLP-1 Banner */}
        <div className="bg-gradient-to-r from-purple-500/6 via-purple-500/3 to-transparent border border-purple-500/12 rounded-2xl p-3.5 flex items-start gap-3 mb-4">
          <div className="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0">
            <FlaskConical size={13} className="text-purple-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-[11px] font-semibold text-foreground">GLP-1 Companion</p>
              <span className="text-[7px] px-1.5 py-0.5 rounded-full bg-purple-500/15 text-purple-400 font-bold uppercase tracking-wider">Active</span>
            </div>
            <p className="text-[10px] text-muted-foreground leading-relaxed mt-0.5">
              Protein target: 140g. B12 + iron added. Muscle preservation protocol adjusted.
            </p>
          </div>
        </div>

        {/* AI Coach */}
        <div className="bg-card border border-primary/8 rounded-2xl p-4 mb-4 flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-primary/8 flex items-center justify-center shrink-0">
            <Sparkles size={13} className="text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold text-foreground mb-0.5">AI Coach</p>
            <p className="text-[10px] text-muted-foreground leading-[1.6]">
              HRV trending up 15% this week. Bio age dropped 0.3yr since adding evening Ashwagandha. Cold plunge at 3pm would optimize your cortisol window.
            </p>
          </div>
        </div>

        {/* Today's Stack — Real Data */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2.5">
            <h2 className="text-[13px] font-semibold text-foreground tracking-tight">Today's Stack</h2>
            <Link href="/supplements">
              <button className="text-[10px] text-primary flex items-center gap-0.5 font-medium" data-testid="link-supplements">
                View all <ChevronRight size={11} />
              </button>
            </Link>
          </div>
          <div className="space-y-1.5">
            {suppWithLogs.slice(0, 4).map((s) => (
              <div key={s.id} className="flex items-center gap-3 bg-card border border-border/40 rounded-xl px-3 py-2.5">
                <button
                  onClick={() => s.log && toggleSuppMutation.mutate({ logId: s.log.id, taken: !s.taken })}
                  className={`w-[18px] h-[18px] rounded-full border-[1.5px] flex items-center justify-center transition-colors ${
                    s.taken ? "bg-primary border-primary" : "border-border/60"
                  }`}
                  data-testid={`toggle-supp-${s.id}`}
                >
                  {s.taken && <span className="text-primary-foreground text-[8px] font-bold">&#10003;</span>}
                </button>
                <p className={`text-[11px] font-medium flex-1 ${s.taken ? "text-muted-foreground line-through" : "text-foreground"}`}>
                  {s.name}
                </p>
                <span className="text-[9px] text-muted-foreground/60 font-mono">{s.timing}</span>
              </div>
            ))}
          </div>
          <p className="text-[9px] text-muted-foreground mt-2 text-center">
            {takenCount}/{supplements.length} taken today
          </p>
        </div>

        {/* Meals — Real Data */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2.5">
            <h2 className="text-[13px] font-semibold text-foreground tracking-tight">Recommended Meals</h2>
            <Link href="/nutrition">
              <button className="text-[10px] text-primary flex items-center gap-0.5 font-medium" data-testid="link-nutrition">
                Full plan <ChevronRight size={11} />
              </button>
            </Link>
          </div>
          {lunchAndDinner.map((m) => (
            <div key={m.id} className="bg-card border border-border/40 rounded-xl px-3 py-2.5 flex items-center gap-3 mb-1.5">
              <div className="w-9 h-9 rounded-xl bg-accent/40 flex items-center justify-center">
                <Utensils size={14} className="text-accent-foreground/50" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-medium text-foreground">{m.name}</p>
                <p className="text-[9px] text-muted-foreground mt-0.5 font-mono">{m.calories} kcal · P{m.protein} C{m.carbs} F{m.fat}</p>
              </div>
              <span className="text-[9px] text-muted-foreground/50 capitalize">{m.mealType}</span>
            </div>
          ))}
        </div>

        {/* Recovery */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2.5">
            <h2 className="text-[13px] font-semibold text-foreground tracking-tight">Recovery</h2>
            <Link href="/marketplace">
              <button className="text-[10px] text-primary flex items-center gap-0.5 font-medium" data-testid="link-marketplace">Browse <ChevronRight size={11} /></button>
            </Link>
          </div>
          <div className="bg-card border border-border/40 rounded-2xl p-3.5 flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-blue-500/8 flex items-center justify-center">
              <Snowflake size={18} className="text-blue-400/80" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-medium text-foreground">Cryotherapy Session</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Optimal window: 3-5pm</p>
            </div>
            <button className="w-7 h-7 rounded-full bg-primary/8 flex items-center justify-center" data-testid="button-book-cryo">
              <ArrowUpRight size={12} className="text-primary" />
            </button>
          </div>
        </div>

        {/* Coverage */}
        <div className="bg-card border border-border/40 rounded-2xl px-4 py-3 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Shield size={12} className="text-primary" />
            <p className="text-[11px] font-semibold text-foreground">Wellness Coverage</p>
            <span className="text-[9px] font-mono text-primary ml-auto font-bold">9/9</span>
          </div>
          <div className="flex gap-[3px]">
            {Array.from({ length: 9 }).map((_, i) => (<div key={i} className="flex-1 h-[5px] rounded-full bg-primary/70" />))}
          </div>
        </div>

        {/* Next Action */}
        <div className="bg-gradient-to-r from-primary/8 via-primary/4 to-transparent border border-primary/8 rounded-2xl px-4 py-3 flex items-center gap-3">
          <div className="w-[6px] h-[6px] rounded-full bg-primary animate-breathe" />
          <div className="flex-1">
            <p className="text-[11px] font-semibold text-foreground">Next: Take Vitamin D3 + K2</p>
            <p className="text-[9px] text-muted-foreground">10:00 AM with breakfast</p>
          </div>
          <Clock size={12} className="text-muted-foreground/40" />
        </div>
      </div>
    </div>
  );
}
