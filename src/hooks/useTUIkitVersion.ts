import { useState, useEffect, useCallback, useRef } from "react";

/** localStorage key for version cache. */
const CACHE_KEY = "tuikit-version-cache";

/** How long cached version remains valid (24 hours). */
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000;

/** Minimum time between force-refresh clicks (60 seconds). */
const FORCE_REFRESH_COOLDOWN_MS = 60 * 1000;

/** Fallback version if all sources fail. */
const FALLBACK_VERSION = "0.3.0";

/** Shape of the localStorage cache entry. */
interface VersionCacheEntry {
  version: string;
  fetchedAt: number;
  source: "api" | "precache" | "build";
}

/** Return type of the useTUIkitVersion hook. */
export interface UseTUIkitVersionReturn {
  /** Current TUIkit version (e.g., "0.3.0"). */
  version: string;
  /** Whether initial fetch is in progress (false after first resolution). */
  loading: boolean;
  /** API error message if fetch failed, null otherwise. */
  error: string | null;
  /** Whether version was served from localStorage cache. */
  isFromCache: boolean;
  /** Unix timestamp (ms) of last successful fetch, or null if none yet. */
  lastFetchedAt: number | null;
  /** Whether force-refresh is allowed (cooldown elapsed). */
  canForceRefresh: boolean;
  /** Bypass cache and fetch fresh data (respects cooldown). */
  forceRefresh: () => void;
}

// ---------------------------------------------------------------------------
// localStorage helpers: all reads/writes wrapped in try/catch for Safari Private Mode
// ---------------------------------------------------------------------------

/** Read and validate the cached version from localStorage. */
function readCache(): VersionCacheEntry | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as VersionCacheEntry;
    if (!parsed || typeof parsed.version !== "string" || typeof parsed.fetchedAt !== "number") {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
    return parsed;
  } catch {
    try {
      localStorage.removeItem(CACHE_KEY);
    } catch {
      /* ignore */
    }
    return null;
  }
}

/** Persist version to localStorage with timestamp and source. */
function writeCache(version: string, source: "api" | "precache"): number {
  const fetchedAt = Date.now();
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ version, fetchedAt, source }));
  } catch {
    /* Storage full or unavailable: silently continue without cache */
  }
  return fetchedAt;
}

// ---------------------------------------------------------------------------
// Fetching helpers
// ---------------------------------------------------------------------------

/** Fetch latest TUIkit version from GitHub tags API. */
async function fetchVersionFromAPI(): Promise<string> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
  };

  const token = import.meta.env.PUBLIC_GITHUB_TOKEN;
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch("https://api.github.com/repos/phranck/TUIkit/tags", { headers });

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
}

/** Fetch version from pre-cached JSON file. */
async function fetchVersionFromPreCache(): Promise<string | null> {
  try {
    const response = await fetch("/version-cache.json");
    if (!response.ok) return null;
    const data = await response.json();
    return data.version || null;
  } catch {
    return null;
  }
}

/**
 * Hook to fetch and cache the latest TUIkit version from GitHub releases.
 *
 * On mount checks localStorage for fresh cache (< 24h old). If valid cache exists
 * it's served immediately. Otherwise falls back to pre-cache JSON, then GitHub API.
 *
 * The hook enforces a 60-second cooldown on force-refresh to prevent rate-limit issues.
 * All localStorage operations are wrapped in try/catch for Safari Private Mode compatibility.
 */
export function useTUIkitVersion(): UseTUIkitVersionReturn {
  const [version, setVersion] = useState<string>(
    import.meta.env.PUBLIC_TUIKIT_VERSION || FALLBACK_VERSION
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFromCache, setIsFromCache] = useState(false);
  const [lastFetchedAt, setLastFetchedAt] = useState<number | null>(null);

  const initializedRef = useRef(false);

  // -------------------------------------------------------------------------
  // Core fetch logic: try API, fallback to pre-cache
  // -------------------------------------------------------------------------

  const doFetch = useCallback(async () => {
    setLoading(true);
    try {
      const apiVersion = await fetchVersionFromAPI();
      const timestamp = writeCache(apiVersion, "api");
      setVersion(apiVersion);
      setLastFetchedAt(timestamp);
      setIsFromCache(false);
      setError(null);
    } catch (err) {
      console.warn("Failed to fetch version from GitHub API:", err);

      // Fallback to pre-cache
      const preCacheVersion = await fetchVersionFromPreCache();
      if (preCacheVersion) {
        const timestamp = writeCache(preCacheVersion, "precache");
        setVersion(preCacheVersion);
        setLastFetchedAt(timestamp);
        setIsFromCache(false);
        setError(null);
      } else {
        // All sources failed: keep build-time fallback, set error
        setError(err instanceof Error ? err.message : "Unknown error");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // -------------------------------------------------------------------------
  // Mount: check cache, serve cached version or trigger fresh fetch
  // -------------------------------------------------------------------------

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const cached = readCache();
    const now = Date.now();

    if (cached && now - cached.fetchedAt < CACHE_DURATION_MS) {
      // Cache is fresh: serve immediately, no API call
      setVersion(cached.version);
      setLastFetchedAt(cached.fetchedAt);
      setIsFromCache(true);
      setLoading(false);
    } else {
      // Cache stale or missing: fetch fresh version
      doFetch();
    }
  }, [doFetch]);

  // -------------------------------------------------------------------------
  // Force refresh with 60-second cooldown
  // -------------------------------------------------------------------------

  const canForceRefresh = lastFetchedAt === null || Date.now() - lastFetchedAt >= FORCE_REFRESH_COOLDOWN_MS;

  const forceRefresh = useCallback(() => {
    if (!canForceRefresh) return;
    doFetch();
  }, [canForceRefresh, doFetch]);

  return {
    version,
    loading,
    error,
    isFromCache,
    lastFetchedAt,
    canForceRefresh,
    forceRefresh,
  };
}
