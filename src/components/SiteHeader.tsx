import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { fetchCategories, type Category } from "@/lib/posts";
import { supabase } from "@/integrations/supabase/client";

export function SiteHeader() {
  const [cats, setCats] = useState<Category[]>([]);
  const [q, setQ] = useState("");
  const [authed, setAuthed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories().then(setCats).catch(() => {});
    supabase.auth.getSession().then(({ data }) => setAuthed(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setAuthed(!!s));
    return () => sub.subscription.unsubscribe();
  }, []);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) navigate({ to: "/search", search: { q: q.trim() } });
  };

  return (
    <header className="border-b border-border bg-background sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-background/85">
      <div className="max-w-7xl mx-auto px-6 py-5 flex items-center gap-6 flex-wrap">
        <Link to="/" className="font-display text-2xl font-bold tracking-tight shrink-0">
          Inkwell<span className="text-accent">.</span>
        </Link>
        <nav className="flex gap-5 text-sm font-medium text-muted-foreground items-center">
          <Link to="/" className="hover:text-foreground" activeOptions={{ exact: true }} activeProps={{ className: "text-foreground" }}>Home</Link>
          {cats.map((c) => (
            <Link
              key={c.id}
              to="/category/$slug"
              params={{ slug: c.slug }}
              className="hover:text-foreground"
              activeProps={{ className: "text-foreground" }}
            >
              {c.name}
            </Link>
          ))}
          <Link to="/about" className="hover:text-foreground" activeProps={{ className: "text-foreground" }}>About</Link>
        </nav>
        <form onSubmit={onSearch} className="ml-auto relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search articles…"
            className="pl-9 pr-3 py-2 w-64 bg-secondary border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </form>
        {authed ? (
          <Link to="/admin" className="text-sm font-medium hover:text-accent">Admin</Link>
        ) : (
          <Link to="/auth" className="text-sm font-medium hover:text-accent">Sign in</Link>
        )}
      </div>
    </header>
  );
}
