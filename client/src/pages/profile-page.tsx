import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useUser } from "../App";
import { apiRequest, queryClient } from "../lib/queryClient";
import LumLoopLogo from "../components/lumloop-logo";
import { PerplexityAttribution } from "../components/PerplexityAttribution";
import {
  User, Crown, Bell, Shield, Settings,
  Smartphone, HelpCircle, LogOut, Dna, Target
} from "lucide-react";
import type { WellnessGoal, DailyScore } from "@shared/schema";
import { Link } from "wouter";

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

  const { data: subscription } = useQuery({
    queryKey: ["/api/subscription", userId],
    queryFn: async () => { const r = await apiRequest("GET", `/api/subscription/${userId}`); return r.json(); },
  });

  const { data: notifPrefs } = useQuery({
    queryKey: ["/api/notifications", userId],
    queryFn: async () => { const r = await apiRequest("GET", `/api/notifications/${userId}`); return r.json(); },
  });

  const [emailBriefing, setEmailBriefing] = useState(true);
  const [emailWeeklyReview, setEmailWeeklyReview] = useState(true);
  const [supplementReminders, setSupplementReminders] = useState(true);
  const [checkinReminders, setCheckinReminders] = useState(true);
  const [anomalyAlerts, setAnomalyAlerts] = useState(true);
  const [timezone, setTimezone] = useState("Asia/Kuala_Lumpur");

  useEffect(() => {
    if (notifPrefs) {
      setEmailBriefing(notifPrefs.emailBriefing !== false);
      setEmailWeeklyReview(notifPrefs.emailWeeklyReview !== false);
      setSupplementReminders(notifPrefs.supplementReminders !== false);
      setCheckinReminders(notifPrefs.checkinReminders !== false);
      setAnomalyAlerts(notifPrefs.anomalyAlerts !== false);
      if (notifPrefs.timezone) setTimezone(notifPrefs.timezone);
    }
  }, [notifPrefs]);

  const savePrefs = useMutation({
    mutationFn: async (data: Record<string, any>) => {
      const r = await apiRequest("PUT", `/api/notifications/${userId}`, data);
      return r.json();
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/notifications", userId] }); },
  });

  function togglePref(key: string, value: boolean, setter: (v: boolean) => void) {
    setter(value);
    savePrefs.mutate({
      emailBriefing: key === "emailBriefing" ? value : emailBriefing,
      emailWeeklyReview: key === "emailWeeklyReview" ? value : emailWeeklyReview,
      supplementReminders: key === "supplementReminders" ? value : supplementReminders,
      checkinReminders: key === "checkinReminders" ? value : checkinReminders,
      anomalyAlerts: key === "anomalyAlerts" ? value : anomalyAlerts,
      timezone,
    });
  }

  function updateTimezone(tz: string) {
    setTimezone(tz);
    savePrefs.mutate({ emailBriefing, emailWeeklyReview, supplementReminders, checkinReminders, anomalyAlerts, timezone: tz });
  }

  const planName = subscription?.plan || "free";
  const planLabel = planName.charAt(0).toUpperCase() + planName.slice(1);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1200px] mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-foreground tracking-tight">Profile</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT column */}
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
                    <span className="text-xs text-amber-400 font-medium">{planLabel} Plan</span>
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

            {/* Wellness Goals */}
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
                        <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${g.progress || 0}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upgrade CTA */}
            {planName === "free" && (
              <Link href="/pricing">
                <div className="bg-gradient-to-r from-primary/8 via-primary/4 to-transparent border border-primary/12 rounded-xl p-5 cursor-pointer hover:border-primary/25 transition-colors">
                  <div className="flex items-center gap-2 mb-2">
                    <Crown size={16} className="text-amber-400" />
                    <span className="text-sm font-bold text-foreground">Upgrade to Premium</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                    Dynamic protocol adjustments, biomarker analysis, GLP-1 companion, and advanced insights.
                  </p>
                  <span className="bg-primary text-primary-foreground px-5 py-2 rounded-lg text-sm font-semibold inline-block">
                    View Plans — from $29/mo
                  </span>
                </div>
              </Link>
            )}
          </div>

          {/* RIGHT column */}
          <div className="lg:col-span-2 space-y-4">
            {/* Devices section */}
            <div className="bg-card border border-border/40 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-foreground mb-3">Devices & Integrations</h3>
              <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-secondary/30 transition-colors">
                <Smartphone size={16} className="text-muted-foreground/60" />
                <span className="text-sm text-foreground flex-1 text-left">Connected Devices</span>
                <span className="text-xs text-muted-foreground">None</span>
              </button>
            </div>

            {/* Notification Preferences — real toggles */}
            <div className="bg-card border border-border/40 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Bell size={14} className="text-primary" />
                <h3 className="text-sm font-semibold text-foreground">Notification Preferences</h3>
              </div>
              <div className="space-y-3">
                {[
                  { key: "emailBriefing", label: "Email Briefing", desc: "Daily morning email with your protocol", value: emailBriefing, setter: setEmailBriefing },
                  { key: "emailWeeklyReview", label: "Weekly Review Email", desc: "Summary of your week's progress", value: emailWeeklyReview, setter: setEmailWeeklyReview },
                  { key: "supplementReminders", label: "Supplement Reminders", desc: "Morning & evening supplement alerts", value: supplementReminders, setter: setSupplementReminders },
                  { key: "checkinReminders", label: "Check-in Reminders", desc: "Daily wellness check-in prompts", value: checkinReminders, setter: setCheckinReminders },
                  { key: "anomalyAlerts", label: "Anomaly Alerts", desc: "Alerts when metrics drop significantly", value: anomalyAlerts, setter: setAnomalyAlerts },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between py-1">
                    <div>
                      <p className="text-sm text-foreground">{item.label}</p>
                      <p className="text-[11px] text-muted-foreground">{item.desc}</p>
                    </div>
                    <button
                      onClick={() => togglePref(item.key, !item.value, item.setter)}
                      className={`relative w-10 h-5.5 rounded-full transition-colors ${item.value ? "bg-primary" : "bg-border/50"}`}
                      style={{ minWidth: 40, height: 22 }}
                    >
                      <div className={`absolute top-0.5 w-4.5 h-4.5 rounded-full bg-white shadow transition-transform ${item.value ? "translate-x-5" : "translate-x-0.5"}`}
                        style={{ width: 18, height: 18, transform: item.value ? "translateX(20px)" : "translateX(2px)" }} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Timezone */}
              <div className="mt-4 pt-3 border-t border-border/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-foreground">Timezone</p>
                    <p className="text-[11px] text-muted-foreground">Used for reminder scheduling</p>
                  </div>
                  <select value={timezone} onChange={e => updateTimezone(e.target.value)}
                    className="bg-background border border-border/50 rounded-lg px-2 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary/30">
                    <option value="Asia/Kuala_Lumpur">Asia/Kuala Lumpur</option>
                    <option value="America/New_York">America/New York</option>
                    <option value="America/Los_Angeles">America/Los Angeles</option>
                    <option value="America/Chicago">America/Chicago</option>
                    <option value="Europe/London">Europe/London</option>
                    <option value="Europe/Berlin">Europe/Berlin</option>
                    <option value="Asia/Tokyo">Asia/Tokyo</option>
                    <option value="Asia/Singapore">Asia/Singapore</option>
                    <option value="Australia/Sydney">Australia/Sydney</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Privacy section */}
            <div className="bg-card border border-border/40 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-foreground mb-3">Privacy & Security</h3>
              <div className="space-y-0.5">
                <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-secondary/30 transition-colors">
                  <Shield size={16} className="text-muted-foreground/60" />
                  <span className="text-sm text-foreground flex-1 text-left">Health Data & Privacy</span>
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-secondary/30 transition-colors">
                  <Settings size={16} className="text-muted-foreground/60" />
                  <span className="text-sm text-foreground flex-1 text-left">Preferences</span>
                </button>
              </div>
            </div>

            {/* Support section */}
            <div className="bg-card border border-border/40 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-foreground mb-3">Help & Support</h3>
              <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-secondary/30 transition-colors">
                <HelpCircle size={16} className="text-muted-foreground/60" />
                <span className="text-sm text-foreground flex-1 text-left">Support</span>
              </button>
            </div>

            {/* Sign out & Footer */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={async () => { try { await fetch('/api/auth/logout', { method: 'POST' }); } catch(e) {} setUser(null); }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-destructive/70 hover:bg-destructive/5 transition-colors"
              >
                <LogOut size={16} />
                <span className="text-sm font-medium">Sign Out</span>
              </button>
              <div className="flex items-center gap-3">
                <LumLoopLogo size={16} className="opacity-20" />
                <span className="text-[10px] text-muted-foreground/30">LumLoop v3.0</span>
                <PerplexityAttribution />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
