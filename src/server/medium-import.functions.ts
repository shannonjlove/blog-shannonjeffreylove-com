import { createServerFn } from "@tanstack/react-start";
import Firecrawl from "@mendable/firecrawl-js";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const PROFILE_URL = "https://medium.com/@shannonjeffreylove";

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

function extractMediumLinks(markdown: string, links: string[] | undefined): string[] {
  const out = new Set<string>();
  // From returned links array
  for (const l of links ?? []) {
    if (typeof l !== "string") continue;
    if (/medium\.com\/@shannonjeffreylove\/[a-z0-9-]+-[a-f0-9]{10,}/i.test(l)) {
      out.add(l.split("?")[0].split("#")[0]);
    }
  }
  // From markdown body as fallback
  const re = /https:\/\/medium\.com\/@shannonjeffreylove\/[a-z0-9-]+-[a-f0-9]{10,}/gi;
  for (const m of markdown.matchAll(re)) out.add(m[0]);
  return [...out];
}

function pickExcerpt(md: string): string {
  const lines = md.split("\n");
  for (const line of lines) {
    const t = line.trim();
    if (!t) continue;
    if (t.startsWith("#") || t.startsWith("![")) continue;
    return t.replace(/[#*_`>]/g, "").slice(0, 220);
  }
  return "";
}

function pickCover(md: string, metadata: { ogImage?: string } | undefined): string | null {
  if (metadata?.ogImage) return metadata.ogImage;
  const m = md.match(/!\[[^\]]*\]\((https?:\/\/[^)]+)\)/);
  return m ? m[1] : null;
}

function stripTitle(md: string, title: string): string {
  // Remove leading H1 if it matches the title
  return md.replace(new RegExp(`^\\s*#\\s+${title.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\$&")}\\s*\\n`, "i"), "").trim();
}

export const importFromMedium = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ limit: z.number().min(1).max(50).optional() }).parse(d))
  .handler(async ({ data, context }) => {
    const { userId } = context;

    // Verify admin
    const { data: roles } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);
    if (!(roles ?? []).some((r) => r.role === "admin")) {
      throw new Error("Admin access required");
    }

    if (!process.env.FIRECRAWL_API_KEY) throw new Error("FIRECRAWL_API_KEY not configured");
    const fc = new Firecrawl({ apiKey: process.env.FIRECRAWL_API_KEY });

    // 1. Scrape profile to discover post URLs
    const profile = await fc.scrape(PROFILE_URL, {
      formats: ["markdown", "links"],
      onlyMainContent: false,
      waitFor: 3000,
    });
    const profileMd =
      (profile as { markdown?: string }).markdown ??
      (profile as { data?: { markdown?: string } }).data?.markdown ??
      "";
    const profileLinks =
      (profile as { links?: string[] }).links ??
      (profile as { data?: { links?: string[] } }).data?.links ??
      [];
    const postUrls = extractMediumLinks(profileMd, profileLinks);

    if (postUrls.length === 0) {
      return { discovered: 0, imported: 0, skipped: 0, errors: ["No post URLs found on profile"] };
    }

    const limit = data.limit ?? postUrls.length;
    const targets = postUrls.slice(0, limit);

    let imported = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const url of targets) {
      try {
        const r = await fc.scrape(url, {
          formats: ["markdown"],
          onlyMainContent: true,
          waitFor: 2500,
        });
        const md =
          (r as { markdown?: string }).markdown ??
          (r as { data?: { markdown?: string } }).data?.markdown ??
          "";
        const meta =
          (r as { metadata?: Record<string, unknown> }).metadata ??
          (r as { data?: { metadata?: Record<string, unknown> } }).data?.metadata ??
          {};
        const title =
          (meta.ogTitle as string | undefined) ??
          (meta.title as string | undefined) ??
          md.match(/^\s*#\s+(.+)$/m)?.[1] ??
          "Untitled";

        const slug = slugify(title) || slugify(url.split("/").pop() ?? "post");
        if (!slug) {
          skipped++;
          continue;
        }

        // Skip if exists
        const { data: existing } = await supabaseAdmin
          .from("posts")
          .select("id")
          .eq("slug", slug)
          .maybeSingle();
        if (existing) {
          skipped++;
          continue;
        }

        const content = stripTitle(md, title);
        const excerpt = pickExcerpt(content);
        const cover = pickCover(
          content,
          meta as { ogImage?: string },
        );
        const publishedAt =
          (meta.publishedTime as string | undefined) ??
          (meta["article:published_time"] as string | undefined) ??
          new Date().toISOString();

        const { data: inserted, error: insErr } = await supabaseAdmin
          .from("posts")
          .insert({
            title: title.slice(0, 200),
            slug,
            excerpt: excerpt || null,
            content,
            cover_image: cover,
            status: "published",
            published_at: publishedAt,
            author_id: userId,
          })
          .select("id")
          .single();
        if (insErr) throw insErr;

        // Tags: 'medium-import' + Medium keywords
        const keywords =
          ((meta.keywords as string | undefined) ?? "")
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean) ?? [];
        const tagSet = new Set<string>(["medium-import", ...keywords.map((k) => k.toLowerCase())]);
        const tagRows = [...tagSet].map((tag) => ({ post_id: inserted.id, tag }));
        if (tagRows.length) await supabaseAdmin.from("post_tags").insert(tagRows);

        imported++;
      } catch (e) {
        errors.push(`${url}: ${e instanceof Error ? e.message : String(e)}`);
      }
    }

    return { discovered: postUrls.length, imported, skipped, errors };
  });
