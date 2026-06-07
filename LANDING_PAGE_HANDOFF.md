# Portfolio Landing Page Handoff

## Project Overview

This project is a single-screen personal portfolio landing page inspired by the macOS desktop aesthetic. It is built with Next.js 14 App Router and Tailwind CSS.

The current experience includes:

- Full viewport, non-scrollable desktop-style landing page.
- Background image from `/public/image/port_backgounrd.png`.
- Scattered draggable project thumbnails, styled like loose macOS desktop items.
- A glassmorphism macOS-style dock centered at the bottom.
- Dock icons for About Me, Notes, plus 3 display-only social labels (YouTube · Coming Soon, Gmail address, Zalo phone).
- macOS-like tooltips/popovers above dock icons.
- 9 in-page windows: About Me, Notes, AI Workflows, Lighting, Video Creator, Visual Design, Multimedia, Retention Visual Skills, Build a Channel.
- Windows can be dragged by the titlebar.
- Windows have macOS traffic-light buttons: close, minimize, zoom/restore.
- Clicking a dock icon or a desktop thumbnail with `appId` toggles the matching window open/closed.
- Window opening uses a spring/bounce-style scale/fade animation (transform/opacity only — no filter blur).
- Window focus order is tracked: clicking any window brings it to the front via `focusOrder` z-index.
- YouTube videos for sub-projects play inline as embedded iframes.

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
    port_backgounrd.png         # canonical background (typo intentional)
    icon_apple.jpg              # About icon + favicon
    notes.svg
    youtube.svg
    gmail.svg
    zalo.svg
    profile_image.jpg
    hero.jpg
    ai-generate.jpg
    ai-timeline.jpg
    cover-lighting.jpg
    cover-vespa-custom.jpg
    cover-vespa-wheel.jpg
    cover-multimedia.jpg
    cover-video.png
    cover-motion-war.jpg
    cover-design.jpg
    cover-design-catalogue.jpg
    cover-design-poster.jpg
    cover-build-channel.jpg
    retention-before.jpg
    retention-after.jpg
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
- Drag is scoped: `pointermove`/`pointerup` listeners are attached only inside `startDrag` and torn down on `pointerup`.
- Position updates are throttled with `requestAnimationFrame` so a single setState lands per frame.
- Position is clamped inside the viewport.
- Bottom safe area prevents thumbnails from being dragged into the dock area.
- Thumbnail rises above others while being dragged.
- Click vs drag is separated by a 5px movement threshold (`dragRef.moved`).
- A thumbnail with `appId` opens the matching window via `window.__openMacApp(id)` (fallback: `macdock:open` CustomEvent).

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
  focusOrder: number;
};
```

Default positions (used until first user drag):

- About Me: `{ x: 80, y: 72 }`
- Notes: `{ x: 360, y: 86 }`
- AI Workflows: `{ x: 140, y: 60 }`
- Lighting: `{ x: 180, y: 80 }`
- Video Creator: `{ x: 200, y: 70 }`
- Visual Design: `{ x: 220, y: 90 }`
- Multimedia: `{ x: 240, y: 100 }`
- Retention Visual Skills: `{ x: 160, y: 90 }`
- Build a Channel: `{ x: 200, y: 110 }`

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
{ src, label, left, top, rotate, appId? }
```

`left` and `top` are percentages for initial placement. `appId` (optional) routes a click to a specific window via `window.__openMacApp(id)`.

### `app/data/dock.ts`

Static data for:

- 3 social dock icons (display-only labels, no click handlers): `YouTube · Coming Soon`, `hoangcd.contact@gmail.com`, `Zalo · 0332038903`.
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

The original uploaded assets may also exist in `/image` or under `Joseph_s Portfolio/` (gitignored), but Next serves static public files from `/public`.

Important current assets:

- Background: `/image/port_backgounrd.png` (typo intentional; canonical name)
- About Me icon + favicon: `/image/icon_apple.jpg`
- Profile photo: `/image/profile_image.jpg`
- Notes icon: `/image/notes.svg`
- Social icons: `/image/youtube.svg`, `/image/gmail.svg`, `/image/zalo.svg`
- AI Workflows: `/image/ai-generate.jpg`, `/image/ai-timeline.jpg`
- Lighting: `/image/cover-lighting.jpg`, `/image/cover-vespa-custom.jpg`, `/image/cover-vespa-wheel.jpg`, `/image/cover-multimedia.jpg`
- Video Creator: `/image/cover-video.png`, `/image/cover-motion-war.jpg`
- Visual Design: `/image/cover-design.jpg`, `/image/cover-design-catalogue.jpg`, `/image/cover-design-poster.jpg`
- Retention Visual Skills: `/image/retention-before.jpg`, `/image/retention-after.jpg`
- Build a Channel: `/image/cover-build-channel.jpg`

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

8. Do not add `mailto:` / `tel:` / `href` to social dock icons.
   They are display-only — only the tooltip surfaces info.

9. Do not reintroduce `dragRef.current.active` or other transient drag fields.
   `dragRef` was reduced to `{ moved }`. All other drag state lives inside the `startDrag` closure. A stale `active` reference broke the Vercel typecheck once.

10. If the dev server starts returning HTTP 500 on `/_next/static/...` after a refactor:
    `taskkill /F /IM node.exe`, `rm -rf .next`, then restart `npm.cmd run dev`.

## Current Verification Status

At the time this handoff was written:

- `npm.cmd run lint` passes with no warnings.
- `npm.cmd run build` passes.
- Dev server was run successfully on `http://localhost:3000`.
- Page returned HTTP `200`.

## Suggested Future Improvements

Potential next tasks:

- Wire YouTube channel link into the YouTube dock icon when the channel goes live (currently labelled `Coming Soon`).
- Add persistent positions for dragged thumbnails using `localStorage`.
- Add draggable window resize handles.
- Add a Notes data model and selectable notes.
- Add mobile-specific dock/window layout refinements.
- Add keyboard accessibility for window close/minimize/zoom.
- Build out content for the Build a Channel and Multimedia Courses windows when source material is ready.
