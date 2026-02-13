# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Landing page and live dashboard for **TUIkit**, a Swift Terminal UI framework. Built with Astro 5 (static site generator) + React 19 (interactive components) + Tailwind CSS v4. Deployed to tuikit.dev via GitHub Pages.

## Commands

```bash
npm run dev        # Local dev server
npm run build      # Production build (runs prebuild scripts first)
npm run preview    # Preview production build locally
```

### Prebuild Pipeline

`npm run build` automatically runs prebuild via `package.json`:
1. `tsx scripts/generate-terminal-data.ts` - Parses `terminal-script.md` into `src/components/react/terminal-data.ts`
2. `tsx scripts/update-plans-data.ts` - Fetches project plans data into `public/data/plans.json`

### Data Update Scripts

```bash
npm run update:plans                          # Update plans data
tsx scripts/update-social-cache.ts [--full]    # Update social profiles cache
```

## Architecture

### Rendering Model

- **Astro pages** (`src/pages/`) handle static HTML generation and SEO
- **React components** (`src/components/react/`) handle all client-side interactivity
- **Astro components** (`src/components/astro/`) are purely static (no JS shipped)
- Hydration directives: `client:load` (critical), `client:idle` (non-critical), `client:visible` (lazy)

### Key Directories

```
src/components/astro/       # Static Astro components
src/components/react/       # Interactive React components
src/components/react/dashboard/  # Dashboard-specific components
src/hooks/                  # React hooks (data fetching, caching, clipboard)
src/lib/                    # Utilities (terminal parser)
src/layouts/                # BaseLayout.astro (HTML shell, SEO, analytics)
src/pages/                  # Two routes: index.astro (/), dashboard.astro (/dashboard)
src/styles/                 # global.css with Tailwind + 6 theme palettes
scripts/                    # Build-time data generation scripts
public/                     # Static assets, cached JSON data, sounds, fonts
```

### Theme System

Six terminal-inspired color themes (green, amber, red, violet, blue, white) defined as CSS custom properties in `src/styles/global.css`. Theme is stored on `<html data-theme="...">` and persisted to localStorage. ThemeProvider (React Context) manages state; a blocking script in BaseLayout.astro prevents FOUC.

### Terminal Animation Pipeline

`terminal-script.md` (root) defines animation sequences using markers like `[TYPE]`, `[INSTANT]`, `[COUNTER]`, `[DELAY 1200ms]`, etc. The parser in `src/lib/terminal-parser.ts` converts this into structured data. `scripts/generate-terminal-data.ts` runs at prebuild to produce `src/components/react/terminal-data.ts`. `HeroTerminal.tsx` consumes this data for the CRT boot animation with synchronized audio (Howler.js, lazy-loaded).

### Data Fetching

- **Build time**: Prebuild scripts fetch GitHub API data, parse README badges for test counts
- **Client time**: `useGitHubStats` hook queries ~13 GitHub API endpoints in parallel; `useGitHubStatsCache` wraps it with localStorage caching (5-min TTL, background refresh)
- **Pre-cached JSON**: `public/social-cache.json` (social profiles), `public/weekly-activity-cache.json` (activity heatmap)

### Environment Variables

- `PUBLIC_GITHUB_TOKEN` - GitHub API token for dashboard (higher rate limits)
- `PUBLIC_TUIKIT_VERSION` - Injected by CI from GitHub tags
- `PUBLIC_TUIKIT_TEST_COUNT` / `PUBLIC_TUIKIT_SUITE_COUNT` - Injected by `astro.config.mjs` from prebuild

## Conventions

- **TypeScript strict mode** throughout (extends `astro/tsconfigs/strict`)
- **Path alias**: `@/*` maps to `src/*`
- **Responsive**: Mobile-first Tailwind; expensive effects (backdrop-blur, glow) disabled on mobile via `@media` queries and `prefers-reduced-motion`
- **Accessibility**: Skip links, semantic HTML, ARIA labels, `sr-only` text, icons hidden with `aria-hidden`
- **Custom Tailwind utilities**: `bg-frosted-glass`, `text-glow`, `animate-cursor-blink`, `animate-skeleton` (defined in global.css)

## CI/CD Workflows (.github/workflows/)

- **ci.yml** - Build and deploy to GitHub Pages on push to main
- **update-social-cache.yml** - Fetches social profiles every 2h (incremental) + weekly full refresh
- **update-weekly-activity.yml** - Updates activity heatmap data
- **update-plans-data.yml** - Updates project plans data

Auto-commits from workflows use `[skip ci]` to prevent rebuild loops.
