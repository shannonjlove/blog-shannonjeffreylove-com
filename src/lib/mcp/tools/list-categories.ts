import { defineTool } from "@lovable.dev/mcp-js";
import { supabaseForUser, textResult } from "../supabase";

export default defineTool({
  name: "list_categories",
  title: "List categories",
  description: "List all blog categories with their slugs.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    if (!ctx.isAuthenticated()) return textResult("Not authenticated", true);
    const { data, error } = await supabaseForUser(ctx).from("categories").select("name,slug,color").order("name");
    if (error) return textResult(error.message, true);
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }], structuredContent: { categories: data } };
  },
});
