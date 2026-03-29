import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useUser } from "../App";
import { apiRequest } from "../lib/queryClient";
import { CreditCard, Check, Crown, Lock } from "lucide-react";

export default function Pricing() {
  const { user } = useUser();
  const userId = user?.id || 1;
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const { data: subscription } = useQuery({
    queryKey: ["/api/subscription", userId],
    queryFn: async () => { const r = await apiRequest("GET", `/api/subscription/${userId}`); return r.json(); },
  });

  const currentPlan = subscription?.plan || "free";

  async function handleCheckout(plan: string) {
    if (plan === "free") return;
    setCheckoutLoading(plan);
    setMessage(null);
    try {
      const r = await apiRequest("POST", "/api/subscription/checkout", { userId, plan });
      const data = await r.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setMessage(data.message || "Payments coming soon");
      }
    } catch {
      setMessage("Something went wrong. Try again later.");
    }
    setCheckoutLoading(null);
  }

  const plans = [
    {
      id: "essential", name: "Essential", price: 29,
      features: ["AI protocol adjustments", "Biomarker analysis", "Effectiveness scoring", "Email briefings", "Unlimited health data entry"],
      popular: false,
    },
    {
      id: "premium", name: "Premium", price: 79,
      features: ["Everything in Essential", "Unlimited supplements", "AI meal macro estimation", "Advanced bio age analytics", "Priority AI coach responses"],
      popular: true,
    },
    {
      id: "concierge", name: "Concierge", price: 249,
      features: ["Everything in Premium", "Dedicated wellness advisor", "Custom lab panel design", "Monthly video check-in", "Supplement sourcing service"],
      popular: false,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1200px] mx-auto px-6 py-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <CreditCard size={18} className="text-primary" />
            <h1 className="text-xl font-semibold text-foreground tracking-tight">Choose Your Plan</h1>
          </div>
          <p className="text-sm text-muted-foreground">Unlock the full power of AI-driven wellness optimization</p>
        </div>

        {message && (
          <div className="max-w-md mx-auto mb-6 p-3 bg-primary/10 border border-primary/20 rounded-xl text-center">
            <p className="text-sm text-primary font-medium">{message}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {plans.map((plan) => {
            const isCurrent = currentPlan === plan.id;
            return (
              <div key={plan.id}
                className={`bg-card border rounded-xl p-6 relative ${
                  plan.popular ? "border-primary/40 ring-1 ring-primary/20" : "border-border/40"
                }`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                      Most Popular
                    </span>
                  </div>
                )}
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-foreground">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-3xl font-serif font-semibold text-foreground">${plan.price}</span>
                    <span className="text-sm text-muted-foreground">/mo</span>
                  </div>
                </div>
                <ul className="space-y-2.5 mb-6">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check size={14} className="text-primary mt-0.5 shrink-0" />
                      <span className="text-sm text-muted-foreground">{f}</span>
                    </li>
                  ))}
                </ul>
                {isCurrent ? (
                  <button disabled className="w-full py-2.5 rounded-lg text-sm font-semibold bg-primary/10 text-primary cursor-default">
                    Current Plan
                  </button>
                ) : (
                  <button onClick={() => handleCheckout(plan.id)}
                    disabled={checkoutLoading === plan.id}
                    className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-all ${
                      plan.popular
                        ? "bg-primary text-primary-foreground hover:opacity-90"
                        : "bg-secondary text-foreground hover:bg-secondary/80"
                    } disabled:opacity-50`}>
                    {checkoutLoading === plan.id ? "Loading..." : "Subscribe"}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Free tier note */}
        <div className="text-center mt-8">
          <p className="text-xs text-muted-foreground">
            {currentPlan === "free" && <><Crown size={12} className="inline text-amber-400 mr-1" />You're on the Free plan — upgrade to unlock AI features</>}
          </p>
        </div>
      </div>
    </div>
  );
}
