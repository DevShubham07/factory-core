# 0004 - Shared-code distribution via npm + Changesets

## Status
accepted

## Context
Shared UI/SEO/config/analytics code needs one propagation path across a
growing fleet of independent site repos, with semver-controlled fleet-wide
fixes rather than copy-paste drift.

## Decision
Publish `@toolfactory/*` packages (`ui`, `seo`, `config`, `analytics`) from
`factory-core` to npm using Changesets: `changesets/action@v1` opens a
"Version Packages" PR on merge; merging that PR publishes with provenance.
Sites depend on `@toolfactory/<name>@^x`; a fleet-wide fix is a patch
release followed by Renovate PRs into every site, each gated by that site's
CI.

## Consequences
- Requires a [HUMAN]-provisioned npm account/scope and an `NPM_TOKEN` org
  secret before this path is usable (P0 prerequisite).
- Until the npm account exists, packages ship vendored inside
  `site-template` instead (fallback, recorded separately in ADR 0012) —
  propagation degrades to scripted per-site sync, an accepted risk.
- `@changesets/action` has no confirmed stable `v2` tag as of this
  document; pin `@v1` and re-check at P0 (open item #6, §16).
