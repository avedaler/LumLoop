import { useState } from "react";
import { useUser } from "../App";
import { apiRequest } from "../lib/queryClient";
import LumLoopLogo from "../components/lumloop-logo";
import { ArrowRight, Moon, Zap, Brain, Heart, Dna, Shield, Mail } from "lucide-react";

const goals = [
  { id: "Peak Performance", icon: Zap, color: "text-amber-400", bg: "bg-amber-500/8 border-amber-500/15" },
  { id: "Better Sleep", icon: Moon, color: "text-blue-400", bg: "bg-blue-500/8 border-blue-500/15" },
  { id: "Stress Recovery", icon: Heart, color: "text-rose-400", bg: "bg-rose-500/8 border-rose-500/15" },
  { id: "Longevity", icon: Dna, color: "text-emerald-400", bg: "bg-emerald-500/8 border-emerald-500/15" },
  { id: "Mental Clarity", icon: Brain, color: "text-purple-400", bg: "bg-purple-500/8 border-purple-500/15" },
  { id: "Recovery", icon: Shield, color: "text-cyan-400", bg: "bg-cyan-500/8 border-cyan-500/15" },
];

export default function Onboarding() {
  const [mode, setMode] = useState<"register" | "login">("register");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [selectedGoal, setSelectedGoal] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { setUser } = useUser();

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !selectedGoal) {
      setError("Please fill in all fields and select a goal");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await apiRequest("POST", "/api/auth/register", {
        name: name.trim(), email: email.trim().toLowerCase(),
      });
      const user = await res.json();

      // If user already has onboarding complete (returning user), just log in
      if (user.onboardingComplete) {
        setUser(user);
        return;
      }

      // Submit assessment for new user
      await apiRequest("POST", "/api/assessment", {
        userId: user.id, primaryGoal: selectedGoal,
        sleepQuality: null, stressLevel: null, supplementUse: null,
        glp1User: false, dietStyle: null, exerciseFrequency: null,
      });
      setUser({ ...user, onboardingComplete: true });
    } catch (e) {
      setError("Something went wrong. Please try again.");
    }
    setLoading(false);
  };

  const handleLogin = async () => {
    if (!email.trim()) {
      setError("Please enter your email");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await apiRequest("POST", "/api/auth/login", { email: email.trim().toLowerCase() });
      const user = await res.json();
      setUser(user);
    } catch (e: any) {
      setError("No account found with this email. Try registering instead.");
    }
    setLoading(false);
  };

  // ─── LOGIN MODE ───
  if (mode === "login") {
    return (
      <div className="min-h-screen bg-background gradient-mesh flex flex-col px-6 pt-20 pb-8">
        <div className="text-center mb-8 animate-fade-in-up">
          <LumLoopLogo size={40} className="mx-auto mb-4" />
          <h1 className="font-serif text-2xl font-medium text-foreground tracking-tight">Welcome back</h1>
          <p className="text-[11px] text-muted-foreground mt-1">Sign in with your email</p>
        </div>

        <div className="flex-1 max-w-sm mx-auto w-full">
          <div className="mb-5">
            <label className="text-[9px] text-muted-foreground uppercase tracking-[0.15em] font-bold block mb-1.5">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="daler@lumloop.com"
              className="w-full bg-card border border-border/50 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary/30"
              data-testid="login-email"
            />
          </div>

          {error && <p className="text-xs text-destructive mb-3 text-center">{error}</p>}

          <button onClick={handleLogin} disabled={loading}
            className="w-full bg-primary text-primary-foreground py-3.5 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] disabled:opacity-50 transition-all mb-4"
            data-testid="button-login"
          >
            {loading ? "Signing in..." : "Sign In"}
            {!loading && <ArrowRight size={16} />}
          </button>

          <button onClick={() => { setMode("register"); setError(""); }}
            className="w-full text-center text-[11px] text-muted-foreground hover:text-foreground transition-colors"
            data-testid="switch-to-register"
          >
            Don't have an account? <span className="text-primary font-semibold">Create one</span>
          </button>
        </div>
      </div>
    );
  }

  // ─── REGISTER MODE ───
  return (
    <div className="min-h-screen bg-background gradient-mesh flex flex-col px-6 pt-12 pb-8">
      <div className="text-center mb-6 animate-fade-in-up">
        <LumLoopLogo size={40} className="mx-auto mb-3" />
        <h1 className="font-serif text-2xl font-medium text-foreground tracking-tight">LumLoop</h1>
        <p className="text-[11px] text-muted-foreground mt-1">Your AI wellness operating system</p>
      </div>

      <div className="flex-1 stagger-children max-w-sm mx-auto w-full">
        <div className="mb-3">
          <label className="text-[9px] text-muted-foreground uppercase tracking-[0.15em] font-bold block mb-1.5">Your Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)}
            placeholder="Daler" autoComplete="name"
            className="w-full bg-card border border-border/50 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary/30"
            data-testid="input-name"
          />
        </div>

        <div className="mb-4">
          <label className="text-[9px] text-muted-foreground uppercase tracking-[0.15em] font-bold block mb-1.5">Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="daler@lumloop.com" autoComplete="email"
            className="w-full bg-card border border-border/50 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary/30"
            data-testid="input-email"
          />
        </div>

        <div className="mb-5">
          <label className="text-[9px] text-muted-foreground uppercase tracking-[0.15em] font-bold block mb-2">What matters most to you?</label>
          <div className="grid grid-cols-2 gap-2">
            {goals.map((g) => {
              const isSelected = selectedGoal === g.id;
              return (
                <button key={g.id} onClick={() => setSelectedGoal(g.id)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border transition-all text-left ${
                    isSelected ? "border-primary bg-primary/5" : `${g.bg} hover:border-primary/20`
                  }`}
                  data-testid={`goal-${g.id.toLowerCase().replace(/\s/g, "-")}`}
                >
                  <g.icon size={14} className={isSelected ? "text-primary" : g.color} />
                  <span className={`text-[10px] font-medium ${isSelected ? "text-primary" : "text-foreground/80"}`}>{g.id}</span>
                </button>
              );
            })}
          </div>
        </div>

        {error && <p className="text-xs text-destructive mb-3 text-center">{error}</p>}

        <button onClick={handleRegister} disabled={loading}
          className="w-full bg-primary text-primary-foreground py-3.5 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] disabled:opacity-50 transition-all mb-3"
          data-testid="button-start"
        >
          {loading ? "Building your protocol..." : "Start My Protocol"}
          {!loading && <ArrowRight size={16} />}
        </button>

        <button onClick={() => { setMode("login"); setError(""); }}
          className="w-full text-center text-[11px] text-muted-foreground hover:text-foreground transition-colors"
          data-testid="switch-to-login"
        >
          Already have an account? <span className="text-primary font-semibold">Sign in</span>
        </button>
      </div>
    </div>
  );
}
