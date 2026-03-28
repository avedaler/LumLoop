import { useState } from "react";
import { useLocation } from "wouter";
import { useUser } from "../App";
import { apiRequest } from "../lib/queryClient";
import LumLoopLogo from "../components/lumloop-logo";
import { ArrowLeft, Check } from "lucide-react";

const questions = [
  {
    id: "primaryGoal", title: "Primary wellness goal", subtitle: "What matters most to you right now?",
    options: [
      { label: "Peak Performance", emoji: "*" },
      { label: "Better Sleep", emoji: "*" },
      { label: "Stress Recovery", emoji: "*" },
      { label: "Longevity", emoji: "*" },
      { label: "Mental Clarity", emoji: "*" },
      { label: "Physical Recovery", emoji: "*" },
    ],
  },
  {
    id: "sleepQuality", title: "Average sleep quality", subtitle: "How would you rate your typical night?",
    options: [
      { label: "Excellent (7-9h)", emoji: "*" },
      { label: "Good (6-7h)", emoji: "*" },
      { label: "Fair (5-6h)", emoji: "*" },
      { label: "Poor (<5h)", emoji: "*" },
    ],
  },
  {
    id: "stressLevel", title: "Daily stress level", subtitle: "On a typical workday, how stressed do you feel?",
    options: [
      { label: "Low", emoji: "*" },
      { label: "Moderate", emoji: "*" },
      { label: "High", emoji: "*" },
      { label: "Very High", emoji: "*" },
    ],
  },
  {
    id: "supplementUse", title: "Current supplement use", subtitle: "What are you currently taking?",
    options: [
      { label: "Nothing yet", emoji: "*" },
      { label: "Basic vitamins", emoji: "*" },
      { label: "Targeted stack", emoji: "*" },
      { label: "Advanced protocols", emoji: "*" },
    ],
  },
  {
    id: "glp1User", title: "GLP-1 medication", subtitle: "Are you currently on any GLP-1 medication?",
    options: [
      { label: "No", emoji: "*" },
      { label: "Yes - injectable", emoji: "*" },
      { label: "Yes - oral", emoji: "*" },
      { label: "Planning to start", emoji: "*" },
    ],
  },
];

export default function Assessment() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [analyzing, setAnalyzing] = useState(false);
  const { user, setUser } = useUser();
  const [, setLocation] = useLocation();

  const question = questions[step];
  const progress = ((step + 1) / questions.length) * 100;

  const handleSelect = async (option: string) => {
    const newAnswers = { ...answers, [question.id]: option };
    setAnswers(newAnswers);

    if (step < questions.length - 1) {
      setTimeout(() => setStep(step + 1), 250);
    } else {
      // Submit assessment
      setAnalyzing(true);
      try {
        const assessmentData = {
          userId: user?.id || 1,
          primaryGoal: newAnswers.primaryGoal,
          sleepQuality: newAnswers.sleepQuality,
          stressLevel: newAnswers.stressLevel,
          supplementUse: newAnswers.supplementUse,
          glp1User: newAnswers.glp1User?.includes("Yes") || false,
          dietStyle: null,
          exerciseFrequency: null,
        };
        await apiRequest("POST", "/api/assessment", assessmentData);
        // Update user context
        if (user) {
          setUser({ ...user, onboardingComplete: true });
        }
        setTimeout(() => setLocation("/"), 2500);
      } catch (e) {
        setTimeout(() => setLocation("/"), 2500);
      }
    }
  };

  if (analyzing) {
    return (
      <div className="min-h-screen bg-background gradient-mesh flex flex-col items-center justify-center px-8 text-center">
        <div className="animate-fade-in-up">
          <LumLoopLogo size={48} className="mx-auto mb-6 animate-pulse" />
          <h2 className="font-serif text-xl font-medium text-foreground tracking-tight mb-3">Building your protocol</h2>
          <p className="text-muted-foreground text-sm max-w-xs mx-auto mb-8">
            Our AI is analyzing your responses and cross-referencing with clinical wellness data...
          </p>
          <div className="flex items-center justify-center gap-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="w-2 h-2 rounded-full bg-primary" style={{ animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }} />
            ))}
          </div>
          <div className="mt-8 space-y-2 text-xs text-muted-foreground/60">
            <p className="animate-fade-in-up" style={{ animationDelay: "0.5s" }}>Analyzing sleep patterns</p>
            <p className="animate-fade-in-up" style={{ animationDelay: "1s" }}>Calibrating supplement stack</p>
            <p className="animate-fade-in-up" style={{ animationDelay: "1.5s" }}>Generating recovery plan</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col px-6 pt-14 pb-8">
      <div className="flex items-center justify-between mb-8">
        <button onClick={() => step > 0 && setStep(step - 1)} className={`w-9 h-9 rounded-full flex items-center justify-center ${step > 0 ? "bg-secondary text-foreground" : "opacity-0"}`} data-testid="button-back">
          <ArrowLeft size={16} />
        </button>
        <span className="text-xs text-muted-foreground font-mono tracking-wider">{step + 1}/{questions.length}</span>
        <div className="w-9" />
      </div>

      <div className="w-full h-0.5 bg-border rounded-full mb-10 overflow-hidden">
        <div className="h-full bg-primary rounded-full transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
      </div>

      <div className="animate-fade-in-up" key={step}>
        <h2 className="font-serif text-xl font-medium text-foreground tracking-tight mb-1.5">{question.title}</h2>
        <p className="text-sm text-muted-foreground mb-8">{question.subtitle}</p>
        <div className="space-y-3">
          {question.options.map((opt) => {
            const isSelected = answers[question.id] === opt.label;
            return (
              <button key={opt.label} onClick={() => handleSelect(opt.label)}
                className={`w-full text-left px-4 py-3.5 rounded-2xl border transition-all flex items-center gap-3 ${
                  isSelected ? "border-primary bg-primary/5 text-foreground" : "border-border bg-card hover:border-primary/30 text-foreground/80"
                }`}
                data-testid={`option-${opt.label.toLowerCase().replace(/\s/g, "-")}`}
              >
                <span className="text-sm font-medium flex-1">{opt.label}</span>
                {isSelected && <Check size={16} className="text-primary" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
