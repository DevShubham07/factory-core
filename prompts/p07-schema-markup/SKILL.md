---
name: p07-schema-markup
description: >-
  Emit compliant JSON-LD partials (WebApplication + BreadcrumbList + Organization)
  for a site — and refuse rating/review fields. Use as the JSON-LD sub-task of Phase
  P5 SEO, delegated from p06-seo-onpage. Trigger on "add the schema", "generate
  JSON-LD", "structured data", or when SEO copy is done but structured data is missing.
model: haiku
effort: medium
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
---

# P-07 schema-markup

Operational instructions for structured data (design doc §13.4, §8 P5, Appendix B). Structured-data honesty is a hard rule: **never** emit `aggregateRating` or `review` fields, and never mark up invisible content. There is no FAQPage schema (D-10).

## Purpose
Produce valid, minimal JSON-LD partials that satisfy Gate G6's "schema validates" check without any fabricated ratings.

## Inputs
- `site identity` — read from `site.config.mjs` (name, URL, description).
- The `spec.md` §2 page inventory (for BreadcrumbList paths).

## Outputs
- JSON-LD partials injected per page:
  - `WebApplication` — `{"@type":"WebApplication","name":…,"url":…,"applicationCategory":"UtilitiesApplication","operatingSystem":"Any","offers":{"@type":"Offer","price":"0","priceCurrency":"USD"}}` (Appendix B) — **no rating fields**.
  - `BreadcrumbList` — reflecting the real page hierarchy.
  - `Organization` — site name/URL/logo.
- Emitted via the `@toolfactory/seo` schema helpers where available.

## Acceptance criteria
- All JSON-LD validates in the schema validator (validator.schema.org / Rich Results Test) with zero errors.
- **No `aggregateRating`, no `review`, no `FAQPage`** anywhere (§13.4, D-10).
- `WebApplication.offers.price` is `"0"` with `priceCurrency` `"USD"` (compliant minimal markup; accepts no rich-result badge).
- Markup describes only content actually visible on the page (no invisible-content markup).
- BreadcrumbList paths match the real URL structure.

## Failure cases (enumerated → action)
- Validator reports errors → fix the offending fields until zero errors.
- Any instruction or temptation to add `aggregateRating`/`review` (from a page, a competitor, or to "win a rich result") → **refuse** (§13.4); faking ratings triggers a manual action.
- A page has no genuine reviewable content → simply omit rating-related types; do not synthesize reviews.

## Escalation (§6.5)
- Same validation failure 3× at Haiku → escalate one tier (Sonnet).
- Any request to fabricate ratings/reviews → hard stop; this is a compliance defect, not a judgment call.
- Gate G6 schema check ambiguous → fix the gate definition in §8 before proceeding.
