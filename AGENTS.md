# AGENTS.md

Guidance for AI/code agents working on this repository.

## Project summary

This is ThangQT's personal website built with Astro. It is not a typical blog theme: the site presents itself as a small desktop-OS-like environment, with draggable/resizable windows, an app launcher, keyboard shortcuts, fake terminal, chat app, settings, bookmarks, writing, projects, and profile widgets.

Core concepts:

- **Astro static site** for content and routes.
- **Content collections** for writing, projects, and links.
- **Desktop OS UI layer** in vanilla browser JS under `src/scripts/desktop/`.
- **Windowed navigation**: internal links are intercepted and opened inside desktop windows instead of full page reloads.
- **Personal archive**: writing, project pages, links/bookmarks, resume/about pages.
- **Playful apps**: terminal and LLM chat use the same desktop window system.

## Commands

Use `pnpm`.

```sh
pnpm dev       # local dev server
pnpm build     # production build / validation
pnpm preview   # preview built site
```

Before finishing non-trivial code changes, run:

```sh
pnpm build
```

A successful build is the main validation gate. Existing Astro content warnings may appear if unrelated to your changes; do not hide warnings unless you fix the root cause.

## Important architecture paths

### Astro pages and layouts

```txt
src/pages/
src/layouts/Layout.astro
src/components/
```

- `src/layouts/Layout.astro` owns the global page shell and desktop UI markup.
- Route pages are mostly content/archive/detail pages.
- Keep Astro pages focused on page composition; move reusable fetching/sorting/formatting into utilities.

### Content collections

```txt
src/content/config.ts
src/content/writing/
src/content/projects/
src/content/links/
```

Shared content helpers live in:

```txt
src/utils/collections.ts
src/utils/links.ts
src/utils/pagination.ts
src/utils/contentImages.ts
src/utils/llmContext.ts
```

Use these helpers instead of duplicating `getCollection`, draft filtering, sorting, pagination, date formatting, or SEO-image fallback logic.

Key patterns:

- `getPublishedWriting()` returns writing sorted newest-first.
- `getPublishedProjects()` returns projects sorted newest-first by project year/date key.
- `getPublishedLinks()` returns sorted links plus slug map.
- Page-size constants live in `src/utils/pagination.ts`.
- Keep first-page and `/page/[page]` page sizes consistent.

### Desktop browser JS

Main entrypoint:

```txt
src/scripts/desktop/index.js
```

Shared desktop utilities:

```txt
src/scripts/desktop/dom.js
src/scripts/desktop/events.js
src/scripts/desktop/storage.js
src/scripts/desktop/viewport.js
src/scripts/desktop/pageLoader.js
```

Use `events.js` helpers for global listeners:

- `runOnce(key, setup)`
- `addGlobalListenerOnce(key, target, type, listener, options)`
- `isTypingTarget(target)`

This code runs across Astro page-load/content-change events, so avoid registering duplicate global listeners.

### Desktop routing/window architecture

Public facade:

```txt
src/scripts/desktop/router.js
src/scripts/desktop/windowManager.js
```

Internals:

```txt
src/scripts/desktop/routing/
  history.js
  open.js
  restore.js

src/scripts/desktop/window/
  controls.js
  content.js
  create.js
  drag.js
  placement.js
  resize.js
  spec.js
  viewportNudge.js
  workArea.js
  zIndex.js
```

Routing responsibilities:

- `routing/history.js`: browser history, document title, active nav state.
- `routing/open.js`: open internal routes into windows.
- `routing/restore.js`: restore saved desktop windows.
- `pageLoader.js`: fetch and parse Astro pages for `.desktop-document` content.

Window responsibilities:

- `windowManager.js`: coordinator that initializes windows.
- `window/create.js`: creates/reuses desktop windows.
- `window/content.js`: updates window content and loading state.
- `window/spec.js`: applies app/window metadata and bleed flags.
- `window/placement.js`: default cascade placement.
- `window/drag.js`, `window/resize.js`, `window/controls.js`: interaction behavior.
- `window/zIndex.js`: focus/z-index behavior.
- `window/workArea.js`, `window/viewportNudge.js`: viewport/work-area constraints.

Prefer importing from the public facades (`router.js`, `windowManager.js`) unless you are working inside the desktop window/routing internals.

### Desktop apps/features

