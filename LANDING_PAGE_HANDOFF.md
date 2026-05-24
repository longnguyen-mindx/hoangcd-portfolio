# Portfolio Landing Page Handoff

## Project Overview

This project is a single-screen personal portfolio landing page inspired by the macOS desktop aesthetic. It is built with Next.js 14 App Router and Tailwind CSS.

The current experience includes:

- Full viewport, non-scrollable desktop-style landing page.
- Background image from `/public/image/port_backgounrd.png`.
- Scattered draggable project thumbnails, styled like loose macOS desktop items.
- A glassmorphism macOS-style dock centered at the bottom.
- Dock icons for About Me, Notes, YouTube, Instagram, Gmail, and Zalo.
- macOS-like tooltips/popovers above dock icons.
- About Me and Notes windows that open inside the page.
- Windows can be dragged by the titlebar.
- Windows have macOS traffic-light buttons: close, minimize, zoom/restore.
- Clicking About Me or Notes dock icon toggles that app window open/closed.
- Window opening uses a spring/bounce-style scale/fade animation.

## Important User Preferences

Preserve these unless the user explicitly changes direction:

- The design should feel like macOS, not a generic web dashboard.
- Keep the page single viewport and non-scrollable.
- Use the SF Font stack where possible.
- Social dock icons should use SVG files from `/public/image`, not icon libraries.
- Social dock icons should be rounded only, without visible borders.
- Avoid reintroducing `framer-motion`, `react-icons`, or `lucide-react`; they were removed because they became unnecessary and earlier iterations had white-screen/icon issues.
- Avoid using `next/image` for the SVG dock icons. Use plain `<img>` for SVG dock icons because `next/image` previously caused broken-looking social icons in this project.
- Before running a dev server, close old Next dev server ports (`3000-3010`) to avoid stale bundle confusion.

## Current Tech Stack

- Next.js 14 App Router
- React 18
- Tailwind CSS 3
- TypeScript
- No Framer Motion currently
- No react-icons currently
- No lucide-react currently

## Key Commands

Use `npm.cmd` on this Windows machine because PowerShell blocks `npm.ps1` scripts.

```powershell
npm.cmd run lint
npm.cmd run build
npm.cmd run dev -- -p 3000
```

Recommended restart routine before launching dev server:

```powershell
$ports = 3000..3010
$owners = Get-NetTCPConnection -ErrorAction SilentlyContinue | Where-Object { $ports -contains $_.LocalPort -and $_.OwningProcess -ne 0 } | Select-Object -ExpandProperty OwningProcess -Unique
foreach ($owner in $owners) { Stop-Process -Id $owner -Force -ErrorAction SilentlyContinue }
Start-Sleep -Seconds 2
```

Then start:

```powershell
Start-Process -FilePath npm.cmd -ArgumentList @('run','dev','--','-p','3000') -WorkingDirectory 'e:\dh' -WindowStyle Hidden
```

Check page:

```powershell
Invoke-WebRequest -Uri http://localhost:3000 -UseBasicParsing -TimeoutSec 10
```

## File Structure

```text
app/
  layout.tsx
  page.tsx
  globals.css
  components/
    DraggableProjectIcon.tsx
    MacDock.tsx
    ProjectDesktop.tsx
  data/
    dock.ts
    projects.ts
public/
  image/
    port_backgounrd.png
    icon_apple.jpg
    notes.svg
    youtube.svg
    instagram.svg
    gmail.svg
    zalo.svg
    project-a.jpg
    project-b.jpg
    project-c.jpg
    project-d.jpg
```

## Main Files

### `app/page.tsx`

This is intentionally small. It composes the desktop:

- Main full-screen background.
- Light radial overlay.
- Noise overlay.
- `<ProjectDesktop />` for draggable thumbnails.
- `<MacDock />` for dock and app windows.

Do not move large interaction logic back into this file.

### `app/components/ProjectDesktop.tsx`

Renders the project thumbnails from `app/data/projects.ts`.

### `app/components/DraggableProjectIcon.tsx`

Client component for draggable thumbnails.

Behavior:

- Initial thumbnail position is based on `left` and `top` percentages from data.
- Drag uses global `pointermove` and `pointerup` listeners so the item follows the pointer reliably.
- Position is clamped inside the viewport.
- Bottom safe area prevents thumbnails from being dragged into the dock area.
- Thumbnail rises above others while being dragged.

