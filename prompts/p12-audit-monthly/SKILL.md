---
name: p12-audit-monthly
description: >-
  Produce the monthly fleet portfolio audit — rankings trend, revenue/site, content
  refresh and kill/park candidates, technical-debt register — every claim linked to a
  data artifact. Use during Phase P10 operate (monthly, fleet-wide). Trigger on "run
  the monthly audit", "portfolio review", or on the monthly audit schedule.
model: opus
effort: high
allowed-tools: Read, Write, Edit, Bash, Grep, Glob, WebFetch
---

# P-12 audit-monthly

Operational instructions for the monthly portfolio audit (design doc §8 P10, §11.3, §12.2). Infrequent, cross-site, high-stakes synthesis. Opus judges a Sonnet/Haiku fan-out. Every claim must link to a data artifact; a data gap is named, never guessed.

## Purpose
Assess the whole fleet against real data and emit a report plus a set of testable next-month actions and any required ADRs.

## Inputs
- Fleet data — GSC Search Analytics API (rankings/queries/position trend), Vercel Analytics (traffic), Sentry (error counts), revenue/site, dependency PR backlog.
- `registry/portfolio.json` — the fleet source of truth.
- Per-site `site.json` gate histories.

## Outputs
- A monthly audit report (Markdown) under `factory-core/docs` covering: rankings trend, traffic/revenue per site, content-refresh candidates, kill/park recommendations (a site 6 months post-INDEXED with <5 clicks/day enters PARK review), and a technical-debt register.
- A next-month action list — each action a testable task.
- ADRs (`docs/adr/NNNN-title.md`, MADR 4.0) for any systemic finding or template fix; template fixes routed to propagate fleet-wide.

## Acceptance criteria
- Every quantitative claim links to a specific data artifact (GSC pull, analytics export, Sentry query) — no unsourced numbers; unavailable data is labeled a **gap**, not estimated silently (§7.1).
- Every recommended action is a concrete, testable task (not a vague aspiration).
- Kill/park recommendations apply the §11.3 rule objectively (post-INDEXED age + clicks/day).
- Systemic findings produce an ADR and, where a template/shared-package fix applies, a propagation plan (Changesets patch → Renovate PRs).

## Failure cases (enumerated → action)
- A data source is missing/unreachable → name it as a gap in the report; do not fill it with a guessed figure.
- A finding is cross-site/systemic → record an ADR and a template fix rather than patching one site.
- Fan-out leg (Sonnet/Haiku) returns malformed structured output → retry, do not hand-parse (§7.1 rule 8).

## Escalation (§6.5)
- Opus (this model) fails to produce a defensible audit twice → stop; reduce scope (audit a subset) and record an ADR-lite note.
- Any action touching money, credentials, ToS, or third-party publishing → **[HUMAN]** (e.g. AdSense, domain renewals, registrar transfer at month ~11).
- Gate/metric definitions ambiguous → fix the definition in the doc before asserting a pass/fail.
