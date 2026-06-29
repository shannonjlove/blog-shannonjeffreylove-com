import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { fetchPosts, type Post } from "@/lib/posts";
import { PostCard } from "@/components/PostCard";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Inkwell — Stories that shape culture" },
      { name: "description", content: "Essays, field notes, and cultural reporting by Shannon J. Love." },
      { property: "og:title", content: "Inkwell — Stories that shape culture" },
      { property: "og:description", content: "Essays, field notes, and cultural reporting by Shannon J. Love." },
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

  return (
    <div>
      {/* HERO */}
      <section className="border-b border-border">
        <div className="max-w-7xl mx-auto px-6 pt-16 pb-20 md:pt-24 md:pb-28">
          <p className="eyebrow mb-8">Brooklyn, NY · Volume 01 · Story-First</p>
          <h1 className="font-display font-bold leading-[0.95] text-5xl md:text-7xl lg:text-[6.5rem] max-w-[14ch]">
            Stories that
            <br />
            <span className="display-italic text-gradient-ember">shape culture.</span>
          </h1>
          <p className="mt-8 max-w-2xl text-lg md:text-xl text-muted-foreground leading-relaxed">
            <span className="text-foreground font-semibold">Inkwell</span> is the writing
            desk of Shannon J. Love — essays, field notes, and cultural reporting
            from 25 years at the intersection of television, film, and digital media.
          </p>
        </div>
      </section>

      {!posts ? (
        <div className="max-w-7xl mx-auto px-6 py-20 text-muted-foreground">Loading the latest…</div>
      ) : posts.length === 0 ? (
        <div className="max-w-7xl mx-auto px-6 py-20 text-muted-foreground">No posts yet.</div>
      ) : (
        <>
          {/* FEATURED */}
          <section className="border-b border-border">
            <div className="max-w-7xl mx-auto px-6 py-16 md:py-20">
              <div className="flex items-center gap-4 mb-10">
                <span className="font-mono text-accent text-sm">01</span>
                <div className="flex-1 h-px bg-border" />
                <span className="eyebrow !text-muted-foreground">The Latest</span>
              </div>
              <PostCard post={posts[0]} featured />
            </div>
          </section>

          {/* GRID */}
          {posts.length > 1 && (
            <section className="max-w-7xl mx-auto px-6 py-16 md:py-20">
              <div className="flex items-end justify-between mb-12 gap-4 flex-wrap">
                <div>
                  <span className="font-mono text-accent text-sm">02</span>
                  <h2 className="font-display text-4xl md:text-5xl font-bold mt-2">
                    More <span className="display-italic text-gradient-ember">writing</span>
                  </h2>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.18em]">
                  <label className="text-muted-foreground">Sort</label>
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value as typeof sort)}
                    className="bg-secondary border border-border rounded-full px-4 py-2 text-xs uppercase tracking-[0.18em] font-mono focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    <option value="newest">Newest</option>
                    <option value="oldest">Oldest</option>
                    <option value="popular">Most read</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
                {posts.slice(1).map((p) => <PostCard key={p.id} post={p} />)}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
