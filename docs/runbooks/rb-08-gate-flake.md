# RB-08 - Gate flake (CI green/red oscillation)

## Trigger
The same commit produces different CI results across re-runs (green then
red then green) — most commonly LHCI perf-score variance or a flaky
Playwright test.

## Steps
1. **LHCI variance**: open the shared `lighthouserc.json` and confirm both
   `collect.numberOfRuns: 3` **and**
   `assert.aggregationMethod: "median-run"` are set. LHCI's default
   aggregation is `optimistic`, which asserts the *best* of the runs and
   masks real variance — if `aggregationMethod` is missing or set to
   anything other than `median-run`, that is the bug; fix the shared
   config (propagates fleet-wide via `ci-templates`), not the individual
   site.
2. If the config is already correct and variance persists: re-run the LHCI
   job 2-3 times to characterize the spread; if perf legitimately hovers
   near the 0.90 threshold, treat as a real performance issue (route to
   P-04/perf investigation), not a flake.
3. **Playwright flake**: identify the specific flaking test and apply the
   P-05 test-authoring failure policy: fix the root cause (usually a
   missing wait-for-condition or a `sleep`-based timing assumption) or
   quarantine the test with a filed issue — **never delete** a failing
   test to force green (§7.1 principle 7: tests are immutable evidence).
4. Confirm no unrelated diff was introduced while fixing the flake.

## Verification
- `lighthouserc.json` confirmed to contain both `numberOfRuns: 3` and
  `aggregationMethod: "median-run"`.
- 3 consecutive CI runs on the same commit produce the same pass/fail
  result (flake eliminated) or the flaky test is quarantined with a linked
  issue, not silently deleted.
- If quarantined, an issue exists tracking the root-cause fix.

## Escalation
If the LHCI config fix doesn't resolve oscillation, or a Playwright test
still flakes after root-cause investigation -> escalate per §6.5 (3 same-
tier fails -> one tier up). If a gate's pass/fail criterion is itself
ambiguous (not just flaky-in-practice but not objectively checkable) ->
the gate definition is defective; fix the gate definition in the design
doc before proceeding (§6.5 rule 4), rather than continuing to chase a gate
that can't be objectively evaluated.
