import {
  Crown, Sparkles, Brain, Pill, Activity, ShieldCheck,
  Zap, Star, ChevronRight, Check, Lock
} from "lucide-react";

const tiers = [
  {
    name: "Essential",
    price: "$29",
    period: "/month",
    description: "Foundation wellness tracking and basic AI insights",
    features: [
      "Daily readiness score",
      "Basic supplement recommendations",
      "Sleep & energy tracking",
      "Weekly AI wellness summary",
    ],
    cta: "Current Plan",
    active: false,
    highlight: false,
  },
  {
    name: "Premium",
    price: "$79",
    period: "/month",
    description: "Full AI-powered precision wellness with advanced protocols",
    features: [
      "Everything in Essential",
      "AI-personalized supplement stack",
      "Recovery-focused nutrition plans",
      "Biomarker integration & tracking",
      "Priority treatment booking",
      "Advanced analytics dashboard",
      "Monthly wellness report",
    ],
    cta: "Upgrade to Premium",
    active: true,
    highlight: true,
  },
  {
    name: "Concierge",
    price: "$249",
    period: "/month",
    description: "White-glove wellness with dedicated AI coach and expert access",
    features: [
      "Everything in Premium",
      "Dedicated wellness concierge",
      "1:1 expert consultations (monthly)",
      "Custom longevity protocols",
      "Genomic & epigenetic integration",
      "Exclusive treatment access & pricing",
      "Quarterly comprehensive blood panel",
      "Supplement auto-delivery included",
    ],
    cta: "Apply for Concierge",
    active: false,
    highlight: false,
  },
];

const exclusivePerks = [
  { icon: Brain, title: "AI Wellness Coach", desc: "24/7 personalized guidance powered by your biomarker data" },
  { icon: Pill, title: "Smart Stack Optimizer", desc: "Dynamic supplement protocols that adapt to your sleep and recovery" },
  { icon: Activity, title: "Treatment Matching", desc: "AI-curated recovery sessions based on your real-time wellness data" },
  { icon: ShieldCheck, title: "Clinical Confidence", desc: "Every recommendation backed by peer-reviewed research" },
];

export default function Membership() {
  return (
    <div className="min-h-screen bg-background">
      <header className="px-5 pt-14 pb-2">
        <div className="flex items-center gap-2">
          <Crown size={16} className="text-amber-400" />
          <p className="text-xs text-amber-400/80 uppercase tracking-widest font-medium">
            Exclusive Access
          </p>
        </div>
        <h1 className="text-lg font-semibold text-foreground tracking-tight mt-1">
          Membership
        </h1>
      </header>

      <div className="px-5 pb-8 stagger-children">
        {/* Hero message */}
        <div className="bg-gradient-to-br from-amber-500/8 via-primary/5 to-transparent border border-amber-500/10 rounded-2xl p-5 mb-5 text-center">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center mx-auto mb-3">
            <Crown size={22} className="text-amber-400" />
          </div>
          <h2 className="font-serif text-xl font-medium text-foreground tracking-tight mb-2">
            Elevate Your Protocol
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-xs mx-auto">
            Unlock the full power of AI-driven precision wellness. Join 12,000+ high-performing professionals who trust LumLoop.
          </p>
        </div>

        {/* Tier Cards */}
        <div className="space-y-3 mb-6">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`rounded-2xl p-4 border ${
                tier.highlight
                  ? "bg-primary/5 border-primary/20"
                  : "bg-card border-border/50"
              }`}
              data-testid={`tier-${tier.name.toLowerCase()}`}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-foreground">{tier.name}</h3>
                    {tier.highlight && (
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-primary text-primary-foreground font-semibold uppercase tracking-wider">
                        Recommended
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{tier.description}</p>
                </div>
              </div>

              <div className="flex items-baseline gap-0.5 mb-3">
                <span className="text-2xl font-mono font-bold text-foreground">{tier.price}</span>
                <span className="text-xs text-muted-foreground">{tier.period}</span>
              </div>

              <div className="space-y-2 mb-4">
                {tier.features.map((f) => (
                  <div key={f} className="flex items-center gap-2">
                    <Check size={12} className={tier.highlight ? "text-primary" : "text-muted-foreground"} />
                    <span className="text-[11px] text-foreground/80">{f}</span>
                  </div>
                ))}
              </div>

              <button
                className={`w-full py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  tier.highlight
                    ? "bg-primary text-primary-foreground hover:opacity-90 active:scale-[0.98]"
                    : tier.active
                    ? "bg-secondary text-secondary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
                data-testid={`cta-${tier.name.toLowerCase()}`}
              >
                {tier.cta}
              </button>
            </div>
          ))}
        </div>

        {/* Exclusive Perks */}
        <div className="mb-5">
          <h3 className="text-sm font-semibold text-foreground mb-3">Premium Benefits</h3>
          <div className="grid grid-cols-2 gap-2">
            {exclusivePerks.map((perk) => (
              <div
                key={perk.title}
                className="bg-card border border-border/50 rounded-xl p-3"
              >
                <perk.icon size={16} className="text-primary mb-2" />
                <p className="text-xs font-medium text-foreground mb-0.5">{perk.title}</p>
                <p className="text-[10px] text-muted-foreground leading-relaxed">{perk.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Trust signals */}
        <div className="flex items-center justify-center gap-4 text-[10px] text-muted-foreground/60 py-4">
          <span className="flex items-center gap-1">
            <Lock size={10} /> Encrypted
          </span>
          <span>·</span>
          <span className="flex items-center gap-1">
            <ShieldCheck size={10} /> HIPAA Ready
          </span>
          <span>·</span>
          <span>Cancel anytime</span>
        </div>
      </div>
    </div>
  );
}
