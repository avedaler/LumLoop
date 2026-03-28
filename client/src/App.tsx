import { Switch, Route, Router } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { useState, useEffect, createContext, useContext } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient, apiRequest } from "./lib/queryClient";
import Welcome from "./pages/welcome";
import Assessment from "./pages/assessment";
import Dashboard from "./pages/dashboard";
import DailyPlan from "./pages/daily-plan";
import Supplements from "./pages/supplements";
import Nutrition from "./pages/nutrition";
import Marketplace from "./pages/marketplace";
import Analytics from "./pages/analytics";
import Membership from "./pages/membership";
import Profile from "./pages/profile";
import AppShell from "./components/app-shell";
import NotFound from "./pages/not-found";
import type { User } from "@shared/schema";

// ─── User Context ───
interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  loading: boolean;
}
const UserContext = createContext<UserContextType>({
  user: null, setUser: () => {}, loading: true
});
export const useUser = () => useContext(UserContext);

function AppContent() {
  const { user, loading } = useUser();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-primary text-sm">Loading LumLoop...</div>
      </div>
    );
  }

  // Show onboarding if no user or onboarding not complete
  if (!user || !user.onboardingComplete) {
    return (
      <Switch>
        <Route path="/" component={Welcome} />
        <Route path="/assessment" component={Assessment} />
        <Route component={Welcome} />
      </Switch>
    );
  }

  return (
    <AppShell>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/plan" component={DailyPlan} />
        <Route path="/supplements" component={Supplements} />
        <Route path="/nutrition" component={Nutrition} />
        <Route path="/marketplace" component={Marketplace} />
        <Route path="/analytics" component={Analytics} />
        <Route path="/membership" component={Membership} />
        <Route path="/profile" component={Profile} />
        <Route component={NotFound} />
      </Switch>
    </AppShell>
  );
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session (stored in React state since localStorage is blocked)
  useEffect(() => {
    // No persisted session in sandbox — user registers fresh each visit
    setLoading(false);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <UserContext.Provider value={{ user, setUser, loading }}>
        <Router hook={useHashLocation}>
          <AppContent />
        </Router>
      </UserContext.Provider>
    </QueryClientProvider>
  );
}

export default App;
