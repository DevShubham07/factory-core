---
name: p04-bugfix
description: >-
  Reproduce, root-cause, and fix a single defect with a regression test, keeping the
  diff minimal. Use during Phase P4 build or after any gate failure when a specific
  bug blocks progress. Trigger on "fix this bug", "this is broken", a failing test, a
  console error, or when P-03 reports the same failure 3 times. Runs one bug at a time.
model: sonnet
effort: high
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
---

# P-04 bugfix

Operational instructions for isolated defect repair (design doc §8 P4, §6.5). Fix exactly one bug per invocation. Reproduce before you fix; instrument rather than shotgun. Use `/clear` between distinct bugs so context does not bleed.

## Purpose
Diagnose the true root cause of one defect, add a regression test that fails before and passes after, and land a minimal fix.

## Inputs
- `repro` (string) — reproduction steps, passed as `$ARGUMENTS` (e.g. `/p04-bugfix "enter -5 diagonal, PPI shows NaN, expected input rejected"`).
- `expected` (string) — the correct behavior per `spec.md`.
- `actual` (string) — the observed wrong behavior.
- The failing signal — a `tests/` failure, `pnpm build` error, or console error.

## Outputs
- One fix commit with a conventional message describing root cause.
- A regression test (added to the relevant spec in `tests/`, e.g. `tests/smoke.spec.ts` or a formula unit test) that reproduces the bug and now passes.
- If the fix required a spec-linked test change, a justification line in the commit (§7.1 rule 7).

## Acceptance criteria
- A repro test was added and is green after the fix (and demonstrably red before it).
- The diff contains no unrelated changes — scope is the single reported bug only.
- `pnpm build` still exits 0 and the existing `tests/smoke.spec.ts` suite stays green.
- The fixed behavior matches `spec.md` (expected), not merely "no longer crashes".

## Failure cases (enumerated → action)
- Cannot reproduce the bug → instrument (add logging/assertions, narrow inputs); do NOT apply speculative shotgun fixes.
- Root cause is in a shared `@toolfactory/*` package → do not patch it locally; record the finding and route a fleet-level fix (Changesets patch), noting it in the commit/`site.json`.
- Fix would require weakening or deleting a test → refuse; find the real cause (§7.1 rule 7).
- Environment-caused (not a code defect) → follow runbook RB-06/RB-07 rather than editing product code.

## Escalation (§6.5)
- Same bug fails 3 times at Sonnet → **Opus takes the wheel for this bug only**, then hands back.
- Opus fails twice → stop; reduce scope or amend the spec via ADR-lite note in `site.json`.
- Anything touching money, credentials, ToS, or third-party publishing → **[HUMAN]**.
