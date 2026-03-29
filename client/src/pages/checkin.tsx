import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useUser } from "../App";
import { apiRequest, queryClient } from "../lib/queryClient";
import { ClipboardCheck, Moon, Zap, Smile, Brain } from "lucide-react";
import type { DailyCheckin } from "@shared/schema";

const sliders = [
  { key: "sleepQuality", label: "Sleep Quality", icon: Moon, color: "text-blue-400", bgColor: "bg-blue-400" },
  { key: "energyLevel", label: "Energy", icon: Zap, color: "text-amber-400", bgColor: "bg-amber-400" },
  { key: "mood", label: "Mood", icon: Smile, color: "text-emerald-400", bgColor: "bg-emerald-400" },
  { key: "stressLevel", label: "Stress", icon: Brain, color: "text-rose-400", bgColor: "bg-rose-400" },
] as const;

const levelLabels = ["", "Very Low", "Low", "Moderate", "Good", "Excellent"];

export default function Checkin() {
  const { user } = useUser();
  const userId = user?.id || 1;
  const todayStr = new Date().toISOString().split("T")[0];

  const [sleepQuality, setSleepQuality] = useState(3);
  const [energyLevel, setEnergyLevel] = useState(3);
  const [mood, setMood] = useState(3);
  const [stressLevel, setStressLevel] = useState(3);
  const [notes, setNotes] = useState("");
  const [saved, setSaved] = useState(false);

  const { data: todayCheckin } = useQuery<DailyCheckin | null>({
    queryKey: ["/api/checkins", userId, todayStr],
    queryFn: async () => { const r = await apiRequest("GET", `/api/checkins/${userId}/${todayStr}`); return r.json(); },
  });

  // Load last 7 days for the dots
  const past7 = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split("T")[0];
  });

  const saveCheckin = useMutation({
    mutationFn: async () => {
      const r = await apiRequest("POST", "/api/checkins", {
        userId, date: todayStr, sleepQuality, energyLevel, mood, stressLevel,
        notes: notes.trim() || null,
      });
      return r.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/checkins", userId, todayStr] });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    },
  });

  const stateMap: Record<string, { val: number; set: (v: number) => void }> = {
    sleepQuality: { val: sleepQuality, set: setSleepQuality },
    energyLevel: { val: energyLevel, set: setEnergyLevel },
    mood: { val: mood, set: setMood },
    stressLevel: { val: stressLevel, set: setStressLevel },
  };

  const alreadyDone = !!todayCheckin;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[700px] mx-auto px-6 py-8">
        {/* Page header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <ClipboardCheck size={18} className="text-primary" />
            <h1 className="text-xl font-semibold text-foreground tracking-tight">Daily Check-in</h1>
          </div>
          <p className="text-xs text-muted-foreground">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })} — Rate how you feel today
          </p>
        </div>

        {/* 7-day history dots */}
        <div className="bg-card border border-border/40 rounded-xl p-4 mb-6">
          <p className="text-xs text-muted-foreground mb-3">Last 7 days</p>
          <div className="flex gap-2 justify-between">
            {past7.map((date, i) => {
              const isToday = date === todayStr;
              const d = new Date(date);
              const dayLabel = d.toLocaleDateString("en", { weekday: "short" });
              const hasTodayCheckin = isToday && alreadyDone;
              return (
                <div key={date} className="flex-1 text-center">
                  <div
                    className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center text-xs font-mono transition-all ${
                      hasTodayCheckin ? "bg-primary text-primary-foreground" :
                      isToday ? "ring-2 ring-primary/40 bg-card text-foreground" :
                      i < 6 ? "bg-primary/20 text-primary" :
                      "bg-border/30 text-muted-foreground"
                    }`}
                    data-testid={`checkin-dot-${date}`}
                  >
                    {hasTodayCheckin ? "\u2713" : d.getDate()}
                  </div>
                  <p className={`text-[10px] mt-1 ${isToday ? "text-primary font-semibold" : "text-muted-foreground/60"}`}>{dayLabel}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Already done message */}
        {alreadyDone && (
          <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 mb-6 text-center">
            <p className="text-sm text-primary font-medium">You've already checked in today!</p>
            <p className="text-xs text-muted-foreground mt-1">
              Sleep: {todayCheckin.sleepQuality}/5 · Energy: {todayCheckin.energyLevel}/5 · Mood: {todayCheckin.mood}/5 · Stress: {todayCheckin.stressLevel}/5
            </p>
          </div>
        )}

        {/* Sliders */}
        <div className="bg-card border border-border/40 rounded-xl p-5 mb-6">
          <div className="space-y-6">
            {sliders.map((s) => {
              const Icon = s.icon;
              const { val, set } = stateMap[s.key];
              return (
                <div key={s.key}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Icon size={16} className={s.color} />
                      <span className="text-sm font-medium text-foreground">{s.label}</span>
                    </div>
                    <span className="text-xs font-mono text-muted-foreground">{val}/5 · {levelLabels[val]}</span>
                  </div>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        onClick={() => set(n)}
                        className={`flex-1 h-10 rounded-lg text-sm font-mono font-semibold transition-all ${
                          n <= val
                            ? `${s.bgColor} text-white`
                            : "bg-border/30 text-muted-foreground hover:bg-border/50"
                        }`}
                        data-testid={`${s.key}-${n}`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Notes */}
        <div className="bg-card border border-border/40 rounded-xl p-5 mb-6">
          <label className="text-sm font-medium text-foreground block mb-2">Notes (optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="How are you feeling? Anything notable today?"
            rows={3}
            className="w-full bg-background border border-border/50 rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary/30 resize-none transition-colors"
            data-testid="checkin-notes"
          />
        </div>

        {/* Save button */}
        <button
          onClick={() => saveCheckin.mutate()}
          disabled={saveCheckin.isPending || alreadyDone}
          className={`w-full py-3 rounded-xl text-sm font-semibold transition-all ${
            saved
              ? "bg-emerald-500 text-white"
              : alreadyDone
              ? "bg-muted text-muted-foreground cursor-not-allowed"
              : "bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50"
          }`}
          data-testid="save-checkin"
        >
          {saveCheckin.isPending ? "Saving..." : saved ? "Saved!" : alreadyDone ? "Already checked in today" : "Save Check-in"}
        </button>
      </div>
    </div>
  );
}
