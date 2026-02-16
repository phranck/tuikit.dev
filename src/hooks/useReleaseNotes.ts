import { useState, useEffect } from "react";

export interface ReleaseAuthor {
  login: string;
  avatarUrl: string;
  profileUrl: string;
}

export interface ReleaseNote {
  version: string;
  tagName: string;
  name: string;
  publishedAt: string;
  htmlUrl: string;
  body?: string;
  author?: ReleaseAuthor;
}

export interface ReleasesCache {
  generatedAt: string;
  latest: ReleaseNote;
}

/**
 * Fetches release notes from the pre-cached JSON file.
 *
 * Returns null if cache is not available (e.g., on first page load before data is generated).
 */
export function useReleaseNotes() {
  const [release, setRelease] = useState<ReleaseNote | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/data/releases-cache.json")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch releases");
        return res.json();
      })
      .then((data: ReleasesCache) => {
        setRelease(data.latest);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  return { release, loading };
}
