---
name: p06-seo-onpage
description: >-
  Produce on-page SEO — per-page meta/canonical/OG tags, the 600-word home copy, FAQ
  visible content, and the long-tail MPA landing pages from the keyword map. Use at
  Phase P5 SEO (state QA_PASSED → SEO_DONE). Trigger on "do the SEO", "write the
  landing pages", "add the home copy", or when a QA-passed site has placeholder copy.
  Delegates JSON-LD to p07-schema-markup.
model: sonnet
effort: high
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
---

# P-06 seo-onpage

Operational instructions for on-page SEO and content (design doc §8 P5, §2.3, §13). Copy must be factual and cite only the tool's real behavior — no keyword stuffing, no thin pages. FAQ is **visible content only**; do not add FAQPage schema (D-10, §13.4).

## Purpose
Satisfy every Gate G6 per-page assertion: unique titles/descriptions with the keyword, absolute canonicals, OG/Twitter tags, ≥600-word home copy, FAQ visible content, landing pages from the keyword map, and clean URLs.

## Inputs
- `research/keywords.md` and the `spec.md` §6 keyword map — main + supporting keywords, landing-page list, harvested questions.
- The `spec.md` §2 page inventory.
- `site.config.mjs` — identity used by `<Seo>` props; never hardcode identity.

## Outputs
- `<Seo>` props set per page (title, description, canonical, OG/Twitter) via the `@toolfactory/seo` component.
- Home page: tool above the fold + ≥600 words of genuinely useful explanatory copy (how it works, accuracy notes, use cases).
- FAQ section rendered as **visible on-page content** from harvested questions — no `FAQPage` JSON-LD.
- 3–8 long-tail MPA landing pages under `src/pages/` (e.g. `/27-inch-monitor-dimensions/`, `/how-many-words-is-a-5-minute-speech/`), each with unique intent-matched copy.
- Image `alt` text on all meaningful images; clean, hyphenated URLs.

## Acceptance criteria (Gate G6)
- Each page: unique `<title>` ≤60 chars containing the keyword; meta description ≤160 chars containing the keyword; absolute canonical (`new URL(Astro.url.pathname, Astro.site)`); OG + Twitter (`summary_large_image`) tags present.
- Home copy ≥600 words and factual (describes real tool behavior only; US-English).
- Sitemap contains all pages; `robots.txt` references the sitemap (no `@astrojs/sitemap` "Skipping" warning in the build log — `site:` must be set).
- 404 and 500 custom pages render.
- Keyword density ≤3% (no stuffing); no landing page under 300 words.
- JSON-LD is handled by **p07-schema-markup** (invoke it) and must contain no rating/review fields.

## Failure cases (enumerated → action)
- Keyword stuffing detected (density >3%) → rewrite the copy to read naturally.
- A landing page comes out thin (<300 words) → merge it into a stronger page or drop it from the keyword map; never pad with filler.
- Two pages collide on title/keyword → differentiate intent and titles; canonicals must remain unique and absolute.
- Tempted to add FAQPage/aggregateRating markup for a "rich result" → refuse (D-10, §13.4); FAQ stays visible content only.

## Escalation (§6.5)
- Thin/duplicative copy persists after rewrite (same failure 3×) → escalate one tier: **Opus rewrites the worst pages**.
- Anything touching third-party publishing (Reddit/Quora drafts are fine; posting is not) → **[HUMAN]** (§13.5).
- Gate G6 ambiguity → fix the gate definition in §8 before proceeding.
