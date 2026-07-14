# factory-core/automation

Plain Node.js ESM scripts (`.mjs`), **zero npm dependencies** — everything
uses global `fetch`, `node:crypto`, `node:fs`, `node:path`, and
`node:child_process` only. Every script:

- starts with a header-comment contract (Inputs / Outputs / Exit codes /
  Idempotency),
- supports `--help`,
- supports `--dry-run` where it has side effects,
- logs with `[ok]` / `[warn]` / `[fail]` prefixed lines,
- exits `0` on success and `1` on failure,
- is safe to re-run (check-before-create / idempotent-by-key, per plan
  §3.4).

Run any script with `node automation/<script>.mjs --help` for the exact
flag list — this file summarizes the contract; the script header comment
is the source of truth.

Fixtures live in `automation/fixtures/` so every script can be exercised at
G0 without real credentials (plan §8 P0 Gate G0: "every automation script
exercised against its fixture (exit 0)").

## rdap-check.mjs

Domain availability via RDAP. **Only `.com`/`.net`** are supported (both
served by Verisign's RDAP service) — this is a hard scope limit, stated in
the script and in the plan's task spec, not a bug.

- 404 → `AVAILABLE (probably)`; 200 → `TAKEN` (prints the expiry event if
  present); any other HTTP status → `UNKNOWN`.
- Throttled to 1 request/sec by default (`--delay` to override) — plan
  §14.2: "RDAP: no published quota; script throttles to 1 rps as courtesy."
- Exit 1 only on an actual lookup error (network failure/timeout/bad JSON),
  not on `UNKNOWN`/`SKIPPED` results.
- `--fixture` runs against `fixtures/rdap.fixture.txt` (`google.com`) and
  makes a **real** RDAP call, per the task spec allowance.

```
node rdap-check.mjs example.com another.net [--file list.txt] [--delay 1000] [--dry-run]
node rdap-check.mjs --fixture
```

## new-site.mjs

Scaffolds a new `site-<slug>` directory from `site-template`, and
registers/updates the site in `factory-core/registry/portfolio.json`.

- Copies `site-template` → `--dest` (default: sibling `site-<slug>`),
  excluding `node_modules`, `dist`, `.astro`, `.git`, `test-results`,
  `playwright-report`.
- Rewrites `site.config.mjs` (name, domain, keyword, description,
  vercelSlug, legalName), `package.json` name, `vercel.json` host value,
  `DevShubham07` in `.github/workflows/ci.yml` and `renovate.json` (only if
  `--org` is given — otherwise the placeholder is left in place and a
  `[warn]` is printed), and `site.json` (slug, domain, `template_tag`;
  `state` stays `IDEA` — scaffolding alone passes no gate).
- `template_tag` is read from `git describe --tags` in `--source` if it's a
  git repo, else falls back to `template-v<package.json version>`.
- Registers/updates the `portfolio.json` entry **idempotently by slug**
  (re-running for the same slug updates the record instead of duplicating
  it).
- Refuses to overwrite an existing `--dest` unless `--force`.
- `--install` runs `pnpm install` + `git init` + a first commit in `--dest`
  (optional; the scaffold itself succeeds without it).

```
node new-site.mjs --slug monitorsizecalculator --domain monitorsizecalculator.com \
  --name "Monitor Size Calculator" --keyword "monitor size calculator" \
  --description "Calculate monitor dimensions, PPI, and compare screen sizes." \
  --org my-github-org [--source <path>] [--dest <path>] [--install] [--force] [--dry-run]
```

## indexnow.mjs

Generates (or reuses) a 32-hex IndexNow key and POSTs a URL batch to
`https://api.indexnow.org/indexnow`. **Covers Bing/Yandex/Seznam/Naver —
not Google** (Google's path is sitemaps-only, plan D-08).

- Reuses a domain's key from `portfolio.json` if one is already recorded
  (idempotent — never invalidates a key already deployed at
  `https://<domain>/<key>.txt`); otherwise generates a fresh one, or uses
  `--key` if supplied.
- Writes the key file locally at `--key-file-out` (default
  `./<key>.txt`) — **the operator must deploy this file** to the site's
  `public/` folder so it's served at `https://<domain>/<key>.txt`.
- Caps at 10,000 URLs per call (protocol limit); errors out rather than
  silently truncating if exceeded.
- Body: `{host, key, keyLocation, urlList[]}`,
  `Content-Type: application/json; charset=utf-8`.
- Records the key in the matching `portfolio.json` entry (by domain) after
  a successful POST.

```
node indexnow.mjs --domain example.com --urls https://example.com/,https://example.com/about/ [--key <hex32>] [--key-file-out <path>] [--dry-run]
node indexnow.mjs --domain example-fixture-site.com --file fixtures/urls.fixture.txt --dry-run
```

## gsc-submit.mjs

Submits a sitemap to Google Search Console via the Sitemaps API, using a
service-account OAuth2 JWT-bearer flow signed with `node:crypto` RS256 (no
Google client library — zero deps).

- Flow: build JWT claims (`iss`, `scope: .../auth/webmasters`, `aud`,
  `exp`, `iat`) → sign RS256 with the SA private key → exchange at
  `https://oauth2.googleapis.com/token` → `PUT
  https://www.googleapis.com/webmasters/v3/sites/{siteUrl}/sitemaps/{feedpath}`.
- Optional `--inspect <url>` also POSTs to
  `https://searchconsole.googleapis.com/v1/urlInspection/index:inspect`.
- Default `--sa` path: `%USERPROFILE%\.factory\gsc-sa.json` (never
  committed to a repo, per plan §4.7 secrets matrix).
- Missing SA file → a clear `[HUMAN]` setup message (GCP project → enable
  Search Console API → service account + key → add SA email as a GSC user)
  and exit 1, not a stack trace.
- `--dry-run` builds and prints the JWT claims and endpoint URLs but makes
  no network call — safe against `fixtures/sa.fixture.json` (a
  structurally valid but unregistered fixture key pair, so a *non*-dry-run
  call against it fails cleanly at Google's token endpoint, as expected).

```
node gsc-submit.mjs --site-url sc-domain:example.com --sitemap https://example.com/sitemap-index.xml [--inspect <url>] [--sa <path>] [--dry-run]
```

## psi-audit.mjs

Runs Google PageSpeed Insights (v5) against one or more URLs and checks
scores against the plan's thresholds (performance ≥0.90; SEO,
accessibility, best-practices ≥0.95 — the same thresholds as the shared
`lighthouserc.json`, plan §5/Appendix B).

- `--url` (repeatable) and/or `--all` (reads every "live" site — states
  `DEPLOYED`/`DOMAIN_LIVE`/`INDEXED`/`MONETIZED`/`OPERATING` — from
  `portfolio.json` and audits its production URL, falling back to its
  domain or `*.vercel.app` URL).
- `--key` or env `PSI_API_KEY`; runs keyless (rate-limited) if neither is
  given.
- `--fixture <path>` substitutes a canned PSI JSON response for every URL
  instead of calling the network (G0 self-test, no key needed) —
  `fixtures/psi.fixture.json` is provided.
- Exit 1 if any category is below threshold, unless `--no-fail`. Missing
  categories in a response are not scored/failed (treated as "not
  reported", not zero).

```
node psi-audit.mjs --url https://example.com/ --fixture fixtures/psi.fixture.json
node psi-audit.mjs --all [--strategy mobile|desktop] [--no-fail]
```

## screenshot.mjs

Captures a PNG of a URL for gate-evidence records.

- **Primary**: dynamic `import()` of site-template's own installed
  `@playwright/test` (its ESM entry, `index.mjs` — importing the CJS
  `index.js` directly by file URL was tried first and produced an
  incomplete named-export interop where `chromium` came back `undefined`;
  fixed by preferring `index.mjs`). `ASSUMPTION`: per the task spec, this
  assumes `site-template` has been `pnpm install`-ed at least once and its
  Playwright browser binary is present locally.
- **Fallback**: if that import throws for any reason, spawns `npx
  playwright screenshot <url> <out>` as a child process (downloads
  `playwright` via npx on first use if not already resolvable).
- Overwrites `--out` on every run by design (evidence is meant to be
  refreshed on every gate re-check, plan §9).

```
node screenshot.mjs --url https://example.com --out ./evidence/home.png [--width 1280] [--height 800] [--full-page] [--dry-run]
```

## fleet-status.mjs

Pretty-prints `portfolio.json` as a table: slug, domain, state, last gate,
live URL — and flags **stale** sites: any site in a non-terminal state
(anything other than `PARKED`/`KILLED`, per plan §3.2) whose last gate (or,
absent any gate, last portfolio update) is more than 14 days old
(`--stale-days` to override).

`DEVIATION` from the literal task spec ("no args"): a `--portfolio <path>`
override flag was added so this script (and G0) can run against
`fixtures/portfolio.fixture.json` without touching the real fleet
registry. Omit it for normal fleet use — it then reads the real
`factory-core/registry/portfolio.json`.

```
node fleet-status.mjs
node fleet-status.mjs --portfolio fixtures/portfolio.fixture.json [--stale-days 14]
```

## fixtures/

| File | Used by | Purpose |
|---|---|---|
| `rdap.fixture.txt` | rdap-check.mjs `--fixture` | `google.com` — a stable known-TAKEN `.com`; the one script allowed to make a real network call in its G0 fixture run. |
| `urls.fixture.txt` | indexnow.mjs `--file` | A small fictitious URL list for `--dry-run` payload testing. |
| `sa.fixture.json` | gsc-submit.mjs `--sa` | A structurally valid (freshly generated, throwaway) RSA service-account JSON shape — signs a real JWT locally, but is not registered with Google, so a non-dry-run call against it fails cleanly at the token-exchange step, as expected. `_fixture`/`_note` fields mark it as non-production. |
| `psi.fixture.json` | psi-audit.mjs `--fixture` | A canned PageSpeed Insights v5 response (`lighthouseResult.categories.*.score`) for offline threshold-logic testing. |
| `portfolio.fixture.json` | fleet-status.mjs / psi-audit.mjs `--portfolio` | A 3-site mini fleet (one `OPERATING` live site, one `SCAFFOLDED` site, one long-`IDEA` site included specifically to exercise the staleness flag) mirroring the real registry's record shape. |

## portfolio.json record shape

`factory-core/registry/portfolio.json` is a bare JSON array (plan §3.3:
"array of site records"). Each record (written/updated by `new-site.mjs`,
`indexnow.mjs`; read by `psi-audit.mjs --all` and `fleet-status.mjs`):

```json
{
  "slug": "monitorsizecalculator",
  "domain": "monitorsizecalculator.com",
  "name": "Monitor Size Calculator",
  "keyword": "monitor size calculator",
  "state": "IDEA",
  "template_tag": "template-v0.1.0",
  "scores": null,
  "created_at": "2026-07-14T00:00:00.000Z",
  "updated_at": "2026-07-14T00:00:00.000Z",
  "last_gate": null,
  "urls": { "vercel": null, "production": null },
  "external": {
    "vercel_project": null,
    "gsc_property": null,
    "sentry_dsn": null,
    "adsense_pub": null,
    "indexnow_key": null,
    "indexnow_key_file": null
  }
}
```

This is not one of the four schemas requested for `factory-core/schemas/`
(only `site.schema.json`, `scorecard.schema.json`, `triage.schema.json`,
`audit.schema.json` were in scope) — this table documents the shape by
convention instead.

## Known environment quirk (Node 24 / Windows): avoid `process.exit()` right after `fetch()`

During implementation, calling `process.exit(n)` synchronously in a
`catch` block immediately after an awaited `fetch()` call intermittently
crashed the process with `Assertion failed:
!(handle->flags & UV_HANDLE_CLOSING)` (a libuv/undici socket-teardown race)
on this Node 24 / Windows setup, which clobbers the intended exit code.
All scripts here that make network calls set `process.exitCode = n` and
return normally instead of forcing `process.exit(n)` on those paths, which
avoided the crash in testing. Pre-network-call argument validation still
uses `process.exit()` directly since there's no pending socket state at
that point.
