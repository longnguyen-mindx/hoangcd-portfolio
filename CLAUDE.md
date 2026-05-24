# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Single-screen, non-scrollable personal portfolio styled like a macOS desktop. Next.js 14 App Router + React 18 + Tailwind 3 + TypeScript. No `framer-motion`, `react-icons`, or `lucide-react` — these were removed and should not be reintroduced.

`LANDING_PAGE_HANDOFF.md` is the long-form spec for current behavior, default window positions, and asset filenames. Read it before making non-trivial changes.

## Commands (Windows / PowerShell)

PowerShell blocks `npm.ps1`, so always invoke `npm.cmd`:

```powershell
npm.cmd run lint
npm.cmd run build
npm.cmd run dev -- -p 3000
```

Before starting a dev server, kill any old listeners on ports 3000–3010 — stale Next dev servers have repeatedly caused white-screen / 404 confusion in this project:

```powershell
$ports = 3000..3010
$owners = Get-NetTCPConnection -ErrorAction SilentlyContinue | Where-Object { $ports -contains $_.LocalPort -and $_.OwningProcess -ne 0 } | Select-Object -ExpandProperty OwningProcess -Unique
foreach ($owner in $owners) { Stop-Process -Id $owner -Force -ErrorAction SilentlyContinue }
```

## Architecture

`app/page.tsx` is a thin server component that composes the desktop background, overlays, and two client components. Keep it small — interaction logic belongs in the client components, not here.

Two client components own all interactivity:

- `app/components/ProjectDesktop.tsx` + `DraggableProjectIcon.tsx` — scattered draggable thumbnails. Drag uses **global** `pointermove`/`pointerup` listeners (not element-local) so the item tracks the cursor reliably. Position is clamped by `EDGE_PADDING` (8px) and a `DOCK_SAFE_AREA` (96px) at the bottom that prevents thumbnails from overlapping the dock.
- `app/components/MacDock.tsx` — owns the dock, tooltips, and the About Me / Notes windows. Each window has a `WindowState` `{ open, minimized, maximized, closing, x, y }`. Clicking a dock icon toggles open ↔ closing animation ↔ closed; minimized re-opens. Window drag is bound to the titlebar only, ignores traffic-light clicks, and is disabled when maximized.

Data is static in `app/data/projects.ts` (thumbnail positions as `left`/`top` percentages) and `app/data/dock.ts` (social icons, About Me stats, Notes content).

Window open/close uses CSS keyframes in `app/globals.css` (`mac-window-open` / `mac-window-close`) — the open animation deliberately overshoots scale > 1 then settles, to mimic macOS spring. If reworking animations, edit globals.css rather than adding a JS animation library.

## Project-specific gotchas

- **SVG dock icons use plain `<img>`, not `next/image`.** `next/image` previously rendered the social icons broken. Don't "fix" this.
- **The background filename `port_backgounrd.png` is a typo, but it's the canonical name.** Don't silently rename — references exist in `app/page.tsx` and elsewhere. (`port_background.png` also exists in `public/image` as a leftover; the typo'd one is what's wired up.)
- Browser-served assets must live under `public/image/`. A top-level `image/` directory may also exist with originals but is not served.
- Avoid PowerShell string-replace edits on TSX files — literal `` `r`n `` injections have broken JSX here before. Use the Edit tool or rewrite whole files with here-strings.
