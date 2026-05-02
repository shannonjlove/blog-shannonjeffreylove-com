import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { getRequestHost } from "@tanstack/react-start/server";

// One-time bootstrap: writes the mirror endpoint URL and shared secret into
// private.app_settings so the DB trigger can call the mirror endpoint.
// Protected by the same shared secret (provided in header).
export const Route = createFileRoute("/api/public/mirror-bootstrap")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env.MIRROR_SHARED_SECRET;
        if (!secret) return new Response("Server not configured", { status: 500 });
        if (request.headers.get("x-mirror-secret") !== secret) {
          return new Response("Unauthorized", { status: 401 });
        }

        const host = getRequestHost();
        const endpoint = `https://${host}/api/public/mirror-post`;

        const { error } = await supabaseAdmin
          .schema("private" as never)
          .from("app_settings")
          .upsert([
            { key: "mirror_endpoint", value: endpoint },
            { key: "mirror_secret", value: secret },
          ]);
        if (error) return new Response(error.message, { status: 500 });

        return Response.json({ ok: true, endpoint });
      },
    },
  },
});
