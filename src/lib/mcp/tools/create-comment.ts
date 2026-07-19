import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser, textResult } from "../supabase";

export default defineTool({
  name: "create_comment",
  title: "Comment on a post",
  description: "Post a comment on a published blog post as the signed-in user.",
  inputSchema: {
    post_slug: z.string().min(1),
    body: z.string().trim().min(1).max(4000),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async ({ post_slug, body }, ctx) => {
    if (!ctx.isAuthenticated()) return textResult("Not authenticated", true);
    const supabase = supabaseForUser(ctx);
    const { data: post, error: postErr } = await supabase
      .from("posts").select("id").eq("slug", post_slug).eq("status", "published").maybeSingle();
    if (postErr) return textResult(postErr.message, true);
    if (!post) return textResult(`No published post with slug "${post_slug}"`, true);
    const { data, error } = await supabase
      .from("comments")
      .insert({ post_id: (post as any).id, user_id: ctx.getUserId(), body })
      .select("id,body,created_at")
      .single();
    if (error) return textResult(error.message, true);
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }], structuredContent: { comment: data } };
  },
});
