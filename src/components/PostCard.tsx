import { Link } from "@tanstack/react-router";
import type { Post } from "@/lib/posts";
import { ShareButtons } from "@/components/ShareButtons";

export function CategoryTag({ name, slug }: { name: string; color?: string; slug: string }) {
  return (
    <Link
      to="/category/$slug"
      params={{ slug }}
      className="inline-flex items-center font-mono text-[10px] font-medium uppercase tracking-[0.22em] px-3 py-1 rounded-full border border-accent/40 text-accent hover:bg-accent hover:text-accent-foreground transition-colors"
    >
      {name}
    </Link>
  );
}

export function TagChip({ tag }: { tag: string }) {
  return (
    <Link
      to="/"
      search={{ tag }}
      className="inline-flex items-center font-mono text-[10px] uppercase tracking-[0.18em] px-2.5 py-1 rounded-full border border-border text-muted-foreground hover:border-accent hover:text-accent transition-colors"
    >
      #{tag}
    </Link>
  );
}

function fmtDate(iso?: string | null, long = false) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", long
    ? { month: "long", day: "numeric", year: "numeric" }
    : { month: "short", day: "numeric", year: "numeric" });
}

function postUrl(slug: string) {
  if (typeof window === "undefined") return `/post/${slug}`;
  return `${window.location.origin}/post/${slug}`;
}

export function PostCard({ post, featured = false }: { post: Post; featured?: boolean }) {
  const tags = (post.tags ?? []).filter((t) => t !== "medium-import").slice(0, 4);

  if (featured) {
    return (
      <article className="grid md:grid-cols-5 gap-8 md:gap-12 group items-center">
        <Link
          to="/post/$slug"
          params={{ slug: post.slug }}
          className="md:col-span-3 block aspect-[5/4] overflow-hidden rounded-2xl bg-card border border-border relative"
        >
          {post.cover_image ? (
            <img src={post.cover_image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[1200ms] ease-out" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-card to-secondary" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
        </Link>
        <div className="md:col-span-2 flex flex-col">
          <div className="flex items-center gap-3 mb-5">
            {post.category && <CategoryTag {...post.category} />}
            <span className="eyebrow !text-muted-foreground">{fmtDate(post.published_at, true)}</span>
          </div>
          <Link to="/post/$slug" params={{ slug: post.slug }}>
            <h2 className="font-display text-4xl md:text-[3.25rem] font-bold leading-[0.98] mb-5 group-hover:text-gradient-ember transition-colors">
              {post.title}
            </h2>
          </Link>
          {post.excerpt && (
            <p className="text-lg text-muted-foreground leading-relaxed mb-6 line-clamp-4">{post.excerpt}</p>
          )}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-6">
              {tags.map((t) => <TagChip key={t} tag={t} />)}
            </div>
          )}
          <div className="flex items-center justify-between gap-4">
            <Link
              to="/post/$slug"
              params={{ slug: post.slug }}
              className="pill"
            >
              Read the story →
            </Link>
            <ShareButtons title={post.title} url={postUrl(post.slug)} />
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="group flex flex-col">
      <Link to="/post/$slug" params={{ slug: post.slug }} className="block aspect-[16/10] overflow-hidden rounded-xl bg-card border border-border mb-5">
        {post.cover_image ? (
          <img src={post.cover_image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-card to-secondary" />
        )}
      </Link>
      <div className="flex items-center gap-3 mb-3">
        {post.category && <CategoryTag {...post.category} />}
        <span className="eyebrow !text-muted-foreground">{fmtDate(post.published_at)}</span>
      </div>
      <Link to="/post/$slug" params={{ slug: post.slug }}>
        <h3 className="font-display text-2xl font-bold leading-[1.1] mb-3 group-hover:text-accent transition-colors">
          {post.title}
        </h3>
      </Link>
      {post.excerpt && (
        <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3 mb-4">{post.excerpt}</p>
      )}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {tags.map((t) => <TagChip key={t} tag={t} />)}
        </div>
      )}
      <div className="flex items-center justify-between mt-auto pt-3 border-t border-border/60">
        <Link
          to="/post/$slug"
          params={{ slug: post.slug }}
          className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground hover:text-accent transition-colors"
        >
          Read →
        </Link>
        <ShareButtons title={post.title} url={postUrl(post.slug)} />
      </div>
    </article>
  );
}
