import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { fetchPostBySlug, type Post } from "@/lib/posts";
import { CategoryTag } from "@/components/PostCard";
import { Comments } from "@/components/Comments";
import { ShareButtons } from "@/components/ShareButtons";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/post/$slug")({
  component: PostPage,
});

function PostPage() {
  const { slug } = Route.useParams();
  const [post, setPost] = useState<Post | null | undefined>(undefined);

  useEffect(() => {
    fetchPostBySlug(slug).then(setPost).catch(() => setPost(null));
    // increment view count (fire and forget)
    supabase.rpc as any; // no-op type guard
    supabase.from("posts").select("id, view_count").eq("slug", slug).maybeSingle().then(({ data }) => {
      if (data) supabase.from("posts").update({ view_count: data.view_count + 1 }).eq("id", data.id).then(() => {});
    });
  }, [slug]);

  if (post === undefined) return <div className="max-w-3xl mx-auto px-6 py-16 text-muted-foreground">Loading…</div>;
  if (post === null) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-16 text-center">
        <h1 className="font-display text-4xl font-bold">Post not found</h1>
        <Link to="/" className="mt-4 inline-block text-accent">← Back home</Link>
      </div>
    );
  }

  const url = typeof window !== "undefined" ? window.location.href : "";

  return (
    <article className="max-w-3xl mx-auto px-6 py-12 md:py-16">
      {post.category && <div className="mb-5"><CategoryTag {...post.category} /></div>}
      <h1 className="font-display text-4xl md:text-6xl font-bold leading-[1.05] mb-5">{post.title}</h1>
      {post.excerpt && <p className="text-xl text-muted-foreground leading-relaxed mb-6">{post.excerpt}</p>}
      <div className="flex items-center justify-between gap-4 pb-6 mb-8 border-b border-border text-sm text-muted-foreground">
        <p>{post.published_at && new Date(post.published_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} · {post.view_count} views</p>
        <ShareButtons title={post.title} url={url} />
      </div>
      {post.cover_image && (
        <img src={post.cover_image} alt="" className="w-full aspect-video object-cover rounded-xl mb-10" />
      )}
      <div className="prose-article" dangerouslySetInnerHTML={{ __html: renderMarkdown(post.content) }} />
      {post.tags && post.tags.length > 0 && (
        <div className="mt-10 pt-6 border-t border-border flex gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground mr-2">Tags:</span>
          {post.tags.map((t) => (
            <Link key={t} to="/tag/$tag" params={{ tag: t }} className="text-xs px-3 py-1 rounded-full bg-secondary text-foreground hover:bg-accent hover:text-accent-foreground transition-colors">
              #{t}
            </Link>
          ))}
        </div>
      )}
      <div className="mt-16">
        <Comments postId={post.id} />
      </div>
    </article>
  );
}

// Tiny markdown renderer (just headings, paragraphs, line breaks)
function renderMarkdown(md: string): string {
  const escape = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return md.split(/\n\n+/).map((block) => {
    const b = block.trim();
    if (b.startsWith("## ")) return `<h2>${escape(b.slice(3))}</h2>`;
    if (b.startsWith("### ")) return `<h3>${escape(b.slice(4))}</h3>`;
    return `<p>${escape(b).replace(/\n/g, "<br/>")}</p>`;
  }).join("\n");
}
