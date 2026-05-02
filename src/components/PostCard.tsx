import { Link } from "@tanstack/react-router";
import type { Post } from "@/lib/posts";

export function CategoryTag({ name, color, slug }: { name: string; color: string; slug: string }) {
  return (
    <Link
      to="/category/$slug"
      params={{ slug }}
      className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded text-white"
      style={{ backgroundColor: color }}
    >
      {name}
    </Link>
  );
}

export function PostCard({ post, featured = false }: { post: Post; featured?: boolean }) {
  if (featured) {
    return (
      <article className="grid md:grid-cols-2 gap-8 group">
        <Link to="/post/$slug" params={{ slug: post.slug }} className="block aspect-[4/3] overflow-hidden rounded-xl bg-secondary">
          {post.cover_image && (
            <img src={post.cover_image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
          )}
        </Link>
        <div className="flex flex-col justify-center">
          {post.category && <div className="mb-3"><CategoryTag {...post.category} /></div>}
          <Link to="/post/$slug" params={{ slug: post.slug }}>
            <h2 className="font-display text-4xl md:text-5xl font-bold leading-[1.05] mb-4 group-hover:text-accent transition-colors">
              {post.title}
            </h2>
          </Link>
          <p className="text-lg text-muted-foreground mb-4 leading-relaxed">{post.excerpt}</p>
          <p className="text-sm text-muted-foreground">
            {post.published_at && new Date(post.published_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </p>
        </div>
      </article>
    );
  }

  return (
    <article className="group flex flex-col">
      <Link to="/post/$slug" params={{ slug: post.slug }} className="block aspect-[16/10] overflow-hidden rounded-lg bg-secondary mb-4">
        {post.cover_image && (
          <img src={post.cover_image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        )}
      </Link>
      {post.category && <div className="mb-2"><CategoryTag {...post.category} /></div>}
      <Link to="/post/$slug" params={{ slug: post.slug }}>
        <h3 className="font-display text-2xl font-bold leading-tight mb-2 group-hover:text-accent transition-colors">
          {post.title}
        </h3>
      </Link>
      <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2 mb-3">{post.excerpt}</p>
      <p className="text-xs text-muted-foreground mt-auto">
        {post.published_at && new Date(post.published_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
      </p>
    </article>
  );
}
