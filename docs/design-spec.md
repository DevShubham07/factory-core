# Design Spec (binding — §4.3, §7.1)

One page. `packages/ui` and every site consume these tokens/rules as-is. The
implementer must not invent visual design ad hoc — deviations require an ADR
(§12.2).

Source of truth for the token *values* below is the already-written
`site-template/src/styles/global.css`; this document is the human-readable
mirror of it plus the rules that aren't expressible as CSS.

## 1. Color tokens

Defined as CSS custom properties on `:root` (light) and overridden on `.dark`
(dark), then re-exposed to Tailwind via `@theme inline` so they're usable as
`bg-(--color-bg)`, `text-(--color-fg-muted)`, etc.

| Token | Light | Dark | Usage |
|---|---|---|---|
| `--color-bg` | `#ffffff` | `#0a0a0a` | page background |
| `--color-bg-subtle` | `#fafafa` | `#171717` | subtle panel/hover backgrounds |
| `--color-fg` | `#171717` | `#ededed` | primary text |
| `--color-fg-muted` | `#525252` | `#a3a3a3` | secondary text (nav links, captions, FAQ answers) |
| `--color-border` | `#e5e5e5` | `#262626` | hairline borders (header, footer, dividers) |
| `--color-accent` | `#0070f3` | `#3291ff` | links, focus rings, primary actions |
| `--color-accent-fg` | `#ffffff` | `#0a0a0a` | text/icon color placed on `--color-accent` (also used for `::selection`) |

A Vercel-like neutral palette by design decision (recorded in
`global.css` comment). Do not add new color tokens without an ADR — pages
compose from this set only.

### WCAG AA contrast floors
These pairs must hold ≥ 4.5:1 for normal text / ≥ 3:1 for large text
(≥24px or ≥19px bold), both themes:
- `--color-fg` on `--color-bg` and on `--color-bg-subtle`
- `--color-fg-muted` on `--color-bg` and on `--color-bg-subtle`
- `--color-accent-fg` on `--color-accent`
- `--color-accent` on `--color-bg` (link-only text use)

Any new component that places text on `--color-accent`,
`--color-bg-subtle`, or introduces a new surface must re-check these ratios
(a contrast checker, not eyeballing) before merge. This is enforced
informally at the a11y pass (P-08) and formally via axe-core in CI (0
critical/serious, Gate G5).

## 2. Type scale (Tailwind `text-*` usage — no custom font-size tokens)

Use Tailwind's built-in scale directly; do not define a parallel scale.

| Role | Class | Example |
|---|---|---|
| Page/section H1 | `text-3xl font-bold tracking-tight` (site name/hero) | home hero heading |
| Section H2 | `text-2xl font-semibold tracking-tight` | `FaqSection` heading (`Frequently Asked Questions`) |
| Subsection H3 | `text-xl font-semibold` | in-page subheads |
| Body | default (`text-base`) | explanatory copy, ≥600-word home content |
| Small/nav/meta | `text-sm` | `Header` nav, `Footer` legal nav, FAQ meta |
| Brand/wordmark | `text-lg font-semibold tracking-tight` | `Header` site name link |

Font family: `ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto,
"Helvetica Neue", Arial, sans-serif` (system stack — no webfont download, no
CLS/webfont-loading cost). `-webkit-font-smoothing: antialiased` set on
`html`.

## 3. Spacing rules

