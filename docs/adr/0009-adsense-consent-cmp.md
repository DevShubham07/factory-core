# 0009 - Google-certified CMP for AdSense consent (EEA/UK/CH)

## Status
accepted

## Context
Google's EU User Consent Policy requires a Google-certified Consent
Management Platform for EEA/UK/CH visitors on any AdSense-monetized site,
even one that is US-targeted (research correction C-08). "Just apply" is
not sufficient.

## Decision
Enable AdSense's built-in "Privacy & messaging" (Google-certified CMP) for
every site at first monetization (P9 step 3), before requesting AdSense
review. If GA4 is ever added on top of this (D-07 is opt-in-only), Consent
Mode v2 defaults all four signals to `denied`. The privacy policy page
discloses ad cookies and links Google's partner-sites page.

## Consequences
- Gate G10 requires the CMP message to be verified live for an EEA test
  (VPN check or Google's own preview tool) before "ads render" is
  considered satisfied.
- The exact "Privacy & messaging" UI flow is confirmed in-dashboard at the
  first real P9 run (Google's UI changes frequently — open item #4, §16),
  not hardcoded here.
- No ads.txt or ad script ships before this CMP step is live, and never
  before the Vercel Pro upgrade (ADR 0001) or on a site still on Hobby.
