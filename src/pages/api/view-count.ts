import type { APIRoute } from "astro";
import fs from "node:fs";
import path from "node:path";

const DATA_FILE = path.resolve(process.cwd(), "data/view_counts.json");
const STATS_FILE = path.resolve(process.cwd(), "data/visitor_stats.json");

interface ViewCountsData {
  view_counts: Record<string, number>;
}

interface VisitorStats {
  total_visits: number;
  unique_visitors: Record<string, number>;
  daily_stats: Record<string, { visits: number; unique: string[] }>;
  page_views: Record<string, number>;
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

function ensureStatsFile(): void {
  const dir = path.dirname(STATS_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(STATS_FILE)) {
    const initial: VisitorStats = {
      total_visits: 0,
      unique_visitors: {},
      daily_stats: {},
      page_views: {},
    };
    fs.writeFileSync(STATS_FILE, JSON.stringify(initial, null, 2), "utf-8");
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

function readStats(): VisitorStats {
  try {
    ensureStatsFile();
    const raw = fs.readFileSync(STATS_FILE, "utf-8");
    return JSON.parse(raw) as VisitorStats;
  } catch {
    return { total_visits: 0, unique_visitors: {}, daily_stats: {}, page_views: {} };
  }
}

function writeData(data: ViewCountsData): void {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
}

function writeStats(data: VisitorStats): void {
  fs.writeFileSync(STATS_FILE, JSON.stringify(data, null, 2), "utf-8");
}

function getTodayKey(): string {
  return new Date().toISOString().split("T")[0];
}

function sanitizeSlug(slug: string): string {
  return slug.replace(/[^a-zA-Z0-9\u4e00-\u9fa5_-]/g, "").substring(0, 200);
}

function makeResponse(body: unknown, status: number): Response {
  const headers = new Headers();
  headers.set("Content-Type", "application/json");
  headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  headers.set("Access-Control-Allow-Origin", "*");
  return new Response(JSON.stringify(body), { status, headers });
}

function getClientIP(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIP = request.headers.get("x-real-ip");
  if (realIP) {
    return realIP;
  }
  return "unknown";
}

// ==================== 文章浏览量 API ====================

// GET /api/view-count — 获取浏览量
export const GET: APIRoute = async ({ url, request }) => {
  const slug = url.searchParams.get("slug") ?? "";
  const stats = url.searchParams.get("stats") ?? "";

  if (stats === "true") {
    const visitorStats = readStats();
    const today = getTodayKey();
    const todayStats = visitorStats.daily_stats[today] || { visits: 0, unique: [] };

    return makeResponse({
      total_visits: visitorStats.total_visits,
      today_visits: todayStats.visits,
      today_unique: todayStats.unique.length,
      unique_count: Object.keys(visitorStats.unique_visitors).length,
      page_count: Object.keys(visitorStats.page_views).length,
    }, 200);
  }

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
  let clientIP = getClientIP(request);

  try {
    const body = await request.json();
    slug = typeof body.slug === "string" ? sanitizeSlug(body.slug) : "";
    if (body.ip) {
      clientIP = sanitizeSlug(String(body.ip).substring(0, 50));
    }
  } catch {
    return makeResponse({ error: "Invalid request body" }, 400);
  }

  if (!slug) {
    return makeResponse({ error: "slug is required" }, 400);
  }

  const data = readData();
  const stats = readStats();
  const today = getTodayKey();

  // 更新文章浏览量
  const currentCount = data.view_counts[slug] ?? 0;
  data.view_counts[slug] = currentCount + 1;
  writeData(data);

  // 更新访客统计
  stats.total_visits += 1;

  // 记录独立访客
  if (clientIP !== "unknown") {
    if (!stats.unique_visitors[clientIP]) {
      stats.unique_visitors[clientIP] = 0;
    }
    stats.unique_visitors[clientIP] += 1;
  }

  // 记录每日统计
  if (!stats.daily_stats[today]) {
    stats.daily_stats[today] = { visits: 0, unique: [] };
  }
  stats.daily_stats[today].visits += 1;

  // 记录每日独立访客
  if (clientIP !== "unknown" && !stats.daily_stats[today].unique.includes(clientIP)) {
    stats.daily_stats[today].unique.push(clientIP);
  }

  // 记录页面浏览
  if (!stats.page_views[slug]) {
    stats.page_views[slug] = 0;
  }
  stats.page_views[slug] += 1;

  // 清理30天前的旧数据
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const cutoffDate = thirtyDaysAgo.toISOString().split("T")[0];

  for (const dateKey of Object.keys(stats.daily_stats)) {
    if (dateKey < cutoffDate) {
      delete stats.daily_stats[dateKey];
    }
  }

  writeStats(stats);

  return makeResponse({
    slug,
    count: data.view_counts[slug],
    stats: {
      total_visits: stats.total_visits,
      today_visits: stats.daily_stats[today].visits,
    }
  }, 200);
};
