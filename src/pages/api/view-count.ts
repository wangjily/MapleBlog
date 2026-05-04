import type { APIRoute } from "astro";
import fs from "node:fs";
import path from "node:path";

const DATA_FILE = path.resolve(process.cwd(), "data/view_counts.json");

interface ViewCountsData {
  view_counts: Record<string, number>;
}

function ensureDataFile(): void {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ view_counts: {} }, null, 2), "utf-8");
  }
}

function readData(): ViewCountsData {
  try {
    ensureDataFile();
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    return JSON.parse(raw) as ViewCountsData;
  } catch {
    return { view_counts: {} };
  }
}

function writeData(data: ViewCountsData): void {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
}

function makeResponse(body: unknown, status: number): Response {
  const headers = new Headers();
  headers.set("Content-Type", "application/json");
  headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  headers.set("Access-Control-Allow-Origin", "*");
  return new Response(JSON.stringify(body), { status, headers });
}

// GET /api/view-count — 获取浏览量
// GET /api/view-count?slug=xxx — 获取指定 slug 的浏览量
export const GET: APIRoute = async ({ url }) => {
  const slug = url.searchParams.get("slug") ?? "";

  const data = readData();

  if (!slug) {
    return makeResponse(data.view_counts, 200);
  }

  const count = data.view_counts[slug] ?? 0;
  return makeResponse({ slug, count }, 200);
};

// POST /api/view-count — 增加浏览量（需要 slug 参数）
export const POST: APIRoute = async ({ request }) => {
  let slug = "";
  try {
    const body = await request.json();
    slug = typeof body.slug === "string" ? body.slug.trim() : "";
  } catch {
    return makeResponse({ error: "Invalid request body" }, 400);
  }

  if (!slug) {
    return makeResponse({ error: "slug is required" }, 400);
  }

  const data = readData();
  const currentCount = data.view_counts[slug] ?? 0;
  data.view_counts[slug] = currentCount + 1;
  writeData(data);

  return makeResponse({ slug, count: data.view_counts[slug] }, 200);
};
