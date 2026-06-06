# thangqt.com

My personal website, rebuilt as a small desktop-like environment with Astro.

It is home to my writing, projects, saved links, and a few things that are better discovered than documented.

Visit it at [thangqt.com](https://thangqt.com).

## Development

This project uses [pnpm](https://pnpm.io/).

```sh
pnpm install
pnpm dev
```

The development server runs at `http://localhost:4321`.

Useful commands:

```sh
pnpm build          # Create a production build
pnpm preview        # Preview the production build
pnpm check          # Run Astro and TypeScript diagnostics
pnpm lint           # Run oxlint
pnpm format:check   # Check formatting
pnpm knip           # Check files, dependencies, and imports
pnpm validate       # Run the main release checks
```

A Nix development shell is also available:

```sh
nix develop
```

## Project structure

```txt
src/content/           Writing, projects, and saved links
src/pages/             Astro routes
src/layouts/           Global page and desktop shell
src/scripts/desktop/   Desktop UI, window manager, apps, and interactions
src/styles/            Shared, desktop, and page styles
src/config/desktop.ts  Desktop app registry and UI configuration
```

The current desktop-style site is on `main`. The [previous version](https://github.com/thang-qt/thangqt.com/tree/old) is preserved on the `old` branch.

## License

Except for the exclusions below, the source code in this repository is licensed under the [GNU Affero General Public License v3.0](./LICENSE).

The following materials are **not** licensed under the AGPL and remain © Quang Thang. All rights reserved:

- Written content and metadata under `src/content/`
- Personal photographs and media
- Resume and biographical content
- Personal branding and original visual identity

Third-party assets remain subject to their respective rights and terms. In particular, `public/nyancat.svg` is adapted from [Gowee/nyancat-svg](https://github.com/Gowee/nyancat-svg), with animation frames credited upstream to [iliana/html5nyancat](https://github.com/iliana/html5nyancat). It is not covered by this repository's AGPL license.

If you publish something substantially based on this project, attribution with a link back to this repository is appreciated.
