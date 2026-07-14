---
name: p03-implement
description: >-
  Implement the site spec.md section-by-section — Astro pages, the core tool island,
  datasets, and formulas — committing per feature until the build is green. Use at
  Phase P4 (state SCAFFOLDED → BUILT) as the main build loop. Trigger on "implement
  the tool", "build the spec", "start the build loop", or when a scaffolded site has
  an approved spec.md and empty tool logic.
model: sonnet
effort: high
allowed-tools: Read, Write, Edit, Bash, Grep, Glob, WebFetch
---

# P-03 implement

Operational instructions for the AI build loop (design doc §8 P4, §7). Build only what `spec.md` authorizes. For any Astro API, config key, or CLI flag not already in the doc's §5 stack table or a lockfile, consult the astro-docs MCP before writing — never code against a remembered API (§7.1).

## Purpose
Turn the approved `spec.md` into working code that satisfies Gate G4: build passes, every spec feature is demonstrably present, formula unit tests pass, and no dependency exists outside §5 or the spec.

## Inputs
- `spec_ref` (string, optional) — a specific `spec.md` section to implement next, passed as `$ARGUMENTS` (e.g. `/p03-implement §3 core calculator`). Absent → work through the spec top-to-bottom.
- `spec.md` — the binding contract (all features come from here).
- `site.config.mjs` — site identity (SITE_NAME, DOMAIN, MAIN_KEYWORD, DESCRIPTION) that template pages read; never hardcode identity in pages.

## Outputs
- Code commits (conventional messages, one per feature) under `src/` — pages in `src/pages/`, the core tool island per the §7 hydration plan, presentational components with no client directive.
- `data/*.json` datasets when the spec requires one, each entry carrying `source` + `retrieved` fields (fetched from authoritative pages, never invented — §7.2).
- Formula unit tests co-located per the test setup, covering the 3 known input/output pairs per formula named in the spec.
- The `spec.md` §10 acceptance checklist ticked, each item annotated with its commit ref.

## Acceptance criteria (Gate G4)
- `pnpm build` exits 0.
- Every spec feature is demonstrably present (drive the tool in `pnpm dev` with the spec's 3 known I/O pairs per formula; they must match).
- Formula unit tests pass (3 known I/O pairs per formula from the spec).
- No runtime dependency outside the §5 pinned stack or `@toolfactory/*`, unless the dep is listed in `spec.md` with an exact pinned version and one-line justification (§7.2). Never type a version not in the §5 table or a lockfile.
- Hydration directives match the spec §7 plan (`client:load` core island only; below-fold `client:visible`; presentational = no directive; one island per context boundary).
- Edge cases from the spec are handled (e.g. zero/negative input, absurd values warned, unicode, huge-paste caps, unit persistence in localStorage) — as enumerated in the tool's §2.2 row and spec.

## Failure cases (enumerated → action)
- Uncertain about an Astro/Vercel API surface → look it up via astro-docs MCP (or official docs fetch); never guess.
- External datum not fetchable from an authoritative source → exclude that datum (never fabricate); note the exclusion.
- Same bug fails 3 times → hand off to **P-04 bugfix** (which may escalate to Opus for that one bug); use `/clear` between distinct bugs to keep context clean.
- "The spec doesn't say" → ask or amend the spec via P-02/ADR-lite; never improvise silently (§7.1 rule 6).
- Wanting a new dependency not in §5/spec → do not add it; route the decision through the §7.2 dependency tree (spec line + pin required).

## Escalation (§6.5)
- Same error 3× at Sonnet → escalate one tier: **Opus takes the wheel for that bug only** (via P-04), then control returns to Sonnet.
- Anything touching money, credentials, ToS, or third-party publishing → **[HUMAN]**.
- Never delete or weaken a failing test to make the build green (§7.1 rule 7).