```txt
src/scripts/desktop/chat.js
src/scripts/desktop/chat/
  messages.js

src/scripts/desktop/llm/
  client.js
  context.js
  settings.js

src/scripts/desktop/terminal.js
src/scripts/desktop/terminal/
  commands.js
  connect.js
  dom.js
  dot.js
  fileSystem.js
  state.js
```

- `chat.js` is the chat app initializer.
- `chat/messages.js` handles message rendering/conversation extraction.
- `llm/*` is shared LLM provider/settings/context code used by chat and terminal.
- `terminal.js` is the terminal app initializer.
- Terminal internals stay under `terminal/`; do not flatten terminal files into the desktop root.

### Config

```txt
src/config/desktop.ts
src/config/desktop-apps.md
```

Desktop app registry, pinned menu items, profile data, theme/background options, and app window specs live here.

### Styles

Entrypoint:

```txt
src/styles/main.css
```

Split CSS files:

```txt
src/styles/base.css
src/styles/desktop/windowing.css
src/styles/desktop/chat.css
src/styles/desktop/terminal.css
src/styles/pages/list-legacy.css
src/styles/pages/archives.css
src/styles/pages/settings-home.css
```

Keep CSS organized by feature/page group. If a style file grows too large or mixes many unrelated concerns, split it.

## Coding rules and preferences

### Be modular

If a file grows too large or starts owning many responsibilities, refactor it. Prefer small modules with clear boundaries.

Good examples in this repo:

- `router.js` is a facade; routing logic lives in `routing/`.
- `windowManager.js` is a coordinator; behavior lives in `window/`.
- `terminal.js` initializes the app; terminal behavior lives in `terminal/`.
- Shared LLM logic lives in `llm/`.

Do not create giant catch-all files.

### Reuse existing helpers

Before adding new logic, check existing utilities:

- Content fetching/sorting: `src/utils/collections.ts`, `src/utils/links.ts`
- Pagination/date formatting: `src/utils/pagination.ts`
- Desktop DOM/helpers: `src/scripts/desktop/dom.js`
- Safe storage: `src/scripts/desktop/storage.js`
- Global event listener once: `src/scripts/desktop/events.js`
- Viewport checks: `src/scripts/desktop/viewport.js`

Avoid reintroducing duplicate collection fetch predicates, page-size constants, date formatters, viewport media queries, or `window.__someReady` flags.

### Global listeners must be registered once

This site uses Astro page events and dynamic window content. Many init functions may run repeatedly.

For document/window listeners, use:

```js
addGlobalListenerOnce('descriptive-key', document, 'click', handler);
```

For per-root/per-window listeners, guard with a dataset flag such as:

```js
if (root.dataset.featureReady === 'true') return;
root.dataset.featureReady = 'true';
```

### Use safe storage wrappers

Use `src/scripts/desktop/storage.js` instead of direct `localStorage` for app code:

- `safeRead`
- `safeWrite`
- `safeReadJson`
- `safeWriteJson`

This keeps private-mode/storage errors from breaking the desktop UI.

### Preserve desktop-window navigation behavior

Internal links should generally be opened through the window router, not full page reloads. Use existing link/router helpers:

- `getInternalHref`, `openLink` in `src/scripts/desktop/links.js`
- `openInternalHref`, `openHrefInWindow` from `src/scripts/desktop/router.js`

Be careful when changing `.desktop-document`, `data-window-title`, or route/page title behavior because routing depends on these.

### Keep generated/build output out of source changes

Do not edit generated output in:

```txt
dist/
.astro/
node_modules/
```

Do not commit generated build artifacts unless explicitly asked.

### Content changes

For writing/projects, prefer Markdown/MDX content under `src/content/`. Use frontmatter schemas in `src/content/config.ts`. Images colocated with content can be resolved by existing content image helpers.

### Validation expectations

After refactors or behavior changes:

1. Run `pnpm build`.
2. Check for import/path mistakes caused by file moves.
3. For desktop JS changes, think through repeated initialization after:
   - `DOMContentLoaded`
   - `astro:page-load`
   - `desktop:content-change`
4. Ensure global listeners are not duplicated.

## Current high-level mental model

The page is statically rendered by Astro, then the desktop JS layer turns it into a windowed OS-like interface. The initial Astro route provides normal HTML for SEO and no-JS/basic behavior. Once JS runs, internal navigation is intercepted, fetched, parsed for `.desktop-document`, and injected into desktop windows. Window state, preferences, and LLM settings are stored locally. Content collections drive writing/projects/links archives and feed both pages and chat context.
