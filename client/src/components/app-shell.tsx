import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useUser } from "../App";
import LumLoopLogo from "./lumloop-logo";
import {
  Sparkles, Pill, BarChart3, User,
  PanelLeftClose, PanelLeft, Menu, X,
} from "lucide-react";

const navItems = [
  { path: "/", icon: Sparkles, label: "Today" },
  { path: "/stack", icon: Pill, label: "Stack" },
  { path: "/insights", icon: BarChart3, label: "Insights" },
  { path: "/profile", icon: User, label: "Profile" },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { user, setShowCoach } = useUser();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
          data-testid="sidebar-overlay"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-screen flex flex-col border-r transition-all duration-200 ${
          collapsed ? "w-16" : "w-60"
        } bg-[hsl(var(--sidebar))] border-[hsl(var(--sidebar-border))] ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
        data-testid="sidebar"
      >
        {/* Logo area */}
        <div className={`flex items-center h-14 border-b border-[hsl(var(--sidebar-border))] px-4 ${collapsed ? "justify-center" : "justify-between"}`}>
          {!collapsed && (
            <div className="flex items-center gap-2.5">
              <LumLoopLogo size={22} />
              <span className="text-sm font-semibold text-[hsl(var(--sidebar-foreground))] tracking-tight">LumLoop</span>
            </div>
          )}
          {collapsed && <LumLoopLogo size={22} />}
          <button
            onClick={() => { setCollapsed(!collapsed); setMobileOpen(false); }}
            className="hidden md:flex w-7 h-7 items-center justify-center rounded-md text-[hsl(var(--sidebar-foreground))]/60 hover:text-[hsl(var(--sidebar-foreground))] hover:bg-[hsl(var(--sidebar-accent))] transition-colors"
            data-testid="sidebar-toggle"
          >
            {collapsed ? <PanelLeft size={16} /> : <PanelLeftClose size={16} />}
          </button>
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden w-7 h-7 flex items-center justify-center rounded-md text-[hsl(var(--sidebar-foreground))]/60 hover:text-[hsl(var(--sidebar-foreground))]"
            data-testid="sidebar-close-mobile"
          >
            <X size={16} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location === item.path;
            const Icon = item.icon;
            return (
              <Link key={item.path} href={item.path}>
                <button
                  onClick={() => setMobileOpen(false)}
                  className={`w-full flex items-center gap-3 rounded-lg transition-colors ${
                    collapsed ? "justify-center px-2 py-2.5" : "px-3 py-2"
                  } ${
                    isActive
                      ? "bg-[hsl(var(--sidebar-accent))] text-[hsl(var(--sidebar-primary))]"
                      : "text-[hsl(var(--sidebar-foreground))]/60 hover:text-[hsl(var(--sidebar-foreground))] hover:bg-[hsl(var(--sidebar-accent))]/50"
                  }`}
                  data-testid={`nav-${item.label.toLowerCase()}`}
                >
                  <Icon size={18} strokeWidth={isActive ? 2 : 1.5} />
                  {!collapsed && (
                    <span className={`text-sm ${isActive ? "font-semibold" : "font-medium"}`}>
                      {item.label}
                    </span>
                  )}
                </button>
              </Link>
            );
          })}

          {/* AI Coach button */}
          <button
            onClick={() => { setShowCoach(true); setMobileOpen(false); }}
            className={`w-full flex items-center gap-3 rounded-lg transition-colors mt-2 ${
              collapsed ? "justify-center px-2 py-2.5" : "px-3 py-2"
            } text-[hsl(var(--sidebar-primary))] hover:bg-[hsl(var(--sidebar-accent))]/50`}
            data-testid="nav-coach"
          >
            <Sparkles size={18} strokeWidth={1.5} />
            {!collapsed && <span className="text-sm font-medium">AI Coach</span>}
          </button>
        </nav>

        {/* User area at bottom */}
        <div className={`border-t border-[hsl(var(--sidebar-border))] px-3 py-3 ${collapsed ? "flex justify-center" : ""}`}>
          <Link href="/profile">
            <button
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-2.5 w-full rounded-lg hover:bg-[hsl(var(--sidebar-accent))]/50 transition-colors ${
                collapsed ? "justify-center p-1.5" : "px-2 py-1.5"
              }`}
              data-testid="sidebar-user"
            >
              <div className="w-8 h-8 rounded-full bg-[hsl(var(--sidebar-primary))]/15 flex items-center justify-center shrink-0">
                <User size={14} className="text-[hsl(var(--sidebar-primary))]" />
              </div>
              {!collapsed && (
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-xs font-medium text-[hsl(var(--sidebar-foreground))] truncate">
                    {user?.name || "User"}
                  </p>
                  <p className="text-[10px] text-[hsl(var(--sidebar-foreground))]/50 truncate">
                    {user?.email || ""}
                  </p>
                </div>
              )}
            </button>
          </Link>
        </div>
      </aside>

      {/* Main content area */}
      <div className={`flex-1 min-h-screen transition-all duration-200 ${collapsed ? "md:ml-16" : "md:ml-60"}`}>
        {/* Mobile header with hamburger */}
        <header className="md:hidden flex items-center justify-between h-14 px-4 border-b border-border/30 bg-background sticky top-0 z-30">
          <button
            onClick={() => setMobileOpen(true)}
            className="w-8 h-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground transition-colors"
            data-testid="hamburger-menu"
          >
            <Menu size={20} />
          </button>
          <LumLoopLogo size={22} />
          <div className="w-8" />
        </header>

        <main className="overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
