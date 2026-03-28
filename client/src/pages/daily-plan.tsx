import { useState } from "react";
import {
  Sun, Coffee, Pill, Dumbbell, Utensils, Brain, Moon,
  Snowflake, Wind, CheckCircle2, Circle, Clock
} from "lucide-react";

interface PlanItem {
  time: string;
  title: string;
  subtitle: string;
  icon: any;
  iconColor: string;
  iconBg: string;
  done: boolean;
  category: string;
}

const planItems: PlanItem[] = [
  {
    time: "6:30 AM",
    title: "Morning Light Exposure",
    subtitle: "10 min sunlight within 30 min of waking",
    icon: Sun,
    iconColor: "text-amber-400",
    iconBg: "bg-amber-500/10",
    done: true,
    category: "Recovery",
  },
  {
    time: "7:00 AM",
    title: "Morning Supplement Stack",
    subtitle: "Magnesium L-Threonate, Omega-3, D3+K2",
    icon: Pill,
    iconColor: "text-emerald-400",
    iconBg: "bg-emerald-500/10",
    done: true,
    category: "Supplements",
  },
  {
    time: "7:30 AM",
    title: "Anti-inflammatory Breakfast",
    subtitle: "Avocado bowl with turmeric eggs · 480 kcal",
    icon: Coffee,
    iconColor: "text-orange-400",
    iconBg: "bg-orange-500/10",
    done: true,
    category: "Nutrition",
  },
  {
    time: "9:00 AM",
    title: "Deep Work Block",
    subtitle: "Peak cognitive window — minimize distractions",
    icon: Brain,
    iconColor: "text-purple-400",
    iconBg: "bg-purple-500/10",
    done: false,
    category: "Performance",
  },
  {
    time: "12:30 PM",
    title: "Recovery Lunch",
    subtitle: "Omega-rich salmon bowl · 520 kcal · P32 C45 F18",
    icon: Utensils,
    iconColor: "text-blue-400",
    iconBg: "bg-blue-500/10",
    done: false,
    category: "Nutrition",
  },
  {
    time: "2:00 PM",
    title: "Breathwork Session",
    subtitle: "4-7-8 technique · 10 minutes · Cortisol window",
    icon: Wind,
    iconColor: "text-sky-400",
    iconBg: "bg-sky-500/10",
    done: false,
    category: "Recovery",
  },
  {
    time: "4:00 PM",
    title: "Movement Protocol",
    subtitle: "Zone 2 cardio · 30 min · Heart rate 120-140 bpm",
    icon: Dumbbell,
    iconColor: "text-rose-400",
    iconBg: "bg-rose-500/10",
    done: false,
    category: "Exercise",
  },
  {
    time: "5:30 PM",
    title: "Cryotherapy Session",
    subtitle: "3 min whole-body · Recovery optimization",
    icon: Snowflake,
    iconColor: "text-cyan-400",
    iconBg: "bg-cyan-500/10",
    done: false,
    category: "Treatment",
  },
  {
    time: "9:00 PM",
    title: "Evening Wind-Down",
    subtitle: "Ashwagandha + Magnesium · Blue light glasses",
    icon: Moon,
    iconColor: "text-indigo-400",
    iconBg: "bg-indigo-500/10",
    done: false,
    category: "Sleep",
  },
];

export default function DailyPlan() {
  const [items, setItems] = useState(planItems);
  const completedCount = items.filter((i) => i.done).length;
  const progress = (completedCount / items.length) * 100;

  const toggle = (index: number) => {
    const updated = [...items];
    updated[index] = { ...updated[index], done: !updated[index].done };
    setItems(updated);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="px-5 pt-14 pb-2">
        <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">
          Wednesday, March 18
        </p>
        <h1 className="text-lg font-semibold text-foreground tracking-tight mt-1">
          Daily Wellness Plan
        </h1>
      </header>

      {/* Progress summary */}
      <div className="px-5 mb-5">
        <div className="bg-card border border-border/50 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-muted-foreground">Today's Progress</span>
            <span className="text-xs font-mono font-semibold text-foreground">
              {completedCount}/{items.length}
            </span>
          </div>
          <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center gap-4 mt-3">
            {["Recovery", "Nutrition", "Performance"].map((cat) => (
              <span key={cat} className="text-[10px] text-muted-foreground flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                {cat}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="px-5 pb-8">
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-[19px] top-2 bottom-2 w-px bg-border" />

          <div className="space-y-1">
            {items.map((item, i) => {
              const Icon = item.icon;
              return (
                <div
                  key={i}
                  className="relative flex items-start gap-3 py-3"
                  data-testid={`plan-item-${i}`}
                >
                  {/* Timeline dot */}
                  <button
                    onClick={() => toggle(i)}
                    className="relative z-10 shrink-0 mt-0.5"
                    data-testid={`toggle-${i}`}
                  >
                    {item.done ? (
                      <CheckCircle2 size={16} className="text-primary" fill="hsl(152 24% 48%)" />
                    ) : (
                      <Circle size={16} className="text-border" />
                    )}
                  </button>

                  {/* Content */}
                  <div
                    className={`flex-1 flex items-start gap-3 bg-card border border-border/50 rounded-xl px-3 py-2.5 transition-opacity ${
                      item.done ? "opacity-50" : ""
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg ${item.iconBg} flex items-center justify-center shrink-0`}>
                      <Icon size={14} className={item.iconColor} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`text-xs font-medium ${item.done ? "line-through text-muted-foreground" : "text-foreground"}`}>
                          {item.title}
                        </p>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">
                        {item.subtitle}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Clock size={10} className="text-muted-foreground/50" />
                      <span className="text-[10px] font-mono text-muted-foreground">{item.time}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
