import { Link } from "wouter";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-8 text-center">
      <p className="text-6xl font-mono font-light text-muted-foreground/20 mb-4">404</p>
      <h1 className="text-lg font-semibold text-foreground mb-2">Page not found</h1>
      <p className="text-sm text-muted-foreground mb-8">
        The screen you're looking for doesn't exist.
      </p>
      <Link href="/">
        <button className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2" data-testid="button-home">
          <Home size={16} /> Back to Dashboard
        </button>
      </Link>
    </div>
  );
}
