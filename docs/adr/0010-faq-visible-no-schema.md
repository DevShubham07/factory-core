# 0010 - FAQ as visible content, no FAQPage JSON-LD

## Status
accepted

## Context
V1/the source video assumed FAQPage JSON-LD triggers rich SERP results.
Google removed FAQ rich results for all sites in May 2026 (research
correction C-01); the markup itself now has zero visual/ranking benefit,
while the underlying visible FAQ content still earns genuine long-tail
traffic through harvested Questions-tab keywords.

## Decision
Every site renders its FAQ as visible on-page content (`FaqSection.astro`,
native `<details>/<summary>`, no client JS required) sourced from harvested
keyword-research questions. No `FAQPage` schema.org markup is ever built or
automated for these sites.

## Consequences
- `P-07 schema-markup` (haiku) never emits `FAQPage` JSON-LD; the temptation
  to "add it back for SEO" is a named failure case to refuse (§10, §13.4).
- FAQ content contributes to the ≥600-word home-page copy minimum and to
  long-tail landing-page keyword coverage (§2.3), not to structured-data
  eligibility.
- If Google ever reinstates FAQ rich results, re-adding the schema is a new
  ADR, not a silent change.
