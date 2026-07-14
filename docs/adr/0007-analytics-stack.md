# 0007 - Analytics: Vercel Web Analytics + Sentry + GSC, no GA4 by default

## Status
accepted

## Context
GA4 triggers Consent-Mode-v2/CMP obligations for EEA visitors from day one
(research correction C-03), which is unnecessary overhead pre-scale. The
factory still needs error visibility, visit/referrer data, and search
performance data.

## Decision
Primary stack: Vercel Web Analytics (cookieless visits/referrers) + Sentry
(`@sentry/astro`, errors) + Google Search Console (search performance).
GA4 is optional-off by default. PostHog is deferred until fleet-wide Vercel
Analytics volume exceeds its free ceiling (40k events/mo fleet-pooled).

## Consequences
- No CMP/Consent-Mode-v2 obligation exists until GA4 is deliberately added
  (D-09 covers the AdSense-specific CMP requirement, which is separate and
  still required at monetization regardless of GA4).
- If GA4 is ever added, it ships behind `@astrojs/partytown` with Consent
  Mode v2 defaults `denied` on all four signals (§5, D-07).
- Quotas (Sentry 5k errors/mo, Vercel Analytics 50k events/mo, Speed
  Insights 10k events/mo/1-project-on-Hobby) are fleet-pooled, not
  per-site, and are watched in the monthly audit (§14.2).
