import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Search, ArrowUpRight } from "lucide-react";
import { fetchCategories, type Category } from "@/lib/posts";
import { supabase } from "@/integrations/supabase/client";

export function SiteHeader() {
  const [cats, setCats] = useState<Category[]>([]);
  const [q, setQ] = useState("");
  const [authed, setAuthed] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories().then(setCats).catch(() => {});
    supabase.auth.getSession().then(({ data }) => setAuthed(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setAuthed(!!s));
    return () => sub.subscription.unsubscribe();
  }, []);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) {
      navigate({ to: "/search", search: { q: q.trim() } });
      setSearchOpen(false);
    }
  };

  return (
    <header className="border-b border-border bg-background/85 sticky top-0 z-40 backdrop-blur">
      <div className="max-w-7xl mx-auto px-6 py-5 flex items-center gap-6">
        <Link to="/" className="font-display text-2xl font-bold tracking-tight shrink-0">
          Inkwell<span className="display-italic text-gradient-ember">.</span>
        </Link>

        <nav className="hidden md:flex gap-6 text-[13px] font-mono uppercase tracking-[0.14em] text-muted-foreground items-center">
          <Link to="/" className="hover:text-foreground transition-colors" activeOptions={{ exact: true }} activeProps={{ className: "text-foreground" }}>Index</Link>
          {cats.slice(0, 4).map((c) => (
            <Link
              key={c.id}
              to="/category/$slug"
              params={{ slug: c.slug }}
              className="hover:text-foreground transition-colors"
              activeProps={{ className: "text-foreground" }}
            >
              {c.name}
            </Link>
          ))}
          <Link to="/about" className="hover:text-foreground transition-colors" activeProps={{ className: "text-foreground" }}>About</Link>
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <button
            onClick={() => setSearchOpen((s) => !s)}
            aria-label="Search"
            className="p-2 rounded-full border border-border text-muted-foreground hover:text-foreground hover:border-accent transition-colors"
          >
            <Search className="w-4 h-4" />
          </button>
          {authed ? (
            <Link to="/admin" className="pill hidden sm:inline-flex">Admin</Link>
          ) : (
            <Link to="/auth" className="pill pill-solid hidden sm:inline-flex">
              Sign in <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </div>
      {searchOpen && (
        <div className="border-t border-border bg-background">
          <form onSubmit={onSearch} className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-3">
            <Search className="w-4 h-4 text-muted-foreground shrink-0" />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search essays, tags, titles…"
              className="flex-1 bg-transparent border-0 focus:outline-none text-lg font-display placeholder:text-muted-foreground"
            />
            <button type="submit" className="pill pill-solid">Go</button>
          </form>
        </div>
      )}
    </header>
  );
}
