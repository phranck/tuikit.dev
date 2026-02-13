/**
 * Fetches the latest TUIkit version from GitHub tags API.
 * Generates public/version-cache.json for pre-cached client-side access.
 *
 * Runs via prebuild, CI workflow, or manual npm script.
 */

import fs from "fs";
import path from "path";

const REPO = "phranck/TUIkit";
const API_URL = `https://api.github.com/repos/${REPO}/tags`;
const FALLBACK_VERSION = "0.3.0";

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

/** Fetch latest version from GitHub tags API. */
async function fetchLatestVersion(): Promise<string> {
  try {
    const response = await fetch(API_URL, { headers: apiHeaders() });
    if (!response.ok) {
      throw new Error(`GitHub API ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error("No tags found in repository");
    }

    const version = data[0].name?.replace(/^v/, "");
    if (!version) {
      throw new Error("Invalid tag format");
    }

    return version;
  } catch (err) {
    console.warn(`Failed to fetch version from GitHub: ${err}`);
    console.warn(`Using fallback version: ${FALLBACK_VERSION}`);
    return FALLBACK_VERSION;
  }
}

async function main() {
  const version = await fetchLatestVersion();

  const output = {
    version,
    generatedAt: new Date().toISOString(),
  };

  const outputPath = path.join(process.cwd(), "public", "version-cache.json");
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));

  console.log(`✓ Generated version-cache.json: ${version}`);
  console.log(`  Location: ${outputPath}`);
}

main();
