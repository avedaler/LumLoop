import { useQuery } from "@tanstack/react-query";
import { useUser } from "../App";
import { apiRequest } from "../lib/queryClient";
import LumLoopLogo from "../components/lumloop-logo";
import { PerplexityAttribution } from "../components/PerplexityAttribution";
import {
  User, Crown, Bell, Shield, Settings,
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
      <div className="max-w-[1200px] mx-auto px-6 py-8">
        {/* Page header */}
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-foreground tracking-tight">Profile</h1>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT column — User info */}
          <div className="space-y-4">
            {/* User card */}
            <div className="bg-card border border-border/40 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                  <User size={24} className="text-primary" />
                </div>
                <div className="flex-1">
                  <h2 className="text-base font-semibold text-foreground">{user?.name || "User"}</h2>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Crown size={12} className="text-amber-400" />
                    <span className="text-xs text-amber-400 font-medium">Free Plan</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-6 pt-3 border-t border-border/20">
                <div className="flex items-center gap-2">
                  <Dna size={14} className="text-primary" />
                  <span className="text-sm font-mono font-semibold text-foreground">{score?.bioAge?.toFixed(1) || "34.2"}</span>
                  <span className="text-xs text-muted-foreground">Bio Age</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target size={14} className="text-emerald-400" />
                  <span className="text-sm font-mono font-semibold text-foreground">23</span>
                  <span className="text-xs text-muted-foreground">Day Streak</span>
                </div>
              </div>
            </div>

            {/* Wellness Goals — horizontal progress bars */}
            {goals.length > 0 && (
              <div className="bg-card border border-border/40 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-foreground mb-4">Wellness Goals</h3>
                <div className="space-y-3">
                  {goals.map((g) => (
                    <div key={g.id}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs text-muted-foreground">{g.goalName}</span>
                        <span className="text-xs font-mono font-semibold text-foreground">{g.progress}%</span>
                      </div>
                      <div className="w-full h-2 bg-border/30 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-500"
                          style={{ width: `${g.progress || 0}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upgrade CTA banner */}
            <div className="bg-gradient-to-r from-primary/8 via-primary/4 to-transparent border border-primary/12 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <Crown size={16} className="text-amber-400" />
                <span className="text-sm font-bold text-foreground">Upgrade to Premium</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                Dynamic protocol adjustments, biomarker analysis, GLP-1 companion, and advanced insights.
              </p>
              <button className="bg-primary text-primary-foreground px-5 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity" data-testid="button-upgrade">
                View Plans — from $29/mo
              </button>
            </div>
          </div>

          {/* RIGHT column — Settings sections */}
          <div className="lg:col-span-2 space-y-4">
            {/* Devices section */}
            <div className="bg-card border border-border/40 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-foreground mb-3">Devices & Integrations</h3>
              <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-secondary/30 transition-colors" data-testid="menu-connected-devices">
                <Smartphone size={16} className="text-muted-foreground/60" />
                <span className="text-sm text-foreground flex-1 text-left">Connected Devices</span>
                <span className="text-xs text-muted-foreground">None</span>
              </button>
            </div>

            {/* Notifications section */}
            <div className="bg-card border border-border/40 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-foreground mb-3">Notifications</h3>
              <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-secondary/30 transition-colors" data-testid="menu-notifications">
                <Bell size={16} className="text-muted-foreground/60" />
                <span className="text-sm text-foreground flex-1 text-left">Push & Email Notifications</span>
                <span className="text-xs text-primary font-medium">On</span>
              </button>
            </div>

            {/* Privacy section */}
            <div className="bg-card border border-border/40 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-foreground mb-3">Privacy & Security</h3>
              <div className="space-y-0.5">
                <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-secondary/30 transition-colors" data-testid="menu-health-data-&-privacy">
                  <Shield size={16} className="text-muted-foreground/60" />
                  <span className="text-sm text-foreground flex-1 text-left">Health Data & Privacy</span>
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-secondary/30 transition-colors" data-testid="menu-preferences">
                  <Settings size={16} className="text-muted-foreground/60" />
                  <span className="text-sm text-foreground flex-1 text-left">Preferences</span>
                </button>
              </div>
            </div>

            {/* Support section */}
            <div className="bg-card border border-border/40 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-foreground mb-3">Help & Support</h3>
              <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-secondary/30 transition-colors" data-testid="menu-support">
                <HelpCircle size={16} className="text-muted-foreground/60" />
                <span className="text-sm text-foreground flex-1 text-left">Support</span>
              </button>
            </div>

            {/* Sign out & Footer */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={async () => { try { await fetch('/api/auth/logout', { method: 'POST' }); } catch(e) {} setUser(null); }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-destructive/70 hover:bg-destructive/5 transition-colors"
                data-testid="button-signout"
              >
                <LogOut size={16} />
                <span className="text-sm font-medium">Sign Out</span>
              </button>
              <div className="flex items-center gap-3">
                <LumLoopLogo size={16} className="opacity-20" />
                <span className="text-[10px] text-muted-foreground/30">LumLoop v2.0</span>
                <PerplexityAttribution />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
