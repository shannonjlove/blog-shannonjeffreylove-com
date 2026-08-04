import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Terminal, Shield, Plug } from "lucide-react";

export const Route = createFileRoute("/mcp-docs")({
  head: () => ({
    meta: [
      { title: "MCP Connection Docs — Inkwell" },
      { name: "description", content: "Connect to the Inkwell blog MCP server and call read or comment tools." },
      { property: "og:title", content: "MCP Connection Docs — Inkwell" },
      { property: "og:description", content: "Connect to the Inkwell blog MCP server and call read or comment tools." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: McpDocsPage,
});

const MCP_URL = "https://blog.shannonjeffreylove.com/mcp";

function Code({ children }: { children: React.ReactNode }) {
  return (
    <pre className="overflow-x-auto rounded-lg border border-border bg-black/30 p-4 text-sm font-mono leading-relaxed text-ink/90">
      {children}
    </pre>
  );
}

function Section({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <section className="mt-12 md:mt-16">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-md border border-border bg-card/50 text-amber">
          <Icon className="w-5 h-5" />
        </div>
        <h2 className="font-display text-2xl md:text-3xl font-bold">{title}</h2>
      </div>
      <div className="space-y-4 text-muted-foreground leading-relaxed max-w-3xl">
        {children}
      </div>
    </section>
  );
}

function McpDocsPage() {
  return (
    <article className="max-w-4xl mx-auto px-6 py-12 md:py-20">
      <Link to="/" className="inline-flex items-center gap-2 text-sm font-mono uppercase tracking-wider text-muted-foreground hover:text-amber transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Inkwell
      </Link>

      <header className="mt-8 border-b border-border pb-10">
        <p className="eyebrow mb-4">Agent Integrations</p>
        <h1 className="font-display text-4xl md:text-6xl font-bold leading-[1.05]">
          Connect via <span className="display-italic text-gradient-ember">MCP</span>
        </h1>
        <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed">
          The Inkwell blog exposes a Model Context Protocol server so assistants like Claude, ChatGPT, and Cursor can read posts and post comments as a signed-in user.
        </p>
      </header>

      <Section icon={Plug} title="Server endpoint">
        <p>
          Use this URL in any MCP client that supports OAuth-protected HTTP transport. The first request will redirect through the Inkwell consent screen.
        </p>
        <Code>{MCP_URL}</Code>
      </Section>

      <Section icon={Shield} title="Authentication">
        <p>
          The server is protected with Supabase OAuth 2.1. When an assistant connects, you’ll be asked to approve it on the consent screen. Once approved, the assistant receives a bearer token and acts as you.
        </p>
        <ul className="list-disc pl-5 space-y-1 marker:text-amber">
          <li>Read tools (<code>list_posts</code>, <code>get_post</code>, <code>list_categories</code>) work for any signed-in user.</li>
          <li><code>create_comment</code> writes a comment under your identity, so RLS enforces that the comment author is your account.</li>
        </ul>
      </Section>

      <Section icon={Terminal} title="Example calls">
        <p>Each request is JSON-RPC 2.0 sent to the server endpoint with the MCP Streamable HTTP headers.</p>

        <h3 className="font-display text-xl font-bold text-foreground mt-6 mb-2">list_posts</h3>
        <p>List published posts, optionally filtered by category slug.</p>
        <Code>{`POST ${MCP_URL}
Content-Type: application/json
Accept: application/json, text/event-stream

{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "list_posts",
    "arguments": {
      "category_slug": "culture",
      "limit": 10
    }
  }
}`}</Code>

        <h3 className="font-display text-xl font-bold text-foreground mt-8 mb-2">get_post</h3>
        <p>Fetch a single published post by its slug.</p>
        <Code>{`POST ${MCP_URL}
Content-Type: application/json
Accept: application/json, text/event-stream

{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/call",
  "params": {
    "name": "get_post",
    "arguments": {
      "slug": "my-first-essay"
    }
  }
}`}</Code>

        <h3 className="font-display text-xl font-bold text-foreground mt-8 mb-2">list_categories</h3>
        <p>Return all blog categories with post counts.</p>
        <Code>{`POST ${MCP_URL}
Content-Type: application/json
Accept: application/json, text/event-stream

{
  "jsonrpc": "2.0",
  "id": 3,
  "method": "tools/call",
  "params": {
    "name": "list_categories",
    "arguments": {}
  }
}`}</Code>

        <h3 className="font-display text-xl font-bold text-foreground mt-8 mb-2">create_comment</h3>
        <p>Post a comment on a published article. The author is derived from the OAuth token, not the input.</p>
        <Code>{`POST ${MCP_URL}
Content-Type: application/json
Accept: application/json, text/event-stream

{
  "jsonrpc": "2.0",
  "id": 4,
  "method": "tools/call",
  "params": {
    "name": "create_comment",
    "arguments": {
      "post_slug": "my-first-essay",
      "body": "Loved this piece — the pacing is perfect."
    }
  }
}`}</Code>
      </Section>

      <div className="mt-16 pt-8 border-t border-border text-sm text-muted-foreground">
        <p>
          Need help? Open the{" "}
          <Link to="/admin" className="text-amber hover:underline">admin panel</Link>{" "}
          to manage posts, or return to the{" "}
          <Link to="/" className="text-amber hover:underline">homepage</Link>.
        </p>
      </div>
    </article>
  );
}
