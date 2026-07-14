# Launch Checklist — G1 → G10 (§12.3)

Printable per-site artifact. The per-site version of this file is generated
automatically as `site-<slug>/LAUNCH.md` by the **P-10 deploy-verify** skill
and refreshed on every gate pass (§10). This copy in `factory-core/docs`
is the canonical template — copy its checkbox structure and objective
checks verbatim; do not invent new checks per site.

Definitions (§12.3): **"launched"** = G9 passed. **"monetized"** = G10
passed.

---

## G1 — Validation (§2.1)
- [ ] Volume evidence artifact exists in `research/` (main-keyword monthly
      volume, floor ≥1,000 US searches/mo)
- [ ] Competition score `C` ≥ 3
- [ ] Domain RDAP-404 re-verified same day (`automation/rdap-check.mjs`)
- [ ] Domain price verified **< ₹1,200 first year** at the registrar's
      search page (D-11) — screenshot artifact saved in `research/`
- [ ] Scorecard committed as schema-valid `research/scorecard.json` **and**
      rendered `research/scorecard.md`
- [ ] Total score ≥ 22 (Build threshold; 18-21 = Park, <18 = Reject)

## G2 — Spec (§8 P2)
- [ ] Every mandatory `spec.md` heading is non-empty: 1 Overview · 2 Page
      inventory · 3 Features · 4 Formulas & data sources (cited) · 5
      Dataset schema · 6 Keyword map · 7 Island/hydration plan · 8 A11y
      notes · 9 Out of scope · 10 Acceptance checklist
- [ ] Every formula/datum has a cited source
- [ ] Keyword map references G1 artifacts
- [ ] [HUMAN] approval recorded in `site.json`

## G3 — Scaffold (§8 P3)
- [ ] CI green on the init commit
- [ ] Template tests pass unmodified
- [ ] Vercel project deploys (`*.vercel.app` preview live)
- [ ] `site.json` state = `SCAFFOLDED` with origin template tag recorded

## G4 — Build (§8 P4)
- [ ] `pnpm build` exits 0
- [ ] All spec features demonstrably present (checklist in `spec.md`
      ticked with commit references)
- [ ] Unit-level tests for formulas pass (3 known input/output pairs per
      formula, taken from spec)
- [ ] No dependency outside §5 pinned stack / `spec.md`-justified additions

## G5 — QA (§8 P5)
- [ ] CI fully green including LHCI thresholds (perf ≥0.90, a11y/BP/SEO
      ≥0.95, median-of-3 aggregation)
- [ ] axe-core: 0 critical/serious findings
- [ ] Opus `/code-review` (high) findings closed or explicitly [HUMAN]-waived

## G6 — SEO (§8 P5)
- [ ] Every page: unique title ≤60 chars containing the keyword
- [ ] Every page: meta description ≤160 chars containing the keyword
- [ ] Every page: absolute canonical URL present
- [ ] Every page: OG + Twitter tags present
- [ ] Schema validates in Rich Results Test / validator.schema.org (no
      rating/review fields — §13.4)
- [ ] Home copy ≥600 words
- [ ] Sitemap contains all pages
- [ ] `robots.txt` references the sitemap
- [ ] Custom 404/500 pages render correctly

## G7 — Deploy (pre-domain) (§8 P6)
- [ ] `curl -sI https://site-<slug>.vercel.app/` → 200
- [ ] `X-Robots-Tag: noindex` present (host-scoped rule — verified on a
      real deploy, not `vercel dev`)
- [ ] Web Analytics enabled in dashboard [HUMAN one-click]
- [ ] Speed Insights enabled (site #1 only while fleet is on Hobby — 1-
      project cap; enable fleet-wide after Pro upgrade)
- [ ] Sentry receives a test event

## G8 — Domain (§8 P7)
- [ ] `curl -sI https://<domain>/` → 200, valid TLS
- [ ] **No** `X-Robots-Tag` header on the custom domain
- [ ] `www` redirects to apex
- [ ] Canonical tags on live pages point to `https://<domain>/…`
- [ ] `.vercel.app` host still noindexed

## G9 — Indexing (§8 P8) — **"launched"**
- [ ] GSC domain property verified (DNS TXT)
- [ ] Sitemap status = "Success" in GSC
- [ ] IndexNow submission logged with 200/202 response
- [ ] Bing Webmaster property live (imported from GSC)
- [ ] `site.json` state = `INDEXED`

## G10 — Monetization (§8 P9) — **"monetized"**
- [ ] [HUMAN] Vercel project upgraded to **Pro** (before any ad code ships
      — D-01)
- [ ] `ads.txt` reachable at the domain root with the correct AdSense
      pub-ID
- [ ] AdSense "Privacy & messaging" (certified CMP) live for an EEA test
      (VPN check or Google's preview tool)
- [ ] AdSense status = "Ready"
- [ ] Ads render on 2+ pages without layout collapse (CLS re-checked
      ≤0.1 after ad insertion)

---

**Evidence discipline**: every checked box must have a corresponding entry
in `site.json.gates[]` (`{gate, passed_at, evidence}`) — a checkbox ticked
without recorded evidence is not a passed gate (§7.1 principle 4:
"looks good" is not a check).
