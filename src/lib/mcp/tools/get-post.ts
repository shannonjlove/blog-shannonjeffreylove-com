import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser, textResult } from "../supabase";

export default defineTool({
  name: "get_post",
  title: "Get blog post",
  description: "Fetch a single published blog post by slug, including full markdown content and tags.",
  inputSchema: { slug: z.string().min(1) },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ slug }, ctx) => {
    if (!ctx.isAuthenticated()) return textResult("Not authenticated", true);
    const { data, error } = await supabaseForUser(ctx)
      .from("posts")
      .select("title,slug,excerpt,content,cover_image,published_at,view_count,category:categories(name,slug),post_tags(tag)")
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle();
    if (error) return textResult(error.message, true);
    if (!data) return textResult(`No published post with slug "${slug}"`, true);
    const post = {
      ...data,
      category: (data as any).category?.slug ?? null,
      tags: ((data as any).post_tags ?? []).map((t: any) => t.tag),
    };
    delete (post as any).post_tags;
    return { content: [{ type: "text", text: JSON.stringify(post, null, 2) }], structuredContent: { post } };
  },
});
