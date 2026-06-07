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

- `app/components/ProjectDesktop.tsx` + `DraggableProjectIcon.tsx` — scattered draggable thumbnails. Drag attaches `pointermove`/`pointerup` listeners only for the duration of the drag (scoped inside `startDrag`) and gates updates with `requestAnimationFrame` so a single setState lands per frame. Position is clamped by `EDGE_PADDING` (8px) and a `DOCK_SAFE_AREA` (96px) at the bottom. A thumbnail with `appId` opens the matching window on click — drag/click are separated by a 5px movement threshold (`dragRef.moved`).
- `app/components/MacDock.tsx` — owns the dock, tooltips, and 9 windows: About, Notes, AI Workflows, Lighting, Video Creator, Visual Design, Multimedia, Retention Visual Skills, Build a Channel. Each window has `WindowState` `{ open, minimized, maximized, closing, x, y, focusOrder }`. The most recently focused window has the highest `focusOrder`; z-index is `30 + focusOrder` so newer windows stack on top. `bringToFront` is wired to `onFocus` (pointerdown anywhere in the window) and to opening. `WindowShell.startDrag` mirrors the icon pattern: scoped listeners + rAF throttle, attached on titlebar `onPointerDown`.

Cross-component opens use a global function: `MacDock` registers `window.__openMacApp(id)` in a `useEffect`, and `DraggableProjectIcon` calls it on click. A `macdock:open` CustomEvent is the fallback path. New windows must be added to `AppId`, `defaultWindows`, and rendered in the `MacDock` JSX with both `onMove` and `onFocus` props.

Reusable window components:
- `WindowShell` — chrome (titlebar + traffic lights + drag). Reads `state.focusOrder` for z-index.
- `ProjectGalleryWindow` — Notes-style two-column layout for project pages. Sidebar lists `subprojects[]`; main column shows the selected sub-project's media. If a sub-project has `videoUrl`, it renders an aspect-video YouTube `<iframe>`; otherwise falls back to `cover` `<img>` and finally a ▶ placeholder. Pass `comingSoon` for the placeholder badge.
- `AboutWindow`, `NotesWindow`, `AIWorkflowsWindow` — bespoke layouts. AI Workflows embeds its final cut as a YouTube iframe.

Data is static in `app/data/projects.ts` (thumbnail positions as `left`/`top` percentages plus optional `appId`) and `app/data/dock.ts` (3 social icons — YouTube/Gmail/Zalo as display-only labels with no click handlers, About Me stats, Notes content). The `Project` type allows optional `appId` so not every thumbnail needs to open a window.

Window open/close uses CSS keyframes in `app/globals.css` (`mac-window-open` / `mac-window-close`) — the open animation deliberately overshoots scale > 1 then settles, to mimic macOS spring. Animations are transform/opacity only (no `filter: blur`) and `.mac-window` declares `will-change: transform, opacity` plus `contain: layout paint` so the browser keeps the window on its own compositor layer. If reworking animations, edit globals.css rather than adding a JS animation library.

Gallery `<img>` tags use `loading="lazy" decoding="async"` to avoid blocking initial render.

## Project-specific gotchas

- **SVG dock icons use plain `<img>`, not `next/image`.** `next/image` previously rendered the social icons broken. Don't "fix" this.
- **Social dock icons are display-only.** No `onClick`/`href`/`mailto:`/`tel:`. Only the tooltip label conveys info (YouTube · Coming Soon, gmail address, Zalo phone). Don't add link handlers.
- **The background filename `port_backgounrd.png` is a typo, but it's the canonical name.** Don't silently rename — references exist in `app/page.tsx` and elsewhere. (`port_background.png` also exists in `public/image` as a leftover; the typo'd one is what's wired up.)
- Browser-served assets must live under `public/image/`. A top-level `image/` directory may also exist with originals but is not served.
- The original raw assets live in `Joseph_s Portfolio/<project>/...` and that folder is gitignored. Each project subfolder contains a `Tài liệu không có tiêu đề.docx` whose first non-schema link is the canonical YouTube URL for that sub-project. Copy what you need into `public/image/cover-*.{jpg,png}` (or use the slugged names like `retention-after.jpg`, `cover-build-channel.jpg`) before referencing them.
- Avoid PowerShell string-replace edits on TSX files — literal `` `r`n `` injections have broken JSX here before. Use the Edit tool or rewrite whole files with here-strings.
- `event.preventDefault()` on a thumbnail's `pointerdown` cancels the synthetic `click` event. Use `onClick` for taps and gate it with the `dragRef.moved` flag instead.
- Drag refactor traps: `dragRef` was reduced to `{ moved }` only. Don't reintroduce `active`/`startX`/etc. on it — that broke the Vercel typecheck once. All transient drag state lives inside the `startDrag` closure.
- When the dev server hits `MODULE_NOT_FOUND` on `/_next/static/...`: kill all `node.exe`, `rm -rf .next`, then restart. This has happened after large refactors and stale workers.

## Deployment

The `main` branch is wired to Vercel for auto-deploy at `https://hoangcd-portfolio.vercel.app/`. The GitHub remote is `https://github.com/longnguyen-mindx/hoangcd-portfolio`. Push to `main` triggers a build; expect ~60-90s before the new content is live.
