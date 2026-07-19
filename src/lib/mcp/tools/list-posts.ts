import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser, textResult } from "../supabase";

export default defineTool({
  name: "list_posts",
  title: "List blog posts",
  description: "List published blog posts on Inkwell, optionally filtered by category slug or tag, sorted newest/oldest/popular.",
  inputSchema: {
    category: z.string().optional().describe("Category slug"),
    tag: z.string().optional().describe("Tag keyword"),
    search: z.string().optional().describe("Case-insensitive search over title and excerpt"),
    sort: z.enum(["newest", "oldest", "popular"]).optional(),
    limit: z.number().int().min(1).max(50).optional(),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ category, tag, search, sort, limit }, ctx) => {
    if (!ctx.isAuthenticated()) return textResult("Not authenticated", true);
    const supabase = supabaseForUser(ctx);
    let q = supabase
      .from("posts")
      .select("id,title,slug,excerpt,published_at,view_count,category:categories(name,slug),post_tags(tag)")
      .eq("status", "published");
    if (search) q = q.or(`title.ilike.%${search}%,excerpt.ilike.%${search}%`);
    if (sort === "oldest") q = q.order("published_at", { ascending: true });
    else if (sort === "popular") q = q.order("view_count", { ascending: false });
    else q = q.order("published_at", { ascending: false });
    q = q.limit(limit ?? 20);
    const { data, error } = await q;
    if (error) return textResult(error.message, true);
    let rows = (data ?? []).map((p: any) => ({
      title: p.title,
      slug: p.slug,
      excerpt: p.excerpt,
      published_at: p.published_at,
      views: p.view_count,
      category: p.category?.slug ?? null,
      tags: (p.post_tags ?? []).map((t: any) => t.tag),
    }));
    if (category) rows = rows.filter((r) => r.category === category);
    if (tag) rows = rows.filter((r) => r.tags.includes(tag));
    return { content: [{ type: "text", text: JSON.stringify(rows, null, 2) }], structuredContent: { posts: rows } };
  },
});
