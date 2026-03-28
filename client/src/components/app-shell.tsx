import { useLocation, Link } from "wouter";
import { Home, CalendarDays, Pill, BarChart3, User } from "lucide-react";

const tabs = [
  { path: "/", icon: Home, label: "Home" },
  { path: "/plan", icon: CalendarDays, label: "Plan" },
  { path: "/supplements", icon: Pill, label: "Stack" },
  { path: "/analytics", icon: BarChart3, label: "Insights" },
  { path: "/profile", icon: User, label: "Profile" },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 pb-[72px] overflow-y-auto">
        {children}
      </main>

      {/* Premium glass bottom tab bar */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 glass bg-background/70 border-t border-border/30"
        data-testid="bottom-nav"
      >
        <div className="max-w-lg mx-auto flex items-center justify-around px-3 pt-2 pb-6">
          {tabs.map((tab) => {
            const isActive = location === tab.path;
            const Icon = tab.icon;
            return (
              <Link key={tab.path} href={tab.path}>
                <button
                  className={`flex flex-col items-center gap-[3px] px-3 py-1 transition-all duration-200 ${
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground/50 hover:text-muted-foreground"
                  }`}
                  data-testid={`tab-${tab.label.toLowerCase()}`}
                >
                  <Icon
                    size={20}
                    strokeWidth={isActive ? 2 : 1.4}
                    className="transition-all duration-200"
                  />
                  <span className={`text-[9px] tracking-wide transition-all duration-200 ${
                    isActive ? "font-bold" : "font-medium"
                  }`}>
                    {tab.label}
                  </span>
                  {isActive && (
                    <div className="w-1 h-1 rounded-full bg-primary mt-[-1px]" />
                  )}
                </button>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
