import { getCollection } from "astro:content";
import type { APIRoute } from "astro";

export const GET: APIRoute = async () => {
  const allPosts = await getCollection("blog", ({ data, filePath }) => {
    return data.status === "published" && !data.draft && !filePath?.endsWith("-index.md");
  });

  return new Response(
    JSON.stringify({ total: allPosts.length }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=3600",
      },
    }
  );
};
