import { Utensils, Flame, Droplets, Wheat, Beef, Clock, ChevronRight, Sparkles, Leaf } from "lucide-react";

interface Meal {
  name: string;
  time: string;
  cal: number;
  protein: number;
  carbs: number;
  fat: number;
  tags: string[];
  rationale: string;
}

const meals: Meal[] = [
  {
    name: "Turmeric Avocado Bowl",
    time: "7:30 AM · Breakfast",
    cal: 480,
    protein: 22,
    carbs: 38,
    fat: 28,
    tags: ["Anti-inflammatory", "Brain fuel"],
    rationale: "Golden turmeric with healthy fats to support morning cognitive performance",
  },
  {
    name: "Omega-Rich Salmon Poke",
    time: "12:30 PM · Lunch",
    cal: 520,
    protein: 38,
    carbs: 42,
    fat: 18,
    tags: ["Omega-3", "Recovery"],
    rationale: "High EPA/DHA content to complement your supplement stack and reduce inflammation",
  },
  {
    name: "Adaptogenic Matcha Smoothie",
    time: "3:00 PM · Snack",
    cal: 220,
    protein: 12,
    carbs: 28,
    fat: 6,
    tags: ["L-Theanine", "Focus"],
    rationale: "Sustained energy without cortisol spike — pairs with your afternoon breathwork",
  },
  {
    name: "Grass-Fed Steak & Greens",
    time: "7:00 PM · Dinner",
    cal: 580,
    protein: 42,
    carbs: 24,
    fat: 32,
    tags: ["Iron", "B12", "Zinc"],
    rationale: "Bioavailable micronutrients for overnight muscle repair and HRV optimization",
  },
];

const dailyTargets = { cal: 1800, protein: 114, carbs: 132, fat: 84 };
const consumed = { cal: 1000, protein: 60, carbs: 80, fat: 46 };

function MacroBar({ label, current, target, color, icon: Icon }: {
  label: string; current: number; target: number; color: string; icon: any;
}) {
  const pct = Math.min((current / target) * 100, 100);
  return (
    <div className="flex-1">
      <div className="flex items-center gap-1 mb-1.5">
        <Icon size={10} className={color} />
        <span className="text-[10px] text-muted-foreground">{label}</span>
      </div>
      <div className="w-full h-1 bg-border rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all`} style={{ width: `${pct}%`, backgroundColor: `hsl(var(--chart-1))` }} />
      </div>
      <p className="text-[10px] font-mono text-foreground mt-1">
        {current}g <span className="text-muted-foreground">/ {target}g</span>
      </p>
    </div>
  );
}

export default function Nutrition() {
  return (
    <div className="min-h-screen bg-background">
      <header className="px-5 pt-14 pb-2">
        <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">
          Recovery-Focused
        </p>
        <h1 className="text-lg font-semibold text-foreground tracking-tight mt-1">
          Nutrition Plan
        </h1>
      </header>

      <div className="px-5 pb-8 stagger-children">
        {/* AI Rationale */}
        <div className="bg-primary/5 border border-primary/10 rounded-2xl p-3.5 flex items-start gap-3 mb-4">
          <Sparkles size={14} className="text-primary mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-medium text-foreground">Today's Focus: Anti-Inflammatory</p>
            <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">
              Your HRV and sleep data suggest mild systemic inflammation. Today's meals prioritize omega-3s, antioxidants, and gut-healing compounds.
            </p>
          </div>
        </div>

        {/* Daily Macro Summary */}
        <div className="bg-card border border-border/50 rounded-2xl p-4 mb-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Daily Targets</p>
              <p className="text-lg font-mono font-semibold text-foreground mt-0.5">
                {consumed.cal} <span className="text-sm text-muted-foreground font-normal">/ {dailyTargets.cal} kcal</span>
              </p>
            </div>
            <div className="w-12 h-12 rounded-full border-2 border-primary/30 flex items-center justify-center">
              <Flame size={18} className="text-primary" />
            </div>
          </div>

          <div className="flex gap-4">
            <MacroBar label="Protein" current={consumed.protein} target={dailyTargets.protein} color="text-blue-400" icon={Beef} />
            <MacroBar label="Carbs" current={consumed.carbs} target={dailyTargets.carbs} color="text-amber-400" icon={Wheat} />
            <MacroBar label="Fat" current={consumed.fat} target={dailyTargets.fat} color="text-rose-400" icon={Droplets} />
          </div>
        </div>

        {/* Meal Cards */}
        <div className="space-y-3">
          {meals.map((meal, i) => (
            <div
              key={meal.name}
              className="bg-card border border-border/50 rounded-2xl overflow-hidden"
              data-testid={`meal-${i}`}
            >
              {/* Meal header with gradient accent */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock size={10} className="text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground font-mono">{meal.time}</span>
                    </div>
                    <h3 className="text-sm font-semibold text-foreground">{meal.name}</h3>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-accent/50 flex items-center justify-center">
                    <Utensils size={16} className="text-accent-foreground/60" />
                  </div>
                </div>

                {/* Tags */}
                <div className="flex gap-1.5 mb-3">
                  {meal.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[9px] px-2 py-0.5 rounded-full bg-primary/8 text-primary font-medium border border-primary/10"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Macros row */}
                <div className="flex items-center gap-3 text-[10px] font-mono text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Flame size={10} className="text-orange-400" /> {meal.cal} kcal
                  </span>
                  <span>P{meal.protein}g</span>
                  <span>C{meal.carbs}g</span>
                  <span>F{meal.fat}g</span>
                </div>

                {/* AI Rationale */}
                <div className="mt-3 pt-3 border-t border-border/30">
                  <div className="flex items-start gap-2">
                    <Leaf size={10} className="text-primary mt-0.5 shrink-0" />
                    <p className="text-[10px] text-muted-foreground leading-relaxed italic">
                      {meal.rationale}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Hydration reminder */}
        <div className="mt-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl p-3.5 flex items-center gap-3">
          <Droplets size={16} className="text-blue-400" />
          <div className="flex-1">
            <p className="text-xs font-medium text-foreground">Hydration Target</p>
            <p className="text-[10px] text-muted-foreground">2.4L remaining · Electrolytes recommended post-workout</p>
          </div>
        </div>
      </div>
    </div>
  );
}
