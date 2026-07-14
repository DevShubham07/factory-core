# Gate G0 — Factory Bootstrap Evidence

Passed: **2026-07-14** · Operator: DevShubham07 · Recorded by: Claude (Opus 4.8 orchestrator)

| Check (design doc §8 P0) | Result | Evidence |
|---|---|---|
| Template repo CI green | ✅ | Run [29325119562](https://github.com/DevShubham07/site-template/actions/runs/29325119562) — all 15 steps success, 1m32s: build → sitemap-skip guard → Playwright (6 passed) → LHCI (3 runs, median-run assertions, all thresholds met) |
| Local build green, zero sitemap "Skipping" warnings | ✅ | `pnpm build` 7 pages + `sitemap-index.xml`; CI guard step also enforces this every run |
| Smoketest deployed & torn down | ✅ | `site-smoketest` scaffolded via `new-site.mjs` (temp portfolio, no registry pollution) → `vercel deploy --prod` → Ready in 11s → live checks: HTTP 200, **`X-Robots-Tag: noindex` served on the `.vercel.app` host** (host-scoped vercel.json rule verified in production — not testable locally), robots.txt + sitemap 200, custom 404, identity rewrite correct → Vercel project removed + local dir deleted |
| Automation scripts exercised against fixtures (exit 0) | ✅ | rdap-check (live RDAP, google.com TAKEN w/ expiry) · fleet-status (fixture fleet + staleness flag) · new-site (dry-run leak-free + real scaffold) · indexnow (dry-run payload) · psi-audit (fixture scores vs thresholds) · gsc-submit (RS256 JWT signs, dry-run) · screenshot (real browser capture, verified by build agent) |
| MCP servers respond | ✅* | astro-docs: HTTP 406 to bare POST (alive, wants SSE handshake) · vercel: 401 (alive, OAuth pending) · sentry: 401 (alive, OAuth pending) · playwright: stdio via npx. Project-scope `.mcp.json` committed in site-template. *Vercel/Sentry OAuth = one-time interactive `/mcp` step at first use [HUMAN]. GitHub MCP deliberately omitted (would require committing a PAT header; `gh` CLI covers the same surface — see deviation note) |
| portfolio.json initialized (10 candidates, IDEA) | ✅ | `registry/portfolio.json` — build order A3→A5→A1→A4→A2→B1→B4→B5→B2→B3 |

## Fixes made en route (all committed)

1. `changesets/action@v2` → `@v1` (no stable v2 tag exists — caught by pre-implementation verification pass).
2. Reusable workflows must NOT declare their own `concurrency:` — `github.workflow` resolves to the CALLER's name inside a `workflow_call` target, self-deadlocking. Removed from astro-ci.yml/links.yml.
3. `pnpm/action-setup@v6` needs an explicit `version:` — the `packageManager`-field path delegates to pnpm's self-update, which hit a real bootstrap bug in a fresh 11.x patch. Pinned `version: 10`; lockfile (v9.0) verified compatible with pnpm 10.34.5 locally (frozen-lockfile install + build + 6/6 tests).
4. Analytics/SpeedInsights components gated on `process.env.VERCEL` — their scripts only exist on Vercel hosting; unconditional inclusion caused console 404s that failed the zero-console-error smoke test locally/CI.

## Deviations from design doc (accepted)

- Personal account `DevShubham07` instead of a GitHub org (user decision; org migration possible later without loss).
- Repos public (user-confirmed at creation prompt).
- npm publishing deferred — packages vendored via template copy (ADR-0012); npm account creation pending.
- Sentry integration deferred to Site #1's P6/G7 (org not yet created); Better Stack deferred to first live site.
