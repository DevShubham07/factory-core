---
name: p05-test-author
description: >-
  Author deterministic Playwright specs covering the tool's core flows, extending
  tests/smoke.spec.ts. Use at Phase P5 QA (state BUILT → QA_PASSED prep) after the
  build is green. Trigger on "write tests", "add coverage", "author the Playwright
  specs", or when a built tool has only the template smoke test.
model: sonnet
effort: medium
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
---

# P-05 test-author

Operational instructions for behavioral test authoring (design doc §8 P5, §5, §11). Tests are immutable evidence — write them to fail loudly on real regressions, never to be conveniently green. No `waitForTimeout`/sleeps; wait on conditions.

## Purpose
Extend the Playwright suite so every core tool flow from `spec.md` is covered by a deterministic test, feeding Gate G5.

## Inputs
- `spec.md` — the source of core flows and edge cases to cover.
- `flows` (string, optional) — a specific flow to prioritize, passed as `$ARGUMENTS`.
- Existing `tests/smoke.spec.ts` (template baseline: title, h1, console-error==0, legal links present, mobile viewport).

## Outputs
- New/extended Playwright specs under `tests/` (e.g. `tests/<tool>.spec.ts`), plus additions to `tests/smoke.spec.ts` where the core-page invariants grow.
- Each spec covers a named `spec.md` flow with concrete input → expected output assertions (including the spec's 3 known I/O pairs per formula and its edge cases: zero/negative, absurd-value warnings, huge paste caps, unicode, localStorage persistence).

## Acceptance criteria
- Every core flow in `spec.md` has at least one test.
- Tests are deterministic — no `waitForTimeout`/arbitrary sleeps; use web-first assertions and condition waits.
- A `console-error == 0` assertion is present on tool pages (carried from the smoke baseline).
- Legal-link presence and mobile-viewport checks remain in `tests/smoke.spec.ts`.
- The full suite runs green locally (`pnpm exec playwright test`) and in CI, and edge-case tests actually exercise the spec's boundary inputs.

## Failure cases (enumerated → action)
- A test is flaky → fix the root cause (bad selector, race, animation) or quarantine it with a linked GitHub issue; **never delete a failing test** to go green (§7.1 rule 7).
- The spec is ambiguous about expected output for a flow → do not guess; route to P-02 to amend the spec, then write the test.
- A flow can't be driven deterministically in Playwright → note it and cover the underlying logic with a unit test instead; record the gap.

## Escalation (§6.5)
- Same test-authoring failure 3× at Sonnet → escalate one tier (Opus).
- Persistent flakiness with no root cause found → quarantine + issue, and flag for P-13 regression-check.
- Gate G5's pass/fail ambiguous → the gate definition is the defect; fix §8 G5 before proceeding.
