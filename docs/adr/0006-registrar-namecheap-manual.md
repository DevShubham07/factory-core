# 0006 - Namecheap registrar, manual purchase only

## Status
accepted

## Context
Namecheap's domain API is gated behind account minimums (>=20 domains or
>=$50 balance/spend), requires a mandatory static-IPv4 whitelist, is
XML-only, and its `setHosts` call replaces ALL DNS records atomically —
none of this is workable for a solo operator registering domains one at a
time (research correction C-04).

## Decision
Use free, anonymous RDAP lookups (`rdap-check.mjs` against
`https://rdap.verisign.com/com/v1/domain/{name}`) for availability
screening. All actual purchases happen manually on Namecheap
[HUMAN] — payment, registrant PII, and ToS acceptance are never automated
(§9 never-automate list). Once purchased, nameservers are delegated to
Vercel's provided pair one time [HUMAN], after which DNS attach/updates
become programmatic via the Vercel API/MCP.

## Consequences
- RDAP is registry truth, not purchasability truth (reserved/redemption
  states exist) — final confirmation always happens at registrar checkout.
- Every domain purchase and nameserver change is a [HUMAN] step; no
  Namecheap credentials are ever handled by AI or scripts.
- Programmatic DNS (attach domain to Vercel project, add/remove records)
  is available post-delegation without further Namecheap API access.
