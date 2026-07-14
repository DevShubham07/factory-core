# 0012 - Vendor @toolfactory/* packages until the npm account exists

## Status
accepted

## Context
Shared-code distribution (ADR 0004, D-04) is designed around npm-published
`@toolfactory/*` packages via Changesets, but that path requires a
[HUMAN]-provisioned npm account/scope and org `NPM_TOKEN` secret (P0
prerequisite, §4.7) that may not exist yet when the first sites are built.
The factory cannot block site #1 on an account-creation dependency.

## Decision
Until the npm account exists, `site-template` ships `packages/` as vendored
copies (not a package dependency) of `ui`, `seo`, `config`, and `analytics`.
Fleet-wide propagation of a fix degrades, for this period, to a scripted
copy performed by `new-site.mjs` at scaffold time (P3) — each new site gets
whatever the template's vendored copy currently contains; already-scaffolded
sites do not automatically receive later template fixes and must be synced
manually per site (script or PR) until npm publishing is live.

## Consequences
- This is an accepted, explicitly-recorded risk (per D-04's own fallback
  clause), not a silent deviation: any site built during this period may
  drift from `packages/*` in `factory-core` until synced.
- Revisit at 5+ sites scaffolded: if the npm account still doesn't exist by
  then, evaluate whether the vendored-copy sync script needs to become a
  first-class automation script (`automation/sync-packages.mjs`) rather
  than an ad hoc per-site task.
- Once the npm account exists and Changesets publishing is live, this ADR
  is superseded: new sites depend on `@toolfactory/*@^x` per ADR 0004, and
  already-vendored sites are migrated opportunistically (tracked as
  technical debt in the monthly audit, §11.3).
