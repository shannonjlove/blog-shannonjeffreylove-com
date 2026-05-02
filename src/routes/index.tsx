import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { fetchPosts, type Post } from "@/lib/posts";
import { PostCard } from "@/components/PostCard";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Inkwell — Personal Writing & Portfolio" },
      { name: "description", content: "Essays, notes, and design writing — a personal blog." },
      { property: "og:title", content: "Inkwell — Personal Writing & Portfolio" },
      { property: "og:description", content: "Essays, notes, and design writing — a personal blog." },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [sort, setSort] = useState<"newest" | "oldest" | "popular">("newest");

  useEffect(() => {
    fetchPosts({ sort }).then(setPosts).catch(() => setPosts([]));
  }, [sort]);

  if (!posts) return <div className="max-w-7xl mx-auto px-6 py-16 text-muted-foreground">Loading…</div>;

  const [featured, ...rest] = posts;

  return (
    <div className="max-w-7xl mx-auto px-6">
      <section className="py-12 md:py-20 border-b border-border">
        <p className="text-xs uppercase tracking-[0.2em] text-accent font-bold mb-6">Latest Story</p>
        {featured ? <PostCard post={featured} featured /> : <p className="text-muted-foreground">No posts yet.</p>}
      </section>

      <section className="py-12 md:py-16">
        <div className="flex items-end justify-between mb-10 gap-4 flex-wrap">
          <h2 className="font-display text-3xl md:text-4xl font-bold">More writing</h2>
          <div className="flex items-center gap-2 text-sm">
            <label className="text-muted-foreground">Sort:</label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as typeof sort)}
              className="bg-secondary border border-border rounded-md px-3 py-1.5 text-sm"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="popular">Most read</option>
            </select>
          </div>
        </div>
        {rest.length === 0 ? (
          <p className="text-muted-foreground">No more posts.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {rest.map((p) => <PostCard key={p.id} post={p} />)}
          </div>
        )}
      </section>
    </div>
  );
}
