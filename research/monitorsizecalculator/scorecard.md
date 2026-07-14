# Scorecard — Monitor Size Calculator (`monitorsizecalculator.com`)

**Decision: BUILD** · Total **28 / 35** (threshold ≥ 22) · P1 run 2026-07-14 · Site #1 (build order A3=1)

| Factor | Score | Evidence |
|---|---|---|
| **C** Competition | **3** | Two-pass (P-01 ambiguity rule): first pass 2 (conservative), second pass rubric-literal 3-capped. The #1 result for the exact keyword (`screen-size.info`) has a **broken HTTPS cert** (serves `*.kasserver.com` shared-hosting cert); positions 4/6/7 are different-intent, dated-HTML, and 2006-era toolbox respectively; 4 of top-10 are retailer/manufacturer utility pages. Counterweight: Omni Calculator at #2 — but its page is generic screen-size, **no PPI in-tool, no monitor presets, no comparison table**. No result combines our exact feature set. |
| **D** Domain | **5** | Exact-keyword `.com`, RDAP-404 re-verified same-day (2026-07-14). D-11 price screenshot pending [HUMAN]. |
| **M** Monetization | **3** | Consumer electronics CPM tier (plan tier 3–4, conservative). General audience — no adblock deduction. |
| **B** Build ease | **5** | Pure client-side math (Pythagoras + aspect ratio). No dataset, no sensors. |
| **R** Risk | **5** | No YMYL, no data liability; thin-content risk mitigated by 600-word copy + 7 landing pages. |

`Score = 2(3) + 1.5(5) + 1.5(3) + 5 + 5 = 28`

## Volume
`[ESTIMATE]` 1k–5k US/mo exact keyword; parent "screen size calculator" 10k–30k US/mo. Derivation: ≥6 dedicated exact-match pages observed ranking (incl. programmatic-SEO entrants — competitors think it's worth building for); Omni maintains 4 separate variant calculators implying each clears their traffic threshold. **Pending [HUMAN]: Ahrefs capture** to replace estimate.

## The winning wedge (from competitor gap analysis)
No top-10 page offers, on one modern mobile-first page: diagonal + aspect-ratio presets (16:9/16:10/21:9/32:9) → width/height/**area**/**PPI** + **common-monitor comparison table** + per-size landing pages. Omni lacks PPI in-tool and any comparison; Display Wars is comparison-only with no numeric outputs and dated UI; toolstud.io has depth but 2006 design and requires resolution input; calcpedia is a thin template page.

## Gate G1 checklist
- [x] SERP evidence ≥10 rows (serp-analysis.json)
- [x] C ≥ 3 (two-pass, rationale above — flagged for G2 human review)
- [x] RDAP-404 same-day (2026-07-14)
- [x] Total ≥ 22 (28)
- [x] Scorecard schema-valid (scorecard.json)
- [ ] **Volume artifact [HUMAN]** — Ahrefs screenshot or explicit accept-estimate
- [ ] **D-11 price screenshot [HUMAN]** — Namecheap first-year < ₹1,200
