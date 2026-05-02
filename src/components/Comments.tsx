import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

type Comment = { id: string; author_name: string; content: string; created_at: string; author_id: string };

export function Comments({ postId }: { postId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [text, setText] = useState("");
  const [posting, setPosting] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("comments").select("*").eq("post_id", postId).order("created_at", { ascending: true });
    setComments((data ?? []) as Comment[]);
  };

  useEffect(() => {
    load();
    supabase.auth.getUser().then(({ data }) => setUser(data.user ? { id: data.user.id, email: data.user.email } : null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setUser(s?.user ? { id: s.user.id, email: s.user.email } : null);
    });
    return () => sub.subscription.unsubscribe();
  }, [postId]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !text.trim()) return;
    setPosting(true);
    const name = user.email?.split("@")[0] ?? "Anonymous";
    const { error } = await supabase.from("comments").insert({
      post_id: postId, author_id: user.id, author_name: name, content: text.trim(),
    });
    setPosting(false);
    if (!error) { setText(""); load(); }
  };

  const remove = async (id: string) => {
    await supabase.from("comments").delete().eq("id", id);
    load();
  };

  return (
    <section>
      <h2 className="font-display text-2xl font-bold mb-6">Comments ({comments.length})</h2>
      {user ? (
        <form onSubmit={submit} className="mb-8">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Share your thoughts…"
            rows={3}
            className="w-full bg-card border border-border rounded-md p-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <button type="submit" disabled={posting || !text.trim()} className="mt-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium disabled:opacity-50">
            {posting ? "Posting…" : "Post comment"}
          </button>
        </form>
      ) : (
        <p className="mb-8 text-sm text-muted-foreground">
          <Link to="/auth" className="text-accent hover:underline">Sign in</Link> to leave a comment.
        </p>
      )}
      <div className="space-y-6">
        {comments.length === 0 && <p className="text-sm text-muted-foreground">Be the first to comment.</p>}
        {comments.map((c) => (
          <div key={c.id} className="border-b border-border pb-5">
            <div className="flex items-baseline justify-between mb-1">
              <p className="font-semibold text-sm">{c.author_name}</p>
              <p className="text-xs text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</p>
            </div>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{c.content}</p>
            {user?.id === c.author_id && (
              <button onClick={() => remove(c.id)} className="mt-2 text-xs text-muted-foreground hover:text-destructive">Delete</button>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
