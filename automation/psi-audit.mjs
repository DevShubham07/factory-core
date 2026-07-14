#!/usr/bin/env node
/**
 * psi-audit.mjs
 *
 * ---------------------------------------------------------------------------
 * Inputs (flags):
 *   --url <url>        repeatable: one or more absolute URLs to audit.
 *   --all               read every "live" site from factory-core/registry/
 *                       portfolio.json (states DEPLOYED/DOMAIN_LIVE/INDEXED/
 *                       MONETIZED/OPERATING) and audit each site's
 *                       production URL (falling back to its domain or
 *                       *.vercel.app URL). Combinable with --url.
 *   --key <str>        PageSpeed Insights API key. Falls back to env
 *                       PSI_API_KEY. PSI works keyless at low volume, but a
 *                       key is recommended for the fleet's weekly audit.yml
 *                       cron (plan §11.1: "25k queries/day (trivial)").
 *   --strategy <s>      "mobile" (default) or "desktop".
 *   --no-fail           report scores but always exit 0 (used for
 *                       informational runs / CI steps that shouldn't block).
 *   --fixture <path>    read a canned PSI API JSON response from this file
 *                       instead of calling the network, for every --url (G0
 *                       self-test without a real PSI_API_KEY).
 *   --portfolio <path>  override for factory-core/registry/portfolio.json.
 *   --dry-run           print the PSI request URLs that would be called
 *                       (key redacted); make no network calls.
 *   --help              print this contract and exit 0.
 *
 * Outputs:
 *   - Console table: url | performance | seo | accessibility | best-practices
 *   - No files are written.
 *
 * Exit codes:
 *   0  - every URL scored, and (unless --no-fail) every score met its
 *        threshold: performance >= 0.90, seo/accessibility/best-practices
 *        >= 0.95 (plan §5 LHCI thresholds / Appendix B, applied here to the
 *        live-site PSI equivalent per plan §11.3).
 *   1  - a PSI call errored, --all found no live sites and no --url was
 *        given, or (without --no-fail) any score was below threshold.
 *
 * Idempotency: read-only against PSI/portfolio.json (no writes). Safe to
 * re-run any number of times.
 * ---------------------------------------------------------------------------
 */

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const HELP = `psi-audit.mjs - PageSpeed Insights score audit

Usage:
  node psi-audit.mjs --url <url> [--url <url2> ...] [--strategy mobile|desktop] \\
    [--key <psi-api-key>] [--no-fail] [--dry-run]
  node psi-audit.mjs --all [--portfolio <path>] [--strategy mobile|desktop]
  node psi-audit.mjs --url <url> --fixture fixtures/psi.fixture.json   # G0, no network/key needed

Thresholds (fail unless --no-fail): performance >= 0.90; seo, accessibility,
best-practices >= 0.95 (plan §5 / Appendix B lighthouserc.json thresholds).
`;

const WORKSPACE_ROOT = "C:\\Users\\gshub\\OneDrive\\Desktop\\CompellingFuture\\factory";
const DEFAULT_PORTFOLIO = path.join(WORKSPACE_ROOT, "factory-core", "registry", "portfolio.json");
const LIVE_STATES = new Set(["DEPLOYED", "DOMAIN_LIVE", "INDEXED", "MONETIZED", "OPERATING"]);
const THRESHOLDS = { performance: 0.9, seo: 0.95, accessibility: 0.95, best_practices: 0.95 };
const PSI_ENDPOINT = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed";

function parseArgs(argv) {
  const out = {
    urls: [],
    all: false,
    key: process.env.PSI_API_KEY || null,
    strategy: "mobile",
    noFail: false,
    fixture: null,
    portfolio: DEFAULT_PORTFOLIO,
    dryRun: false,
    help: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--help" || a === "-h") out.help = true;
    else if (a === "--all") out.all = true;
    else if (a === "--no-fail") out.noFail = true;
    else if (a === "--dry-run") out.dryRun = true;
    else if (a === "--url") out.urls.push(argv[++i]);
    else if (a === "--key") out.key = argv[++i];
    else if (a === "--strategy") out.strategy = argv[++i];
    else if (a === "--fixture") out.fixture = argv[++i];
    else if (a === "--portfolio") out.portfolio = argv[++i];
    else if (a.startsWith("--")) {
      console.error(`[fail] unknown flag: ${a}`);
      process.exit(1);
    }
  }
  return out;
}

function readPortfolio(portfolioPath) {
  if (!existsSync(portfolioPath)) return [];
  const text = readFileSync(portfolioPath, "utf8").trim();
  if (!text) return [];
  const parsed = JSON.parse(text);
  return Array.isArray(parsed) ? parsed : parsed.sites || [];
}

