import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useUser } from "../App";
import { apiRequest, queryClient } from "../lib/queryClient";
import ScoreRing from "../components/score-ring";
import {
  Dna, TrendingDown, Sparkles, Moon, Zap, Heart, Brain,
  Check, Pill, Utensils, Dumbbell, Wind, Sun, Clock
} from "lucide-react";
import type { DailyScore, Supplement, SupplementLog, Meal } from "@shared/schema";

export default function Today() {
  const { user, setShowCoach } = useUser();
  const userId = user?.id || 1;
  const todayStr = new Date().toISOString().split("T")[0];

  const { data: score } = useQuery<DailyScore>({
    queryKey: ["/api/scores", userId, "today"],
    queryFn: async () => { const r = await apiRequest("GET", `/api/scores/${userId}/today`); return r.json(); },
  });
  const { data: supps = [] } = useQuery<Supplement[]>({
    queryKey: ["/api/supplements", userId],
    queryFn: async () => { const r = await apiRequest("GET", `/api/supplements/${userId}`); return r.json(); },
  });
  const { data: logs = [] } = useQuery<SupplementLog[]>({
    queryKey: ["/api/supplement-logs", userId, todayStr],
    queryFn: async () => { const r = await apiRequest("GET", `/api/supplement-logs/${userId}/${todayStr}`); return r.json(); },
  });
  const { data: meals = [] } = useQuery<Meal[]>({
    queryKey: ["/api/meals", userId, todayStr],
    queryFn: async () => { const r = await apiRequest("GET", `/api/meals/${userId}/${todayStr}`); return r.json(); },
  });

  const toggleSupp = useMutation({
    mutationFn: async ({ logId, taken }: { logId: number; taken: boolean }) => {
      const r = await apiRequest("PATCH", `/api/supplement-logs/${logId}`, { taken }); return r.json();
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/supplement-logs", userId, todayStr] }); },
  });

  const toggleMeal = useMutation({
    mutationFn: async ({ mealId, logged }: { mealId: number; logged: boolean }) => {
      const r = await apiRequest("PATCH", `/api/meals/${mealId}`, { logged }); return r.json();
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/meals", userId, todayStr] }); },
  });

  // Build protocol items
  const morningSupps = supps.filter(s => s.timing === "Morning" || s.timing === "Morning, fasted");
  const mealSupps = supps.filter(s => s.timing === "With meal");
  const eveningSupps = supps.filter(s => s.timing === "Evening");
  const anyTimeSupps = supps.filter(s => s.timing === "Any time");

  const suppWithLogs = supps.map(s => {
    const log = logs.find(l => l.supplementId === s.id);
    return { ...s, log, taken: log?.taken || false };
  });

  // Protocol items
  type ProtocolItem = { id: string; label: string; sub: string; icon: any; color: string; done: boolean; onToggle: () => void; };
  const protocol: ProtocolItem[] = [];

  // Morning supplements (grouped)
  const morningSuppsDone = morningSupps.every(s => suppWithLogs.find(sw => sw.id === s.id)?.taken);
  const morningSuppCount = morningSupps.filter(s => suppWithLogs.find(sw => sw.id === s.id)?.taken).length;
  if (morningSupps.length > 0) {
    protocol.push({
      id: "morning-supps", label: "Morning Supplements", sub: `${morningSupps.map(s => s.name.split(" ")[0]).join(", ")}`,
      icon: Pill, color: "text-emerald-400", done: morningSuppsDone,
      onToggle: () => {
        morningSupps.forEach(s => {
          const sw = suppWithLogs.find(sw2 => sw2.id === s.id);
          if (sw?.log) toggleSupp.mutate({ logId: sw.log.id, taken: !morningSuppsDone });
        });
      },
    });
  }

  // Breakfast
  const breakfast = meals.find(m => m.mealType === "breakfast");
  if (breakfast) {
    protocol.push({
      id: "breakfast", label: breakfast.name, sub: `${breakfast.calories} kcal · P${breakfast.protein} C${breakfast.carbs} F${breakfast.fat}`,
      icon: Utensils, color: "text-amber-400", done: breakfast.logged || false,
      onToggle: () => toggleMeal.mutate({ mealId: breakfast.id, logged: !breakfast.logged }),
    });
  }

  // With-meal supplements
  if (mealSupps.length > 0) {
    const mealSuppsDone = mealSupps.every(s => suppWithLogs.find(sw => sw.id === s.id)?.taken);
    protocol.push({
      id: "meal-supps", label: "With-Meal Supplements", sub: mealSupps.map(s => s.name.split(" ")[0]).join(", "),
      icon: Pill, color: "text-emerald-400", done: mealSuppsDone,
      onToggle: () => {
        mealSupps.forEach(s => {
          const sw = suppWithLogs.find(sw2 => sw2.id === s.id);
          if (sw?.log) toggleSupp.mutate({ logId: sw.log.id, taken: !mealSuppsDone });
        });
      },
    });
  }

  // Lunch
  const lunch = meals.find(m => m.mealType === "lunch");
  if (lunch) {
    protocol.push({
      id: "lunch", label: lunch.name, sub: `${lunch.calories} kcal · P${lunch.protein} C${lunch.carbs} F${lunch.fat}`,
      icon: Utensils, color: "text-amber-400", done: lunch.logged || false,
      onToggle: () => toggleMeal.mutate({ mealId: lunch.id, logged: !lunch.logged }),
    });
  }

  // Breathwork
  protocol.push({
    id: "breathwork", label: "Breathwork Session", sub: "4-7-8 technique, 10 min",
    icon: Wind, color: "text-sky-400", done: false, onToggle: () => {},
  });

  // Dinner
  const dinner = meals.find(m => m.mealType === "dinner");
  if (dinner) {
    protocol.push({
      id: "dinner", label: dinner.name, sub: `${dinner.calories} kcal · P${dinner.protein} C${dinner.carbs} F${dinner.fat}`,
      icon: Utensils, color: "text-amber-400", done: dinner.logged || false,
      onToggle: () => toggleMeal.mutate({ mealId: dinner.id, logged: !dinner.logged }),
    });
  }

  // Evening supplements
  if (eveningSupps.length > 0) {
    const eveningSuppsDone = eveningSupps.every(s => suppWithLogs.find(sw => sw.id === s.id)?.taken);
    protocol.push({
      id: "evening-supps", label: "Evening Supplements", sub: eveningSupps.map(s => s.name.split(" ")[0]).join(", "),
      icon: Moon, color: "text-blue-400", done: eveningSuppsDone,
      onToggle: () => {
        eveningSupps.forEach(s => {
          const sw = suppWithLogs.find(sw2 => sw2.id === s.id);
          if (sw?.log) toggleSupp.mutate({ logId: sw.log.id, taken: !eveningSuppsDone });
        });
      },
    });
  }

  const completedCount = protocol.filter(p => p.done).length;
  const totalCount = protocol.length;
  const progressPct = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  const nextItem = protocol.find(p => !p.done);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1200px] mx-auto px-6 py-8">
        {/* Page header */}
        <div className="mb-6">
          <p className="text-xs text-muted-foreground tracking-wide uppercase font-medium">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
          </p>
          <h1 className="text-xl font-semibold text-foreground tracking-tight mt-1">
            Welcome back, {user?.name || "there"}
          </h1>
        </div>

        {/* TOP ROW: Bio Age + Readiness + Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Bio Age */}
          <div className="bg-card border border-border/40 rounded-xl p-5">
            <div className="flex items-center gap-1.5 mb-3">
              <Dna size={14} className="text-primary" />
              <span className="text-xs text-primary uppercase tracking-widest font-bold">Bio Age</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-serif text-4xl font-medium text-foreground tracking-tight leading-none">
                {score?.bioAge?.toFixed(1) || "34.2"}
              </span>
              <span className="text-sm text-muted-foreground">years</span>
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              <TrendingDown size={12} className="text-emerald-400" />
              <span className="text-xs text-emerald-400 font-semibold">
                {(41 - (score?.bioAge || 34.2)).toFixed(1)}yr younger
              </span>
            </div>
          </div>

          {/* Readiness ring */}
          <div className="bg-card border border-border/40 rounded-xl p-5 flex items-center justify-center">
            <ScoreRing score={score?.readiness || 87} size={100} strokeWidth={5} label="Ready" />
          </div>

          {/* Quick stats — Sleep & HRV */}
          <div className="bg-card border border-border/40 rounded-xl p-5 flex flex-col justify-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-400/10 flex items-center justify-center">
                <Moon size={16} className="text-blue-400" />
              </div>
              <div>
                <p className="text-lg font-mono font-semibold text-foreground leading-none">{score?.sleepHours ? `${score.sleepHours.toFixed(0)}h` : "7h"}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Sleep</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-rose-400/10 flex items-center justify-center">
                <Heart size={16} className="text-rose-400" />
              </div>
              <div>
                <p className="text-lg font-mono font-semibold text-foreground leading-none">{score?.hrv || 68}ms</p>
                <p className="text-xs text-muted-foreground mt-0.5">HRV</p>
              </div>
            </div>
          </div>

          {/* Quick stats — Energy & Focus */}
          <div className="bg-card border border-border/40 rounded-xl p-5 flex flex-col justify-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-400/10 flex items-center justify-center">
                <Zap size={16} className="text-amber-400" />
              </div>
              <div>
                <p className="text-lg font-mono font-semibold text-foreground leading-none">{score?.energyLevel || "High"}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Energy</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-purple-400/10 flex items-center justify-center">
                <Brain size={16} className="text-purple-400" />
              </div>
              <div>
                <p className="text-lg font-mono font-semibold text-foreground leading-none">{score?.focusScore || 94}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Focus</p>
              </div>
            </div>
          </div>
        </div>

        {/* MAIN AREA: Two-column grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* LEFT column (~60%) — Today's Protocol */}
          <div className="lg:col-span-3">
            <div className="bg-card border border-border/40 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-foreground">Today's Protocol</h2>
                <div className="flex items-center gap-3">
                  <div className="w-24 h-1.5 bg-border/50 rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }} />
                  </div>
                  <span className="text-xs font-mono text-muted-foreground">{completedCount}/{totalCount}</span>
                </div>
              </div>

              <div className="space-y-1">
                {protocol.map((item) => {
                  const Icon = item.icon;
                  const isNext = item === nextItem;
                  return (
                    <button
                      key={item.id}
                      onClick={item.onToggle}
                      className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all text-left ${
                        item.done
                          ? "bg-card/50 border border-border/20"
                          : isNext
                          ? "bg-primary/5 border border-primary/15"
                          : "bg-background/50 border border-border/30"
                      }`}
                      data-testid={`protocol-${item.id}`}
                    >
                      <div className={`w-5 h-5 rounded-full border-[1.5px] flex items-center justify-center shrink-0 transition-all ${
                        item.done ? "bg-primary border-primary" : isNext ? "border-primary/50" : "border-border/50"
                      }`}>
                        {item.done && <Check size={10} className="text-primary-foreground" strokeWidth={3} />}
                      </div>
                      <Icon size={14} className={`${item.done ? "text-muted-foreground/30" : item.color} shrink-0`} />
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${item.done ? "text-muted-foreground/50 line-through" : "text-foreground"}`}>
                          {item.label}
                        </p>
                        <p className={`text-xs ${item.done ? "text-muted-foreground/30" : "text-muted-foreground/60"} font-mono`}>
                          {item.sub}
                        </p>
                      </div>
                      {isNext && !item.done && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-primary/15 text-primary font-bold uppercase tracking-wider shrink-0">
                          Next
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT column (~40%) — AI Coach summary + Bio Age breakdown */}
          <div className="lg:col-span-2 space-y-4">
            {/* AI Coach summary */}
            <button
              onClick={() => setShowCoach(true)}
              className="w-full bg-card border border-primary/10 rounded-xl p-5 text-left hover:bg-primary/3 transition-colors"
              data-testid="open-coach-card"
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Sparkles size={16} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-semibold text-foreground">AI Coach</p>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-primary/10 text-primary font-bold uppercase tracking-wider">Chat</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    HRV trending up 15% this week. Bio age dropped 0.3yr since adding evening Ashwagandha.
                    {score?.stressLevel === "High" ? " Consider a breathwork session at 2pm to manage cortisol." : " Keep up the current protocol."}
                  </p>
                </div>
              </div>
            </button>

            {/* Bio Age subsystem breakdown */}
            <div className="bg-card border border-border/40 rounded-xl p-5">
              <div className="flex items-center gap-1.5 mb-4">
                <Dna size={14} className="text-primary" />
                <span className="text-sm font-semibold text-foreground">Bio Age Breakdown</span>
              </div>
              <div className="space-y-3">
                {[
                  { label: "Cardiovascular", val: score?.cardioAge?.toFixed(0) || "32", icon: Heart, color: "text-rose-400", bgColor: "bg-rose-400/10" },
                  { label: "Sleep System", val: score?.sleepAge?.toFixed(0) || "35", icon: Moon, color: "text-blue-400", bgColor: "bg-blue-400/10" },
                  { label: "Metabolic", val: score?.metabolicAge?.toFixed(0) || "36", icon: Zap, color: "text-amber-400", bgColor: "bg-amber-400/10" },
                  { label: "Immune", val: score?.immuneAge?.toFixed(0) || "33", icon: Dna, color: "text-emerald-400", bgColor: "bg-emerald-400/10" },
                  { label: "Musculoskeletal", val: score?.muscleAge?.toFixed(0) || "35", icon: Brain, color: "text-purple-400", bgColor: "bg-purple-400/10" },
                ].map((sys) => (
                  <div key={sys.label} className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg ${sys.bgColor} flex items-center justify-center shrink-0`}>
                      <sys.icon size={14} className={sys.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground">{sys.label}</p>
                    </div>
                    <span className="text-sm font-mono font-semibold text-foreground">{sys.val} yr</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
