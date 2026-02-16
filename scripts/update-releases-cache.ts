/**
 * Fetches latest releases from phranck/TUIkit via GitHub API.
 * Generates public/data/releases-cache.json for pre-cached client-side access.
 *
 * Runs via GitHub Actions (every 30 min) or manual npm script.
 */

import fs from "fs";
import path from "path";

const REPO = "phranck/TUIkit";
const API_URL = `https://api.github.com/repos/${REPO}/releases`;

interface GitHubRelease {
  tag_name: string;
  name: string;
  published_at: string;
  html_url: string;
  body: string;
  author: {
    login: string;
    avatar_url: string;
    html_url: string;
  };
}

interface ReleaseAuthor {
  login: string;
  avatarUrl: string;
  profileUrl: string;
}

interface ReleaseNote {
  version: string;
  tagName: string;
  name: string;
  publishedAt: string;
  htmlUrl: string;
  body?: string;
  author?: ReleaseAuthor;
}

interface ReleasesCache {
  generatedAt: string;
  latest: ReleaseNote;
}

/** Build common headers for GitHub API requests. */
function apiHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "tuikit-website",
  };
  const token = process.env.GITHUB_TOKEN || process.env.PUBLIC_GITHUB_TOKEN;
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

/** Fetch latest release from GitHub API. */
async function fetchLatestRelease(): Promise<ReleaseNote | null> {
  try {
    const response = await fetch(`${API_URL}?per_page=1`, {
      headers: apiHeaders(),
    });

    if (!response.ok) {
      throw new Error(`GitHub API ${response.status}: ${response.statusText}`);
    }

    const data = (await response.json()) as GitHubRelease[];
    if (!Array.isArray(data) || data.length === 0) {
      console.warn("No releases found in repository");
      return null;
    }

    const release = data[0];
    return {
      version: release.tag_name.replace(/^v/, ""),
      tagName: release.tag_name,
      name: release.name || release.tag_name,
      publishedAt: release.published_at,
      htmlUrl: release.html_url,
      body: release.body || "",
      author: release.author
        ? {
            login: release.author.login,
            avatarUrl: release.author.avatar_url,
            profileUrl: release.author.html_url,
          }
        : undefined,
    };
  } catch (err) {
    console.error(`Failed to fetch releases from GitHub: ${err}`);
    return null;
  }
}

async function main() {
  const latest = await fetchLatestRelease();

  if (!latest) {
    console.warn("No release data available - skipping cache generation");
    return;
  }

  const output: ReleasesCache = {
    generatedAt: new Date().toISOString(),
    latest,
  };

  const outputDir = path.join(process.cwd(), "public", "data");
  fs.mkdirSync(outputDir, { recursive: true });

  const outputPath = path.join(outputDir, "releases-cache.json");
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));

  console.log(`✓ Generated releases-cache.json: ${latest.version}`);
  console.log(`  Location: ${outputPath}`);
}

main();
