# RB-01 - Deploy failure / rollback

## Trigger
CI-red on `main`, or a production deploy on Vercel that is bad (site
broken/500s) despite CI having been green. Alert routing (§11.2): CI-red or
Vercel deploy-failure notification fires immediately by email — this is
too urgent to wait for the weekly audit.

## Steps
1. Identify the last known-good deployment: Vercel dashboard -> project ->
   Deployments, or `vercel ls <project>`.
2. If production is currently broken: trigger Vercel's **Instant Rollback**
   to the previous good deployment (dashboard, or Vercel MCP/API
   equivalent) — this is immediate and does not require a new build.
3. In parallel, fix the root cause in git:
   - `git log --oneline -5` to find the breaking commit.
   - `git revert <bad-commit-sha>` (creates a new commit; never
     force-push/rewrite `main`).
4. Push the revert; CI re-runs on `main`.
5. If the fix is more than a revert (e.g. a real bug needing a forward
   fix), route to **P-04 bugfix** skill rather than hand-patching.
6. Once CI is green and the new deploy is live, re-run Gate G7 assertions
   (`curl -sI https://site-<slug>.vercel.app/` -> 200 and
   `X-Robots-Tag: noindex`) — or G8 assertions if the domain is already
   attached — to confirm the fix actually deployed correctly.

## Verification
- CI status = green on `main`.
- Production URL returns 200 with expected content (spot-check the core
  tool flow, not just the homepage).
- G7/G8 curl assertions pass and are logged into `site.json`.
- No unrelated diff introduced by the revert/fix (P-04 acceptance
  criterion: repro test added & green, no unrelated diffs).

## Escalation
Same failure recurring 3x at the assigned model tier -> escalate one tier
(§6.5). If the root cause is a shared-package (`@toolfactory/*`) or CI
template change, treat as a fleet-wide incident: check whether other sites
on the same template/package version are affected, not just this one.
Anything requiring credential or payment action -> [HUMAN].