- Page container: `mx-auto max-w-5xl px-4` (used identically in `Header`,
  `Footer`, and `Base`'s `<main>`).
- Vertical page rhythm: `<main>` gets `py-8`; `Footer` gets `mt-16`;
  `FaqSection` gets `mt-12`.
- Component-internal spacing uses Tailwind's default spacing scale
  (multiples of 0.25rem via `p-*`/`gap-*`/`mt-*` utilities) — no custom
  spacing tokens are defined. Prefer `gap-*` on flex/grid over margin
  chains.
- Interactive hit targets (nav links, `ThemeToggle` button) keep at least
  `p-1.5`/inline padding so touch targets stay ≥ 24px (WCAG 2.2 AA target
  size), consistent with `ThemeToggle`'s `p-1.5` button.

## 4. Dark mode behavior

- **Mechanism**: class-based. Tailwind v4's `@custom-variant dark
  (&:where(.dark, .dark *));` in `global.css` makes every `dark:` utility
  apply only when a `.dark` class is present on `<html>` (not the OS-level
  `prefers-color-scheme` media variant Tailwind ships by default).
- **Toggle**: `ThemeToggle.astro` — a single button that calls
  `document.documentElement.classList.toggle("dark")` and writes
  `localStorage.setItem("theme", isDark ? "dark" : "light")`. Rebinds on
  `astro:page-load` (Astro view-transitions safety) as well as on initial
  script run.
- **Persistence**: `localStorage["theme"]` is the source of truth once the
  user has toggled; absent a stored value, OS preference
  (`prefers-color-scheme: dark`) decides.
- **FOUC bootstrap**: an inline, render-blocking `<script is:inline>` in
  `Base.astro`'s `<head>` — *before* `<Seo>` and any other head content —
  reads `localStorage.getItem("theme")`, falls back to
  `matchMedia("(prefers-color-scheme: dark)")`, and adds `.dark` to
  `document.documentElement` synchronously so the correct theme paints on
  first frame (no flash of incorrect theme). This script must stay inline
  (not an external file) to run before first paint.
- Icons: `ThemeToggle` ships both sun and moon SVGs in the DOM at all
  times, toggled via `hidden dark:block` / `dark:hidden` classes — no JS
  re-render needed to swap icon on toggle.

## 5. Component inventory & prop contracts

All components live in `site-template/src/components/` (or, once
`@toolfactory/ui`/`@toolfactory/seo` are published per D-04, are re-exported
from those packages — see §4.3/§4.4 of the design doc). Prop contracts below
are read directly from the current template source (2026-07-14).

### `Seo.astro`
Emits `<title>`, meta description, absolute canonical link, `noindex` meta
(conditional), OG tags, Twitter card tags. Canonical is always built from
`Astro.site` + `Astro.url.pathname` (never hand-typed), so the custom domain
always wins over `*.vercel.app` — this is the duplicate-content fix (design
doc §14.2 dup-content note, Appendix B).

```ts
export interface Props {
  title: string;
  description: string;
  image?: string;      // default: "/og-default.png"
  noindex?: boolean;   // default: false
}
```
Throws at build time if `Astro.site` is unset in `astro.config.mjs`.

### `JsonLd.astro`
Emits compliant structured data per design doc §13.4 — `WebApplication`
(`offers.price: "0"`, **no** `rating`/`review` fields), optional
`Organization` (home page only), optional `BreadcrumbList` (subpages).
Reads site identity from `site.config.mjs` (`SITE`, `SITE_URL`).

```ts
export interface Props {
  organization?: boolean;                          // default: false
  breadcrumbs?: { name: string; path?: string }[];  // last item may omit path
}
```

### `FaqSection.astro`
Renders FAQ as **visible content only** (design doc D-10 — no `FAQPage`
JSON-LD; Google removed FAQ rich results for all sites in May 2026). Native
`<details>/<summary>` disclosure widgets, no client JS required.

```ts
export interface Props {
  items: { question: string; answer: string }[];
}
```

### `Header.astro`
No props — reads `SITE` from `site.config.mjs`. Renders the site name as a
link to `/`, a `Main` nav (`About`, `Contact`), and `<ThemeToggle />`. Sticky
container is `max-w-5xl` matching the page container convention (§3).

### `Footer.astro`
No props — reads `SITE` from `site.config.mjs`, computes current year at
render time. Renders copyright line + a `Legal` nav with the four required
legal links (`Privacy Policy`, `Terms & Conditions`, `About Us`,
`Contact Us`) — the AdSense-reviewer-visible link set required by design doc
§2.3/§9.

### `ThemeToggle.astro`
No props. Self-contained button + inline `<script>` (see §4 above for
behavior). Depends on nothing but `localStorage` and `matchMedia`.

### `Base.astro` (layout, `src/layouts/Base.astro`)
The layout every page renders through. Imports `global.css`, mounts the
FOUC-prevention script, `<Seo>`, `<Header>`, `<Footer>`, and (Vercel-only)
`@vercel/analytics/astro` + `@vercel/speed-insights/astro`.

```ts
export interface Props {
  title: string;
  description: string;
  image?: string;
  noindex?: boolean;
}
```
Named slot `head` for per-page `<head>` additions (e.g. extra `<JsonLd>`
tags); default slot for page body content, rendered inside
`<main class="mx-auto w-full max-w-5xl flex-1 px-4 py-8">`.

Analytics/Speed Insights are gated on `process.env.VERCEL` at build time —
they must **not** render outside Vercel hosting, because their `/_vercel/*`
scripts 404 off-platform and would fail the Playwright smoke suite's
zero-console-error assertion (Gate G5).

## 6. Non-negotiables (restated from design doc §7.1/§13.4)

- No new color tokens, spacing scale, or type scale outside this document
  without an ADR.
- No `FAQPage`, `AggregateRating`, or `Review` JSON-LD, ever (D-10, §13.4).
- Every page renders through `Base.astro` — no bespoke `<html>` scaffolding
  per page.
- Dark mode must never flash the wrong theme (FOUC script is mandatory,
  inline, and must run before `<Seo>`).
