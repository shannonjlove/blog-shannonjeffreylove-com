import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { fetchCategories, type Category } from "@/lib/posts";
import { importFromMedium } from "@/lib/medium-import.functions";

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
  const [loadError, setLoadError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [cats, setCats] = useState<Category[]>([]);
  const [draft, setDraft] = useState<DraftPost>(empty);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [mappings, setMappings] = useState<{ id: string; medium_key: string; category_id: string }[]>([]);
  const [newMapKey, setNewMapKey] = useState("");
  const [newMapCat, setNewMapCat] = useState("");
  const importMedium = useServerFn(importFromMedium);
  const [importing, setImporting] = useState(false);
  const [importMsg, setImportMsg] = useState<string | null>(null);

  const refreshMappings = async () => {
    const { data } = await supabase.from("category_mappings").select("*").order("medium_key");
    setMappings((data ?? []) as any);
  };

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoadError(null);
        const { data, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) throw sessionError;
        if (!data.session) {
          let settled = false;
          const { data: authSub } = supabase.auth.onAuthStateChange((_event, session) => {
            if (!session || cancelled || settled) return;
            settled = true;
            authSub.subscription.unsubscribe();
            setAuthChecked(false);
          });

          window.setTimeout(() => {
            if (cancelled || settled) return;
            settled = true;
            authSub.subscription.unsubscribe();
            setAuthChecked(true);
            navigate({ to: "/auth" });
          }, 1200);
          return;
        }

        if (cancelled) return;
        setUserId(data.session.user.id);

        const { data: roles, error: rolesError } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", data.session.user.id);
        if (rolesError) throw rolesError;

        const admin = (roles ?? []).some((r: any) => r.role === "admin");
        if (cancelled) return;
        setIsAdmin(admin);

        if (admin) {
          const [postsResult, categoriesResult, mappingsResult] = await Promise.all([
            supabase.from("posts").select("*").order("created_at", { ascending: false }),
            fetchCategories(),
            supabase.from("category_mappings").select("*").order("medium_key"),
          ]);

          if (postsResult.error) throw postsResult.error;
          if (mappingsResult.error) throw mappingsResult.error;
          if (cancelled) return;
          setPosts(postsResult.data ?? []);
          setCats(categoriesResult);
          setMappings((mappingsResult.data ?? []) as any);
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Admin page failed to load", error);
          setLoadError(error instanceof Error ? error.message : "Admin page failed to load.");
        }
      } finally {
        if (!cancelled) setAuthChecked(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const addMapping = async () => {
    const key = newMapKey.trim().toLowerCase();
    if (!key || !newMapCat) return;
    const { error } = await supabase.from("category_mappings").upsert({ medium_key: key, category_id: newMapCat }, { onConflict: "medium_key" });
    if (!error) { setNewMapKey(""); setNewMapCat(""); refreshMappings(); }
  };
  const deleteMapping = async (id: string) => {
    await supabase.from("category_mappings").delete().eq("id", id);
    refreshMappings();
  };

  if (!authChecked) return <div className="max-w-3xl mx-auto px-6 py-16 text-muted-foreground">Loading…</div>;

  if (loadError) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-16">
        <h1 className="font-display text-4xl font-bold mb-4">Admin couldn&apos;t load</h1>
        <p className="text-muted-foreground mb-6">{loadError}</p>
        <div className="flex flex-wrap gap-3">
          <button onClick={() => window.location.reload()} className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium">Try again</button>
          <Link to="/" className="px-4 py-2 border border-border rounded-md text-sm">Back home</Link>
        </div>
      </div>
    );
  }

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

  const runImport = async () => {
    if (!confirm("Import all articles from medium.com/@shannonjeffreylove? Existing slugs will be skipped.")) return;
    setImporting(true); setImportMsg("Scraping Medium…");
    try {
      const res = await importMedium({ data: {} });
      setImportMsg(`Imported ${res.imported} · skipped ${res.skipped} · discovered ${res.discovered}${res.errors.length ? ` · ${res.errors.length} errors` : ""}`);
      const { data: ps } = await supabase.from("posts").select("*").order("created_at", { ascending: false });
      setPosts(ps ?? []);
    } catch (e) {
      setImportMsg(e instanceof Error ? e.message : String(e));
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-10 gap-4 flex-wrap">
        <h1 className="font-display text-4xl font-bold">Admin</h1>
        <div className="flex items-center gap-3">
          <button onClick={runImport} disabled={importing} className="text-sm px-3 py-1.5 border border-border rounded-md hover:bg-secondary disabled:opacity-50">{importing ? "Importing…" : "Import from Medium"}</button>
          <button onClick={() => supabase.auth.signOut().then(() => navigate({ to: "/" }))} className="text-sm text-muted-foreground hover:text-foreground">Sign out</button>
        </div>
      </div>
      {importMsg && <p className="mb-6 text-sm text-accent">{importMsg}</p>}
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

      <div className="mt-16 border-t border-border pt-10">
        <h2 className="font-display text-2xl font-bold mb-2">Medium tag → category mappings</h2>
        <p className="text-sm text-muted-foreground mb-6">When importing, the first Medium tag of each post is matched here. Unmapped tags auto-create a category and add a row below.</p>

        <div className="flex flex-wrap gap-2 mb-6">
          <input value={newMapKey} onChange={(e) => setNewMapKey(e.target.value)} placeholder="medium tag (e.g. leadership)" className="flex-1 min-w-[180px] bg-card border border-border rounded-md px-3 py-2 text-sm" />
          <select value={newMapCat} onChange={(e) => setNewMapCat(e.target.value)} className="bg-card border border-border rounded-md px-3 py-2 text-sm">
            <option value="">— Category —</option>
            {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <button onClick={addMapping} disabled={!newMapKey.trim() || !newMapCat} className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium disabled:opacity-50">Add / update</button>
        </div>

        <div className="space-y-2">
          {mappings.length === 0 && <p className="text-sm text-muted-foreground">No mappings yet.</p>}
          {mappings.map((m) => {
            const cat = cats.find((c) => c.id === m.category_id);
            return (
              <div key={m.id} className="flex items-center justify-between gap-3 p-3 bg-card border border-border rounded-md">
                <div className="text-sm">
                  <span className="font-mono">{m.medium_key}</span>
                  <span className="text-muted-foreground"> → </span>
                  <span className="font-medium">{cat?.name ?? "(deleted category)"}</span>
                </div>
                <button onClick={() => deleteMapping(m.id)} className="text-xs px-2 py-1 text-destructive hover:bg-secondary rounded">Remove</button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
