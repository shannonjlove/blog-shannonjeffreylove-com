import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { fetchPosts, fetchCategories, type Post, type Category } from "@/lib/posts";
import { PostCard } from "@/components/PostCard";

export const Route = createFileRoute("/category/$slug")({
  component: CategoryPage,
});

function CategoryPage() {
  const { slug } = Route.useParams();
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [cat, setCat] = useState<Category | null>(null);

  useEffect(() => {
    fetchPosts({ categorySlug: slug }).then(setPosts).catch(() => setPosts([]));
    fetchCategories().then((cs) => setCat(cs.find((c) => c.slug === slug) ?? null));
  }, [slug]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 md:py-16">
      <header className="mb-12 pb-8 border-b border-border">
        <p className="text-xs uppercase tracking-[0.2em] font-bold mb-3" style={{ color: cat?.color }}>Category</p>
        <h1 className="font-display text-5xl md:text-6xl font-bold">{cat?.name ?? slug}</h1>
      </header>
      {!posts ? <p className="text-muted-foreground">Loading…</p> : posts.length === 0 ? (
        <p className="text-muted-foreground">No posts in this category yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
          {posts.map((p) => <PostCard key={p.id} post={p} />)}
        </div>
      )}
    </div>
  );
}