Important constants:

- `EDGE_PADDING = 8`
- `DOCK_SAFE_AREA = 96`

### `app/components/MacDock.tsx`

Client component for:

- Dock icons.
- Dock tooltips.
- About Me window.
- Notes window.
- Window manager state.
- Window dragging.
- Window open/close/minimize/zoom behavior.

Current window state shape:

```ts
type WindowState = {
  open: boolean;
  minimized: boolean;
  maximized: boolean;
  closing: boolean;
  x: number;
  y: number;
};
```

Default positions:

- About Me: left side, `{ x: 80, y: 72 }`
- Notes: right offset, `{ x: 360, y: 86 }`

Clicking the About Me or Notes dock icon toggles its window:

- Closed -> open
- Open -> closing animation -> closed
- Minimized -> open again

Window dragging:

- Drag by titlebar only.
- Drag does not start if clicking traffic-light buttons.
- Maximized windows cannot be dragged.
- Position is clamped inside viewport and above dock safe area.

### `app/data/projects.ts`

Project thumbnails data:

```ts
{ src, label, left, top, rotate }
```

`left` and `top` are percentages for initial placement.

### `app/data/dock.ts`

Static data for:

- Social dock icons.
- About Me stats.
- Notes folders.
- Notes preview list.

### `app/globals.css`

Contains global styles for:

- SF font stack.
- Noise overlay.
- Project thumbnail shadow.
- Apple dock glassmorphism.
- Dock tooltips/popovers.
- macOS window glass style.
- macOS titlebar.
- Window open/close animations.

Important animation classes:

- `.mac-window-opening`
- `.mac-window-closing`
- `@keyframes mac-window-open`
- `@keyframes mac-window-close`

The open animation intentionally uses overshoot/bounce:

- starts small and slightly lower
- scales above `1`
- settles back to `1`

## Assets

The browser-visible assets must live in `/public/image`.

The original uploaded assets may also exist in `/image`, but Next serves static public files from `/public`.

Important current assets:

- Background: `/image/port_backgounrd.png`
- About Me icon: `/image/icon_apple.jpg`
- Notes icon: `/image/notes.svg`
- Social icons:
  - `/image/youtube.svg`
  - `/image/instagram.svg`
  - `/image/gmail.svg`
  - `/image/zalo.svg`
- Project thumbnails:
  - `/image/project-a.jpg`
  - `/image/project-b.jpg`
  - `/image/project-c.jpg`
  - `/image/project-d.jpg`

Note the filename typo: `port_backgounrd.png` is intentional because the user provided/used that name. Do not silently rename it unless updating references everywhere.

## Known Pitfalls To Avoid

1. Do not use PowerShell string replacement that injects literal `` `r`n `` into TSX.
   This previously broke JSX and caused white-screen behavior.

2. Do not leave multiple Next dev servers running.
   The user repeatedly saw stale pages or 404/white screens because old ports were still alive.
   Always close active listeners on `3000-3010` before starting a new server.

3. Do not use `next/image` for SVG dock icons unless testing carefully.
   Plain `<img>` is intentional for dock SVGs.

4. Do not reintroduce heavy icon libraries unless necessary.
   Current SVG assets cover the dock.

5. Do not move all page logic into a client component.
   The current architecture keeps only interactive components client-side.

6. Be cautious with Tailwind arbitrary classes in PowerShell replacements.
   Prefer rewriting whole files with clean here-strings if necessary.

7. `npm` may fail in PowerShell because `npm.ps1` execution is blocked.
   Use `npm.cmd`.

## Current Verification Status

At the time this handoff was written:

- `npm.cmd run lint` passes with no warnings.
- `npm.cmd run build` passes.
- Dev server was run successfully on `http://localhost:3000`.
- Page returned HTTP `200`.

## Suggested Future Improvements

Potential next tasks:

- Add content editing or real links for social icons.
- Add persistent positions for dragged thumbnails using `localStorage`.
- Add z-index focus ordering for windows when clicked.
- Add draggable window resize handles.
- Add a Notes data model and selectable notes.
- Add mobile-specific dock/window layout refinements.
- Add keyboard accessibility for window close/minimize/zoom.
