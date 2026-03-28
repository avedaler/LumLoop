import { useQuery } from "@tanstack/react-query";
import { useUser } from "../App";
import { apiRequest } from "../lib/queryClient";
import LumLoopLogo from "../components/lumloop-logo";
import { PerplexityAttribution } from "../components/PerplexityAttribution";
import {
  User, Crown, ChevronRight, Bell, Shield, Settings,
  Smartphone, HelpCircle, LogOut, Dna, Target
} from "lucide-react";
import type { WellnessGoal, DailyScore } from "@shared/schema";

export default function ProfilePage() {
  const { user, setUser } = useUser();
  const userId = user?.id || 1;

  const { data: goals = [] } = useQuery<WellnessGoal[]>({
    queryKey: ["/api/goals", userId],
    queryFn: async () => { const r = await apiRequest("GET", `/api/goals/${userId}`); return r.json(); },
  });

  const { data: score } = useQuery<DailyScore>({
    queryKey: ["/api/scores", userId, "today"],
    queryFn: async () => { const r = await apiRequest("GET", `/api/scores/${userId}/today`); return r.json(); },
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="px-5 pt-14 pb-2">
        <h1 className="text-lg font-semibold text-foreground tracking-tight">Profile</h1>
      </header>

      <div className="px-5 pb-8">
        {/* User card — compact */}
        <div className="bg-card border border-border/40 rounded-2xl p-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
              <User size={20} className="text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-sm font-semibold text-foreground">{user?.name || "User"}</h2>
              <p className="text-[10px] text-muted-foreground">{user?.email}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Crown size={9} className="text-amber-400" />
                <span className="text-[9px] text-amber-400 font-medium">Free Plan</span>
              </div>
            </div>
          </div>
          {/* Key stat line */}
          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border/20">
            <div className="flex items-center gap-1">
              <Dna size={10} className="text-primary" />
              <span className="text-[10px] font-mono font-semibold text-foreground">{score?.bioAge?.toFixed(1) || "34.2"}</span>
              <span className="text-[8px] text-muted-foreground">Bio Age</span>
            </div>
            <div className="flex items-center gap-1">
              <Target size={10} className="text-emerald-400" />
              <span className="text-[10px] font-mono font-semibold text-foreground">23</span>
              <span className="text-[8px] text-muted-foreground">Day Streak</span>
            </div>
          </div>
        </div>

        {/* Wellness Goals — horizontal scroll */}
        {goals.length > 0 && (
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-[12px] font-semibold text-foreground">Wellness Goals</h3>
            </div>
            <div className="flex gap-2 overflow-x-auto scrollbar-none -mx-5 px-5 pb-1">
              {goals.map((g) => (
                <div key={g.id} className="bg-card border border-border/40 rounded-xl p-3 min-w-[110px] shrink-0">
                  <div className="relative w-12 h-12 mx-auto mb-2">
                    <svg className="w-12 h-12 -rotate-90">
                      <circle cx="24" cy="24" r="20" stroke="hsl(225 8% 15%)" strokeWidth="3" fill="none" />
                      <circle cx="24" cy="24" r="20" stroke="hsl(152 26% 46%)" strokeWidth="3" fill="none"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 20}`}
                        strokeDashoffset={`${2 * Math.PI * 20 * (1 - (g.progress || 0) / 100)}`}
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-[10px] font-mono font-bold text-foreground">
                      {g.progress}%
                    </span>
                  </div>
                  <p className="text-[9px] text-center text-muted-foreground font-medium">{g.goalName}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Membership upgrade */}
        <div className="bg-gradient-to-r from-primary/6 via-primary/3 to-transparent border border-primary/12 rounded-2xl p-4 mb-5">
          <div className="flex items-center gap-2 mb-1.5">
            <Crown size={14} className="text-amber-400" />
            <span className="text-[11px] font-bold text-foreground">Upgrade to Premium</span>
          </div>
          <p className="text-[10px] text-muted-foreground leading-relaxed mb-3">
            Dynamic protocol adjustments, biomarker analysis, GLP-1 companion, and advanced insights.
          </p>
          <button className="w-full bg-primary text-primary-foreground py-2.5 rounded-xl text-xs font-semibold hover:opacity-90 transition-opacity" data-testid="button-upgrade">
            View Plans — from $29/mo
          </button>
        </div>

        {/* Menu */}
        <div className="space-y-0.5 mb-5">
          {[
            { icon: Smartphone, label: "Connected Devices" },
            { icon: Bell, label: "Notifications" },
            { icon: Shield, label: "Health Data & Privacy" },
            { icon: Settings, label: "Preferences" },
            { icon: HelpCircle, label: "Support" },
          ].map((item) => (
            <button key={item.label} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-secondary/30 transition-colors" data-testid={`menu-${item.label.toLowerCase().replace(/\s/g, "-")}`}>
              <item.icon size={15} className="text-muted-foreground/50" />
              <span className="text-[11px] font-medium text-foreground flex-1 text-left">{item.label}</span>
              <ChevronRight size={13} className="text-muted-foreground/30" />
            </button>
          ))}
        </div>

        {/* Sign out */}
        <button onClick={async () => { try { await fetch('/api/auth/logout', { method: 'POST' }); } catch(e) {} setUser(null); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-destructive/70 hover:bg-destructive/5 transition-colors" data-testid="button-signout">
          <LogOut size={15} />
          <span className="text-[11px] font-medium">Sign Out</span>
        </button>

        {/* Footer */}
        <div className="mt-8 text-center">
          <LumLoopLogo size={16} className="mx-auto mb-1.5 opacity-20" />
          <p className="text-[8px] text-muted-foreground/30 mb-3">LumLoop v2.0</p>
          <PerplexityAttribution />
        </div>
      </div>
    </div>
  );
}
