# 0011 - Domain price rule: checkout < ₹1,200 first year (operator-set, hard)

## Status
accepted

## Context
Fresh (RDAP-404) `.com` domains have uniform non-premium registry pricing
(~₹850-1,000 at Namecheap), but aftermarket/premium listings, non-.com TLD
premium tiers, and price drift can silently inflate a domain's real
checkout cost above what the honest CPM/build-cost model assumes. This is
an operator-set hard constraint, not a derived one.

## Decision
Registrar checkout total must be **< ₹1,200 first year** for every selected
tool's domain, verified twice: at Gate G1 (screenshot artifact in
`research/`) and re-verified at P7 immediately before purchase. In the
domain-scoring rubric (§2.1), a premium/aftermarket-priced name scores
`D = 0` regardless of keyword quality, and the domain check is a same-day
RDAP-404 re-verification. Renewal is kept under the same ceiling by
transferring to an at-cost registrar (Cloudflare Registrar, ~₹900/yr)
before first renewal (~month 11 per domain).
Weights and thresholds in the §2.1 scoring formula are a policy default;
they may only be tuned via a new ADR (§12.2), never ad hoc.

## Consequences
- P7 aborts and falls back to the site's backup domain if checkout total
  is >= ₹1,200 at purchase time.
- The month-11 at-cost registrar transfer is a standing P10 maintenance
  task per domain (requires switching DNS to Cloudflare with grey-cloud
  A/CNAME records pointing to Vercel).
- All 10 initial portfolio domains (§2.2) satisfy this rule by
  construction as fresh unregistered `.com`s; the G1 screenshot still runs
  per site as the formal, auditable check.
