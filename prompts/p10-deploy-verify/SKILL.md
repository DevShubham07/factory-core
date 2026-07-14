---
name: p10-deploy-verify
description: >-
  Capture objective deploy-gate evidence (G7 vercel.app + G8 custom-domain curl header
  assertions) into site.json and regenerate LAUNCH.md. Use at Phases P6–P8 after a
  production deploy or domain attach. Trigger on "verify the deploy", "check the
  headers", "refresh LAUNCH.md", or when a site reaches DEPLOYED/DOMAIN_LIVE.
model: haiku
effort: medium
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
---

# P-10 deploy-verify

Operational instructions for deploy verification (design doc §8 P6–P8, §12.3, Appendix B). These are mechanical, objective header checks. Note: `X-Robots-Tag` host-scoped rules are testable only on real deploys, not under `vercel dev`.

## Purpose
Run the G7/G8 curl assertions on real deploys, record evidence into `site.json`, and refresh the printable `LAUNCH.md` on every gate pass.

## Inputs
- `domain` (string) and `vercel_project`/`slug` (string) — read from `site.config.mjs` / `site.json`, overridable via `$ARGUMENTS`.
- The live `https://site-<slug>.vercel.app/` and (at P8) `https://<domain>/` deployments.

## Outputs
- `site.json` gate entries for G7 and/or G8 with the captured `curl -sI` output as evidence (append-only, §3.3).
- `LAUNCH.md` — the G1→G10 checkbox page (§12.3) regenerated to reflect current evidence links; "launched" = G9 passed, "monetized" = G10.

## Acceptance criteria
- **G7**: `curl -sI https://site-<slug>.vercel.app/` → `200` **and** `X-Robots-Tag: noindex` present (host-scoped rule from `vercel.json`); Web Analytics enabled note recorded; Sentry test event confirmed. Evidence captured verbatim into `site.json`.
- **G8**: `curl -sI https://<domain>/` → `200`, valid TLS, **no** `X-Robots-Tag` header; `www` redirects to apex; live-page canonicals point to `https://<domain>/…`; `.vercel.app` still returns `noindex`.
- `LAUNCH.md` refreshed with current checkbox states and evidence links.

## Failure cases (enumerated → action)
- `X-Robots-Tag` missing on `.vercel.app` (G7) → check that the `has: host` value in `vercel.json` exactly matches the actual deploy alias; correct it and redeploy.
- `X-Robots-Tag` unexpectedly present on the custom domain (G8) → the host match is wrong (matching the apex too); fix the `vercel.json` host value.
- `www` not redirecting to apex → fix the Vercel domain redirect config; re-run G8.
- Curl shows non-200 / TLS invalid → follow runbook RB-01 (deploy) or RB-02 (domain/DNS); do not mark the gate passed.

## Escalation (§6.5)
- Same header/deploy failure 3× at Haiku → escalate one tier (Sonnet).
- Domain purchase, nameserver changes, ToS, or dashboard consent toggles → **[HUMAN]** (these are human-only boundaries; only the header verification is automated).
- Gate G7/G8 ambiguity → fix the gate definition in §8 before proceeding.
