---
name: p11-monitor-triage
description: >-
  Classify daily monitoring feeds (Sentry errors, uptime, lychee link-checks) into
  noise / known / new, filing GitHub issues with repro for new items. Use during Phase
  P10 operate (daily, fleet-wide). Trigger on "triage the alerts", "check Sentry",
  "process the monitoring feeds", or on the daily monitoring cron output.
model: haiku
effort: low
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
---

# P-11 monitor-triage

Operational instructions for daily monitoring triage (design doc §8 P10, §11.2, §11.3). Highest-frequency, lowest-per-event-complexity stage. Classify every event; escalate genuine uncertainty rather than guessing severity.

## Purpose
Turn raw Sentry / uptime / lychee feeds into a labeled, actionable set: noise suppressed, known issues linked, new issues filed with repro.

## Inputs
- Sentry error feed, Better Stack uptime events, and `links.yml` (lychee) failures for the fleet.
- `feed` (string, optional) — a specific source to triage, passed as `$ARGUMENTS`.
- `registry/portfolio.json` — to map events to live sites.

## Outputs
- Each event classified: `noise` (suppressed with reason) / `known` (linked to existing issue) / `new`.
- For each `new` event: a GitHub issue with reproduction steps, affected site, and severity label; `fleet-alert` label where §11.2 requires.
- A weekly summary contribution to the aggregate issue in `factory-core` (P-11 output).

## Acceptance criteria
- Every event in the feed is classified (none left unlabeled).
- New issues include concrete repro steps and the affected URL/site.
- Site DOWN / deploy-failure events are routed immediately to RB-01/RB-02 (not batched), per §11.2.
- No duplicate issues filed for an already-known problem (dedupe against open issues).

## Failure cases (enumerated → action)
- Severity uncertain → escalate to Sonnet for that event; do not guess.
- Event can't be reproduced → file with the raw evidence and mark "needs repro", route to P-04 for instrumentation; do not close as noise on a hunch.
- New-release-correlated error spike → link to RB-05 (and RB-01 rollback path if a bad deploy is implicated).

## Escalation (§6.5)
- Anomaly beyond mechanical classification → Sonnet; a genuine incident → the matching runbook (RB-01/02/05).
- Same triage failure 3× at Haiku → escalate one tier (Sonnet).
- Anything touching credentials/ToS/publishing → **[HUMAN]**.
