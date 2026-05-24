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

- `app/components/ProjectDesktop.tsx` + `DraggableProjectIcon.tsx` — scattered draggable thumbnails. Drag uses **global** `pointermove`/`pointerup` listeners (not element-local) so the item tracks the cursor reliably. Position is clamped by `EDGE_PADDING` (8px) and a `DOCK_SAFE_AREA` (96px) at the bottom. A thumbnail with `appId` opens the matching window on click — drag/click are separated by a 5px movement threshold (`moved` flag).
- `app/components/MacDock.tsx` — owns the dock, tooltips, and 7 windows: About, Notes, AI Workflows, Lighting, Video Creator, Visual Design, Multimedia. Each window has `WindowState` `{ open, minimized, maximized, closing, x, y, focusOrder }`. The most recently focused window has the highest `focusOrder`; z-index is `30 + focusOrder` so newer windows stack on top. `bringToFront` is wired to `onFocus` (pointerdown anywhere in the window) and to opening.

Cross-component opens use a global function: `MacDock` registers `window.__openMacApp(id)` in a `useEffect`, and `DraggableProjectIcon` calls it on click. A `macdock:open` CustomEvent is the fallback path. New windows must be added to `AppId`, `defaultWindows`, and rendered in the `MacDock` JSX with both `onMove` and `onFocus` props.

Reusable window components:
- `WindowShell` — chrome (titlebar + traffic lights + drag). Reads `state.focusOrder` for z-index.
- `ProjectGalleryWindow` — Notes-style two-column layout for project pages. Sidebar lists `subprojects[]`, main column shows the selected sub-project's hero image, name, kind, and the parent project's `meta`. Pass `comingSoon` for the placeholder badge.
- `AboutWindow`, `NotesWindow`, `AIWorkflowsWindow` — bespoke layouts.

Data is static in `app/data/projects.ts` (thumbnail positions as `left`/`top` percentages plus optional `appId`) and `app/data/dock.ts` (social icons, About Me stats, Notes content). The `Project` type allows optional `appId` so not every thumbnail needs to open a window.

Window open/close uses CSS keyframes in `app/globals.css` (`mac-window-open` / `mac-window-close`) — the open animation deliberately overshoots scale > 1 then settles, to mimic macOS spring. If reworking animations, edit globals.css rather than adding a JS animation library.

Gallery `<img>` tags use `loading="lazy" decoding="async"` to avoid blocking initial render.

## Project-specific gotchas

- **SVG dock icons use plain `<img>`, not `next/image`.** `next/image` previously rendered the social icons broken. Don't "fix" this.
- **The background filename `port_backgounrd.png` is a typo, but it's the canonical name.** Don't silently rename — references exist in `app/page.tsx` and elsewhere. (`port_background.png` also exists in `public/image` as a leftover; the typo'd one is what's wired up.)
- Browser-served assets must live under `public/image/`. A top-level `image/` directory may also exist with originals but is not served.
- The original raw assets live in `Joseph_s Portfolio/<project>/...` and that folder is gitignored. Copy what you need into `public/image/cover-*.{jpg,png}` with web-friendly filenames before referencing them.
- Avoid PowerShell string-replace edits on TSX files — literal `` `r`n `` injections have broken JSX here before. Use the Edit tool or rewrite whole files with here-strings.
- `event.preventDefault()` on a thumbnail's `pointerdown` cancels the synthetic `click` event. Use `onClick` for taps and gate it with the `dragRef.moved` flag instead.

## Deployment

The `main` branch is wired to Vercel for auto-deploy at `https://hoangcd-portfolio.vercel.app/`. The GitHub remote is `https://github.com/longnguyen-mindx/hoangcd-portfolio`. Push to `main` triggers a build; expect ~60-90s before the new content is live.
