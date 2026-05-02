import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { fetchCategories, type Category } from "@/lib/posts";
import { importFromMedium } from "@/server/medium-import.functions";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
});

type DraftPost = {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image: string;
  category_id: string;
  status: "draft" | "published";
  tags: string;
};

const empty: DraftPost = { title: "", slug: "", excerpt: "", content: "", cover_image: "", category_id: "", status: "draft", tags: "" };

function AdminPage() {
  const navigate = useNavigate();
  const [authChecked, setAuthChecked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [cats, setCats] = useState<Category[]>([]);
  const [draft, setDraft] = useState<DraftPost>(empty);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) { navigate({ to: "/auth" }); return; }
      setUserId(data.session.user.id);
      const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", data.session.user.id);
      const admin = (roles ?? []).some((r: any) => r.role === "admin");
      setIsAdmin(admin);
      setAuthChecked(true);
      if (admin) {
        const [{ data: ps }, cs] = await Promise.all([
          supabase.from("posts").select("*").order("created_at", { ascending: false }),
          fetchCategories(),
        ]);
        setPosts(ps ?? []); setCats(cs);
      }
    })();
  }, [navigate]);

  if (!authChecked) return <div className="max-w-3xl mx-auto px-6 py-16 text-muted-foreground">Loading…</div>;

  if (!isAdmin) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-16">
        <h1 className="font-display text-4xl font-bold mb-4">Become an admin</h1>
        <p className="text-muted-foreground mb-6">You're signed in but don't have admin access. Run this once in your database to grant yourself admin rights:</p>
        <pre className="bg-card border border-border rounded-md p-4 text-xs overflow-auto">{`INSERT INTO public.user_roles (user_id, role) VALUES ('${userId}', 'admin');`}</pre>
        <p className="text-sm text-muted-foreground mt-4">Then refresh this page.</p>
        <Link to="/" className="mt-6 inline-block text-accent">← Back home</Link>
      </div>
    );
  }

  const slugify = (s: string) => s.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").slice(0, 80);

  const edit = (p: any) => setDraft({
    id: p.id, title: p.title, slug: p.slug, excerpt: p.excerpt ?? "", content: p.content,
    cover_image: p.cover_image ?? "", category_id: p.category_id ?? "", status: p.status, tags: "",
  });

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setMsg(null);
    const slug = draft.slug || slugify(draft.title);
    const payload: any = {
      title: draft.title, slug, excerpt: draft.excerpt || null, content: draft.content,
      cover_image: draft.cover_image || null, category_id: draft.category_id || null,
      status: draft.status, author_id: userId,
      published_at: draft.status === "published" ? new Date().toISOString() : null,
    };
    let postId = draft.id;
    if (draft.id) {
      const { error } = await supabase.from("posts").update(payload).eq("id", draft.id);
      if (error) { setMsg(error.message); setSaving(false); return; }
    } else {
      const { data, error } = await supabase.from("posts").insert(payload).select().single();
      if (error) { setMsg(error.message); setSaving(false); return; }
      postId = data.id;
    }
    if (draft.tags && postId) {
      await supabase.from("post_tags").delete().eq("post_id", postId);
      const tags = draft.tags.split(",").map((t) => t.trim()).filter(Boolean);
      if (tags.length) await supabase.from("post_tags").insert(tags.map((tag) => ({ post_id: postId, tag })));
    }
    const { data: ps } = await supabase.from("posts").select("*").order("created_at", { ascending: false });
    setPosts(ps ?? []); setDraft(empty); setSaving(false); setMsg("Saved.");
  };

  const del = async (id: string) => {
    if (!confirm("Delete this post?")) return;
    await supabase.from("posts").delete().eq("id", id);
    setPosts(posts.filter((p) => p.id !== id));
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-10">
        <h1 className="font-display text-4xl font-bold">Admin</h1>
        <button onClick={() => supabase.auth.signOut().then(() => navigate({ to: "/" }))} className="text-sm text-muted-foreground hover:text-foreground">Sign out</button>
      </div>
      <div className="grid lg:grid-cols-2 gap-12">
        <form onSubmit={save} className="space-y-3">
          <h2 className="font-display text-2xl font-bold mb-2">{draft.id ? "Edit post" : "New post"}</h2>
          <input required placeholder="Title" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value, slug: draft.slug || slugify(e.target.value) })} className="w-full bg-card border border-border rounded-md px-3 py-2 text-sm" />
          <input placeholder="slug-auto-from-title" value={draft.slug} onChange={(e) => setDraft({ ...draft, slug: e.target.value })} className="w-full bg-card border border-border rounded-md px-3 py-2 text-sm font-mono text-xs" />
          <input placeholder="Cover image URL" value={draft.cover_image} onChange={(e) => setDraft({ ...draft, cover_image: e.target.value })} className="w-full bg-card border border-border rounded-md px-3 py-2 text-sm" />
          <select value={draft.category_id} onChange={(e) => setDraft({ ...draft, category_id: e.target.value })} className="w-full bg-card border border-border rounded-md px-3 py-2 text-sm">
            <option value="">— Category —</option>
            {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <input placeholder="Tags (comma separated)" value={draft.tags} onChange={(e) => setDraft({ ...draft, tags: e.target.value })} className="w-full bg-card border border-border rounded-md px-3 py-2 text-sm" />
          <textarea placeholder="Excerpt" rows={2} value={draft.excerpt} onChange={(e) => setDraft({ ...draft, excerpt: e.target.value })} className="w-full bg-card border border-border rounded-md px-3 py-2 text-sm" />
          <textarea required placeholder="Content (markdown — ## headings, blank lines for paragraphs)" rows={12} value={draft.content} onChange={(e) => setDraft({ ...draft, content: e.target.value })} className="w-full bg-card border border-border rounded-md px-3 py-2 text-sm font-mono" />
          <select value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value as any })} className="bg-card border border-border rounded-md px-3 py-2 text-sm">
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
          <div className="flex gap-2">
            <button type="submit" disabled={saving} className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium">{saving ? "…" : "Save"}</button>
            {draft.id && <button type="button" onClick={() => setDraft(empty)} className="px-4 py-2 border border-border rounded-md text-sm">Cancel</button>}
          </div>
          {msg && <p className="text-sm text-accent">{msg}</p>}
        </form>
        <div>
          <h2 className="font-display text-2xl font-bold mb-4">All posts</h2>
          <div className="space-y-2">
            {posts.map((p) => (
              <div key={p.id} className="flex items-center justify-between gap-3 p-3 bg-card border border-border rounded-md">
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">{p.title}</p>
                  <p className="text-xs text-muted-foreground">{p.status} · {p.slug}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => edit(p)} className="text-xs px-2 py-1 hover:bg-secondary rounded">Edit</button>
                  <button onClick={() => del(p.id)} className="text-xs px-2 py-1 text-destructive hover:bg-secondary rounded">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