function liveUrlFor(record) {
  if (record.urls && record.urls.production) return record.urls.production;
  if (record.domain) return `https://${record.domain}`;
  if (record.urls && record.urls.vercel) return record.urls.vercel;
  return null;
}

function psiRequestUrl(targetUrl, strategy, key) {
  const u = new URL(PSI_ENDPOINT);
  u.searchParams.set("url", targetUrl);
  u.searchParams.set("strategy", strategy);
  for (const cat of ["PERFORMANCE", "SEO", "ACCESSIBILITY", "BEST_PRACTICES"]) {
    u.searchParams.append("category", cat);
  }
  if (key) u.searchParams.set("key", key);
  return u.toString();
}

function extractScores(psiBody) {
  const cats = (psiBody && psiBody.lighthouseResult && psiBody.lighthouseResult.categories) || {};
  return {
    performance: cats.performance ? cats.performance.score : null,
    seo: cats.seo ? cats.seo.score : null,
    accessibility: cats.accessibility ? cats.accessibility.score : null,
    best_practices: cats["best-practices"] ? cats["best-practices"].score : null,
  };
}

async function fetchScores(targetUrl, args) {
  if (args.fixture) {
    const body = JSON.parse(readFileSync(args.fixture, "utf8"));
    return extractScores(body);
  }
  const reqUrl = psiRequestUrl(targetUrl, args.strategy, args.key);
  const res = await fetch(reqUrl);
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`PSI HTTP ${res.status}: ${body.error ? body.error.message : JSON.stringify(body)}`);
  }
  return extractScores(body);
}

function belowThreshold(scores) {
  const fails = [];
  for (const [cat, min] of Object.entries(THRESHOLDS)) {
    const v = scores[cat];
    if (v === null || v === undefined) continue; // missing category isn't scored, don't fail on absence
    if (v < min) fails.push(`${cat} ${v.toFixed(2)} < ${min}`);
  }
  return fails;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(HELP);
    process.exit(0);
  }

  let targets = [...args.urls];
  if (args.all) {
    const portfolio = readPortfolio(args.portfolio);
    const live = portfolio.filter((r) => LIVE_STATES.has(r.state));
    for (const rec of live) {
      const url = liveUrlFor(rec);
      if (url) targets.push(url);
      else console.log(`[warn] portfolio entry "${rec.slug}" is live but has no resolvable URL - skipped`);
    }
    console.log(`[ok] --all: ${live.length} live site(s) found in portfolio, ${targets.length} URL(s) queued`);
  }
  targets = [...new Set(targets)];

  if (targets.length === 0) {
    console.error("[fail] no URLs to audit (use --url, --all, or both)");
    process.exit(1);
  }

  if (args.dryRun) {
    console.log(`[ok] dry-run: would request PSI (${args.strategy}) for:`);
    for (const t of targets) {
      console.log(`  ${psiRequestUrl(t, args.strategy, args.key ? "***" : null)}`);
    }
    process.exit(0);
  }

  if (!args.fixture && !args.key) {
    console.log("[warn] no PSI API key (--key or PSI_API_KEY env) - proceeding keyless, subject to low rate limits");
  }

  const rows = [];
  let hadError = false;
  let hadThresholdFail = false;

  for (const target of targets) {
    try {
      const scores = await fetchScores(target, args);
      const fails = belowThreshold(scores);
      if (fails.length) {
        hadThresholdFail = true;
        console.log(`[warn] ${target} below threshold: ${fails.join("; ")}`);
      } else {
        console.log(`[ok] ${target} meets all thresholds`);
      }
      rows.push({ target, ...scores });
    } catch (err) {
      hadError = true;
      console.log(`[fail] ${target} - ${err.message}`);
      rows.push({ target, performance: null, seo: null, accessibility: null, best_practices: null });
    }
  }

  console.log("\n--- PSI Summary (" + args.strategy + ") ---");
  console.log(
    "URL".padEnd(45) + "Perf".padEnd(8) + "SEO".padEnd(8) + "A11y".padEnd(8) + "BestPr".padEnd(8)
  );
  for (const r of rows) {
    const fmt = (v) => (v === null || v === undefined ? "n/a".padEnd(8) : v.toFixed(2).padEnd(8));
    console.log(r.target.padEnd(45) + fmt(r.performance) + fmt(r.seo) + fmt(r.accessibility) + fmt(r.best_practices));
  }

  if (hadError) {
    console.error("\n[fail] one or more PSI calls errored");
    process.exitCode = 1;
    return;
  }
  if (hadThresholdFail && !args.noFail) {
    console.error("\n[fail] one or more URLs scored below threshold");
    process.exitCode = 1;
    return;
  }
  console.log("\n[ok] audit complete");
  process.exitCode = 0;
}

main();
