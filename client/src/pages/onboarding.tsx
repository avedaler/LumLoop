import { useState } from "react";
import { useUser } from "../App";
import { apiRequest } from "../lib/queryClient";
import LumLoopLogo from "../components/lumloop-logo";
import { ArrowRight, Moon, Zap, Brain, Heart, Dna, Shield } from "lucide-react";

const goals = [
  { id: "Peak Performance", icon: Zap, color: "text-amber-400", bg: "bg-amber-500/8 border-amber-500/15" },
  { id: "Better Sleep", icon: Moon, color: "text-blue-400", bg: "bg-blue-500/8 border-blue-500/15" },
  { id: "Stress Recovery", icon: Heart, color: "text-rose-400", bg: "bg-rose-500/8 border-rose-500/15" },
  { id: "Longevity", icon: Dna, color: "text-emerald-400", bg: "bg-emerald-500/8 border-emerald-500/15" },
  { id: "Mental Clarity", icon: Brain, color: "text-purple-400", bg: "bg-purple-500/8 border-purple-500/15" },
  { id: "Recovery", icon: Shield, color: "text-cyan-400", bg: "bg-cyan-500/8 border-cyan-500/15" },
];

export default function Onboarding() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [selectedGoal, setSelectedGoal] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { setUser } = useUser();

  const handleSubmit = async () => {
    if (!name.trim() || !email.trim() || !selectedGoal) {
      setError("Please fill in all fields and select a goal");
      return;
    }
    setLoading(true);
    setError("");
    try {
      // Register user
      const userRes = await apiRequest("POST", "/api/auth/register", {
        name: name.trim(),
        email: email.trim().toLowerCase(),
      });
      const user = await userRes.json();

      // Submit quick assessment
      await apiRequest("POST", "/api/assessment", {
        userId: user.id,
        primaryGoal: selectedGoal,
        sleepQuality: null,
        stressLevel: null,
        supplementUse: null,
        glp1User: false,
        dietStyle: null,
        exerciseFrequency: null,
      });

      setUser({ ...user, onboardingComplete: true });
    } catch (e) {
      setError("Something went wrong. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background gradient-mesh flex flex-col px-6 pt-16 pb-8">
      {/* Brand */}
      <div className="text-center mb-8 animate-fade-in-up">
        <LumLoopLogo size={44} className="mx-auto mb-4" />
        <h1 className="font-serif text-2xl font-medium text-foreground tracking-tight">LumLoop</h1>
        <p className="text-[11px] text-muted-foreground mt-1">Your AI wellness operating system</p>
      </div>

      {/* Single form — name, email, goal */}
      <div className="flex-1 stagger-children">
        {/* Name */}
        <div className="mb-4">
          <label className="text-[9px] text-muted-foreground uppercase tracking-[0.15em] font-bold block mb-1.5">Your Name</label>
          <input
            type="text" value={name} onChange={(e) => setName(e.target.value)}
            placeholder="Daler"
            className="w-full bg-card border border-border/50 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary/30"
            data-testid="input-name"
          />
        </div>

        {/* Email */}
        <div className="mb-5">
          <label className="text-[9px] text-muted-foreground uppercase tracking-[0.15em] font-bold block mb-1.5">Email</label>
          <input
            type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="daler@lumloop.com"
            className="w-full bg-card border border-border/50 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary/30"
            data-testid="input-email"
          />
        </div>

        {/* Goal selection */}
        <div className="mb-6">
          <label className="text-[9px] text-muted-foreground uppercase tracking-[0.15em] font-bold block mb-2">What matters most to you?</label>
          <div className="grid grid-cols-2 gap-2">
            {goals.map((g) => {
              const isSelected = selectedGoal === g.id;
              return (
                <button
                  key={g.id}
                  onClick={() => setSelectedGoal(g.id)}
                  className={`flex items-center gap-2.5 px-3 py-3 rounded-xl border transition-all text-left ${
                    isSelected
                      ? "border-primary bg-primary/5"
                      : `${g.bg} hover:border-primary/20`
                  }`}
                  data-testid={`goal-${g.id.toLowerCase().replace(/\s/g, "-")}`}
                >
                  <g.icon size={16} className={isSelected ? "text-primary" : g.color} />
                  <span className={`text-[11px] font-medium ${isSelected ? "text-primary" : "text-foreground/80"}`}>{g.id}</span>
                </button>
              );
            })}
          </div>
        </div>

        {error && <p className="text-xs text-destructive mb-3 text-center">{error}</p>}

        {/* CTA */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-primary text-primary-foreground py-3.5 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] disabled:opacity-50 transition-all"
          data-testid="button-start"
        >
          {loading ? "Building your protocol..." : "Start My Protocol"}
          {!loading && <ArrowRight size={16} />}
        </button>

        <p className="mt-3 text-[8px] text-muted-foreground/40 text-center">
          Free to start. No credit card required.
        </p>
      </div>
    </div>
  );
}
