# 0002 - Astro 7 static + Tailwind v4 via @tailwindcss/vite

## Status
accepted

## Context
V1 assumed a v3-era `@astrojs/tailwind` integration. Tailwind v4's
recommended Astro setup is the `@tailwindcss/vite` plugin; `@astrojs/tailwind`
is deprecated, and even `astro add tailwind` now installs the vite plugin
under the hood (research correction C-02).

## Decision
Every site is Astro 7.x, `output: 'static'` (no adapter needed for
static-on-Vercel), with Tailwind CSS 4.x wired via `@tailwindcss/vite`
(`vite: { plugins: [tailwindcss()] }`, `@import "tailwindcss";` in
`global.css`). `@astrojs/tailwind` must never be added.

## Consequences
- Template and every generated site share one styling pipeline; no
  per-site Tailwind config drift.
- Design tokens live as CSS custom properties re-exposed via
  `@theme inline` (see `docs/design-spec.md`), not a `tailwind.config.js`
  theme block.
- Any future Tailwind major requires a green template build plus this ADR
  amended, not silent adoption (§5 version-drift rule).
