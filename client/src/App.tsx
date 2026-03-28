import { Switch, Route, Router } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { useState, useEffect, createContext, useContext } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient, apiRequest } from "./lib/queryClient";
import Onboarding from "./pages/onboarding";
import Today from "./pages/today";
import Stack from "./pages/stack";
import Insights from "./pages/insights";
import ProfilePage from "./pages/profile-page";
import NotFound from "./pages/not-found";
import AppShell from "./components/app-shell";
import type { User } from "@shared/schema";

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  loading: boolean;
}
const UserContext = createContext<UserContextType>({ user: null, setUser: () => {}, loading: true });
export const useUser = () => useContext(UserContext);

function AppContent() {
  const { user, loading } = useUser();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || !user.onboardingComplete) {
    return (
      <Switch>
        <Route path="/" component={Onboarding} />
        <Route component={Onboarding} />
      </Switch>
    );
  }

  return (
    <AppShell>
      <Switch>
        <Route path="/" component={Today} />
        <Route path="/stack" component={Stack} />
        <Route path="/insights" component={Insights} />
        <Route path="/profile" component={ProfilePage} />
        <Route component={NotFound} />
      </Switch>
    </AppShell>
  );
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session via visitor ID (injected by deploy proxy)
  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch("/api/auth/session");
        if (res.ok) {
          const data = await res.json();
          if (data && data.id) {
            setUser(data);
          }
        }
      } catch (e) {
        // No session — that's fine
      }
      setLoading(false);
    }
    checkSession();
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
