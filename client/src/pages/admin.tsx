import { useQuery } from "@tanstack/react-query";
import { useUser } from "../App";
import { apiRequest } from "../lib/queryClient";
import { Shield, Users, UserPlus, Crown, Activity, Pill, Utensils, ClipboardCheck, Zap } from "lucide-react";

const ADMIN_EMAILS = ["avedaler@gmail.com", "daler@teiza.com"];

export default function Admin() {
  const { user } = useUser();

  const isAdmin = user?.email && ADMIN_EMAILS.includes(user.email);

  const { data: stats } = useQuery({
    queryKey: ["/api/admin/stats"],
    queryFn: async () => { const r = await apiRequest("GET", "/api/admin/stats"); return r.json(); },
    enabled: !!isAdmin,
  });

  const { data: recentUsers = [] } = useQuery({
    queryKey: ["/api/admin/users"],
    queryFn: async () => { const r = await apiRequest("GET", "/api/admin/users"); return r.json(); },
    enabled: !!isAdmin,
  });

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Shield size={32} className="text-muted-foreground/30 mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-foreground">Access Denied</h2>
          <p className="text-sm text-muted-foreground mt-1">Admin access is restricted.</p>
        </div>
      </div>
    );
  }

  const statCards = [
    { label: "Total Users", value: stats?.totalUsers ?? "—", icon: Users, color: "text-primary" },
    { label: "Signups This Week", value: stats?.recentSignups ?? "—", icon: UserPlus, color: "text-emerald-400" },
    { label: "Agent Actions Today", value: stats?.agentActionsToday ?? "—", icon: Zap, color: "text-amber-400" },
    { label: "Agent Actions This Week", value: stats?.agentActionsWeek ?? "—", icon: Activity, color: "text-violet-400" },
  ];

  const subBreakdown = stats?.subscriptionBreakdown || {};

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1200px] mx-auto px-6 py-8">
        <div className="flex items-center gap-2 mb-6">
          <Shield size={18} className="text-primary" />
          <h1 className="text-xl font-semibold text-foreground tracking-tight">Admin Dashboard</h1>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.label} className="bg-card border border-border/40 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Icon size={14} className={card.color} />
                  <span className="text-xs text-muted-foreground">{card.label}</span>
                </div>
                <p className="text-2xl font-serif font-semibold text-foreground">{card.value}</p>
              </div>
            );
          })}
        </div>

        {/* Subscription Breakdown */}
        <div className="bg-card border border-border/40 rounded-xl p-5 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Crown size={14} className="text-amber-400" />
            <h3 className="text-sm font-semibold text-foreground">Subscription Breakdown</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {["free", "essential", "premium", "concierge"].map((plan) => (
              <div key={plan} className="text-center py-3 px-2 rounded-lg bg-secondary/30">
                <p className="text-lg font-mono font-semibold text-foreground">{subBreakdown[plan] ?? 0}</p>
                <p className="text-xs text-muted-foreground capitalize">{plan}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Signups */}
        <div className="bg-card border border-border/40 rounded-xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-border/30">
            <h2 className="text-sm font-semibold text-foreground">Recent Signups</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/20">
                  <th className="text-left text-xs font-medium text-muted-foreground px-5 py-2.5">Name</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-3 py-2.5">Email</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-3 py-2.5 hidden sm:table-cell">Goal</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-3 py-2.5 hidden md:table-cell">Joined</th>
                  <th className="text-center text-xs font-medium text-muted-foreground px-5 py-2.5">Onboarded</th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.map((u: any) => (
                  <tr key={u.id} className="border-b border-border/10 last:border-0 hover:bg-secondary/20 transition-colors">
                    <td className="px-5 py-3">
                      <span className="text-sm font-medium text-foreground">{u.name}</span>
                    </td>
                    <td className="px-3 py-3">
                      <span className="text-sm text-muted-foreground">{u.email}</span>
                    </td>
                    <td className="px-3 py-3 hidden sm:table-cell">
                      <span className="text-sm text-muted-foreground/70">{u.primaryGoal || "—"}</span>
                    </td>
                    <td className="px-3 py-3 hidden md:table-cell">
                      <span className="text-xs text-muted-foreground">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded ${
                        u.onboardingComplete ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground"
                      }`}>
                        {u.onboardingComplete ? "Yes" : "No"}
                      </span>
                    </td>
                  </tr>
                ))}
                {recentUsers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-sm text-muted-foreground/50">No users yet</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
