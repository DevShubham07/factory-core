# 0001 - Hosting on Vercel

## Status
accepted

## Context
The factory needs a static-site host with Git-integrated deploys, preview
URLs per PR, and a documented commercial-use policy, since every site will
eventually carry AdSense. The operator already holds a Vercel account.

## Decision
Host every site on Vercel, Git integration as the primary deploy path (CLI
secondary). Start each site on the free Hobby tier during build, then
**upgrade to Vercel Pro before any ad code ships** — Vercel's fair-use
guidelines explicitly classify AdSense-carrying sites as commercial, and
Hobby is non-commercial only.

## Consequences
- P9 step 0 is a hard gate: no ad `<script>` may deploy while a project is
  on Hobby.
- Vercel Pro ($20/mo) becomes a required fleet fixed cost at first
  monetization, not at launch (§14.1).
- Speed Insights is capped at 1 project on Hobby; fleet-wide enablement
  waits for the Pro upgrade (§11.1).
- `*.vercel.app` preview hosts must be kept out of search via a host-scoped
  `X-Robots-Tag: noindex` (Appendix B) to avoid duplicate-content penalties
  against the eventual custom domain.
