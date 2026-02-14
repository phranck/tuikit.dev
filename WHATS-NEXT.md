# What's Next

## Status Snapshot

- **Branch**: main
- **Active Task**: None
- **Status**: completed
- **Last Updated**: 2026-02-15T00:10:00Z

## Current Checkpoint

- **File**: N/A
- **What**: tuikit.dev CI/CD refactoring completed - workflows consolidated and test count handling simplified
- **Phase**: N/A

## Blockers

- (None)

## Next Steps (Immediate Actions)

1. Implement test count automation in TUIkit Repository (update-test-counts.yml)
2. Monitor new scheduled-data-refresh.yml workflow for first runs
3. Verify all caches update correctly on 30-minute schedule

---

## In Progress

(None)

## Open (Backlog)

(None)

## Completed

- **2026-02-15**: CI/CD Workflows consolidated (6 → 3 workflows)
  - Created scheduled-data-refresh.yml (runs every 30 minutes)
  - Deleted 4 redundant individual scheduled workflows
  - Consolidated: plans-data, social-cache, weekly-activity, version-cache
  - Maintained Sunday 4 AM UTC full social refresh

- **2026-02-15**: Simplified test count handling
  - Removed test fetching from generate-terminal-data.ts
  - Changed landing page from "1100 Tests" to "Extensively Tested"
  - Simplified astro.config.mjs (removed project-stats.json parsing)

- **2026-02-14**: Fixed test count parsing to handle + symbols
- **2026-02-14**: Fixed "Read the Docs" button link to https://docs.tuikit.dev
- **2026-02-13**: Runtime TUIkit version fetching from GitHub releases (Hook + Pre-Cache + CI Workflow)
- **2026-02-13**: Documentation buttons updated to point to docs.tuikit.dev
- **2026-02-13**: Comprehensive README.md with automated badges and dashboard screenshot
- **2026-02-13**: CI workflow for automatic Node.js badge updates (update-readme-badges.yml)
- **2026-02-13**: Dynamic shields.io badges for Astro, React, TypeScript, Tailwind CSS

## Notes

- Projekt ist eine statische Astro 5 + React 19 Landingpage für TUIkit
- Deployment via GitHub Pages (CI in .github/workflows/ci.yml)
- Sechs Terminal-Themes (green, amber, red, violet, blue, white)
- Alle Badges in README.md sind automatisiert (CI Status, Node.js via Workflow, Dependencies via shields.io)
- Dashboard-Screenshot in public/images/dashboard-screenshot.png
- TUIkit Version wird zur Laufzeit vom GitHub API geholt (24h localStorage cache + pre-cache JSON)
- 30-minütliches Scheduled Data Refresh für Plans, Social Cache, Weekly Activity, Version
- Nächster Task: TUIkit Repository - Automation für Test-Count Updates im README

**Last Updated**: 2026-02-15T00:10:00Z
