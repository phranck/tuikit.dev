/**
 * Fetches plan data from phranck/TUIkit via GitHub Contents API.
 * Reads .claude/plans/open/ and .claude/plans/done/ directories.
 *
 * Runs via GitHub Actions (hourly) or manual npm script.
 * Output: public/data/plans.json
 *
 * Requires GITHUB_TOKEN env var for authenticated API access.
 */

import fs from "fs";
import path from "path";

const REPO = "phranck/TUIkit";
const API_BASE = `https://api.github.com/repos/${REPO}/contents`;

interface PlanData {
  date: string;
  slug: string;
  title: string;
  preface: string;
  status: "open" | "done";
}

interface GitHubContentItem {
  name: string;
  download_url: string;
  type: "file" | "dir";
}

function extractDate(filename: string): string {
  const match = filename.match(/^(\d{4}-\d{2}-\d{2})/);
  return match ? match[1] : "";
}

function extractSlug(filename: string): string {
  const match = filename.match(/^\d{4}-\d{2}-\d{2}-(.+)\.md$/);
  return match ? match[1] : "";
}

function extractTitle(content: string): string {
  const match = content.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : "Untitled";
}

function extractPreface(content: string): string {
  const match = content.match(/^##\s+Preface\s*\n([\s\S]*?)(?=\n##\s|\Z)/m);
  return match ? match[1].trim() : "";
}

/** Build common headers for GitHub API requests. */
function apiHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "tuikit-website",
  };
  const token = process.env.GITHUB_TOKEN;
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

/** Fetch plan files from a GitHub directory via Contents API. */
async function fetchPlansFromGitHub(
  dirPath: string,
  status: "open" | "done"
): Promise<PlanData[]> {
  const url = `${API_BASE}/${dirPath}`;
  const headers = apiHeaders();

  let items: GitHubContentItem[];
  try {
    const res = await fetch(url, { headers });
    if (!res.ok) {
      console.warn(`GitHub API ${res.status} for ${dirPath}`);
      return [];
    }
    items = (await res.json()) as GitHubContentItem[];
  } catch (err) {
    console.warn(`Failed to fetch ${dirPath}:`, err);
    return [];
  }

  const mdFiles = items.filter(
    (item) => item.type === "file" && item.name.endsWith(".md")
  );

  const plans: PlanData[] = [];
  for (const file of mdFiles) {
    try {
      const contentRes = await fetch(file.download_url, { headers });
      if (!contentRes.ok) continue;
      const content = await contentRes.text();

      const plan: PlanData = {
        date: extractDate(file.name),
        slug: extractSlug(file.name),
        title: extractTitle(content),
        preface: extractPreface(content),
        status,
      };

      if (plan.date && plan.slug && plan.preface) {
        plans.push(plan);
      }
    } catch {
      console.warn(`Failed to fetch content for ${file.name}`);
    }
  }

  return plans;
}

async function main() {
  const openPlans = await fetchPlansFromGitHub(".claude/plans/open", "open");
  const donePlans = await fetchPlansFromGitHub(".claude/plans/done", "done");

  const sortByDateDesc = (a: PlanData, b: PlanData) =>
    new Date(b.date).getTime() - new Date(a.date).getTime();

  openPlans.sort(sortByDateDesc);
  donePlans.sort(sortByDateDesc);

  const output = {
    generated: new Date().toISOString(),
    open: openPlans.map(({ date, slug, title, preface }) => ({
      date,
      slug,
      title,
      preface,
    })),
    done: donePlans.map(({ date, slug, title, preface }) => ({
      date,
      slug,
      title,
      preface,
    })),
  };

  const outputDir = path.join(process.cwd(), "public", "data");
  fs.mkdirSync(outputDir, { recursive: true });

  const outputPath = path.join(outputDir, "plans.json");
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));

  console.log(
    `✓ Generated plans.json (${openPlans.length} open, ${donePlans.length} done)`
  );
  console.log(`  Location: ${outputPath}`);
}

main();
