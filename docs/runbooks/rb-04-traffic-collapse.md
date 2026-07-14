# RB-04 - Traffic collapse (>50% week-over-week)

## Trigger
GSC/Vercel Analytics shows a >50% WoW drop in clicks/visits for a live
site, surfaced by the weekly `audit.yml` run or noticed during a monthly
Opus portfolio audit (P-12).

## Steps
1. **Check GSC manual actions FIRST** (Security & Manual Actions panel) —
   a manual action is the most severe cause and must be ruled out before
   anything else. If present: read the specific violation, do not proceed
   to other diagnostics until a remediation plan exists.
2. Check GSC **index coverage**: new errors, pages dropped from the index,
   or a spike in "Discovered - not indexed"/"Crawled - not indexed".
3. Correlate against **recent deploys**: `git log` on `main` around the
   drop's onset date — did a deploy change URLs, remove content, alter
   canonical tags, or introduce a noindex regression?
4. Check **CWV regression** via Vercel Speed Insights / weekly PSI data —
   a Core Web Vitals regression can suppress rankings independent of
   content changes.
5. Check **SERP volatility**: search Google's own search-status-dashboard /
   known algorithm-update trackers for the date range. If a broad algorithm
   update lines up with the drop and steps 1-4 found nothing site-specific,
   accept and document it as external (no fix action) rather than chasing
   a phantom regression.

## Verification
- Root cause identified and categorized as one of: manual action / index
  coverage issue / deploy regression / CWV regression / external algorithm
  update.
- If actionable: fix applied, Gate G6 (SEO) and G5 (QA/perf) re-verified,
  and traffic trend monitored over the following 1-2 weeks for recovery.
- If external (algorithm update): documented in the monthly audit report
  with no false "fix" claimed.

## Escalation
A manual action found in step 1 -> stop, this is a compliance issue,
escalate to [HUMAN] immediately (do not attempt to "optimize around" a
manual action without addressing its stated cause). Ambiguous cause after
all 5 steps -> escalate to Sonnet/Opus for deeper synthesis (per §6.3
"ambiguous failure -> Sonnet" style escalation) before concluding "unknown".
