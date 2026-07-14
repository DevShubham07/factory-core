# RB-06 - Dependency CVE / broken Renovate PR

## Trigger
A Renovate PR fails CI on a site or on `site-template`, or CodeQL/secret
scanning/a dependency advisory flags a CVE in a package the fleet uses.

## Steps
1. Read the CVE/advisory detail: affected package, version range, and
   attack vector.
2. Assess exploitability **for a static site**: these sites are
   `output: 'static'` with no server-side runtime, database, or auth — a
   CVE in a build-time-only tool (e.g. a bundler) is lower urgency than one
   in a package whose code ships to the browser and executes against
   untrusted input (e.g. a client-side parser used on user-supplied data,
   relevant to Group B tools like JSON/YAML/SQL/regex processors).
3. If the fix is a simple version bump: merge the Renovate PR once CI is
   green (standard gate discipline — no skipping CI).
4. If Renovate's proposed bump breaks CI (failing build/tests): investigate
   the breaking change; either fix forward (adjust calling code) or pin the
   previous safe version explicitly with a one-line justification, per the
   §7.2 dependency decision tree.
5. If the affected package is a `@toolfactory/*` shared package or part of
   `site-template`: fix at the template/package level, not per-site, so
   Renovate propagates the fix fleet-wide on the next PR cycle.
6. Re-run CodeQL/secret-scanning after the fix to confirm clearance.

## Verification
- CI green on the patched dependency across all affected sites (or at
  minimum the template, with fleet propagation confirmed via subsequent
  Renovate PRs).
- CVE/advisory marked resolved (dependency version now outside the
  affected range).
- If a version was pinned instead of upgraded, the pin and its
  justification are recorded in `spec.md` (per §4.6: any dependency
  addition/pin requires a spec.md line).

## Escalation
A CVE with a live, plausible exploitation path against site visitors (not
just a theoretical build-time issue) -> treat as urgent, do not wait for
the next Renovate cycle; patch immediately and deploy per RB-01 verification
steps. Any CVE assessment that's genuinely ambiguous -> escalate to Sonnet/
Opus rather than guessing severity.
