import { useState } from "react";
import {
  Snowflake, Droplets, Flame, Wind, Brain, Stethoscope,
  Activity, Star, Clock, MapPin, ChevronRight, Sparkles, ShieldCheck
} from "lucide-react";

interface Treatment {
  name: string;
  category: string;
  icon: any;
  iconColor: string;
  iconBg: string;
  description: string;
  duration: string;
  price: string;
  rating: number;
  reviews: number;
  venue: string;
  aiMatch: number;
  nextSlot: string;
}

const treatments: Treatment[] = [
  {
    name: "Whole-Body Cryotherapy",
    category: "Recovery",
    icon: Snowflake,
    iconColor: "text-cyan-400",
    iconBg: "bg-cyan-500/10",
    description: "3-minute cold exposure at -110°C for inflammation reduction and recovery acceleration",
    duration: "15 min",
    price: "$85",
    rating: 4.9,
    reviews: 342,
    venue: "CryoElite Studio",
    aiMatch: 96,
    nextSlot: "Today 3:30 PM",
  },
  {
    name: "NAD+ IV Infusion",
    category: "IV Therapy",
    icon: Droplets,
    iconColor: "text-emerald-400",
    iconBg: "bg-emerald-500/10",
    description: "High-dose NAD+ delivered intravenously for cellular repair and energy restoration",
    duration: "90 min",
    price: "$450",
    rating: 4.8,
    reviews: 187,
    venue: "Vitality Drip Lounge",
    aiMatch: 92,
    nextSlot: "Tomorrow 10:00 AM",
  },
  {
    name: "Deep Tissue Massage",
    category: "Bodywork",
    icon: Activity,
    iconColor: "text-rose-400",
    iconBg: "bg-rose-500/10",
    description: "Targeted myofascial release with sports recovery focus and percussion therapy",
    duration: "60 min",
    price: "$180",
    rating: 4.9,
    reviews: 521,
    venue: "The Recovery Room",
    aiMatch: 88,
    nextSlot: "Today 5:00 PM",
  },
  {
    name: "Infrared Sauna Suite",
    category: "Heat Therapy",
    icon: Flame,
    iconColor: "text-amber-400",
    iconBg: "bg-amber-500/10",
    description: "Full-spectrum infrared session with chromotherapy for detox and relaxation",
    duration: "45 min",
    price: "$65",
    rating: 4.7,
    reviews: 298,
    venue: "Glow Wellness Hub",
    aiMatch: 85,
    nextSlot: "Today 6:30 PM",
  },
  {
    name: "Guided Breathwork",
    category: "Mindfulness",
    icon: Wind,
    iconColor: "text-sky-400",
    iconBg: "bg-sky-500/10",
    description: "Expert-led holotropic breathwork session for nervous system regulation",
    duration: "45 min",
    price: "$95",
    rating: 4.8,
    reviews: 164,
    venue: "Breath & Being Studio",
    aiMatch: 90,
    nextSlot: "Thursday 8:00 AM",
  },
  {
    name: "Advanced Blood Panel",
    category: "Diagnostics",
    icon: Stethoscope,
    iconColor: "text-purple-400",
    iconBg: "bg-purple-500/10",
    description: "Comprehensive biomarker panel: hormones, inflammation markers, metabolic health, nutrient levels",
    duration: "30 min",
    price: "$350",
    rating: 4.9,
    reviews: 89,
    venue: "Longevity Labs",
    aiMatch: 94,
    nextSlot: "Friday 9:00 AM",
  },
];

const categories = ["All", "Recovery", "IV Therapy", "Bodywork", "Heat Therapy", "Mindfulness", "Diagnostics"];

export default function Marketplace() {
  const [filter, setFilter] = useState("All");
  const filtered = filter === "All" ? treatments : treatments.filter((t) => t.category === filter);

  return (
    <div className="min-h-screen bg-background">
      <header className="px-5 pt-14 pb-2">
        <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">
          Curated For You
        </p>
        <h1 className="text-lg font-semibold text-foreground tracking-tight mt-1">
          Wellness Treatments
        </h1>
      </header>

      <div className="px-5 pb-8">
        {/* AI Match Banner */}
        <div className="bg-primary/5 border border-primary/10 rounded-2xl p-3.5 flex items-start gap-3 mb-4">
          <Sparkles size={14} className="text-primary mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-medium text-foreground">AI-Matched Treatments</p>
            <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">
              Ranked by your recovery data, HRV trends, and wellness goals. Higher match scores indicate stronger benefit alignment.
            </p>
          </div>
        </div>

        {/* Category pills */}
        <div className="mb-5 overflow-x-auto scrollbar-none -mx-5 px-5">
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
                data-testid={`filter-${cat.toLowerCase().replace(/\s/g, "-")}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Treatment Cards */}
        <div className="space-y-3 stagger-children">
          {filtered.map((t) => {
            const Icon = t.icon;
            return (
              <div
                key={t.name}
                className="bg-card border border-border/50 rounded-2xl p-4"
                data-testid={`treatment-${t.name.toLowerCase().replace(/\s/g, "-")}`}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-xl ${t.iconBg} flex items-center justify-center shrink-0`}>
                    <Icon size={18} className={t.iconColor} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-foreground">{t.name}</h3>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-primary/8 text-primary font-medium border border-primary/10">
                        {t.category}
                      </span>
                      <span className="flex items-center gap-0.5 text-[10px] text-amber-400">
                        <Star size={8} fill="currentColor" /> {t.rating}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        ({t.reviews})
                      </span>
                    </div>
                  </div>
                  {/* AI Match badge */}
                  <div className="flex flex-col items-center shrink-0">
                    <div className="flex items-center gap-1">
                      <ShieldCheck size={10} className="text-primary" />
                      <span className="text-xs font-mono font-semibold text-primary">{t.aiMatch}%</span>
                    </div>
                    <span className="text-[8px] text-muted-foreground uppercase tracking-wider">Match</span>
                  </div>
                </div>

                <p className="text-[11px] text-muted-foreground leading-relaxed mb-3">
                  {t.description}
                </p>

                <div className="flex items-center gap-3 text-[10px] text-muted-foreground mb-3">
                  <span className="flex items-center gap-1">
                    <Clock size={10} /> {t.duration}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin size={10} /> {t.venue}
                  </span>
                </div>

                {/* Footer: price + book */}
                <div className="flex items-center justify-between pt-3 border-t border-border/30">
                  <div>
                    <span className="text-sm font-semibold text-foreground">{t.price}</span>
                    <span className="text-[10px] text-muted-foreground ml-1">/ session</span>
                  </div>
                  <button
                    className="bg-primary text-primary-foreground px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-opacity hover:opacity-90 active:scale-[0.98]"
                    data-testid={`book-${t.name.toLowerCase().replace(/\s/g, "-")}`}
                  >
                    {t.nextSlot.includes("Today") ? "Book Today" : "Reserve"}
                    <ChevronRight size={12} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
