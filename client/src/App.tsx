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
import Coach from "./pages/coach";
import NotFound from "./pages/not-found";
import AppShell from "./components/app-shell";
import { Sparkles } from "lucide-react";
import type { User } from "@shared/schema";

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  loading: boolean;
  showCoach: boolean;
  setShowCoach: (show: boolean) => void;
}
const UserContext = createContext<UserContextType>({ user: null, setUser: () => {}, loading: true, showCoach: false, setShowCoach: () => {} });
export const useUser = () => useContext(UserContext);

function AppContent() {
  const { user, loading, showCoach, setShowCoach } = useUser();

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
    <>
      <AppShell>
        <Switch>
          <Route path="/" component={Today} />
          <Route path="/stack" component={Stack} />
          <Route path="/insights" component={Insights} />
          <Route path="/profile" component={ProfilePage} />
          <Route component={NotFound} />
        </Switch>
      </AppShell>

      {/* Floating AI Coach Button */}
      {!showCoach && (
        <button
          onClick={() => setShowCoach(true)}
          className="fixed bottom-[88px] right-4 z-50 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:opacity-90 active:scale-95 transition-all glow-sage"
          data-testid="open-coach"
        >
          <Sparkles size={20} />
        </button>
      )}

      {/* Coach overlay */}
      {showCoach && <Coach onClose={() => setShowCoach(false)} />}
    </>
  );
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCoach, setShowCoach] = useState(false);

  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch("/api/auth/session");
        if (res.ok) {
          const data = await res.json();
          if (data && data.id) setUser(data);
        }
      } catch (e) {}
      setLoading(false);
    }
    checkSession();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <UserContext.Provider value={{ user, setUser, loading, showCoach, setShowCoach }}>
        <Router hook={useHashLocation}>
          <AppContent />
        </Router>
      </UserContext.Provider>
    </QueryClientProvider>
  );
}

export default App;
