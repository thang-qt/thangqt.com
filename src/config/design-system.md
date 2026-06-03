# OS Design Guide

This site is a desktop shell, not a normal document site with decorative windows. The shell should stay predictable under resize, restore, reload, and mobile fallback.

## App Model

- Top-level pages are apps. Define them in `src/config/desktop.ts`.
- Detail routes can open as their own document windows when the app sets `detailWindows: true`.
- Window sizing belongs to the app registry, not page CSS.
- Page content should adapt inside the shell. Avoid page-specific window chrome.

## Link Policy

- Main nav opens or focuses the app window for that route.
- List item details for `writing`, `projects`, and `links` open separate detail windows.
- Internal links inside content open in the current app by default.
- Right-click a link when the user needs control: open in this window, open in a new window, copy URL, or external tab.
- External links should keep normal browser semantics and may open in a new tab when they leave the site context.
- Files such as RSS or PDFs should bypass the SPA window loader.

## Interaction Rules

- New or focused windows must come to the front.
- Window state persists across reload: open windows, position, size, z-order, minimized/maximized, and view mode.
- Resize handles are invisible edge hit areas. Do not add decorative resize marks.
- Unresizable utility windows, like Profile, must explicitly set `resizable={false}`.
- Utility windows that should never fill the workspace must also set `maximizable={false}`.
- Window drag, resize, spawn, restore, and maximize must keep the title bar below the floating top bar.
- Maximize must leave room for the floating top bar.
- On mobile/narrow screens, windows stack as responsive panels and should not require dragging.

## Visual Rules

- Color must use design tokens from `main.css`.
- Theme packs control color only. Background pattern is a separate preference.
- Window chrome is shared. Individual apps can style their content, not the shell.
- Type should feel retro-adjacent without pixel fonts.
- Avoid gradients, hero cards, nested cards, and page-specific chrome.

## Components

- Buttons use `.ds-button`.
- Small command/status labels use `.ds-chip`.
- Panels use `.ds-panel`.
- Tables use `.ds-table`.
- Form rows use `.ds-field`.

These classes are intentionally token-based so light/dark mode and theme packs continue to work.
