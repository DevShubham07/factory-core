# 0003 - Hub-and-spoke repository strategy

## Status
accepted

## Context
The factory must scale to hundreds of sites without re-architecture. A full
monorepo (`apps/site-*`) bloats install/CI as the fleet grows and still
needs one Vercel project per site, so one bad merge risks the whole fleet.
A pure polyrepo (one independent repo per site with no shared code) lets
shared code drift with no fleet-wide fix propagation.

## Decision
Hub-and-spoke: a small monorepo hub (`factory-core`) holds everything
shared (packages, automation, registry, docs, prompts, ADRs, runbooks); a
GitHub template repo (`site-template`) provides the deployable skeleton;
`ci-templates` holds the fleet's single reusable CI definition;
`renovate-config` holds the org-wide dependency-update preset; each site
gets its own lightweight `site-<slug>` repo created from the template.

## Consequences
- Fleet-wide fixes propagate via (a) versioned npm packages + Renovate PRs
  into every site, (b) reusable CI workflows referenced by tag, (c)
  template updates for future sites only.
- A free GitHub organization is required upfront (org secrets, Renovate
  install, fleet listing all assume an org) — [HUMAN] prerequisite.
- Sites are public repos (free Actions minutes, free CodeQL/secret
  scanning; client-side code ships to browsers anyway).
