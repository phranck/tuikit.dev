# What's Next

## Status Snapshot

- **Branch**: main
- **Active Task**: None
- **Status**: pending
- **Last Updated**: 2026-02-14T22:00:00Z

## Current Checkpoint

- **File**: N/A
- **What**: Fixed "Read the Docs" button link to point to https://docs.tuikit.dev
- **Phase**: N/A

## Blockers

- (None)

## Next Steps (Immediate Actions)

1. Weitere Landing-Page-Features oder Dashboard-Erweiterungen nach Bedarf
2. Terminal-Animation-Sequenzen in `terminal-script.md` anpassen (falls gewünscht)
3. Screenshots oder GIFs zur README hinzufügen (optional)

---

## In Progress

(None)

## Open (Backlog)

(None)

## Completed

- **2026-02-14**: Fixed "Read the Docs" button link to correct docs URL
- **2026-02-13**: Runtime TUIkit version fetching from GitHub releases (Hook + Pre-Cache + CI Workflow)
- **2026-02-13**: Documentation buttons updated to point to docs.tuikit.dev
- **2026-02-13**: Comprehensive README.md with automated badges and dashboard screenshot
- **2026-02-13**: CI workflow for automatic Node.js badge updates (update-readme-badges.yml)
- **2026-02-13**: Dynamic shields.io badges for Astro, React, TypeScript, Tailwind CSS
- **2026-02-13**: engines.node field added to package.json for Node.js version tracking
- **2026-02-13**: Project-spezifische .claude/CLAUDE.md erstellt (Architektur, Commands, Conventions)
- **2026-02-13**: Docs-Link in SiteNav auf https://docs.tuikit.dev korrigiert
- **2026-02-13**: Co-Authored-By Trailer aus allen Commits entfernt

## Notes

- Projekt ist eine statische Astro 5 + React 19 Landingpage für TUIkit
- Deployment via GitHub Pages (CI in .github/workflows/ci.yml)
- Sechs Terminal-Themes (green, amber, red, violet, blue, white)
- Alle Badges in README.md sind automatisiert (CI Status, Node.js via Workflow, Dependencies via shields.io)
- Dashboard-Screenshot in public/images/dashboard-screenshot.png
- Keine Co-Authored-By Trailer in Commits (siehe globale CLAUDE.md)
- TUIkit Version wird zur Laufzeit vom GitHub API geholt (24h localStorage cache + pre-cache JSON)
- Stündliches CI Workflow hält version-cache.json aktuell

**Last Updated**: 2026-02-14T22:00:00Z
