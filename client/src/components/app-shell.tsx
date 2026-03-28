import { useLocation, Link } from "wouter";
import { Sparkles, Pill, BarChart3, User } from "lucide-react";

const tabs = [
  { path: "/", icon: Sparkles, label: "Today" },
  { path: "/stack", icon: Pill, label: "Stack" },
  { path: "/insights", icon: BarChart3, label: "Insights" },
  { path: "/profile", icon: User, label: "Profile" },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 pb-[72px] overflow-y-auto">{children}</main>
      <nav className="fixed bottom-0 left-0 right-0 z-50 glass bg-background/70 border-t border-border/30" data-testid="bottom-nav">
        <div className="max-w-lg mx-auto flex items-center justify-around px-4 pt-2 pb-6">
          {tabs.map((tab) => {
            const isActive = location === tab.path;
            const Icon = tab.icon;
            return (
              <Link key={tab.path} href={tab.path}>
                <button className={`flex flex-col items-center gap-[3px] px-4 py-1 transition-all duration-200 ${isActive ? "text-primary" : "text-muted-foreground/40 hover:text-muted-foreground/60"}`} data-testid={`tab-${tab.label.toLowerCase()}`}>
                  <Icon size={20} strokeWidth={isActive ? 2 : 1.4} />
                  <span className={`text-[9px] tracking-wide ${isActive ? "font-bold" : "font-medium"}`}>{tab.label}</span>
                  {isActive && <div className="w-1 h-1 rounded-full bg-primary" />}
                </button>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
