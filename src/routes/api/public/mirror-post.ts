import { createFileRoute } from "@tanstack/react-router";
import { getRequestHost } from "@tanstack/react-start/server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const REPO_OWNER = "shannonjlove";
const REPO_NAME = "writer-s-sanctuary";
const REPO_BRANCH = "main";

type PostRow = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image: string | null;
  status: string;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  category_id: string | null;
};

function yamlEscape(v: string) {
  return v.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function buildMarkdown(post: PostRow, categoryName: string | null, tags: string[]) {
  const fm: string[] = ["---"];
  fm.push(`title: "${yamlEscape(post.title)}"`);
  fm.push(`slug: "${post.slug}"`);
  if (post.excerpt) fm.push(`excerpt: "${yamlEscape(post.excerpt)}"`);
  if (categoryName) fm.push(`category: "${yamlEscape(categoryName)}"`);
  if (tags.length) fm.push(`tags: [${tags.map((t) => `"${yamlEscape(t)}"`).join(", ")}]`);
  fm.push(`status: "${post.status}"`);
  if (post.published_at) fm.push(`published_at: "${post.published_at}"`);
  if (post.cover_image) fm.push(`cover_image: "${post.cover_image}"`);
  fm.push(`created_at: "${post.created_at}"`);
  fm.push(`updated_at: "${post.updated_at}"`);
  fm.push("---", "", post.content, "");
  return fm.join("\n");
}

async function githubRequest(path: string, init: RequestInit = {}) {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error("GITHUB_TOKEN not configured");
  return fetch(`https://api.github.com${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "lovable-blog-mirror",
      ...(init.headers || {}),
    },
  });
}

async function upsertFile(path: string, contentBase64: string, message: string) {
  // Try to fetch existing file SHA
  const getRes = await githubRequest(
    `/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}?ref=${REPO_BRANCH}`,
  );
  let sha: string | undefined;
  if (getRes.status === 200) {
    const j = (await getRes.json()) as { sha?: string };
    sha = j.sha;
  } else if (getRes.status !== 404) {
    throw new Error(`GitHub GET failed [${getRes.status}]: ${await getRes.text()}`);
  }

  const putRes = await githubRequest(
    `/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}`,
    {
      method: "PUT",
      body: JSON.stringify({
        message,
        content: contentBase64,
        branch: REPO_BRANCH,
        ...(sha ? { sha } : {}),
      }),
    },
  );
  if (!putRes.ok) {
    throw new Error(`GitHub PUT failed [${putRes.status}]: ${await putRes.text()}`);
  }
}

async function deleteFile(path: string, message: string) {
  const getRes = await githubRequest(
    `/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}?ref=${REPO_BRANCH}`,
  );
  if (getRes.status === 404) return;
  if (!getRes.ok) throw new Error(`GitHub GET failed [${getRes.status}]`);
  const { sha } = (await getRes.json()) as { sha: string };
  const delRes = await githubRequest(
    `/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}`,
    {
      method: "DELETE",
      body: JSON.stringify({ message, sha, branch: REPO_BRANCH }),
    },
  );
  if (!delRes.ok && delRes.status !== 404) {
    throw new Error(`GitHub DELETE failed [${delRes.status}]: ${await delRes.text()}`);
  }
}

export const Route = createFileRoute("/api/public/mirror-post")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const sharedSecret = process.env.MIRROR_SHARED_SECRET;
        if (!sharedSecret) {
          return new Response("Server not configured", { status: 500 });
        }
        if (request.headers.get("x-mirror-secret") !== sharedSecret) {
          return new Response("Unauthorized", { status: 401 });
        }

        let body: { post_id?: string; slug?: string; op?: "upsert" | "delete" };
        try {
          body = await request.json();
        } catch {
          return new Response("Invalid JSON", { status: 400 });
        }
        const op = body.op ?? "upsert";

        try {
          if (op === "delete") {
            if (!body.slug) return new Response("slug required", { status: 400 });
            await deleteFile(`content/posts/${body.slug}.md`, `chore(blog): delete ${body.slug}`);
            return Response.json({ ok: true, op, slug: body.slug });
          }

          if (!body.post_id) return new Response("post_id required", { status: 400 });

          const { data: post, error } = await supabaseAdmin
            .from("posts")
            .select("*")
            .eq("id", body.post_id)
            .maybeSingle();
          if (error) throw error;
          if (!post) return new Response("Post not found", { status: 404 });

          // Only mirror published posts; if it's now a draft, remove from repo
          if ((post as PostRow).status !== "published") {
            await deleteFile(
              `content/posts/${(post as PostRow).slug}.md`,
              `chore(blog): unpublish ${(post as PostRow).slug}`,
            );
            return Response.json({ ok: true, op: "unpublished", slug: (post as PostRow).slug });
          }

          const [{ data: cat }, { data: tagRows }] = await Promise.all([
            (post as PostRow).category_id
              ? supabaseAdmin
                  .from("categories")
                  .select("name")
                  .eq("id", (post as PostRow).category_id!)
                  .maybeSingle()
              : Promise.resolve({ data: null as { name: string } | null }),
            supabaseAdmin.from("post_tags").select("tag").eq("post_id", (post as PostRow).id),
          ]);

          const md = buildMarkdown(
            post as PostRow,
            (cat as { name: string } | null)?.name ?? null,
            (tagRows ?? []).map((t: { tag: string }) => t.tag),
          );
          const b64 = Buffer.from(md, "utf8").toString("base64");
          await upsertFile(
            `content/posts/${(post as PostRow).slug}.md`,
            b64,
            `chore(blog): publish ${(post as PostRow).slug}`,
          );
          return Response.json({ ok: true, op: "upserted", slug: (post as PostRow).slug });
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e);
          console.error("mirror-post error:", msg);
          return new Response(msg, { status: 500 });
        }
      },
    },
  },
});
