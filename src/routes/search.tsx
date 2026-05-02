import { createFileRoute } from "@tanstack/react-router";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { useEffect, useState } from "react";
import { fetchPosts, type Post } from "@/lib/posts";
import { PostCard } from "@/components/PostCard";

const schema = z.object({ q: fallback(z.string(), "").default("") });

export const Route = createFileRoute("/search")({
  validateSearch: zodValidator(schema),
  component: SearchPage,
});

function SearchPage() {
  const { q } = Route.useSearch();
  const [posts, setPosts] = useState<Post[] | null>(null);
  useEffect(() => {
    if (!q) { setPosts([]); return; }
    fetchPosts({ search: q }).then(setPosts).catch(() => setPosts([]));
  }, [q]);
  return (
    <div className="max-w-7xl mx-auto px-6 py-12 md:py-16">
      <header className="mb-12 pb-8 border-b border-border">
        <p className="text-xs uppercase tracking-[0.2em] font-bold mb-3 text-accent">Search</p>
        <h1 className="font-display text-4xl md:text-5xl font-bold">Results for "{q}"</h1>
      </header>
      {!posts ? <p className="text-muted-foreground">Loading…</p> : posts.length === 0 ? (
        <p className="text-muted-foreground">No matching posts.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
          {posts.map((p) => <PostCard key={p.id} post={p} />)}
        </div>
      )}
    </div>
  );
}
