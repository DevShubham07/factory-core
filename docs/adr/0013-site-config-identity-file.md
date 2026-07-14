# 0013 — Single identity file (`site.config.mjs`) instead of scattered placeholders

Status: accepted (2026-07-14)

## Context

Design doc §4.4 sketched site identity as `{{SITE_NAME}} {{DOMAIN}} {{MAIN_KEYWORD}} {{DESCRIPTION}}` placeholders scattered across template files, rewritten by `new-site.mjs`. During P0 implementation the template was instead built around a single `site.config.mjs` exporting `SITE` (name, domain, keyword, description, vercelSlug, contactEmail, legalName) + `SITE_URL`; `astro.config.mjs` (site:), all pages, `<Seo>`, JSON-LD, header/footer, and the `robots.txt` endpoint import from it. `new-site.mjs` rewrites only three files (site.config.mjs, package.json name, vercel.json host) plus org references. The P2 adversarial reviewer flagged the spec's citation of `site.config.mjs` as a potential fabrication because the design doc never names the file.

## Decision

Keep `site.config.mjs` as the canonical per-site identity mechanism. It is a strict improvement on the placeholder sketch: one rewrite target instead of N, no risk of missed placeholder occurrences, type-checked imports, and pages derive identity at build time. Verified end-to-end in Gate G0 (smoketest scaffold rewrote identity correctly; deployed site rendered it).

## Consequences

- Specs and skills cite `site.config.mjs` as the identity source (P-02 onward).
- `site.json` remains the *state* record (slug/domain/state/gates) per Appendix A — identity for humans/ops, `site.config.mjs` for the build.
- The design doc's §4.4 placeholder wording is superseded on this point; this ADR is the authoritative record (change-management path per §12.4).
