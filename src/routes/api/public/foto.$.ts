import { createFileRoute } from "@tanstack/react-router";

/** Serve publicamente as fotos enviadas pelo painel (somente leitura). */
export const Route = createFileRoute("/api/public/foto/$")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const path = String((params as Record<string, string>)["_splat"] ?? "");
        if (!path || path.includes("..")) return new Response("Not found", { status: 404 });

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data, error } = await supabaseAdmin.storage.from("produtos").download(path);
        if (error || !data) return new Response("Not found", { status: 404 });

        return new Response(await data.arrayBuffer(), {
          headers: {
            "content-type": data.type || "image/jpeg",
            "cache-control": "public, max-age=31536000, immutable",
          },
        });
      },
    },
  },
});
