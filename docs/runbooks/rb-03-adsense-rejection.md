# RB-03 - AdSense rejection

## Trigger
AdSense review returns a rejection/"not ready" status after a P9 review
request (2-3 rejection-then-reapply cycles are normal per §8 P9).

## Steps
1. Read the stated rejection reason verbatim from the AdSense dashboard
   (email + Sites tab) — do not guess at the cause.
2. Map the stated reason to the known checklist categories:
   - **Content thinness** -> home page copy below the ~600-word minimum
     (§2.3), or too few landing pages (spec requires 3-8 per site).
   - **Policy pages missing/unclear** -> Privacy Policy, Terms, About,
     Contact must all be present and linked in the footer (`Footer.astro`
     already renders all four — confirm they render real content, not
     placeholder text).
   - **Navigation/under-construction** -> confirm no broken links (cross-
     check `links.yml`/lychee output), no lorem-ipsum or TODO copy left in
     any page.
   - **Insufficient original content** -> a pure-tool page with no
     explanatory copy reads as "under construction" to reviewers; confirm
     the ≥600-word home copy and FAQ are genuinely present, not stubbed.
3. Fix the identified gap(s) via the normal P4/P5 flow (implementation +
   SEO/content skills), re-running Gate G5/G6 as needed.
4. Wait at least 2 weeks before reapplying (documented cadence) — do not
   resubmit immediately.
5. Log every attempt (date, stated reason, fix applied) in `site.json` so
   the pattern is auditable across the fleet.

## Verification
- Gate G6 checklist still fully green after the fix (unique titles,
  meta descriptions, canonical, schema, ≥600-word home copy, sitemap
  complete).
- No broken links (`lychee` clean run).
- All four legal pages render substantive content, reachable from the
  footer on every page.
- Reapplication submitted and logged in `site.json`.

## Escalation
If the same rejection reason recurs after 2 fix-and-reapply cycles (i.e. 3
total rejections for the same stated reason), stop and treat as a template-
level defect: the issue likely affects every site built from the current
template, not just this one — escalate to [HUMAN] and consider a
template-wide fix before continuing to reapply per-site.
