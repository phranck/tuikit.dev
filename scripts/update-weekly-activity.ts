/**
 * Fetches the last 52 weeks of commits for phranck/TUIkit and buckets them
 * into the shape returned by GitHub's /stats/commit_activity endpoint:
 *   { week: unix_seconds_sunday_utc, total, days: [Sun..Sat] }
 *
 * Generates public/weekly-activity-cache.json for pre-cached client-side access.
 * Used instead of /stats/commit_activity because that endpoint's async cache
 * gets stuck indefinitely for some repos (returns 202 forever).
 *
 * Runs via GitHub Actions (every 30 min) or manual npm script.
 */

import fs from "fs";
import path from "path";

const REPO = "phranck/TUIkit";
const API_URL = `https://api.github.com/repos/${REPO}/commits`;
const WEEKS = 52;
const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;

interface WeeklyActivity {
  week: number;
  total: number;
  days: number[];
}

interface Commit {
  sha: string;
  commit: {
    author: { date: string } | null;
  };
}

function apiHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "tuikit-website",
  };
  const token = process.env.GITHUB_TOKEN || process.env.PUBLIC_GITHUB_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

/** Returns Sunday 00:00 UTC of the week containing the given timestamp (ms). */
function weekStart(ts: number): number {
  const d = new Date(ts);
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() - d.getUTCDay());
  return d.getTime();
}

function parseNextLink(header: string | null): string | null {
  if (!header) return null;
  for (const part of header.split(",")) {
    const m = part.match(/<([^>]+)>;\s*rel="next"/);
    if (m) return m[1];
  }
  return null;
}

async function fetchCommitsSince(sinceISO: string): Promise<Commit[]> {
  let url: string | null =
    `${API_URL}?per_page=100&since=${encodeURIComponent(sinceISO)}`;
  const all: Commit[] = [];
  while (url) {
    const res = await fetch(url, { headers: apiHeaders() });
    if (!res.ok) {
      throw new Error(`GitHub API ${res.status}: ${res.statusText}`);
    }
    const batch = (await res.json()) as Commit[];
    all.push(...batch);
    url = parseNextLink(res.headers.get("link"));
  }
  return all;
}

async function main() {
  const now = Date.now();
  const currentWeek = weekStart(now);
  const firstWeek = currentWeek - (WEEKS - 1) * MS_PER_WEEK;
  const since = new Date(firstWeek).toISOString();

  const commits = await fetchCommitsSince(since);
  console.log(`Fetched ${commits.length} commits since ${since}`);

  const buckets = new Map<number, WeeklyActivity>();
  for (let i = 0; i < WEEKS; i++) {
    const weekMs = firstWeek + i * MS_PER_WEEK;
    buckets.set(weekMs, {
      week: Math.floor(weekMs / 1000),
      total: 0,
      days: [0, 0, 0, 0, 0, 0, 0],
    });
  }

  for (const c of commits) {
    const dateStr = c.commit.author?.date;
    if (!dateStr) continue;
    const ts = Date.parse(dateStr);
    if (Number.isNaN(ts)) continue;
    const wk = weekStart(ts);
    const bucket = buckets.get(wk);
    if (!bucket) continue;
    const dow = new Date(ts).getUTCDay();
    bucket.days[dow]++;
    bucket.total++;
  }

  const output = Array.from(buckets.values()).sort((a, b) => a.week - b.week);

  const outputPath = path.join(
    process.cwd(),
    "public",
    "weekly-activity-cache.json",
  );
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));

  const totalCommits = output.reduce((s, w) => s + w.total, 0);
  console.log(
    `✓ Generated weekly-activity-cache.json: ${WEEKS} weeks, ${totalCommits} commits total`,
  );
  console.log(`  Location: ${outputPath}`);
}

main();
