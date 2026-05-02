import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/" });
    });
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null);
    const fn = mode === "signin"
      ? supabase.auth.signInWithPassword({ email, password })
      : supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin } });
    const { error } = await fn;
    setLoading(false);
    if (error) setError(error.message);
    else navigate({ to: "/" });
  };

  return (
    <div className="max-w-md mx-auto px-6 py-16">
      <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">← Back</Link>
      <h1 className="font-display text-4xl font-bold mt-4 mb-2">{mode === "signin" ? "Sign in" : "Create account"}</h1>
      <p className="text-muted-foreground text-sm mb-8">{mode === "signin" ? "Welcome back." : "Join to leave comments."}</p>
      <form onSubmit={submit} className="space-y-4">
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="w-full bg-card border border-border rounded-md px-3 py-2.5 text-sm" />
        <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full bg-card border border-border rounded-md px-3 py-2.5 text-sm" />
        {error && <p className="text-sm text-destructive">{error}</p>}
        <button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground py-2.5 rounded-md text-sm font-medium disabled:opacity-50">
          {loading ? "…" : mode === "signin" ? "Sign in" : "Sign up"}
        </button>
      </form>
      <button onClick={() => setMode(mode === "signin" ? "signup" : "signin")} className="mt-6 text-sm text-muted-foreground hover:text-foreground">
        {mode === "signin" ? "Need an account? Sign up" : "Have an account? Sign in"}
      </button>
    </div>
  );
}
