import { useState } from "react";
import { useLocation } from "wouter";
import { useUser } from "../App";
import { apiRequest } from "../lib/queryClient";
import LumLoopLogo from "../components/lumloop-logo";
import { ArrowRight, Brain, Shield, Dna, FlaskConical } from "lucide-react";

const features = [
  { icon: Dna, title: "Biological Wellness Age", desc: "One number that tracks your health trajectory -- updated daily from your data" },
  { icon: Brain, title: "AI-Powered Protocols", desc: "Personalized supplement stacks, nutrition plans, and recovery -- adapted continuously" },
  { icon: FlaskConical, title: "GLP-1 Companion Mode", desc: "Muscle preservation, micronutrient optimization, and side-effect tracking for GLP-1 users" },
  { icon: Shield, title: "9/9 Wellness Coverage", desc: "The only platform with AI coaching, supplements, biomarkers, nutrition, and recovery -- all in one loop" },
];

const replacements = [
  { name: "WHOOP", saves: "$30/mo" },
  { name: "Supplement brand", saves: "$50/mo" },
  { name: "Nutrition app", saves: "$8/mo" },
  { name: "Lab testing", saves: "$40/mo" },
];

export default function Welcome() {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [registering, setRegistering] = useState(false);
  const [error, setError] = useState("");
  const { setUser } = useUser();
  const [, setLocation] = useLocation();

  const handleRegister = async () => {
    if (!name.trim() || !email.trim()) {
      setError("Please enter your name and email");
      return;
    }
    setRegistering(true);
    setError("");
    try {
      const res = await apiRequest("POST", "/api/auth/register", { name: name.trim(), email: email.trim().toLowerCase() });
      const user = await res.json();
      setUser(user);
      setLocation("/assessment");
    } catch (e: any) {
      setError("Something went wrong. Please try again.");
    }
    setRegistering(false);
  };

  // Step 0: Brand intro
  if (step === 0) {
    return (
      <div className="min-h-screen bg-background gradient-mesh flex flex-col items-center justify-center px-8 text-center">
        <div className="animate-fade-in-up">
          <LumLoopLogo size={56} className="mx-auto mb-6" />
          <h1 className="font-serif text-3xl font-medium text-foreground tracking-tight mb-3">LumLoop</h1>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-xs mx-auto mb-1">The AI wellness operating system for</p>
          <p className="text-foreground/80 text-sm font-medium tracking-wide mb-1">high-performing professionals</p>
          <p className="text-[10px] text-primary font-mono mt-2 mb-8">Sense &rarr; Interpret &rarr; Recommend &rarr; Fulfill &rarr; Measure</p>
        </div>
        <div className="w-full max-w-xs stagger-children">
          {features.map((f, i) => (
            <div key={i} className="flex items-start gap-3 text-left mb-5">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <f.icon size={16} className="text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{f.title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <button onClick={() => setStep(1)} className="mt-8 w-full max-w-xs bg-primary text-primary-foreground py-3.5 rounded-2xl text-sm font-semibold tracking-wide flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.98]" data-testid="button-get-started">
          Begin Your Journey <ArrowRight size={16} />
        </button>
        <p className="mt-4 text-[10px] text-muted-foreground/60 tracking-wide">Replaces 4+ wellness subscriptions</p>
      </div>
    );
  }

  // Step 1: Cost replacement
  if (step === 1) {
    return (
      <div className="min-h-screen bg-background gradient-mesh flex flex-col items-center justify-center px-8 text-center">
        <div className="animate-fade-in-up w-full max-w-xs">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
            <Shield size={24} className="text-primary" />
          </div>
          <h2 className="font-serif text-xl font-medium text-foreground tracking-tight mb-2">Replace 4 subscriptions with 1</h2>
          <p className="text-sm text-muted-foreground mb-6">LumLoop covers everything. Cancel the rest.</p>
          <div className="space-y-2 mb-6">
            {replacements.map((r) => (
              <div key={r.name} className="flex items-center justify-between bg-card border border-border/50 rounded-xl px-4 py-2.5">
                <span className="text-xs text-muted-foreground line-through">{r.name}</span>
                <span className="text-xs font-mono text-red-400/60">{r.saves}</span>
              </div>
            ))}
            <div className="flex items-center justify-between bg-primary/5 border border-primary/15 rounded-xl px-4 py-3">
              <span className="text-xs font-semibold text-primary">LumLoop replaces all</span>
              <span className="text-xs font-mono font-bold text-primary">from $79/mo</span>
            </div>
          </div>
          <button onClick={() => setStep(2)} className="w-full bg-primary text-primary-foreground py-3.5 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98]" data-testid="button-continue">
            Continue <ArrowRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  // Step 2: Registration form
  return (
    <div className="min-h-screen bg-background gradient-mesh flex flex-col items-center justify-center px-8 text-center">
      <div className="animate-fade-in-up w-full max-w-xs">
        <LumLoopLogo size={40} className="mx-auto mb-4" />
        <h2 className="font-serif text-xl font-medium text-foreground tracking-tight mb-2">Create your account</h2>
        <p className="text-sm text-muted-foreground mb-6">Start your personalized wellness journey</p>

        <div className="space-y-3 mb-6 text-left">
          <div>
            <label className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium block mb-1.5">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Alexander Vedaler"
              className="w-full bg-card border border-border/50 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/30 transition-colors"
              data-testid="input-name"
            />
          </div>
          <div>
            <label className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium block mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@lumloop.com"
              className="w-full bg-card border border-border/50 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/30 transition-colors"
              data-testid="input-email"
            />
          </div>
        </div>

        {error && <p className="text-xs text-destructive mb-3">{error}</p>}

        <button
          onClick={handleRegister}
          disabled={registering}
          className="w-full bg-primary text-primary-foreground py-3.5 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
          data-testid="button-register"
        >
          {registering ? "Creating your protocol..." : "Start AI Assessment"}
          {!registering && <ArrowRight size={16} />}
        </button>

        <p className="mt-4 text-[9px] text-muted-foreground/40">By continuing, you agree to our Terms of Service and Privacy Policy</p>
      </div>
    </div>
  );
}
