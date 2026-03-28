import { Link } from "wouter";
import LumLoopLogo from "../components/lumloop-logo";
import {
  User, Target, Shield, Moon, Zap, Brain, Heart,
  ChevronRight, Bell, Settings, HelpCircle, LogOut,
  Crown, Calendar, Dumbbell
} from "lucide-react";
import { PerplexityAttribution } from "../components/PerplexityAttribution";

const goals = [
  { icon: Brain, label: "Mental Clarity", progress: 78, color: "text-purple-400" },
  { icon: Moon, label: "Sleep Quality", progress: 85, color: "text-blue-400" },
  { icon: Heart, label: "Heart Health", progress: 72, color: "text-rose-400" },
  { icon: Zap, label: "Energy Levels", progress: 90, color: "text-amber-400" },
  { icon: Dumbbell, label: "Recovery", progress: 68, color: "text-emerald-400" },
];

const stats = [
  { label: "Active Days", value: "47" },
  { label: "Supplements Taken", value: "282" },
  { label: "Treatments Booked", value: "12" },
  { label: "Days Streak", value: "23" },
];

const menuItems = [
  { icon: Bell, label: "Notifications", path: "#" },
  { icon: Shield, label: "Health Data & Privacy", path: "#" },
  { icon: Calendar, label: "Connected Devices", path: "#" },
  { icon: Settings, label: "Preferences", path: "#" },
  { icon: HelpCircle, label: "Support & FAQ", path: "#" },
];

export default function Profile() {
  return (
    <div className="min-h-screen bg-background">
      <header className="px-5 pt-14 pb-2">
        <h1 className="text-lg font-semibold text-foreground tracking-tight">
          Profile
        </h1>
      </header>

      <div className="px-5 pb-8 stagger-children">
        {/* Profile Card */}
        <div className="bg-card border border-border/50 rounded-2xl p-5 mb-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <User size={24} className="text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-semibold text-foreground">Alexander Vedaler</h2>
              <p className="text-xs text-muted-foreground">Founder & CEO</p>
              <div className="flex items-center gap-1.5 mt-1">
                <Crown size={10} className="text-amber-400" />
                <span className="text-[10px] text-amber-400 font-medium">Premium Member</span>
              </div>
            </div>
            <Link href="/membership">
              <button className="text-xs text-primary flex items-center gap-0.5" data-testid="link-membership">
                Manage <ChevronRight size={12} />
              </button>
            </Link>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-4 gap-2 mt-5 pt-4 border-t border-border/30">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-sm font-mono font-bold text-foreground">{s.value}</p>
                <p className="text-[9px] text-muted-foreground mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Wellness Goals */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Target size={14} className="text-primary" />
              <h3 className="text-sm font-semibold text-foreground">Wellness Goals</h3>
            </div>
            <button className="text-xs text-primary flex items-center gap-0.5" data-testid="button-edit-goals">
              Edit <ChevronRight size={12} />
            </button>
          </div>

          <div className="space-y-3">
            {goals.map((g) => {
              const Icon = g.icon;
              return (
                <div
                  key={g.label}
                  className="bg-card border border-border/50 rounded-xl px-3.5 py-3 flex items-center gap-3"
                >
                  <Icon size={16} className={g.color} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-foreground">{g.label}</span>
                      <span className="text-[10px] font-mono text-muted-foreground">{g.progress}%</span>
                    </div>
                    <div className="w-full h-1 bg-border rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${g.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Menu Items */}
        <div className="space-y-1 mb-5">
          {menuItems.map((item) => (
            <button
              key={item.label}
              className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl hover:bg-secondary/50 transition-colors"
              data-testid={`menu-${item.label.toLowerCase().replace(/\s/g, "-")}`}
            >
              <item.icon size={16} className="text-muted-foreground" />
              <span className="text-xs font-medium text-foreground flex-1 text-left">{item.label}</span>
              <ChevronRight size={14} className="text-muted-foreground/50" />
            </button>
          ))}
        </div>

        {/* Sign out */}
        <button
          className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-destructive hover:bg-destructive/5 transition-colors"
          data-testid="button-signout"
        >
          <LogOut size={16} />
          <span className="text-xs font-medium">Sign Out</span>
        </button>

        {/* Footer attribution */}
        <div className="mt-8 text-center">
          <LumLoopLogo size={20} className="mx-auto mb-2 opacity-30" />
          <p className="text-[10px] text-muted-foreground/40 mb-4">LumLoop v2.0 · Build 2026.3</p>
          <PerplexityAttribution />
        </div>
      </div>
    </div>
  );
}
