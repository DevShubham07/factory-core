# RB-05 - Error spike

## Trigger
Sentry reports an unusual spike in error volume for a site, surfaced by
the daily Haiku monitoring-triage pass (P-11) or a direct Sentry email
alert.

## Steps
1. Open the Sentry issue(s) driving the spike; read stack trace, affected
   URL(s), browser/device breakdown, and first-seen timestamp.
2. Classify each event per the monitor-triage contract (P-11): noise
   (known/benign, e.g. browser extension interference), known (already
   filed), or new.
3. For **new** issues: check whether the first-seen timestamp correlates
   with a recent deploy (`git log` on `main` around that time).
   - If correlated with a release -> treat as **RB-01** (deploy
     failure/rollback path): roll back or revert-and-fix-forward, don't
     patch around the symptom.
   - If not correlated with a release (e.g. a pre-existing edge case
     newly triggered by a traffic-pattern change) -> route to **P-04
     bugfix**: reproduce with the exact input from the stack trace, add a
     regression test, fix, verify.
4. If severity/priority is unclear -> escalate the triage decision to
   Sonnet (P-11's stated escalation path) rather than guessing.

## Verification
- Sentry issue resolved/marked fixed after the next deploy, with a
  regression test in the test suite (P-04 acceptance: repro test added &
  green, no unrelated diffs).
- Error rate returns to baseline over the following 24-48h (checked in the
  next Haiku triage pass).
- If rollback was used (RB-01 path), Gate G7/G8 re-verified.

## Escalation
Fleet-pooled Sentry quota (5k errors/mo) approaching exhaustion because of
this spike -> flag in the monthly audit (§14.2) regardless of whether the
underlying bug is fixed, since it affects other sites' error visibility.
Root cause unclear after one P-04 pass -> escalate per §6.5 (3 same-tier
fails -> one tier up; Opus failing twice -> stop, amend spec/scope).
