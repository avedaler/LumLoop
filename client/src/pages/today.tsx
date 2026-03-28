import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useUser } from "../App";
import { apiRequest, queryClient } from "../lib/queryClient";
import ScoreRing from "../components/score-ring";
import LumLoopLogo from "../components/lumloop-logo";
import {
  Dna, TrendingDown, Sparkles, Moon, Zap, Heart, Brain,
  Check, Pill, Utensils, Dumbbell, Wind, Sun, Clock
} from "lucide-react";
import type { DailyScore, Supplement, SupplementLog, Meal } from "@shared/schema";

export default function Today() {
  const { user } = useUser();
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

  // Find next incomplete item
  const nextItem = protocol.find(p => !p.done);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="px-5 pt-14 pb-2 flex items-center justify-between">
        <div>
          <p className="text-[9px] text-muted-foreground tracking-[0.15em] uppercase font-bold">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
          </p>
          <h1 className="text-lg font-semibold text-foreground tracking-tight mt-0.5">
            {user?.name || "Today"}
          </h1>
        </div>
        <LumLoopLogo size={26} />
      </header>

      <div className="px-5 pb-8">
        {/* ═══ ZONE 1: Bio Age + Readiness (above the fold) ═══ */}
        <div className="flex items-center justify-between py-4 mb-1">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <Dna size={10} className="text-primary" />
              <span className="text-[8px] text-primary uppercase tracking-[0.2em] font-bold">Bio Age</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="font-serif text-[48px] font-medium text-foreground tracking-tight leading-none">
                {score?.bioAge?.toFixed(1) || "34.2"}
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <TrendingDown size={10} className="text-emerald-400" />
              <span className="text-[10px] text-emerald-400 font-semibold">
                {(41 - (score?.bioAge || 34.2)).toFixed(1)}yr younger
              </span>
            </div>
          </div>
          <ScoreRing score={score?.readiness || 87} size={76} strokeWidth={4} label="Ready" />
        </div>

        {/* ═══ ZONE 2: Today's Protocol (the core daily ritual) ═══ */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[13px] font-bold text-foreground tracking-tight">Today's Protocol</h2>
            <div className="flex items-center gap-2">
              <div className="w-16 h-[5px] bg-border/50 rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }} />
              </div>
              <span className="text-[10px] font-mono text-muted-foreground">{completedCount}/{totalCount}</span>
            </div>
          </div>

          <div className="space-y-1.5">
            {protocol.map((item) => {
              const Icon = item.icon;
              const isNext = item === nextItem;
              return (
                <button
                  key={item.id}
                  onClick={item.onToggle}
                  className={`w-full flex items-center gap-3 rounded-xl px-3.5 py-3 transition-all text-left ${
                    item.done
                      ? "bg-card/50 border border-border/20"
                      : isNext
                      ? "bg-primary/5 border border-primary/15 glow-sage"
                      : "bg-card border border-border/40"
                  }`}
                  data-testid={`protocol-${item.id}`}
                >
                  {/* Checkbox */}
                  <div className={`w-5 h-5 rounded-full border-[1.5px] flex items-center justify-center shrink-0 transition-all ${
                    item.done ? "bg-primary border-primary" : isNext ? "border-primary/50" : "border-border/50"
                  }`}>
                    {item.done && <Check size={10} className="text-primary-foreground" strokeWidth={3} />}
                  </div>

                  {/* Icon */}
                  <Icon size={14} className={`${item.done ? "text-muted-foreground/30" : item.color} shrink-0`} />

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-[11px] font-medium ${item.done ? "text-muted-foreground/50 line-through" : "text-foreground"}`}>
                      {item.label}
                    </p>
                    <p className={`text-[9px] ${item.done ? "text-muted-foreground/30" : "text-muted-foreground/60"} font-mono`}>
                      {item.sub}
                    </p>
                  </div>

                  {/* Next indicator */}
                  {isNext && !item.done && (
                    <span className="text-[7px] px-1.5 py-0.5 rounded-full bg-primary/15 text-primary font-bold uppercase tracking-wider shrink-0">
                      Next
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ═══ ZONE 3: AI Coach (one insight, one action) ═══ */}
        <div className="bg-card border border-primary/8 rounded-2xl p-4 mb-5 flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-primary/8 flex items-center justify-center shrink-0">
            <Sparkles size={13} className="text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold text-foreground mb-0.5">AI Coach</p>
            <p className="text-[10px] text-muted-foreground leading-[1.6]">
              HRV trending up 15% this week. Bio age dropped 0.3yr since adding evening Ashwagandha.
              {score?.stressLevel === "High" ? " Consider a breathwork session at 2pm to manage cortisol." : " Keep up the current protocol."}
            </p>
          </div>
        </div>

        {/* ═══ ZONE 4: Quick stats (horizontal, compact) ═══ */}
        <div className="flex gap-2 overflow-x-auto scrollbar-none -mx-5 px-5 pb-2">
          {[
            { icon: Moon, label: "Sleep", value: score?.sleepHours ? `${score.sleepHours.toFixed(0)}h` : "7h", color: "text-blue-400" },
            { icon: Zap, label: "Energy", value: score?.energyLevel || "High", color: "text-amber-400" },
            { icon: Heart, label: "HRV", value: `${score?.hrv || 68}ms`, color: "text-rose-400" },
            { icon: Brain, label: "Focus", value: `${score?.focusScore || 94}`, color: "text-purple-400" },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-2 bg-card border border-border/30 rounded-xl px-3 py-2 shrink-0">
              <s.icon size={12} className={`${s.color} opacity-60`} />
              <div>
                <p className="text-[10px] font-mono font-semibold text-foreground">{s.value}</p>
                <p className="text-[7px] text-muted-foreground">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
