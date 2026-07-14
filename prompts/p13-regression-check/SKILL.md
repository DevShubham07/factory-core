---
name: p13-regression-check
description: >-
  Diagnose a regression by narrowing last-green vs now to a root-cause commit
  (bisect-style). Use when a previously-passing site starts failing a gate, a test, or
  a metric. Trigger on "what broke this", "find the regression", "it was green
  before", CI oscillation, or a sudden metric drop.
model: sonnet
effort: medium
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
---

# P-13 regression-check

Operational instructions for regression diagnosis (design doc §8, §12.1 RB-06/RB-08). Narrow methodically; identify the root-cause commit. Distinguish code regressions from environment/flake causes.

## Purpose
Given a last-known-green state and the current failing state, isolate the change that introduced the regression and hand a precise diagnosis to P-04.

## Inputs
- `last_green` (git ref/commit/tag) — the last-known-good point, passed as `$ARGUMENTS`.
- The current failing signal — failing gate, `tests/smoke.spec.ts` failure, LHCI drop, or a metric regression.
- Git history between `last_green` and `HEAD`.

## Outputs
- A diagnosis note naming the root-cause commit (bisect-style narrowing).
- A minimal failing repro (test or command) that isolates the regression.
- A handoff to **P-04 bugfix** with expected vs actual, or a runbook pointer if environment-caused.

## Acceptance criteria
- The root-cause commit is identified by bisect-style narrowing over the `last_green..HEAD` range (not a guess).
- A concrete repro reproduces the regression at the identified commit and not before it.
- The diagnosis distinguishes code regression from environment/flake, with evidence.

## Failure cases (enumerated → action)
- Environment-caused (not a code change) → follow runbook **RB-06** (dependency/CVE) or RB-07; do not edit product code chasing a phantom.
- CI green/red oscillation (flake) → follow **RB-08**: confirm `numberOfRuns: 3` **and** `assert.aggregationMethod: "median-run"` in the shared `lighthouserc.json` (the default `optimistic` masks variance); for Playwright flake apply the P-05 policy.
- Bisect inconclusive (multiple suspect commits) → widen the repro, add instrumentation; do not shotgun-fix.

## Escalation (§6.5)
- Same diagnosis failure 3× at Sonnet → escalate one tier (Opus).
- Root cause in a shared `@toolfactory/*` package → route a fleet-level fix (Changesets patch), note in `site.json`.
- Gate ambiguity around what "green" means → fix the gate definition in §8 before proceeding.
