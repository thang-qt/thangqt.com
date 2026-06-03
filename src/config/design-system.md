# OS Design Guide — v2

This site is a desktop shell, not a normal document site with decorative windows. The shell stays predictable under resize, restore, reload, and mobile fallback.

## App Model

- Top-level pages are apps. Define them in `src/config/desktop.ts`.
- Detail routes can open as their own document windows when the app sets `detailWindows: true`.
- Window sizing belongs to the app registry, not page CSS.
- Page content adapts inside the shell. Avoid page-specific window chrome.

## Link Policy

- Main nav opens or focuses the app window for that route.
- List item details for `writing`, `projects`, and `links` open separate detail windows.
- Internal links inside content open in the current app by default.
- Right-click a link when the user needs control: open in this window, open in a new window, copy URL, or external tab.
- External links keep normal browser semantics and may open in a new tab.
- Files such as RSS or PDFs bypass the SPA window loader.

## Interaction Rules

- New or focused windows come to the front (z-index bump).
- Window state persists across reload: open windows, position, size, z-order, minimized/maximized.
- Resize handles are invisible edge hit areas (8px zones). No decorative resize marks.
- Unresizable utility windows (Profile) explicitly set `resizable={false}`.
- Utility windows that should never fill the workspace also set `maximizable={false}`.
- Window drag, resize, spawn, restore, and maximize must keep the title bar below the floating top bar (`desktopWorkAreaTop = 64px`).
- **Viewport resize nudge**: on `window.resize`, every floating window is nudged so its edges stay inside the work area. Width/height clamp if the stage shrinks smaller than the window.
- On mobile (`< 768px`), windows collapse to title-bar strips. Tapping a collapsed strip expands it; the previous active window collapses.
- On tablet (`768–1100px`), windows stack as panels with `max-width: 48rem`. No drag or resize.

## Visual Rules

- Color uses design tokens from `main.css` (prefix `--wm-`).
- Theme packs control color only. Background pattern is a separate preference.
- Window chrome is shared. Individual apps style their content, not the shell.
- Type is retro-adjacent without pixel fonts: Fraunces (display), IBM Plex Sans (body), IBM Plex Mono (chrome/labels).
- Avoid gradients, hero cards, nested cards, and page-specific chrome.
- Windows appear with a 120ms `scale(0.97) → 1` + `opacity 0 → 1` animation.
- All transitions are disabled under `prefers-reduced-motion`.

## Background Patterns

Patterns live on `.desktop-bg` keyed by `data-bg-pattern`. All use design tokens (`--wm-background`, `--wm-art-a/b/c`, `--wm-border`) so they adapt to any theme pack.

| ID | Name | Concept |
|---|---|---|
| `grid` | Desk Grid | Quiet graph paper |
| `noise` | Static Wash | Fine retro scan lines |
| `weave` | Paper Weave | Diagonal linen crosshatch |
| `dots` | Dot Field | Halftone dot grid |
| `circuit` | Circuit Lines | PCB trace lines |
| `topography` | Contour | Topographic elevation curves |

## Components

### Existing primitives
- `.ds-button` / `.ds-button--accent` — buttons
- `.ds-chip` / `.ds-chip--accent` — passive labels
- `.ds-panel` — bordered content card
- `.ds-table` — data grid
- `.ds-field` — label + input row
- `.ds-grid` / `.ds-grid--three` — auto column grid

### New primitives (v2)
- `.ds-divider` — horizontal rule with optional centered label
- `.ds-badge` / `.ds-badge--accent` — numeric/status indicator pill
- `.ds-kbd` — keyboard shortcut label with bottom-border depth
- `.ds-tabs` / `.ds-tab` — horizontal tab strip
- `.ds-empty` — empty-state placeholder block
- `.ds-skeleton` — loading placeholder shimmer animation
- `.ds-toggle` — switch-style checkbox
- `[data-tooltip]` — CSS tooltip on hover
- `.ds-status--online/away/offline` — dot + label status
- `.ds-progress` / `.ds-progress__bar` — thin progress bar

### App-shared classes
- `.app-header` — kicker + title + description block
- `.app-kicker` — mono uppercase section label
- `.app-title` — display-font page/section title
- `.app-desc` — muted body description
- `.writing-app-header` — two-col app header with toolbar on right
- `.list-toolbar-label` — muted label before toolbar buttons

These classes are intentionally token-based so light/dark mode and theme packs work without overrides.
