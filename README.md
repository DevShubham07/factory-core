# factory-core

Hub repo for the micro-tool website factory. Full engineering design is the
approved plan document (kept authoritative until it's copied into
`docs/architecture.md` per §12.4 change management):
`C:\Users\gshub\.claude\plans\now-you-have-an-warm-parasol.md`.

This repo holds everything shared across the fleet: design-system
packages, automation scripts, the fleet registry, docs, canonical skill
sources, and decision/runbook records. Site code lives in per-site
`site-<slug>` repos scaffolded from `site-template` (design doc §4).

## Folder map

```
factory-core/
├── packages/           @toolfactory/* — ui, seo, config, analytics
│                       (vendored into site-template until npm publishing
│                       is live — ADR 0012)
├── automation/         idempotent Node scripts: rdap-check.mjs,
│                       new-site.mjs, indexnow.mjs, gsc-submit.mjs,
│                       psi-audit.mjs, screenshot.mjs, fleet-status.mjs
│   └── fixtures/       fixtures each automation script self-tests against
├── registry/
│   └── portfolio.json  fleet source of truth — every site's identity,
│                       state, scores, build order (§3.3)
├── schemas/            JSON Schemas for scorecard/triage/audit outputs
│                       and site.json (Appendix A)
├── prompts/            canonical skill sources, synced into
│                       site-template/.claude/skills/
└── docs/
    ├── design-spec.md      one-page binding design spec (§4.3)
    ├── launch-checklist.md printable G1→G10 checklist template (§12.3)
    ├── adr/                MADR-minimal decision records (0001-0012)
    └── runbooks/            RB-01…RB-08 (§12.1)
```

## Site lifecycle (state machine, §3.2)

```
IDEA → VALIDATED → SPECED → SCAFFOLDED → BUILT → QA_PASSED → SEO_DONE
     → DEPLOYED → DOMAIN_LIVE → INDEXED → MONETIZED → OPERATING
```
Plus terminal `PARKED` / `KILLED`, reachable from any state (reason
recorded). Transitions happen **only** via the named gates G1–G10 (§8);
`MONETIZED → OPERATING` is automatic on completion of the site's first P10
monthly audit cycle. A gate is a checklist of objectively verifiable
commands/assertions — see `docs/launch-checklist.md` for the full G1-G10
objective checks. **Resumability rule**: any new session on a site starts
by reading that site's `site.json` + `spec.md` and resumes from the
recorded state — never from scratch.

## Docs

- [`docs/design-spec.md`](docs/design-spec.md) — color/type/spacing
  tokens, dark-mode behavior, WCAG AA contrast floors, component prop
  contracts (`Seo`, `JsonLd`, `FaqSection`, `Header`, `Footer`,
  `ThemeToggle`, `Base` layout).
- [`docs/adr/`](docs/adr/) — decision records 0001-0011 (design doc §0
  decisions D-01 through D-11) plus 0012 (vendored-packages-before-npm
  fallback).
- [`docs/runbooks/`](docs/runbooks/) — RB-01 through RB-08, each: trigger
  → steps → verification → escalation.
- [`docs/launch-checklist.md`](docs/launch-checklist.md) — the G1→G10
  printable checklist template; per-site copies are generated as
  `site-<slug>/LAUNCH.md` by the P-10 skill.

## Quick start

New session picking up factory work: read
[`automation/README.md`](automation/README.md) for the current automation
scripts and their fixtures, then the plan doc above for full context on any
phase (P0-P10), gate (G1-G10), or skill (P-01…P-14) referenced here. Fleet
state always starts from `registry/portfolio.json` + the target site's own
`site.json` — never from memory of a prior session (§3.4, §7.1).
