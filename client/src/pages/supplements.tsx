import { useState } from "react";
import { Pill, Clock, ShieldCheck, RefreshCw, ChevronRight, Sparkles, Info } from "lucide-react";

interface Supplement {
  name: string;
  dose: string;
  timing: string;
  benefit: string;
  form: string;
  confidence: number;
  taken: boolean;
  category: string;
}

const supplements: Supplement[] = [
  {
    name: "Magnesium L-Threonate",
    dose: "2,000 mg",
    timing: "Morning",
    benefit: "Cognitive function, sleep quality, stress resilience",
    form: "Capsule",
    confidence: 96,
    taken: true,
    category: "Cognitive",
  },
  {
    name: "Omega-3 EPA/DHA",
    dose: "2,400 mg",
    timing: "With meal",
    benefit: "Anti-inflammatory, cardiovascular, brain health",
    form: "Softgel",
    confidence: 98,
    taken: true,
    category: "Foundation",
  },
  {
    name: "Vitamin D3 + K2",
    dose: "5,000 IU + 200 mcg",
    timing: "Morning",
    benefit: "Immune function, bone density, mood regulation",
    form: "Liquid drop",
    confidence: 95,
    taken: false,
    category: "Foundation",
  },
  {
    name: "Ashwagandha KSM-66",
    dose: "600 mg",
    timing: "Evening",
    benefit: "Cortisol management, stress recovery, sleep onset",
    form: "Capsule",
    confidence: 92,
    taken: false,
    category: "Adaptogen",
  },
  {
    name: "NMN (Nicotinamide Mononucleotide)",
    dose: "500 mg",
    timing: "Morning, fasted",
    benefit: "NAD+ precursor, cellular energy, longevity",
    form: "Sublingual",
    confidence: 88,
    taken: false,
    category: "Longevity",
  },
  {
    name: "Creatine Monohydrate",
    dose: "5 g",
    timing: "Any time",
    benefit: "Cognitive reserve, ATP production, muscle recovery",
    form: "Powder",
    confidence: 97,
    taken: false,
    category: "Performance",
  },
];

const categories = ["All", "Foundation", "Cognitive", "Adaptogen", "Longevity", "Performance"];

export default function Supplements() {
  const [items, setItems] = useState(supplements);
  const [filter, setFilter] = useState("All");
  const takenCount = items.filter((s) => s.taken).length;

  const filtered = filter === "All" ? items : items.filter((s) => s.category === filter);

  const toggleTaken = (name: string) => {
    setItems(items.map((s) => s.name === name ? { ...s, taken: !s.taken } : s));
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="px-5 pt-14 pb-2">
        <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">
          Personalized Stack
        </p>
        <h1 className="text-lg font-semibold text-foreground tracking-tight mt-1">
          Supplements
        </h1>
      </header>

      {/* AI Confidence Banner */}
      <div className="px-5 mb-4">
        <div className="bg-primary/5 border border-primary/10 rounded-2xl p-3.5 flex items-start gap-3">
          <Sparkles size={14} className="text-primary mt-0.5 shrink-0" />
          <div>
            <p className="text-xs text-foreground font-medium">AI-Curated Protocol</p>
            <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">
              Based on your assessment, sleep data, and wellness goals. Each supplement includes a clinical confidence score.
            </p>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="px-5 mb-4">
        <div className="bg-card border border-border/50 rounded-xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Pill size={14} className="text-primary" />
            <span className="text-xs text-foreground font-medium">Today's Adherence</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-20 h-1.5 bg-border rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${(takenCount / items.length) * 100}%` }}
              />
            </div>
            <span className="text-xs font-mono text-muted-foreground">
              {takenCount}/{items.length}
            </span>
          </div>
        </div>
      </div>

      {/* Category filter */}
      <div className="px-5 mb-4 overflow-x-auto scrollbar-none">
        <div className="flex gap-2 pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3 py-1.5 rounded-full text-[11px] font-medium whitespace-nowrap transition-colors ${
                filter === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
              data-testid={`filter-${cat.toLowerCase()}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Supplement Cards */}
      <div className="px-5 pb-8 space-y-3 stagger-children">
        {filtered.map((s) => (
          <div
            key={s.name}
            className="bg-card border border-border/50 rounded-2xl p-4"
            data-testid={`supplement-${s.name.toLowerCase().replace(/\s/g, "-")}`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-foreground">{s.name}</h3>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{s.benefit}</p>
              </div>
              <button
                onClick={() => toggleTaken(s.name)}
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                  s.taken ? "bg-primary border-primary" : "border-border"
                }`}
                data-testid={`toggle-${s.name.toLowerCase().replace(/\s/g, "-")}`}
              >
                {s.taken && <span className="text-primary-foreground text-[10px]">✓</span>}
              </button>
            </div>

            <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <Pill size={10} /> {s.dose} · {s.form}
              </span>
              <span className="flex items-center gap-1">
                <Clock size={10} /> {s.timing}
              </span>
            </div>

            {/* Confidence bar */}
            <div className="mt-3 flex items-center gap-2">
              <ShieldCheck size={10} className="text-primary shrink-0" />
              <div className="flex-1 h-1 bg-border rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary/60 rounded-full"
                  style={{ width: `${s.confidence}%` }}
                />
              </div>
              <span className="text-[10px] font-mono text-primary">{s.confidence}%</span>
            </div>
          </div>
        ))}

        {/* Reorder CTA */}
        <div className="bg-card border border-dashed border-primary/20 rounded-2xl p-4 flex items-center gap-3">
          <RefreshCw size={16} className="text-primary" />
          <div className="flex-1">
            <p className="text-xs font-medium text-foreground">Auto-Replenish Active</p>
            <p className="text-[10px] text-muted-foreground">Next delivery: March 25 · 6 items</p>
          </div>
          <ChevronRight size={14} className="text-muted-foreground" />
        </div>
      </div>
    </div>
  );
}
