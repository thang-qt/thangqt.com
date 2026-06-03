# Desktop App Registry

Top-level desktop apps are defined in `src/config/desktop.ts` via `desktopApps`.

To add a new app:

1. Add an entry to `desktopApps`.
2. Create the matching Astro page, for example `src/pages/notes.astro`.
3. Set `nav: true` if it should appear in the floating bar.
4. Set `detailWindows: true` if routes such as `/notes/example` should open as their own windows.
5. Tune the `window` object for default size and resize constraints.

Example:

```ts
{
  id: 'notes',
  label: 'Notes',
  href: '/notes',
  icon: '◇',
  nav: true,
  detailWindows: true,
  window: {
    minWidth: 340,
    minHeight: 240,
    width: 'min(52rem, calc(100vw - 5rem))',
    height: 'min(42rem, calc(100dvh - 8rem))',
  },
}
```

The server layout and browser window manager both consume this registry, so app identity, nav, route matching, and default window behavior stay in one place.
